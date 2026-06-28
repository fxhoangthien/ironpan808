import { spawn, execSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const NEW_BASE = "http://localhost:3000";

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, { cwd: ROOT, stdio: "inherit", shell: true });
    proc.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} failed`))));
  });
}

function killPort(port) {
  try {
    execSync(
      `powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort ${port} -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"`,
      { stdio: "ignore" },
    );
  } catch {
    // ignore
  }
  try {
    execSync("ping -n 3 127.0.0.1 > nul", { shell: true, stdio: "ignore" });
  } catch {
    // ignore
  }
}

async function waitForServer(maxAttempts = 40) {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetch(`${NEW_BASE}/pages/index.html`, {
        signal: AbortSignal.timeout(5000),
      });
      const html = await response.text();
      if (response.ok && html.includes("rebuild-normalize") && html.includes("elementor-page")) {
        return;
      }
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`Server not ready at ${NEW_BASE}`);
}

async function main() {
  await run("npm", ["run", "pages"]);

  killPort(3000);

  console.log(`Starting dev server on ${NEW_BASE}...`);
  const server = spawn("npx", ["vite", "--port", "3000"], {
    cwd: ROOT,
    stdio: ["ignore", "pipe", "pipe"],
    shell: true,
  });

  server.stdout?.on("data", (chunk) => process.stdout.write(chunk));
  server.stderr?.on("data", (chunk) => process.stderr.write(chunk));

  try {
    await waitForServer();
    console.log("Server ready.\n");
    await run("npm", ["run", "compare:visual"]);
  } finally {
    server.kill("SIGTERM");
    killPort(3000);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
