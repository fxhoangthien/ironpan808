import { cpSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const output = join(root, "output");
const imagesDest = join(root, "src", "assets", "images");
const logosDest = join(root, "src", "assets", "logos");

for (const dir of [imagesDest, logosDest]) {
  mkdirSync(dir, { recursive: true });
}

if (existsSync(join(output, "images"))) {
  cpSync(join(output, "images"), imagesDest, { recursive: true, force: true });
}

if (existsSync(join(output, "assets"))) {
  cpSync(join(output, "assets"), logosDest, { recursive: true, force: true });
}

console.log("Assets synced from /output to /src/assets");
