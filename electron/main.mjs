import { app, BrowserWindow, shell } from "electron";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const isDev = !app.isPackaged;

const API_PORT = Number(process.env.FINVERDE_PORT || 3919);

// En producción la base de datos vive en la carpeta de datos del usuario,
// nunca dentro del instalador (que es de solo lectura).
if (!isDev) {
  process.env.FINVERDE_DB_DIR = join(app.getPath("userData"), "db");
}
process.env.PORT = String(API_PORT);

let mainWindow = null;

const startApiServer = async () => {
  // El servidor arranca al importarse (escucha en 127.0.0.1)
  await import("../server/api.mjs");
};

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 900,
    minHeight: 620,
    show: false,
    backgroundColor: "#EDF8F7",
    autoHideMenuBar: true,
    title: "Savia — Control Financiero",
    webPreferences: {
      preload: join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      additionalArguments: [`--finverde-api-port=${API_PORT}`],
    },
  });

  mainWindow.once("ready-to-show", () => mainWindow.show());

  // Los enlaces externos se abren en el navegador del sistema
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http")) shell.openExternal(url);
    return { action: "deny" };
  });

  if (process.env.ELECTRON_START_URL) {
    mainWindow.loadURL(process.env.ELECTRON_START_URL);
  } else {
    mainWindow.loadFile(resolve(__dirname, "..", "dist", "index.html"));
  }
};

app.whenReady().then(async () => {
  try {
    await startApiServer();
  } catch (error) {
    console.error("No se pudo iniciar el servidor API:", error);
  }
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
