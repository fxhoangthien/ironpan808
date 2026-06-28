import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITEMAP_PATH = join(ROOT, "output", "sitemap.json");
const OUTPUT_DIR = join(ROOT, "comparison");
const OLD_DIR = join(OUTPUT_DIR, "old");
const NEW_DIR = join(OUTPUT_DIR, "new");
const DIFF_DIR = join(OUTPUT_DIR, "diff");

const OLD_BASE = "https://ironpan808.com";
const NEW_BASE = "http://localhost:3000";
const VIEWPORT = { width: 1440, height: 900 };

for (const dir of [OUTPUT_DIR, OLD_DIR, NEW_DIR, DIFF_DIR]) {
  mkdirSync(dir, { recursive: true });
}

function slugFromPath(path) {
  return path === "/" ? "home" : path.replace(/^\//, "").replace(/\//g, "-");
}

function newSiteUrl(path) {
  if (path === "/") return `${NEW_BASE}/pages/index.html`;
  return `${NEW_BASE}/pages${path}.html`;
}

function loadSitemapPages() {
  const sitemap = JSON.parse(readFileSync(SITEMAP_PATH, "utf-8"));
  return sitemap.pages.map((page) => ({
    path: page.path,
    slug: slugFromPath(page.path),
    oldUrl: page.url,
    newUrl: newSiteUrl(page.path),
    title: page.title,
  }));
}

async function preparePage(page) {
  await page.addInitScript(() => {
    const style = document.createElement("style");
    style.textContent = `
      .jet-popup, .jet-popup__container, .jet-popup__inner, .jet-popup__overlay,
      [id^="jet-popup-"] { display: none !important; visibility: hidden !important; opacity: 0 !important; }
    `;
    document.documentElement.appendChild(style);

    const stripWebp = () => {
      document.querySelectorAll('source[type="image/webp"]').forEach((el) => el.remove());
    };
    stripWebp();
    document.addEventListener("DOMContentLoaded", () => {
      stripWebp();
      document.querySelectorAll(".e-con.e-parent, .e-con.e-parent *").forEach((el) => {
        el.classList.add("e-lazyloaded");
      });
    });
  });
}

async function forceLazyContent(page) {
  await page.evaluate(async () => {
    document.querySelectorAll(".e-con.e-parent, .e-con.e-parent *").forEach((el) => {
      el.classList.add("e-lazyloaded");
    });
    document.querySelectorAll('img[loading="lazy"]').forEach((img) => {
      img.loading = "eager";
    });

    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const height = document.body.scrollHeight;
    for (let y = 0; y < height; y += 500) {
      window.scrollTo(0, y);
      await wait(80);
    }
    window.scrollTo(0, 0);
    await wait(300);

    await Promise.all(
      [...document.images].map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.addEventListener("load", resolve, { once: true });
          img.addEventListener("error", resolve, { once: true });
        });
      }),
    );
  });
}

async function dismissOverlays(page) {
  await page.evaluate(() => {
    document.querySelectorAll(".jet-popup, [id^='jet-popup-']").forEach((el) => el.remove());
  });

  const selectors = [
    ".jet-popup__close-button",
    ".jet-popup__close",
    "button[aria-label='Close popup']",
    "button[aria-label='Close']",
  ];

  for (const selector of selectors) {
    const button = page.locator(selector).first();
    if (await button.isVisible({ timeout: 300 }).catch(() => false)) {
      await button.click({ timeout: 800 }).catch(() => {});
    }
  }
}

async function captureFullPage(page, url, outputPath) {
  await preparePage(page);
  await page.goto(url, { waitUntil: "networkidle", timeout: 120_000 });
  await dismissOverlays(page);
  await forceLazyContent(page);
  await page.waitForTimeout(1500);
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: outputPath, fullPage: true });
}

function readPng(filePath) {
  return PNG.sync.read(readFileSync(filePath));
}

