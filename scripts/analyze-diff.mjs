import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "comparison");
const pages = ["about-us", "contact-us", "gallery", "menu"];

function readPng(path) {
  return PNG.sync.read(readFileSync(path));
}

function analyze(slug) {
  const oldImg = readPng(join(ROOT, "old", `${slug}.png`));
  const newImg = readPng(join(ROOT, "new", `${slug}.png`));
  const w = Math.min(oldImg.width, newImg.width);
  const h = Math.min(oldImg.height, newImg.height);

  const diff = new PNG({ width: w, height: h });
  const diffPixels = pixelmatch(oldImg.data, newImg.data, diff.data, w, h, {
    threshold: 0.1,
    includeAA: true,
  });

  const bands = [
    ["header (0-120px)", 0, 120],
    ["hero (120-650px)", 120, 650],
    ["main (650-70%)", 650, Math.floor(h * 0.7)],
    ["footer (70%-100%)", Math.floor(h * 0.7), h],
  ];

  const bandDiffs = bands.map(([label, y0, y1]) => {
    let count = 0;
    for (let y = y0; y < y1; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (w * y + x) * 4;
        if (diff.data[idx] === 255 && diff.data[idx + 1] === 0 && diff.data[idx + 2] === 0) count++;
      }
    }
    const total = w * (y1 - y0);
    return { label, count, pct: Math.round(((total - count) / total) * 10000) / 100 };
  });

  console.log(`\n${slug}: ${Math.round(((w * h - diffPixels) / (w * h)) * 10000) / 100}% overall (${w}x${h})`);
  bandDiffs.forEach((b) => console.log(`  ${b.label}: ${b.pct}% similar`));
}

pages.forEach(analyze);
