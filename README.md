# Savia — Control Financiero Personal

Aplicación de finanzas personales: registro de gastos, metas de ahorro, calendario
financiero, tarjetas y un asistente IA (Fina) impulsado por Gemini. Funciona como
web app y como **aplicación de escritorio para Windows** (Electron).

## Stack

- **Frontend:** React 19 + Vite, CSS propio (tokens de diseño en `src/components/appshell.css`)
- **Backend:** Node.js (`node:http` + `node:sqlite`), sin dependencias externas — `server/api.mjs`
- **Base de datos:** SQLite (`db/financial_control.sqlite` en desarrollo; en la app
  instalada vive en `%APPDATA%/savia-control-financiero/db/`)
- **Escritorio:** Electron + electron-builder (instalador NSIS)
- **Idiomas:** Español e Inglés (`src/i18n/`), selector ES/EN en el header

## Requisitos

- Node.js **≥ 22.13** (usa `node:sqlite`; probado con Node 24)

## Desarrollo

```bash
npm install
npm run dev          # API (127.0.0.1:3001) + Vite (localhost:5173)
npm run desktop:dev  # igual, pero dentro de una ventana Electron
```

## Escritorio (producción)

```bash
npm run desktop      # compila y abre la app Electron local
npm run dist         # genera el instalador Windows en release/
```

## Asistente IA (opcional)

Copia `.env.example` a `.env` y coloca tu clave de Gemini:

```
GEMINI_API_KEY=...
```

La clave se usa únicamente en el servidor local (`POST /api/chat`); si no hay clave,
el chatbot responde en modo local básico. En la app instalada también puedes crear
el archivo `.env` en `%APPDATA%/savia-control-financiero/`.

## Cuenta demo

`juan.perez@gmail.com` / `Savia123!` — cuenta con datos de muestra.

## Estructura

```
electron/    proceso principal y preload de Electron
server/      API HTTP + SQLite (auth, gastos, metas, eventos, tarjetas, chat IA)
src/pages/   páginas (dashboard, gastos, metas, calendario, chatbot, perfil, planes)
src/i18n/    diccionarios es/en y proveedor de idioma
src/components/  AppShell (layout compartido), tarjetas del sidebar, selector de idioma
db/          esquema y datos semilla de SQLite
```