function resizePng(source, width, height) {
  const target = new PNG({ width, height });
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const srcX = Math.min(Math.floor((x / width) * source.width), source.width - 1);
      const srcY = Math.min(Math.floor((y / height) * source.height), source.height - 1);
      const srcIdx = (source.width * srcY + srcX) << 2;
      const dstIdx = (width * y + x) << 2;
      target.data[dstIdx] = source.data[srcIdx];
      target.data[dstIdx + 1] = source.data[srcIdx + 1];
      target.data[dstIdx + 2] = source.data[srcIdx + 2];
      target.data[dstIdx + 3] = source.data[srcIdx + 3];
    }
  }
  return target;
}

function compareImages(oldPath, newPath, diffPath) {
  const imgOld = readPng(oldPath);
  const imgNew = readPng(newPath);

  const width = Math.max(imgOld.width, imgNew.width);
  const height = Math.max(imgOld.height, imgNew.height);

  const normalizedOld =
    imgOld.width === width && imgOld.height === height ? imgOld : resizePng(imgOld, width, height);
  const normalizedNew =
    imgNew.width === width && imgNew.height === height ? imgNew : resizePng(imgNew, width, height);

  const diff = new PNG({ width, height });
  const diffPixels = pixelmatch(
    normalizedOld.data,
    normalizedNew.data,
    diff.data,
    width,
    height,
    { threshold: 0.1, includeAA: true },
  );

  writeFileSync(diffPath, PNG.sync.write(diff));

  const totalPixels = width * height;
  const similarity = ((totalPixels - diffPixels) / totalPixels) * 100;

  return {
    width,
    height,
    diffPixels,
    totalPixels,
    similarity: Math.round(similarity * 100) / 100,
  };
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function similarityClass(similarity) {
  if (similarity >= 90) return "good";
  if (similarity >= 75) return "warn";
  return "bad";
}

function generateReport(results) {
  const avgSimilarity =
    Math.round((results.reduce((sum, r) => sum + r.similarity, 0) / results.length) * 100) / 100;

  const rows = results
    .map(
      (r) => `<article class="page-card">
  <header class="page-card__header">
    <div>
      <h2>${escapeHtml(r.title)}</h2>
      <p class="path">${escapeHtml(r.path)}</p>
    </div>
    <div class="similarity similarity--${similarityClass(r.similarity)}">${r.similarity}%</div>
  </header>
  <dl class="meta">
    <div><dt>Old</dt><dd><a href="${escapeHtml(r.oldUrl)}" target="_blank" rel="noopener">${escapeHtml(r.oldUrl)}</a></dd></div>
    <div><dt>New</dt><dd><a href="${escapeHtml(r.newUrl)}" target="_blank" rel="noopener">${escapeHtml(r.newUrl)}</a></dd></div>
    <div><dt>Dimensions</dt><dd>${r.width} × ${r.height}px</dd></div>
    <div><dt>Diff pixels</dt><dd>${r.diffPixels.toLocaleString()} / ${r.totalPixels.toLocaleString()}</dd></div>
  </dl>
  <div class="shots">
    <figure><figcaption>Original</figcaption><a href="old/${r.slug}.png"><img src="old/${r.slug}.png" alt="Original ${escapeHtml(r.slug)}" loading="lazy"></a></figure>
    <figure><figcaption>Rebuild</figcaption><a href="new/${r.slug}.png"><img src="new/${r.slug}.png" alt="Rebuild ${escapeHtml(r.slug)}" loading="lazy"></a></figure>
    <figure><figcaption>Diff</figcaption><a href="diff/${r.slug}.png"><img src="diff/${r.slug}.png" alt="Diff ${escapeHtml(r.slug)}" loading="lazy"></a></figure>
  </div>
</article>`,
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>IRON PAN Visual Comparison Report</title>
  <style>
    :root {
      --bg: #f7f3eb;
      --card: #fff;
      --text: #213e36;
      --muted: #5a5a5a;
      --good: #2e7d32;
      --warn: #ed6c02;
      --bad: #c62828;
      --border: #d9d0c3;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Poppins, system-ui, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.5;
    }
    .wrap { width: min(1200px, 100% - 2rem); margin: 0 auto; padding: 2rem 0 3rem; }
    h1 { font-family: "EB Garamond", Georgia, serif; font-size: 2.25rem; margin: 0 0 0.5rem; }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1rem;
      margin: 1.5rem 0 2rem;
    }
    .summary div {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1rem 1.25rem;
    }
    .summary strong { display: block; font-size: 1.75rem; }
    .summary span { color: var(--muted); font-size: 0.875rem; }
    .page-card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 1.25rem;
      margin-bottom: 1.5rem;
    }
    .page-card__header {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      align-items: start;
      margin-bottom: 1rem;
    }
    .page-card h2 { margin: 0; font-size: 1.25rem; }
    .path { margin: 0.25rem 0 0; color: var(--muted); font-size: 0.875rem; }
    .similarity {
      font-size: 1.5rem;
      font-weight: 700;
      padding: 0.35rem 0.75rem;
      border-radius: 999px;
      white-space: nowrap;
    }
    .similarity--good { background: #e8f5e9; color: var(--good); }
    .similarity--warn { background: #fff3e0; color: var(--warn); }
    .similarity--bad { background: #ffebee; color: var(--bad); }
    .meta {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 0.75rem 1rem;
      margin: 0 0 1rem;
      font-size: 0.875rem;
    }
    .meta dt { color: var(--muted); font-weight: 600; }
    .meta dd { margin: 0.15rem 0 0; word-break: break-all; }
    .shots {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.75rem;
    }
    figure { margin: 0; }
    figcaption {
      font-size: 0.8125rem;
      font-weight: 600;
      margin-bottom: 0.35rem;
      color: var(--muted);
    }
    .shots img {
      width: 100%;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: #fff;
    }
    @media (max-width: 900px) {
      .shots { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>Visual Comparison Report</h1>
    <p>Comparing <strong>${escapeHtml(OLD_BASE)}</strong> vs <strong>${escapeHtml(NEW_BASE)}</strong></p>
    <div class="summary">
      <div><strong>${results.length}</strong><span>Pages compared</span></div>
      <div><strong>${avgSimilarity}%</strong><span>Average similarity</span></div>
      <div><strong>${Math.min(...results.map((r) => r.similarity))}%</strong><span>Lowest similarity</span></div>
      <div><strong>${Math.max(...results.map((r) => r.similarity))}%</strong><span>Highest similarity</span></div>
    </div>
    ${rows}
  </div>
</body>
</html>`;
}

async function checkNewSiteReady() {
  try {
    const response = await fetch(`${NEW_BASE}/pages/index.html`, { signal: AbortSignal.timeout(5000) });
    return response.ok;
  } catch {
    return false;
  }
}

async function main() {
  const ready = await checkNewSiteReady();
  if (!ready) {
    console.error(`New site is not reachable at ${NEW_BASE}. Start it first:`);
    console.error("  npm run dev:3000");
    console.error("  or: npm run preview:3000");
    process.exit(1);
  }

  const pages = loadSitemapPages();
  console.log(`Comparing ${pages.length} pages from sitemap.json...\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
  });

  const results = [];

  for (const pageInfo of pages) {
    const page = await context.newPage();
    const oldPath = join(OLD_DIR, `${pageInfo.slug}.png`);
    const newPath = join(NEW_DIR, `${pageInfo.slug}.png`);
    const diffPath = join(DIFF_DIR, `${pageInfo.slug}.png`);

    console.log(`[${pageInfo.slug}] Capturing old: ${pageInfo.oldUrl}`);
    await captureFullPage(page, pageInfo.oldUrl, oldPath);

    console.log(`[${pageInfo.slug}] Capturing new: ${pageInfo.newUrl}`);
    await captureFullPage(page, pageInfo.newUrl, newPath);

    console.log(`[${pageInfo.slug}] Comparing...`);
    const comparison = compareImages(oldPath, newPath, diffPath);

    results.push({
      ...pageInfo,
      ...comparison,
    });

    console.log(`[${pageInfo.slug}] Similarity: ${comparison.similarity}%\n`);
    await page.close();
  }

  await browser.close();

  const reportHtml = generateReport(results);
  writeFileSync(join(OUTPUT_DIR, "report.html"), reportHtml, "utf-8");

  console.log("Done.");
  console.log(`Report: ${join(OUTPUT_DIR, "report.html")}`);
  console.log(`Screenshots: ${OUTPUT_DIR}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
