const { contextBridge } = require("electron");

const portArg = process.argv.find((arg) => arg.startsWith("--finverde-api-port="));
const apiPort = portArg ? Number(portArg.split("=")[1]) : 3919;

contextBridge.exposeInMainWorld("finverde", {
  apiBase: `http://127.0.0.1:${apiPort}/api`,
  isDesktop: true,
});
