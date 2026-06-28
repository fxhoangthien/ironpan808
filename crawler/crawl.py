#!/usr/bin/env python3
"""Crawl ironpan808.com and export pages, images, text, and metadata."""

from __future__ import annotations

import hashlib
import json
import re
import sys
import time
from collections import deque
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.parse import urldefrag, urljoin, urlparse
from urllib.robotparser import RobotFileParser
from xml.etree import ElementTree

import requests
from bs4 import BeautifulSoup, NavigableString, Tag

BASE_URL = "https://ironpan808.com"
OUTPUT_DIR = Path(__file__).resolve().parent.parent / "output"
PAGES_DIR = OUTPUT_DIR / "pages"
IMAGES_DIR = OUTPUT_DIR / "images"
ASSETS_DIR = OUTPUT_DIR / "assets"

USER_AGENT = (
    "IronPanRebuildCrawler/1.0 (+https://ironpan808.com; site owner rebuild project)"
)
REQUEST_TIMEOUT = 30
REQUEST_DELAY = 0.5

SKIP_PATH_PREFIXES = (
    "/wp-admin",
    "/wp-json",
    "/wp-includes",
    "/xmlrpc.php",
    "/feed",
    "/comments/feed",
    "/author/",
    "/tag/",
    "/category/",
    "/?s=",
)

SKIP_EXTENSIONS = {
    ".pdf",
    ".zip",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".mp4",
    ".mp3",
    ".avi",
    ".mov",
    ".woff",
    ".woff2",
    ".ttf",
    ".eot",
}

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".ico", ".avif"}
ASSET_HINTS = (
    "logo",
    "icon",
    "favicon",
    "apple-touch",
    "cropped-logo",
    "site-icon",
    "brand",
)


@dataclass
class PageRecord:
    url: str
    path: str
    title: str = ""
    meta_description: str = ""
    canonical: str = ""
    status_code: int = 0
    content_type: str = ""
    text_content: str = ""
    headings: list[dict[str, str]] = field(default_factory=list)
    links: list[str] = field(default_factory=list)
    image_urls: list[str] = field(default_factory=list)
    asset_urls: list[str] = field(default_factory=list)
    crawled_at: str = ""
    error: str = ""


