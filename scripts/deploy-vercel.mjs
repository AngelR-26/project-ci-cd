import { mkdir, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const required = ["VERCEL_TOKEN", "VERCEL_ORG_ID", "VERCEL_PROJECT_ID"];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(`Faltan secretos de GitHub Actions: ${missing.join(", ")}`);
  process.exit(1);
}

const appDirectory = resolve("app");
const vercelDirectory = resolve(appDirectory, ".vercel");

await mkdir(vercelDirectory, { recursive: true });
await writeFile(
  resolve(vercelDirectory, "project.json"),
  JSON.stringify({
    orgId: process.env.VERCEL_ORG_ID,
    projectId: process.env.VERCEL_PROJECT_ID,
  }, null, 2),
  "utf8",
);

console.log("Iniciando despliegue de producción en Vercel...");

const result = spawnSync(
  "pnpm",
  [
    "dlx",
    "vercel@latest",
    "deploy",
    "--prod",
    "--yes",
    `--token=${process.env.VERCEL_TOKEN}`,
  ],
  {
    cwd: appDirectory,
    stdio: "inherit",
    shell: process.platform === "win32",
    env: process.env,
  },
);

if (result.error) {
  console.error(`No se pudo ejecutar Vercel CLI: ${result.error.message}`);
  process.exit(1);
}

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

console.log("Vercel CLI terminó correctamente.");
