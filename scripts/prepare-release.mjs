import { spawnSync } from "node:child_process";

const imageName = "pdf-tool-release:ci";

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (result.error) {
    console.error(`No se pudo ejecutar ${command}: ${result.error.message}`);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log("Preparando el entorno de liberación con Docker...");
run("docker", ["build", "--tag", imageName, "--file", "Dockerfile", "."]);
console.log(`Imagen creada correctamente: ${imageName}`);