class SiteCrawler:
    def __init__(self, base_url: str, output_dir: Path) -> None:
        self.base_url = base_url.rstrip("/")
        parsed = urlparse(self.base_url)
        self.domain = parsed.netloc.lower()
        self.scheme = parsed.scheme or "https"
        self.output_dir = output_dir
        self.pages_dir = output_dir / "pages"
        self.images_dir = output_dir / "images"
        self.assets_dir = output_dir / "assets"

        self.session = requests.Session()
        self.session.headers.update({"User-Agent": USER_AGENT})

        self.robots = RobotFileParser()
        self.robots.set_url(urljoin(self.base_url + "/", "robots.txt"))

        self.visited_pages: set[str] = set()
        self.page_records: dict[str, PageRecord] = {}
        self.all_image_urls: dict[str, dict[str, Any]] = {}
        self.downloaded_files: dict[str, str] = {}
        self.download_errors: list[dict[str, str]] = []

    def setup_dirs(self) -> None:
        for directory in (self.output_dir, self.pages_dir, self.images_dir, self.assets_dir):
            directory.mkdir(parents=True, exist_ok=True)

    def normalize_url(self, url: str, referer: str | None = None) -> str | None:
        if not url:
            return None

        url = url.strip()
        if url.startswith(("mailto:", "tel:", "javascript:", "data:", "#")):
            return None

        absolute = urljoin(referer or self.base_url + "/", url)
        absolute, _fragment = urldefrag(absolute)
        parsed = urlparse(absolute)

        if parsed.scheme not in ("http", "https"):
            return None
        if parsed.netloc.lower() != self.domain:
            return None

        path = parsed.path or "/"
        if path != "/" and path.endswith("/"):
            path = path.rstrip("/")

        normalized = f"{parsed.scheme}://{parsed.netloc}{path}"
        if parsed.query:
            normalized += f"?{parsed.query}"
        return normalized

    def is_crawlable_page(self, url: str) -> bool:
        parsed = urlparse(url)
        path = parsed.path.lower()
        if any(path.startswith(prefix) for prefix in SKIP_PATH_PREFIXES):
            return False
        if any(path.endswith(ext) for ext in SKIP_EXTENSIONS):
            return False
        if any(path.endswith(ext) for ext in IMAGE_EXTENSIONS):
            return False
        if path.endswith(".xml"):
            return False
        return True

    def is_asset_url(self, url: str, rel: str | None = None, alt: str | None = None) -> bool:
        lower = url.lower()
        if rel and rel.lower() in {"icon", "apple-touch-icon", "shortcut icon", "mask-icon"}:
            return True
        if any(hint in lower for hint in ASSET_HINTS):
            return True
        if alt and any(hint in alt.lower() for hint in ("logo", "icon")):
            return True
        parsed = urlparse(lower)
        if parsed.path.endswith(".ico"):
            return True
        return False

    def fetch(self, url: str) -> requests.Response | None:
        try:
            response = self.session.get(url, timeout=REQUEST_TIMEOUT, allow_redirects=True)
            return response
        except requests.RequestException as exc:
            self.download_errors.append({"url": url, "error": str(exc)})
            return None

    def load_robots(self) -> None:
        try:
            self.robots.read()
        except Exception:
            pass

    def seed_urls_from_sitemap(self) -> list[str]:
        seeds: list[str] = []
        sitemap_candidates = [
            f"{self.base_url}/wp-sitemap.xml",
            f"{self.base_url}/sitemap_index.xml",
            f"{self.base_url}/sitemap.xml",
        ]

        for sitemap_url in sitemap_candidates:
            response = self.fetch(sitemap_url)
            if not response or response.status_code != 200:
                continue
            seeds.extend(self._parse_sitemap_xml(response.text))
            if seeds:
                break
        return seeds

    def _parse_sitemap_xml(self, xml_text: str) -> list[str]:
        urls: list[str] = []
        try:
            root = ElementTree.fromstring(xml_text)
        except ElementTree.ParseError:
            return urls

        ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
        sitemap_locs = root.findall(".//sm:sitemap/sm:loc", ns)
        if sitemap_locs:
            for loc in sitemap_locs:
                if loc.text:
                    nested = self.fetch(loc.text.strip())
                    if nested and nested.status_code == 200:
                        urls.extend(self._parse_sitemap_xml(nested.text))

        for loc in root.findall(".//sm:loc", ns):
            if loc.text:
                normalized = self.normalize_url(loc.text.strip())
                if normalized and self.is_crawlable_page(normalized):
                    urls.append(normalized)
        return urls

    def discover_links(self, soup: BeautifulSoup, page_url: str) -> list[str]:
        links: list[str] = []
        for anchor in soup.find_all("a", href=True):
            normalized = self.normalize_url(anchor["href"], page_url)
            if normalized and self.is_crawlable_page(normalized):
                links.append(normalized)
        return sorted(set(links))

    def extract_headings(self, soup: BeautifulSoup) -> list[dict[str, str]]:
        headings: list[dict[str, str]] = []
        for level in range(1, 7):
            for heading in soup.find_all(f"h{level}"):
                text = heading.get_text(" ", strip=True)
                if text:
                    headings.append({"level": f"h{level}", "text": text})
        return headings

    def extract_text_content(self, soup: BeautifulSoup) -> str:
        for tag in soup(["script", "style", "noscript", "svg"]):
            tag.decompose()

        main = soup.find("main") or soup.find("article") or soup.body
        if not main:
            return ""

        blocks: list[str] = []
        for element in main.descendants:
            if isinstance(element, NavigableString):
                text = str(element).strip()
                if text:
                    blocks.append(text)
            elif isinstance(element, Tag) and element.name == "br":
                blocks.append("")

        cleaned: list[str] = []
        previous = ""
        for block in blocks:
            block = re.sub(r"\s+", " ", block).strip()
            if not block or block == previous:
                continue
            cleaned.append(block)
            previous = block
        return "\n".join(cleaned)

    def extract_meta(self, soup: BeautifulSoup) -> tuple[str, str, str]:
        title = ""
        if soup.title and soup.title.string:
            title = soup.title.string.strip()

        meta_description = ""
        description_tag = soup.find("meta", attrs={"name": re.compile(r"^description$", re.I)})
        if description_tag and description_tag.get("content"):
            meta_description = description_tag["content"].strip()

        canonical = ""
        canonical_tag = soup.find("link", rel=lambda value: value and "canonical" in value.lower())
        if canonical_tag and canonical_tag.get("href"):
            canonical = canonical_tag["href"].strip()

        return title, meta_description, canonical

    def _add_image_candidate(
        self,
        url: str,
        page_url: str,
        rel: str | None = None,
        alt: str | None = None,
    ) -> None:
        normalized = self.normalize_url(url, page_url)
        if not normalized:
            return

        parsed = urlparse(normalized)
        if parsed.path.endswith(".css") or parsed.path.endswith(".js"):
            return

        is_asset = self.is_asset_url(normalized, rel=rel, alt=alt)
        entry = self.all_image_urls.setdefault(
            normalized,
            {
                "url": normalized,
                "type": "asset" if is_asset else "image",
                "found_on_pages": [],
                "alt": alt or "",
                "rel": rel or "",
                "local_path": "",
                "download_status": "pending",
            },
        )
        if page_url not in entry["found_on_pages"]:
            entry["found_on_pages"].append(page_url)

    def extract_images(self, soup: BeautifulSoup, page_url: str) -> tuple[list[str], list[str]]:
        images: set[str] = set()
        assets: set[str] = set()

        for img in soup.find_all("img"):
            alt = img.get("alt", "")
            for attr in ("src", "data-src", "data-lazy-src"):
                if img.get(attr):
                    self._add_image_candidate(img[attr], page_url, alt=alt)
            if img.get("srcset"):
                for part in img["srcset"].split(","):
                    candidate = part.strip().split(" ")[0]
                    self._add_image_candidate(candidate, page_url, alt=alt)

        for tag in soup.find_all("source"):
            for attr in ("src", "srcset"):
                if tag.get(attr):
                    value = tag[attr]
                    if attr == "srcset":
                        for part in value.split(","):
                            candidate = part.strip().split(" ")[0]
                            self._add_image_candidate(candidate, page_url)
                    else:
                        self._add_image_candidate(value, page_url)

        for link in soup.find_all("link", href=True):
            rel_values = link.get("rel") or []
            rel = " ".join(rel_values).lower()
            if any(token in rel for token in ("icon", "apple-touch-icon", "shortcut icon")):
                self._add_image_candidate(link["href"], page_url, rel=rel)

        for meta in soup.find_all("meta"):
            prop = (meta.get("property") or meta.get("name") or "").lower()
            if prop in {"og:image", "twitter:image", "msapplication-tileimage"} and meta.get("content"):
                self._add_image_candidate(meta["content"], page_url, rel=prop)

        for tag in soup.find_all(style=True):
            for match in re.findall(r"url\(['\"]?(.*?)['\"]?\)", tag["style"]):
                self._add_image_candidate(match, page_url)

        for entry in self.all_image_urls.values():
            if page_url in entry["found_on_pages"]:
                if entry["type"] == "asset":
                    assets.add(entry["url"])
                else:
                    images.add(entry["url"])

        return sorted(images), sorted(assets)

    def page_slug(self, url: str) -> str:
        parsed = urlparse(url)
        path = parsed.path.strip("/") or "home"
        slug = re.sub(r"[^a-zA-Z0-9_-]+", "-", path).strip("-").lower()
        return slug or "home"

    def crawl_page(self, url: str) -> PageRecord:
        record = PageRecord(
            url=url,
            path=urlparse(url).path or "/",
            crawled_at=datetime.now(timezone.utc).isoformat(),
        )

        response = self.fetch(url)
        if not response:
            record.error = "Request failed"
            return record

        record.status_code = response.status_code
        record.content_type = response.headers.get("Content-Type", "")

        if response.status_code != 200:
            record.error = f"HTTP {response.status_code}"
            return record

        content_type = record.content_type.lower()
        if "text/html" not in content_type and "application/xhtml" not in content_type:
            record.error = f"Unsupported content type: {record.content_type}"
            return record

        html = response.text
        soup = BeautifulSoup(html, "lxml")

        record.title, record.meta_description, record.canonical = self.extract_meta(soup)
        record.headings = self.extract_headings(soup)
        record.text_content = self.extract_text_content(soup)
        record.links = self.discover_links(soup, url)
        record.image_urls, record.asset_urls = self.extract_images(soup, url)

        slug = self.page_slug(url)
        page_json = {
            "url": record.url,
            "path": record.path,
            "title": record.title,
            "meta_description": record.meta_description,
            "canonical": record.canonical,
            "status_code": record.status_code,
            "content_type": record.content_type,
            "crawled_at": record.crawled_at,
            "headings": record.headings,
            "links": record.links,
            "image_urls": record.image_urls,
            "asset_urls": record.asset_urls,
            "text_content": record.text_content,
        }
        (self.pages_dir / f"{slug}.json").write_text(
            json.dumps(page_json, indent=2, ensure_ascii=False),
            encoding="utf-8",
        )
        (self.pages_dir / f"{slug}.html").write_text(html, encoding="utf-8")

        return record

    def crawl_site(self) -> None:
        self.setup_dirs()
        self.load_robots()

        queue: deque[str] = deque()
        start_url = self.normalize_url(self.base_url + "/")
        if not start_url:
            raise RuntimeError("Invalid base URL")

        for seed in self.seed_urls_from_sitemap():
            if seed not in self.visited_pages:
                queue.append(seed)
        queue.appendleft(start_url)

        while queue:
            url = queue.popleft()
            if url in self.visited_pages:
                continue
            if not self.is_crawlable_page(url):
                continue

            self.visited_pages.add(url)
            print(f"Crawling: {url}")
            record = self.crawl_page(url)
            self.page_records[url] = record

            if record.error:
                print(f"  Warning: {record.error}")
            else:
                for link in record.links:
                    if link not in self.visited_pages:
                        queue.append(link)

            time.sleep(REQUEST_DELAY)

    def _safe_filename(self, url: str) -> str:
        parsed = urlparse(url)
        path = parsed.path.strip("/") or "root"
        basename = Path(path).name
        if not basename or "." not in basename:
            basename = hashlib.sha256(url.encode()).hexdigest()[:16] + ".bin"

        basename = re.sub(r"[^\w.\-]", "_", basename)
        if parsed.query:
            query_hash = hashlib.sha256(parsed.query.encode()).hexdigest()[:8]
            stem = Path(basename).stem
            suffix = Path(basename).suffix or ".bin"
            basename = f"{stem}_{query_hash}{suffix}"
        return basename

    def download_images(self) -> None:
        for url, entry in sorted(self.all_image_urls.items()):
            target_dir = self.assets_dir if entry["type"] == "asset" else self.images_dir
            filename = self._safe_filename(url)

            base_path = target_dir / filename
            local_path = base_path
            counter = 1
            while local_path.exists() and self.downloaded_files.get(url) != str(local_path):
                local_path = target_dir / f"{base_path.stem}_{counter}{base_path.suffix}"
                counter += 1

            if url in self.downloaded_files:
                entry["local_path"] = self.downloaded_files[url]
                entry["download_status"] = "skipped_duplicate"
                continue

            print(f"Downloading {entry['type']}: {url}")
            response = self.fetch(url)
            if not response or response.status_code != 200:
                entry["download_status"] = "failed"
                if response:
                    entry["download_status"] = f"failed_http_{response.status_code}"
                continue

            content_type = response.headers.get("Content-Type", "").lower()
            if "text/html" in content_type and not url.lower().endswith(".svg"):
                entry["download_status"] = "failed_not_image"
                continue

            local_path.write_bytes(response.content)
            relative = str(local_path.relative_to(self.output_dir)).replace("\\", "/")
            entry["local_path"] = relative
            entry["download_status"] = "success"
            self.downloaded_files[url] = relative
            time.sleep(REQUEST_DELAY)

    def write_sitemap_json(self) -> None:
        pages = []
        for url in sorted(self.page_records.keys()):
            record = self.page_records[url]
            pages.append(
                {
                    "url": record.url,
                    "path": record.path,
                    "title": record.title,
                    "meta_description": record.meta_description,
                    "status_code": record.status_code,
                    "error": record.error,
                    "image_count": len(record.image_urls),
                    "asset_count": len(record.asset_urls),
                    "internal_links": record.links,
                }
            )

        payload = {
            "site": self.base_url,
            "crawled_at": datetime.now(timezone.utc).isoformat(),
            "total_pages": len(pages),
            "pages": pages,
        }
        (self.output_dir / "sitemap.json").write_text(
            json.dumps(payload, indent=2, ensure_ascii=False),
            encoding="utf-8",
        )

    def write_content_md(self) -> None:
        lines = [
            "# IRON PAN Website Content Export",
            "",
            f"Source: {self.base_url}",
            f"Generated: {datetime.now(timezone.utc).isoformat()}",
            "",
        ]

        for url in sorted(self.page_records.keys(), key=lambda item: self.page_slug(item)):
            record = self.page_records[url]
            lines.extend(
                [
                    "---",
                    "",
                    f"## {record.title or record.path}",
                    "",
                    f"- **URL:** {record.url}",
                    f"- **Path:** `{record.path}`",
                    f"- **Meta Description:** {record.meta_description or '(none)'}",
                    "",
                ]
            )

            if record.headings:
                lines.append("### Headings")
                lines.append("")
                for heading in record.headings:
                    lines.append(f"- **{heading['level'].upper()}:** {heading['text']}")
                lines.append("")

            lines.append("### Text Content")
            lines.append("")
            lines.append(record.text_content or "*(no text extracted)*")
            lines.append("")

        (self.output_dir / "content.md").write_text("\n".join(lines), encoding="utf-8")

    def write_images_json(self) -> None:
        payload = {
            "site": self.base_url,
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "total_images": sum(1 for item in self.all_image_urls.values() if item["type"] == "image"),
            "total_assets": sum(1 for item in self.all_image_urls.values() if item["type"] == "asset"),
            "items": sorted(self.all_image_urls.values(), key=lambda item: item["url"]),
        }
        (self.output_dir / "images.json").write_text(
            json.dumps(payload, indent=2, ensure_ascii=False),
            encoding="utf-8",
        )

    def write_report_md(self) -> None:
        successful_pages = [record for record in self.page_records.values() if not record.error]
        failed_pages = [record for record in self.page_records.values() if record.error]
        downloaded = [item for item in self.all_image_urls.values() if item["download_status"] == "success"]
        failed_downloads = [
            item for item in self.all_image_urls.values() if item["download_status"].startswith("failed")
        ]

        lines = [
            "# IRON PAN Crawl Report",
            "",
            f"**Site:** {self.base_url}",
            f"**Generated:** {datetime.now(timezone.utc).isoformat()}",
            "",
            "## Summary",
            "",
            f"| Metric | Count |",
            f"| --- | ---: |",
            f"| Pages discovered | {len(self.page_records)} |",
            f"| Pages crawled successfully | {len(successful_pages)} |",
            f"| Pages with errors | {len(failed_pages)} |",
            f"| Unique image URLs | {sum(1 for item in self.all_image_urls.values() if item['type'] == 'image')} |",
            f"| Unique asset URLs (logos/icons) | {sum(1 for item in self.all_image_urls.values() if item['type'] == 'asset')} |",
            f"| Files downloaded | {len(downloaded)} |",
            f"| Download failures | {len(failed_downloads)} |",
            "",
            "## Pages Found",
            "",
            "| URL | Title | Status | Images | Assets |",
            "| --- | --- | ---: | ---: | ---: |",
        ]

        for url in sorted(self.page_records.keys()):
            record = self.page_records[url]
            status = "OK" if not record.error else record.error
            title = (record.title or "-").replace("|", "\\|")
            lines.append(
                f"| {record.url} | {title} | {status} | {len(record.image_urls)} | {len(record.asset_urls)} |"
            )

        if failed_pages:
            lines.extend(["", "## Page Errors", ""])
            for record in failed_pages:
                lines.append(f"- **{record.url}** — {record.error}")

        if failed_downloads:
            lines.extend(["", "## Download Failures", ""])
            for item in failed_downloads:
                lines.append(f"- `{item['url']}` — {item['download_status']}")

        lines.extend(
            [
                "",
                "## Output Files",
                "",
                "- `pages/` — HTML and JSON metadata per page",
                "- `images/` — Downloaded content images",
                "- `assets/` — Logos, favicons, and icons",
                "- `sitemap.json` — Structured page index",
                "- `content.md` — Extracted text grouped by page",
                "- `images.json` — All discovered image and asset URLs",
                "- `report.md` — This report",
            ]
        )

        (self.output_dir / "report.md").write_text("\n".join(lines), encoding="utf-8")

    def run(self) -> None:
        print(f"Starting crawl of {self.base_url}")
        self.crawl_site()
        print("\nDownloading images and assets...")
        self.download_images()
        print("\nWriting output files...")
        self.write_sitemap_json()
        self.write_content_md()
        self.write_images_json()
        self.write_report_md()
        print(f"\nDone. Output written to: {self.output_dir}")


def main() -> int:
    crawler = SiteCrawler(BASE_URL, OUTPUT_DIR)
    crawler.run()
    return 0


if __name__ == "__main__":
    sys.exit(main())
