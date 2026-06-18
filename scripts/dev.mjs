import { spawn } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, "..");
const viteBin = resolve(projectRoot, "node_modules", "vite", "bin", "vite.js");

const commands = [
  {
    name: "api",
    command: process.execPath,
    args: ["server/api.mjs"],
  },
  {
    name: "vite",
    command: process.execPath,
    args: [viteBin],
  },
];

for (const entry of commands) {
  const child = spawn(entry.command, entry.args, {
    stdio: "inherit",
    env: process.env,
    shell: false,
  });

  child.on("exit", (code) => {
    if (code && code !== 0) {
      process.exitCode = code;
    }
  });
}
