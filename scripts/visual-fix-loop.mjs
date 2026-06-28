import { spawn } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TARGET = 98;
const MAX_ITERATIONS = 5;

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, { cwd: ROOT, stdio: "inherit", shell: true });
    proc.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} failed`))));
  });
}

function parseScores() {
  const reportPath = join(ROOT, "comparison", "report.html");
  const html = readFileSync(reportPath, "utf-8");
  const matches = [...html.matchAll(/similarity similarity--\w+">([\d.]+)%/g)];
  const slugs = [...html.matchAll(/<h2>([^<]+)<\/h2>/g)];
  return slugs.map((s, i) => ({
    title: s[1],
    similarity: parseFloat(matches[i]?.[1] ?? "0"),
  }));
}

async function main() {
  for (let i = 1; i <= MAX_ITERATIONS; i++) {
    console.log(`\n=== Iteration ${i} ===\n`);
    await run("npm", ["run", "compare"]);

    const scores = parseScores();
    const min = Math.min(...scores.map((s) => s.similarity));
    console.log("\nScores:", scores.map((s) => `${s.title}: ${s.similarity}%`).join(", "));
    console.log(`Minimum: ${min}% (target ${TARGET}%)\n`);

    if (min >= TARGET) {
      console.log("Target reached.");
      break;
    }
  }

  writeFileSync(
    join(ROOT, "comparison", "iteration-log.txt"),
    `Last run: ${new Date().toISOString()}\n${parseScores().map((s) => `${s.title}: ${s.similarity}%`).join("\n")}`,
    "utf-8",
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
