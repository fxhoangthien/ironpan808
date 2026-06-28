import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { basename, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT = join(ROOT, "output");
const PAGES_OUT = join(ROOT, "src", "pages");
const IMAGES_JSON = join(OUTPUT, "images.json");
const SITEMAP_JSON = join(OUTPUT, "sitemap.json");

const PAGE_MAP = {
  "/": "index.html",
  "/about-us": "about-us.html",
  "/menu": "menu.html",
  "/gallery": "gallery.html",
  "/contact-us": "contact-us.html",
  "/qr-code": "qr-code.html",
};

const CRAWL_FILES = {
  "/": "home.html",
  "/about-us": "about-us.html",
  "/menu": "menu.html",
  "/gallery": "gallery.html",
  "/contact-us": "contact-us.html",
  "/qr-code": "qr-code.html",
};

const HERO_MASK_WIDGETS = ["064504b", "3fcc355", "a73a1fc", "81d734f"];
const HERO_MASK_SELECTORS = HERO_MASK_WIDGETS.map((id) => `.elementor-element-${id} img`).join(",");

const POPUP_HIDE_CSS = `<style id="rebuild-normalize">
.jet-popup,.jet-popup__container,.jet-popup__inner,.jet-popup__overlay,[id^="jet-popup-"]{display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important;height:0!important;overflow:hidden!important}
html{scroll-behavior:auto!important}
${HERO_MASK_SELECTORS}{
  -webkit-mask-image:url(../assets/masks/circle.svg)!important;
  mask-image:url(../assets/masks/circle.svg)!important;
  -webkit-mask-size:cover!important;
  mask-size:cover!important;
  -webkit-mask-repeat:no-repeat!important;
  mask-repeat:no-repeat!important;
  -webkit-mask-position:center!important;
  mask-position:center!important;
}
</style>`;

const LAZYLOAD_FIX_SCRIPT = `<script id="rebuild-lazyload-fix">
document.addEventListener("DOMContentLoaded",function(){
  document.querySelectorAll(".e-con.e-parent,.e-con.e-parent *").forEach(function(el){
    el.classList.add("e-lazyloaded");
  });
  document.querySelectorAll('img[loading="lazy"]').forEach(function(img){
    img.loading="eager";
  });
});
</script>`;

function resolveAssetFile(folder, filename) {
  const dir = join(ROOT, "src", "assets", folder);
  const candidates = [
    filename,
    filename.replace(/_(\d+)(\.[^.]+)$/, "$2"),
    filename.replace(/(\.[^.]+)$/, "_1$1"),
    filename.replace(/(\.[^.]+)$/, "_2$1"),
  ];
  for (const candidate of [...new Set(candidates)]) {
    if (existsSync(join(dir, candidate))) return candidate;
  }
  return filename;
}

function buildImageMap() {
  const data = JSON.parse(readFileSync(IMAGES_JSON, "utf-8"));
  const map = new Map();

  for (const item of data.items) {
    if (!item.local_path || item.download_status !== "success") continue;

    const folder = item.type === "asset" ? "logos" : "images";
    const file = resolveAssetFile(folder, basename(item.local_path));
    const localUrl = `../assets/${folder}/${file}`;

    for (const url of [item.url, item.url.replace("https://", "//")]) {
      map.set(url, localUrl);
    }
  }

  return map;
}

function localPathForUploadUrl(url, imageMap) {
  const clean = url.split("?")[0].split("#")[0];
  const full = clean.startsWith("//") ? `https:${clean}` : clean;
  if (imageMap.has(full)) return imageMap.get(full);

  const uploadMatch = full.match(/\/wp-content\/(?:webp-express\/webp-images\/)?uploads\/(.+)$/);
  if (!uploadMatch) return null;

  let rel = uploadMatch[1];
  if (rel.endsWith(".webp")) {
    rel = rel.replace(/\.jpg\.webp$/, ".jpg").replace(/\.png\.webp$/, ".png").replace(/\.webp$/, "");
  }

  const name = basename(rel);
  for (const folder of ["images", "logos"]) {
    const file = resolveAssetFile(folder, name);
    if (existsSync(join(ROOT, "src", "assets", folder, file))) {
      return `../assets/${folder}/${file}`;
    }
  }
  return null;
}

const UPLOAD_URL_RE =
  /https:\/\/ironpan808\.com\/wp-content\/(?:webp-express\/webp-images\/)?uploads\/[^\s"'<>]+/g;

function replaceImages(html, imageMap) {
  return html.replace(UPLOAD_URL_RE, (match) => localPathForUploadUrl(match, imageMap) ?? match);
}

function replaceNavLinks(html) {
  let result = html;

  const pages = ["about-us", "menu", "gallery", "contact-us", "qr-code"];
  for (const slug of pages) {
    result = result.replaceAll(`href="https://ironpan808.com/${slug}"`, `href="${slug}.html"`);
    result = result.replaceAll(`href="https://ironpan808.com/${slug}/"`, `href="${slug}.html"`);
    result = result.replaceAll(`href='https://ironpan808.com/${slug}'`, `href='${slug}.html'`);
    result = result.replaceAll(`href='https://ironpan808.com/${slug}/'`, `href='${slug}.html'`);
    result = result.replaceAll(`href="/${slug}"`, `href="${slug}.html"`);
    result = result.replaceAll(`href="/${slug}/"`, `href="${slug}.html"`);
  }

  result = result.replace(/\bhref="https:\/\/ironpan808\.com\/"/g, 'href="index.html"');
  result = result.replace(/\bhref='https:\/\/ironpan808\.com\/'/g, "href='index.html'");
  result = result.replace(/\bhref="\/?"/g, 'href="index.html"');
  result = result.replace(/\bhref='\/?'/g, "href='index.html'");

  return result;
}

function stripLazyloadHideCss(html) {
  return html.replace(/<style>\s*\.e-con\.e-parent:nth-of-type[\s\S]*?<\/style>/g, "");
}

function injectNormalize(html) {
  let result = html;
  if (!result.includes('id="rebuild-normalize"')) {
    if (result.includes("</head>")) {
      result = result.replace("</head>", `${POPUP_HIDE_CSS}</head>`);
    } else {
      result = POPUP_HIDE_CSS + result;
    }
  }
  if (!result.includes('id="rebuild-lazyload-fix"') && result.includes("</body>")) {
    result = result.replace("</body>", `${LAZYLOAD_FIX_SCRIPT}</body>`);
  }
  return result;
}

function normalizePictureTags(html) {
  return html.replace(/<source[^>]*type="image\/webp"[^>]*>/gi, "");
}

function stripPopupScripts(html) {
  return html
    .replace(/<script[^>]*jet-popup[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<script[^>]*src="[^"]*jet-popup[^"]*"[^>]*><\/script>/gi, "");
}

function processHtml(html, imageMap) {
  let result = html;
  result = replaceImages(result, imageMap);
  result = replaceNavLinks(result);
  result = stripPopupScripts(result);
  result = stripLazyloadHideCss(result);
  result = normalizePictureTags(result);
  result = injectNormalize(result);
  return result;
}

function main() {
  mkdirSync(PAGES_OUT, { recursive: true });
  const imageMap = buildImageMap();
  const sitemap = JSON.parse(readFileSync(SITEMAP_JSON, "utf-8"));

  for (const page of sitemap.pages) {
    const crawlFile = CRAWL_FILES[page.path];
    const outFile = PAGE_MAP[page.path];
    if (!crawlFile || !outFile) continue;

    const sourcePath = join(OUTPUT, "pages", crawlFile);
    const html = readFileSync(sourcePath, "utf-8");
    const processed = processHtml(html, imageMap);
    writeFileSync(join(PAGES_OUT, outFile), processed, "utf-8");
    console.log(`Built ${outFile} from ${crawlFile}`);
  }

  console.log("Done — pages built from crawled HTML.");
}

main();
