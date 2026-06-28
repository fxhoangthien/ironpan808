import { test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const sitemap = JSON.parse(readFileSync(join(ROOT, "output", "sitemap.json"), "utf-8"));

const OLD_BASE = "https://ironpan808.com";
const NEW_BASE = "http://localhost:3000";

function slugFromPath(path) {
  return path === "/" ? "home" : path.replace(/^\//, "").replace(/\//g, "-");
}

function newSiteUrl(path) {
  if (path === "/") return `${NEW_BASE}/pages/index.html`;
  return `${NEW_BASE}/pages${path}.html`;
}

for (const page of sitemap.pages) {
  const slug = slugFromPath(page.path);

  test(`visual capture: ${slug}`, async ({ page: browserPage }) => {
    test.skip(
      process.env.RUN_PLAYWRIGHT_CAPTURE !== "1",
      "Set RUN_PLAYWRIGHT_CAPTURE=1 to run capture-only tests",
    );

    await browserPage.goto(page.url, { waitUntil: "networkidle" });
    await browserPage.screenshot({
      path: join(ROOT, "comparison", "old", `${slug}.png`),
      fullPage: true,
    });

    await browserPage.goto(newSiteUrl(page.path), { waitUntil: "networkidle" });
    await browserPage.screenshot({
      path: join(ROOT, "comparison", "new", `${slug}.png`),
      fullPage: true,
    });
  });
}
