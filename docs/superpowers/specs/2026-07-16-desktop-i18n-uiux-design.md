# Diseño: Finalización de Savia (FinancialControl) — Desktop + i18n + UI/UX

Fecha: 2026-07-16 · Aprobado por el usuario.

## Objetivo

Terminar el proyecto para que corra sin errores como aplicación de escritorio (Windows),
con datos reales en todas las páginas, alternancia de idioma Español/Inglés, y una UI
consistente y bien distribuida. Se mantiene la identidad visual actual (paleta verde-agua
"Savia", tipografías DM Sans / DM Serif Display).

## Estado de partida

- Frontend: React 19 + Vite 8, sin router (App.jsx cambia páginas por string), CSS plano
  duplicado por página (sidebar/header repetidos en las 8 páginas).
- Backend: `server/api.mjs` — servidor `node:http` + `node:sqlite` (DatabaseSync), auth con
  tokens (sha256+salt) en `app_sessions.token_hash`. Requiere Node ≥ 22.13.
- Persistencia real: gastos, metas, eventos de calendario y tarjetas (PUT replace-all).
- Huecos: Dashboard/Perfil/Chatbot usan datos demo hardcodeados (cuenta id=1) y ceros para
  cuentas reales; la API key de Gemini viaja en el bundle del cliente (`VITE_GEMINI_API_KEY`);
  `base: '/ProyectFinancialControl/'` en vite.config; sin i18n; sin empaquetado desktop.

## Decisiones

- **Empaquetado**: Electron + electron-builder (instalador NSIS Windows). El proceso main
  arranca el mismo `server/api.mjs` embebido; en producción la BD vive en `app.getPath('userData')`.
  Electron reciente incluye Node ≥ 22.14, por lo que `node:sqlite` funciona sin flags.
- **Gemini**: se proxea por el servidor local (`POST /api/chat`); la key se lee de `.env`
  del servidor (`GEMINI_API_KEY`, sin prefijo VITE_) y nunca llega al cliente.
- **i18n**: contexto React propio, sin dependencias. Diccionarios `src/i18n/es.js` y
  `src/i18n/en.js`, hook `useI18n()` con `t(clave)`, selector ES/EN en el header, persistido
  en localStorage y en `users.language`. Fechas y montos con `toLocaleDateString/String`
  según idioma activo.
- **UI/UX**: alcance "pulido consistente": extraer `AppShell` (sidebar + header + layout)
  compartido con un único archivo de estilos/tokens; unificar espaciados, tipografía,
  estados hover/focus, estados vacíos y responsive. Sin rediseño de identidad.

## Fases

### Fase 1 — Bugs y datos reales
1. Dashboard calcula KPIs, categorías, movimientos, metas y próximos pagos desde
   `/api/expenses`, `/api/goals`, `/api/events` (la cuenta demo id=1 conserva datos de muestra).
2. Perfil: estadísticas reales (total ahorrado, gastos del mes, metas activas).
3. Chatbot: contexto para Gemini construido dinámicamente con los datos reales del usuario;
   nuevo endpoint `POST /api/chat` en el servidor.
4. Correcciones: orden de spread en `apiClient.js` (headers pisados por `...options`),
   `base` de vite condicionado al target, limpieza de bugs que aparezcan.

### Fase 2 — i18n ES/EN
- Infraestructura (`I18nProvider`, `useI18n`, diccionarios) + extracción de cadenas de las
  8 páginas y componentes. Selector de idioma visible en toda la app.

### Fase 3 — UI/UX
- `AppShell` compartido + tokens CSS globales; migrar las 8 páginas; eliminar CSS duplicado;
  revisar responsive y distribución en pantallas grandes.

### Fase 4 — Electron
- `electron/main.mjs` (arranca API in-process, carga `dist/index.html`), `electron-builder`
  con target NSIS; `API_BASE` absoluto (`http://127.0.0.1:3001/api`) cuando corre en Electron;
  BD en userData. Scripts: `npm run desktop` (dev) y `npm run dist` (instalador).

## Verificación
- `npm run lint` y `npm run build` limpios.
- Smoke tests del API (health, auth, CRUD de gastos/metas/eventos, chat).
- Arranque real de la app Electron empaquetada y flujo completo: registro → agregar gasto/meta/evento → ver dashboard real → cambiar idioma → cerrar y reabrir (persistencia).
