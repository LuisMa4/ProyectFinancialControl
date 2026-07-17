// Modo desarrollo de escritorio: levanta API + Vite y abre Electron
// apuntando al dev server (con recarga en caliente).
import { spawn } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const viteBin = resolve(projectRoot, "node_modules", "vite", "bin", "vite.js");
const electronBin = resolve(projectRoot, "node_modules", ".bin", process.platform === "win32" ? "electron.cmd" : "electron");

const children = [];

const launch = (command, args, extraEnv = {}) => {
  const child = spawn(command, args, {
    stdio: "inherit",
    cwd: projectRoot,
    env: { ...process.env, ...extraEnv },
    shell: process.platform === "win32" && command.endsWith(".cmd"),
  });
  children.push(child);
  return child;
};

launch(process.execPath, [resolve(projectRoot, "server", "api.mjs")]);
launch(process.execPath, [viteBin]);

setTimeout(() => {
  const electron = launch(electronBin, ["."], {
    ELECTRON_START_URL: "http://localhost:5173",
    FINVERDE_PORT: "3001",
  });
  electron.on("exit", () => {
    for (const child of children) child.kill();
    process.exit(0);
  });
}, 2500);
