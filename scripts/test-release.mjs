import { spawnSync } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

const imageName = "pdf-tool-release:ci";
const containerName = "pdf-tool-release-smoke";
const url = "http://127.0.0.1:3000";
let containerStarted = false;

function runDocker(args) {
  const result = spawnSync("docker", args, { encoding: "utf8" });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(result.stderr || `Docker terminó con código ${result.status}`);
  }
  return result.stdout?.trim() ?? "";
}

async function waitForHttp() {
  for (let attempt = 1; attempt <= 30; attempt += 1) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(3000) });
      if (response.ok) {
        console.log(`Prueba de humo aprobada: HTTP ${response.status}`);
        return;
      }
      console.log(`Intento ${attempt}/30: HTTP ${response.status}`);
    } catch {
      console.log(`Intento ${attempt}/30: la aplicación aún no responde`);
    }
    await delay(2000);
  }

  const logs = spawnSync("docker", ["logs", containerName], { encoding: "utf8" });
  throw new Error(
    `La aplicación no respondió a tiempo.\n${logs.stdout ?? ""}\n${logs.stderr ?? ""}`
  );
}

try {
  console.log("Iniciando contenedor para la prueba de humo...");
  runDocker([
    "run", "--detach", "--rm",
    "--name", containerName,
    "--publish", "127.0.0.1:3000:3000",
    imageName,
  ]);
  containerStarted = true;
  await waitForHttp();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  if (containerStarted) {
    spawnSync("docker", ["stop", containerName], { stdio: "inherit" });
  }
}
