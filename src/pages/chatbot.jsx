import { useState, useRef, useEffect } from "react";

/* ─────────────────────────────────────────
   DATA & CONFIG
───────────────────────────────────────── */
import AppShell from "../components/AppShell";
import { useI18n } from "../i18n/index.jsx";
import {
  EXPENSE_CATEGORIES,
  addStoredExpense,
} from "../utils/expensesStorage";
import { loadStoredGoals } from "../utils/goalsStorage";
import { apiRequest } from "../utils/apiClient";

const SUGERENCIAS_INIT = [
  { id:1, texto:"¿Cómo va mi presupuesto este mes?",   icono:"📊" },
  { id:2, texto:"¿Cuándo terminaré mi meta de Europa?", icono:"✈️" },
  { id:3, texto:"¿En qué categorías me estoy pasando?", icono:"⚠️" },
  { id:4, texto:"Dame 3 tips para ahorrar más",         icono:"💡" },
  { id:5, texto:"¿Cuánto debería guardar cada mes?",    icono:"🎯" },
  { id:6, texto:"Analiza mi salud financiera",          icono:"🩺" },
];

const SUGERENCIAS_EMPTY = [
  { id:1, texto:"¿Cómo empiezo mi presupuesto desde cero?", icono:"📊" },
  { id:2, texto:"¿Qué categorías de gastos debería crear?", icono:"💳" },
  { id:3, texto:"Ayúdame a definir mi primera meta", icono:"🎯" },
  { id:4, texto:"Dame 3 tips para organizar mis finanzas", icono:"💡" },
];

// Las llamadas a Gemini se hacen a través del servidor local (/api/chat):
// la API key nunca llega al navegador.

/* ─────────────────────────────────────────
   STYLES
───────────────────────────────────────── */
const S = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --agua:#7EC8C0;--agua-l:#A8DBD6;--agua-p:#D4F0ED;--agua-d:#5AADA5;
  --mint:#EDF8F7;--white:#FAFFFE;--slate:#2D4A47;--slate-m:#4A706C;
  --muted:#8AADA9;--border:#DDE9E7;--gold:#C9A96E;--red:#E07070;--green:#4CAF7D;
  --sw:240px;
}
html,body{height:100%;overflow:hidden}
body{font-family:'DM Sans',sans-serif;background:var(--mint);color:var(--slate)}
#root:has(.chatbot-app){width:100%;max-width:none;min-height:100svh;margin:0;border:0;text-align:left}

/* ── LAYOUT ── */
.app{display:flex;height:100vh;overflow:hidden}
.chatbot-app.app{position:fixed;inset:0;display:flex;width:100vw;max-width:none;height:100svh;overflow:hidden;background:var(--mint)}

/* ── SIDEBAR ── */
.sidebar{width:var(--sw);background:var(--slate);display:flex;flex-direction:column;position:fixed;top:0;left:0;height:100vh;z-index:50;transition:transform .3s ease;flex-shrink:0}
.chatbot-app .sidebar{width:240px;min-width:240px;max-width:240px;flex:0 0 240px}
.sidebar.collapsed{transform:translateX(-100%)}
.sb-brand{display:flex;align-items:center;gap:10px;padding:24px 24px 20px;border-bottom:1px solid rgba(255,255,255,.08)}
.sb-ico{width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,var(--agua-d),var(--agua));display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}
.sb-txt{font-family:'DM Serif Display',serif;font-size:22px;color:white;letter-spacing:-.3px}
.sb-nav{flex:1;padding:16px 12px;display:flex;flex-direction:column;gap:4px;overflow-y:auto}
.nav-item{display:flex;align-items:center;gap:12px;padding:11px 14px;border-radius:10px;font-size:14px;color:rgba(255,255,255,.55);cursor:pointer;transition:all .18s;border:none;background:none;width:100%;text-align:left;font-family:'DM Sans',sans-serif}
.nav-item:hover{background:rgba(255,255,255,.07);color:rgba(255,255,255,.85)}
.nav-item.active{background:linear-gradient(135deg,rgba(90,173,165,.35),rgba(126,200,192,.2));color:white;font-weight:500;box-shadow:inset 0 0 0 1px rgba(126,200,192,.22)}
.sb-footer{padding:16px 12px;border-top:1px solid rgba(255,255,255,.08)}
.user-chip{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;background:rgba(255,255,255,.06)}
.user-av{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,var(--agua-d),var(--agua));display:flex;align-items:center;justify-content:center;font-size:14px;color:white;font-weight:600;flex-shrink:0}
.user-nm{font-size:13px;font-weight:500;color:white;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.user-pl{font-size:11px;color:var(--agua-l)}
.sb-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:99}
.sb-overlay.show{display:block}

/* ── MAIN ── */
.main{margin-left:var(--sw);flex:1;display:flex;flex-direction:column;min-width:0;height:100vh;overflow:hidden}
.chatbot-app .main{margin-left:240px;width:calc(100vw - 240px);height:100svh}

/* ── HEADER ── */
.header{background:var(--white);border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;padding:0 24px;height:64px;flex-shrink:0;gap:12px}
.hd-left{display:flex;align-items:center;gap:12px;min-width:0}
.hamburger{display:none;background:none;border:1px solid var(--border);border-radius:9px;padding:7px 9px;cursor:pointer;font-size:15px;color:var(--slate-m);transition:all .15s;flex-shrink:0}
.hamburger:hover{background:var(--mint);border-color:var(--agua-l)}
.hd-titles{min-width:0}
.hd-eye{font-size:12px;color:var(--muted);font-weight:300}
.hd-title{font-family:'DM Serif Display',serif;font-size:20px;color:var(--slate);letter-spacing:-.3px}
.hd-right{display:flex;align-items:center;gap:8px;flex-shrink:0}
.btn-ghost{padding:8px 10px;background:none;border:1px solid var(--border);border-radius:9px;cursor:pointer;font-size:14px;color:var(--slate-m);transition:all .17s;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;display:flex;align-items:center;gap:5px}
.btn-ghost:hover{background:var(--mint);border-color:var(--agua-l);color:var(--agua-d)}
.btn-ghost.active-btn{background:var(--agua-p);border-color:var(--agua);color:var(--agua-d)}

/* ── CHAT WRAP (dentro de AppShell) ── */
.chat-wrap{display:flex;flex-direction:column;height:calc(100vh - 64px);min-height:0;overflow:hidden;background:var(--mint)}

/* ── CHAT LAYOUT ── */
.chat-layout{display:grid;grid-template-columns:minmax(180px,220px) minmax(0,1fr);flex:1;overflow:hidden;min-height:0}
.chat-layout.no-history{grid-template-columns:1fr}

/* ── HISTORY PANEL ── */
.history-panel{background:var(--white);border-right:1px solid var(--border);display:flex;flex-direction:column;overflow:hidden}
.hist-head{padding:12px 12px 10px;border-bottom:1px solid var(--border);flex-shrink:0}
.hist-title{font-size:11px;font-weight:600;color:var(--slate-m);letter-spacing:.3px;text-transform:uppercase;margin-bottom:8px}
.new-chat-btn{width:100%;padding:8px;background:linear-gradient(135deg,var(--agua-d),var(--agua));color:white;border:none;border-radius:8px;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:500;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;box-shadow:0 2px 10px rgba(90,173,165,.25);transition:all .17s}
.new-chat-btn:hover{transform:translateY(-1px);box-shadow:0 4px 16px rgba(90,173,165,.35)}
.hist-list{flex:1;overflow-y:auto;padding:8px}
.hist-item{padding:8px 10px;border-radius:9px;cursor:pointer;transition:background .15s;margin-bottom:4px}
.hist-item:hover{background:var(--mint)}
.hist-item.active{background:var(--agua-p);border:1px solid var(--agua-l)}
.hist-item-title{font-size:13px;font-weight:500;color:var(--slate);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hist-item-date{font-size:11px;color:var(--muted);margin-top:2px}
.hist-item-preview{font-size:11.5px;color:var(--muted);margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hist-sep{font-size:9.5px;font-weight:600;color:var(--muted);letter-spacing:.5px;text-transform:uppercase;padding:8px 8px 4px}

/* ── CHAT AREA ── */
.chat-area{display:flex;flex-direction:column;min-height:0;flex:1;overflow:hidden;background:var(--mint)}

/* Messages */
.messages{flex:1;overflow-y:auto;padding:24px 28px;display:flex;flex-direction:column;gap:18px;scroll-behavior:smooth}
.messages::-webkit-scrollbar{width:4px}
.messages::-webkit-scrollbar-track{background:transparent}
.messages::-webkit-scrollbar-thumb{background:var(--border);border-radius:2px}

/* Welcome screen */
.welcome{display:flex;flex-direction:column;align-items:center;text-align:center;padding:32px 24px 20px;animation:fadeUp .5s ease;width:100%;max-width:900px;margin:0 auto}
.welcome-avatar{width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,var(--agua-d),var(--agua));display:flex;align-items:center;justify-content:center;font-size:27px;margin-bottom:14px;box-shadow:0 6px 24px rgba(90,173,165,.3);animation:pulse 3s ease-in-out infinite}
@keyframes pulse{0%,100%{box-shadow:0 6px 24px rgba(90,173,165,.3)}50%{box-shadow:0 6px 32px rgba(90,173,165,.5)}}
.welcome-title{font-family:'DM Serif Display',serif;font-size:23px;color:var(--slate);letter-spacing:-.2px;margin-bottom:6px}
.welcome-sub{font-size:13px;color:var(--muted);font-weight:300;line-height:1.55;max-width:520px;margin-bottom:20px}

/* Suggestion chips */
.suggestions-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:8px;width:100%;max-width:820px}
.sug-chip{display:flex;align-items:center;gap:8px;min-height:44px;padding:9px 11px;background:var(--white);border:1.5px solid var(--border);border-radius:10px;cursor:pointer;transition:all .18s;text-align:left;font-family:'DM Sans',sans-serif}
.sug-chip:hover{border-color:var(--agua);background:var(--agua-p);transform:translateY(-1px);box-shadow:0 4px 16px rgba(90,173,165,.12)}
.sug-ico{font-size:16px;flex-shrink:0}
.sug-txt{font-size:12px;color:var(--slate-m);line-height:1.3}

/* Messages */
.msg{display:flex;gap:10px;animation:fadeUp .3s ease}
.msg.user{flex-direction:row-reverse}
.msg-avatar{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;margin-top:2px}
.msg-avatar.fina{background:linear-gradient(135deg,var(--agua-d),var(--agua));font-size:17px}
.msg-avatar.user{background:var(--slate);color:white;font-size:12px;font-weight:600}
.msg-bubble{max-width:72%;display:flex;flex-direction:column;gap:4px}
.msg.user .msg-bubble{align-items:flex-end}
.msg-content{padding:12px 16px;border-radius:16px;font-size:14px;line-height:1.65}
.msg.fina .msg-content{background:var(--white);color:var(--slate);border:1px solid var(--border);border-bottom-left-radius:4px}
.msg.user .msg-content{background:linear-gradient(135deg,var(--agua-d),var(--agua));color:white;border-bottom-right-radius:4px;box-shadow:0 2px 10px rgba(90,173,165,.25)}
.msg-meta-row{display:flex;align-items:center;gap:6px;padding:0 4px}
.msg.user .msg-meta-row{justify-content:flex-end}
.msg-time{font-size:10px;color:var(--muted)}
.msg-source{font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:.3px;padding:2px 6px;border-radius:100px;border:1px solid var(--border);color:var(--muted);background:var(--white)}
.msg-source.gemini{color:var(--agua-d);border-color:var(--agua-l);background:var(--agua-p)}
.msg-source.local{color:var(--gold);border-color:#E9D7A6;background:#FFF8EC}
.msg-source.action{color:var(--green);border-color:#B9E5D0;background:#E8F7F0}

/* Markdown inside bubble */
.msg-content strong{font-weight:600}
.msg-content em{font-style:italic;opacity:.85}
.fina .msg-content ul,.fina .msg-content ol{margin:6px 0 6px 18px;display:flex;flex-direction:column;gap:3px}
.fina .msg-content li{font-size:13.5px}
.fina .msg-content p{margin-bottom:6px}
.fina .msg-content p:last-child{margin-bottom:0}
.fina .msg-content h3{font-family:'DM Serif Display',serif;font-size:16px;color:var(--slate);margin-bottom:6px}
.fina .msg-content code{background:var(--mint);padding:1px 5px;border-radius:4px;font-size:12px}

/* Typing indicator */
.typing{display:flex;align-items:center;gap:10px;animation:fadeUp .3s ease}
.typing-bubble{background:var(--white);border:1px solid var(--border);border-radius:16px;border-bottom-left-radius:4px;padding:14px 18px;display:flex;gap:5px}
.typing-dot{width:7px;height:7px;border-radius:50%;background:var(--muted);animation:bounce .9s ease infinite}
.typing-dot:nth-child(2){animation-delay:.15s}
.typing-dot:nth-child(3){animation-delay:.3s}
@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}

/* Quick actions dentro de respuesta */
.msg-actions{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}
.msg-action-btn{padding:5px 12px;background:var(--mint);border:1px solid var(--border);border-radius:100px;font-size:11.5px;font-weight:500;color:var(--agua-d);cursor:pointer;transition:all .15s;font-family:'DM Sans',sans-serif}
.msg-action-btn:hover{background:var(--agua-p);border-color:var(--agua)}

/* Financial card inside message */
.fin-card{background:linear-gradient(135deg,rgba(90,173,165,.08),rgba(126,200,192,.05));border:1px solid var(--agua-l);border-radius:10px;padding:12px 14px;margin-top:8px;font-size:13px}
.fin-card-row{display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid rgba(90,173,165,.12)}
.fin-card-row:last-child{border-bottom:none}
.fin-card-lbl{color:var(--slate-m)}
.fin-card-val{font-weight:600;color:var(--agua-d)}
.fin-card-val.neg{color:var(--red)}
.fin-card-val.pos{color:var(--green)}

/* Input area */
.input-area{padding:16px 24px;background:var(--white);border-top:1px solid var(--border);flex-shrink:0}
.input-wrap{display:flex;align-items:flex-end;gap:10px;background:var(--mint);border:1.5px solid var(--border);border-radius:14px;padding:10px 12px;transition:border-color .2s,box-shadow .2s}
.input-wrap:focus-within{border-color:var(--agua);box-shadow:0 0 0 3px rgba(126,200,192,.12)}
.chat-input{flex:1;background:none;border:none;outline:none;font-family:'DM Sans',sans-serif;font-size:14px;color:var(--slate);resize:none;max-height:120px;min-height:22px;line-height:1.5}
.chat-input::placeholder{color:var(--muted)}
.input-actions{display:flex;gap:6px;align-items:flex-end;flex-shrink:0}
.attach-btn{width:34px;height:34px;border-radius:9px;background:none;border:1px solid var(--border);cursor:pointer;font-size:15px;display:flex;align-items:center;justify-content:center;transition:all .15s;color:var(--muted)}
.attach-btn:hover{background:var(--agua-p);border-color:var(--agua);color:var(--agua-d)}
.send-btn{width:38px;height:38px;border-radius:10px;background:linear-gradient(135deg,var(--agua-d),var(--agua));border:none;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 10px rgba(90,173,165,.3);transition:all .17s;flex-shrink:0}
.send-btn:hover:not(:disabled){transform:scale(1.05);box-shadow:0 4px 16px rgba(90,173,165,.4)}
.send-btn:disabled{opacity:.5;cursor:not-allowed}
.input-hint{font-size:11px;color:var(--muted);margin-top:7px;text-align:center}

/* Context bar */
.context-bar{display:flex;align-items:center;gap:8px;padding:8px 24px;background:linear-gradient(90deg,rgba(90,173,165,.08),rgba(168,219,214,.05));border-bottom:1px solid var(--border);flex-wrap:wrap;flex-shrink:0}
.ctx-item{display:flex;align-items:center;gap:5px;font-size:11.5px;font-weight:500;color:var(--agua-d);background:var(--agua-p);padding:4px 10px;border-radius:100px;border:1px solid var(--agua-l)}
.ctx-dot{width:5px;height:5px;border-radius:50%;background:var(--green);animation:blink 2s ease infinite}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.4}}
.ctx-label{font-size:11px;color:var(--muted)}

/* ── RESPONSIVE ── */
@media(max-width:1050px){
  .chat-layout{grid-template-columns:minmax(170px,200px) 1fr}
  .suggestions-grid{grid-template-columns:repeat(auto-fit,minmax(170px,1fr))}
}

@media(max-width:640px){
  .history-panel{display:none}
  .chat-layout{grid-template-columns:1fr}
  .chatbot-app .sidebar{transform:translateX(-100%)}
  .chatbot-app .sidebar.open{transform:translateX(0);width:240px;min-width:240px;max-width:240px}
  .hamburger{display:flex}
  .main{margin-left:0}
  .chatbot-app .main{margin-left:0;width:100vw}
  .suggestions-grid{grid-template-columns:repeat(auto-fit,minmax(160px,1fr));max-width:100%}
  .messages{padding:16px}
  .input-area{padding:12px 16px}
}

@media(max-width:560px){
  .header{padding:0 14px;height:58px}
  .hd-title{font-size:17px}
  .hd-eye{display:none}
  .hd-right{gap:6px}
  .btn-ghost{padding:7px 9px;font-size:12px}
  .suggestions-grid{grid-template-columns:1fr 1fr}
  .msg-bubble{max-width:88%}
  .messages{padding:14px 12px}
  .welcome{padding:22px 16px 14px}
  .welcome-title{font-size:20px}
  .welcome-avatar{width:52px;height:52px;font-size:23px}
  .input-area{padding:10px 12px}
  .context-bar{padding:6px 12px;gap:6px}
  .ctx-label{display:none}
}

@media(max-width:380px){
  .suggestions-grid{grid-template-columns:1fr}
  .msg-bubble{max-width:94%}
}

@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
`;

/* ─────────────────────────────────────────
   MARKDOWN RENDERER (simple)
───────────────────────────────────────── */
const renderMarkdown = (text) => {
  const lines = text.split("\n");
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { elements.push(<br key={i} />); i++; continue; }

    if (line.startsWith("### ")) {
      elements.push(<h3 key={i}>{line.slice(4)}</h3>); i++; continue;
    }
    if (line.startsWith("**") && line.endsWith("**") && line.length > 4) {
      elements.push(<p key={i}><strong>{line.slice(2,-2)}</strong></p>); i++; continue;
    }

    // list
    if (line.match(/^[-*•]\s/)) {
      const items = [];
      while (i < lines.length && lines[i].match(/^[-*•]\s/)) {
        items.push(<li key={i}>{inlineMarkdown(lines[i].slice(2))}</li>);
        i++;
      }
      elements.push(<ul key={`ul${i}`}>{items}</ul>);
      continue;
    }
    if (line.match(/^\d+\.\s/)) {
      const items = [];
      while (i < lines.length && lines[i].match(/^\d+\.\s/)) {
        items.push(<li key={i}>{inlineMarkdown(lines[i].replace(/^\d+\.\s/,""))}</li>);
        i++;
      }
      elements.push(<ol key={`ol${i}`}>{items}</ol>);
      continue;
    }

    elements.push(<p key={i}>{inlineMarkdown(line)}</p>);
    i++;
  }
  return elements;
};

const inlineMarkdown = (text) => {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={i}>{part.slice(2,-2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*"))   return <em key={i}>{part.slice(1,-1)}</em>;
    if (part.startsWith("`") && part.endsWith("`"))   return <code key={i}>{part.slice(1,-1)}</code>;
    return part;
  });
};

/* ─────────────────────────────────────────
   TIMESTAMP
───────────────────────────────────────── */
const timestamp = () => new Date().toLocaleTimeString("es-PE", { hour:"2-digit", minute:"2-digit" });
const getCurrentPeriodLabel = () => {
  const now = new Date();
  const month = now.toLocaleDateString("es-PE", { month: "long" });
  return `${month.charAt(0).toUpperCase() + month.slice(1)} ${now.getFullYear()}`;
};

const normalizeText = (text) => text
  .toLowerCase()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "");

const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const expenseCategoryKeywords = {
  alimentacion: ["comida", "almuerzo", "cena", "desayuno", "restaurante", "super", "mercado", "wong", "plaza vea", "kfc"],
  transporte: ["taxi", "uber", "bus", "metropolitano", "tren", "gasolina", "combustible", "transporte"],
  entrete: ["cine", "netflix", "spotify", "juego", "salida", "bar", "entretenimiento"],
  salud: ["farmacia", "medicina", "doctor", "clinica", "dentista", "salud"],
  educacion: ["curso", "libro", "libreria", "clase", "universidad", "educacion"],
  servicios: ["luz", "agua", "internet", "telefono", "claro", "recibo", "servicio"],
  ropa: ["ropa", "camisa", "zapato", "zara", "ripley"],
};

const getCategoryName = (id) => EXPENSE_CATEGORIES.find((cat) => cat.id === id)?.name || "Otros";

const guessExpenseCategory = (content) => {
  const text = normalizeText(content);
  const found = Object.entries(expenseCategoryKeywords)
    .find(([, keywords]) => keywords.some((keyword) => text.includes(keyword)));
  return found?.[0] || null;
};

const parseExpenseAmount = (content) => {
  const match = normalizeText(content).match(/(?:s\/\.?|soles?)?\s*(\d+(?:[.,]\d{1,2})?)/);
  return match ? Number(match[1].replace(",", ".")) : null;
};

const cleanExpenseDescription = (content) => {
  const cleaned = content
    .replace(/(?:agrega|agregar|registra|registrar|anota|añade|guardar|guarda|pague|pagué|gaste|gasté|un gasto|gasto de|por|de)\b/gi, " ")
    .replace(/s\/\.?\s*\d+(?:[.,]\d{1,2})?/gi, " ")
    .replace(/\b\d+(?:[.,]\d{1,2})?\s*(?:soles?)?\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned || cleaned.length < 3) return "";
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
};

const getExpenseIntent = (content) => {
  const text = normalizeText(content);
  return ["agrega", "agregar", "registra", "registrar", "anota", "anade", "añade", "guardar", "gasto", "gaste"].some((word) => text.includes(word));
};

const mergeExpenseDraft = (content, currentDraft = {}) => {
  const amount = parseExpenseAmount(content);
  const category = guessExpenseCategory(content);
  const description = cleanExpenseDescription(content);

  return {
    desc: description || currentDraft.desc || "",
    monto: amount || currentDraft.monto || null,
    cat: category || currentDraft.cat || null,
    fecha: currentDraft.fecha || todayISO(),
    nota: currentDraft.nota || "Agregado desde Fina",
    recurrente: currentDraft.recurrente || false,
  };
};

const getMissingExpenseFields = (draft) => {
  const missing = [];
  if (!draft.desc) missing.push("descripción");
  if (!draft.monto) missing.push("monto");
  if (!draft.cat) missing.push("categoría");
  return missing;
};

const formatExpenseDraft = (draft) => [
  `- Descripción: **${draft.desc || "pendiente"}**`,
  `- Monto: **${draft.monto ? `S/ ${draft.monto.toFixed(2)}` : "pendiente"}**`,
  `- Categoría: **${draft.cat ? getCategoryName(draft.cat) : "pendiente"}**`,
  `- Fecha: **${draft.fecha}**`,
].join("\n");

const getLocalReply = (content, isGuest) => {
  const text = content.toLowerCase();

  if (!isGuest) {
    if (text.includes("meta")) {
      return "**Primera meta sugerida:** arma un fondo de emergencia inicial de S/ 1,000. Empieza con un aporte fijo semanal y ajusta cuando registres tus ingresos reales.";
    }
    if (text.includes("categor")) {
      return "**Categorías iniciales:** vivienda, alimentación, transporte, servicios, salud, educación, ocio y ahorro. Con eso puedes ordenar el 90% de tus movimientos sin complicarte.";
    }
    return "Para empezar desde cero, registra tus ingresos mensuales, tus gastos fijos y una primera meta pequeña. Con esos tres datos Savia puede mostrarte presupuesto, calendario y alertas útiles.";
  }

  if (text.includes("presupuesto")) {
    return "**Tu presupuesto va saludable:** llevas S/ 1,700 gastados de S/ 2,500. Te quedan S/ 800 disponibles. Vigila salud y ropa, porque ya están sobre el límite.";
  }
  if (text.includes("europa") || text.includes("terminar")) {
    return "**Viaje a Europa:** vas en S/ 3,200 de S/ 8,000. Manteniendo S/ 400 al mes, faltan unos 12 meses para completarla.";
  }
  if (text.includes("pasando") || text.includes("categor")) {
    return "**Categorías sobre presupuesto:** salud va S/ 12 arriba y ropa S/ 69 arriba. El ajuste más rápido sería congelar compras de ropa este mes y revisar gastos médicos no recurrentes.";
  }
  if (text.includes("ahorrar") || text.includes("tips")) {
    return "Tres acciones concretas: **1.** separa el aporte a metas apenas entra el sueldo, **2.** pon un tope semanal para ocio, **3.** revisa suscripciones y gastos repetidos antes del día 5.";
  }
  if (text.includes("salud financiera") || text.includes("analiza")) {
    return "**Lectura rápida:** tienes saldo positivo, metas activas y presupuesto con margen. El riesgo está en categorías pequeñas que se pasan sin ruido, como ropa y salud.";
  }
  return "Viendo tus datos, el foco de este mes debería ser conservar los S/ 800 libres y no tocar los aportes a metas. Pregúntame por presupuesto, metas o categorías y lo desgloso.";
};

const getGeminiReply = async ({ content, history, isGuest, lang = "es" }) => {
  const messages = [
    ...history.slice(-8).map((message) => ({ role: message.role, content: message.content })),
    { role: "user", content },
  ];

  try {
    const reply = await apiRequest("/chat", {
      method: "POST",
      body: JSON.stringify({ messages, language: lang }),
    });

    if (reply?.source === "gemini" && reply.content) {
      return { content: reply.content, source: "gemini", error: null };
    }

    return {
      content: `${getLocalReply(content, isGuest)}\n\n_Nota: el asistente IA no está disponible en este momento, así que usé el modo local._`,
      source: "local",
      error: reply?.error || "unavailable",
    };
  } catch {
    return {
      content: `${getLocalReply(content, isGuest)}\n\n_Nota: no pude conectar con el asistente IA. Revisa que el servidor local esté activo._`,
      source: "local",
      error: "network",
    };
  }
};

/* ─────────────────────────────────────────
   COMPONENT
───────────────────────────────────────── */
export default function ChatbotPage({ onNavigate, onLogout, isGuest = false, user = null }) {
  const { t, lang } = useI18n();
  const [messages, setMessages]     = useState([]);
  const [input, setInput]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const [pendingExpense, setPendingExpense] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);
  const nextMessageId  = useRef(1);
  const displayName = user?.fullName || user?.email || (isGuest ? "Juan Pérez" : "Cuenta nueva");
  const firstName = user?.firstName || displayName.split(" ")[0] || "Cuenta";
  const avatar = user?.avatar || `${(user?.firstName?.[0] || displayName[0] || "C").toUpperCase()}${(user?.lastName?.[0] || "").toUpperCase()}`.slice(0, 2);
  const suggestions = isGuest ? SUGERENCIAS_INIT : SUGERENCIAS_EMPTY;
  const [realGoals, setRealGoals] = useState([]);

  useEffect(() => {
    if (isGuest) return;
    let alive = true;
    void loadStoredGoals([]).then((data) => alive && setRealGoals(Array.isArray(data) ? data : []));
    return () => { alive = false; };
  }, [isGuest]);

  const handleNavClick = (id) => {
    if (onNavigate) onNavigate(id);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const getExpenseActionReply = async (content) => {
    const text = normalizeText(content);

    if (pendingExpense) {
      if (["si", "sí", "confirmo", "confirmar", "guardalo", "guárdalo", "guardar"].some((word) => text.includes(normalizeText(word)))) {
        const saved = await addStoredExpense(pendingExpense, []);
        setPendingExpense(null);
        return {
          handled: true,
          content: `Listo, registré el gasto en **Gastos**:\n${formatExpenseDraft(saved)}\n\nPuedes verlo entrando a la página de Gastos.`,
        };
      }

      if (["no", "cancelar", "cancela", "descartar"].some((word) => text.includes(word))) {
        setPendingExpense(null);
        return {
          handled: true,
          content: "Perfecto, no guardé ese gasto. Si quieres, dime el gasto completo y lo preparo de nuevo.",
        };
      }

      const nextDraft = mergeExpenseDraft(content, pendingExpense);
      const missing = getMissingExpenseFields(nextDraft);
      setPendingExpense(nextDraft);

      if (missing.length) {
        return {
          handled: true,
          content: `Me falta ${missing.join(", ")} para registrar el gasto.\n\nBorrador actual:\n${formatExpenseDraft(nextDraft)}`,
        };
      }

      return {
        handled: true,
        content: `Tengo este gasto listo para guardar:\n${formatExpenseDraft(nextDraft)}\n\nResponde **confirmar** para registrarlo o **cancelar** para descartarlo.`,
      };
    }

    if (!getExpenseIntent(content)) return { handled: false };

    const draft = mergeExpenseDraft(content);
    const missing = getMissingExpenseFields(draft);
    setPendingExpense(draft);

    if (missing.length) {
      return {
        handled: true,
        content: `Puedo registrarlo, pero me falta ${missing.join(", ")}.\n\nBorrador:\n${formatExpenseDraft(draft)}`,
      };
    }

    return {
      handled: true,
      content: `Tengo este gasto listo para guardar:\n${formatExpenseDraft(draft)}\n\nResponde **confirmar** para registrarlo o **cancelar** para descartarlo.`,
    };
  };

  const sendMessage = async (text) => {
    const content = (text || input).trim();
    if (!content || loading) return;
    setInput("");

    const userMsg = { id: nextMessageId.current++, role: "user", content, time: timestamp() };
    const historyForGemini = messages;
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const actionReply = await getExpenseActionReply(content);
      if (actionReply.handled) {
        const finaMsg = {
          id: nextMessageId.current++,
          role: "assistant",
          content: actionReply.content,
          source: "action",
          error: null,
          time: timestamp(),
        };
        setMessages(prev => [...prev, finaMsg]);
        return;
      }

      const reply = await getGeminiReply({ content, history: historyForGemini, isGuest, lang });
      const finaMsg = {
        id: nextMessageId.current++,
        role: "assistant",
        content: reply.content,
        source: reply.source,
        error: reply.error,
        time: timestamp(),
      };
      setMessages(prev => [...prev, finaMsg]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const nuevaConversacion = () => {
    setMessages([]);
    inputRef.current?.focus();
  };

  const now = new Date();
  const greeting = t(now.getHours() < 12 ? "greeting.morning" : now.getHours() < 19 ? "greeting.afternoon" : "greeting.evening");
  const currentPeriodLabel = getCurrentPeriodLabel();

  return (
    <>
      <style>{S}</style>
      <AppShell
        active="chatbot"
        onNavigate={handleNavClick}
        onLogout={onLogout}
        user={user}
        isGuest={isGuest}
        fullBleed
        headerLeft={(
          <div className="hd-left">
            <div style={{width:38,height:38,borderRadius:"50%",background:"linear-gradient(135deg,var(--agua-d),var(--agua))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>🤖</div>
            <div className="hd-titles">
              <div className="hd-eye">{t("chat.subtitle")}</div>
              <div className="hd-title">{t("chat.title")}</div>
            </div>
          </div>
        )}
        headerRight={(
          <>
            <button className={`btn-ghost${showHistory?" active-btn":""}`}
              onClick={() => setShowHistory(v => !v)}
              style={{display:"flex"}}>
              🕐 <span style={{marginLeft:4}}>{t("chat.history")}</span>
            </button>
            <button className="btn-ghost" onClick={nuevaConversacion}>✦ {t("common.new")}</button>
          </>
        )}
      >
        <div className="chat-wrap">
          {/* CONTEXT BAR */}
          <div className="context-bar">
            <span className="ctx-label">{t("chat.activeContext")}</span>
            <span className="ctx-item" title="Contexto financiero del usuario"><span className="ctx-dot"/>{" "}{isGuest ? "Perfil de Juan" : firstName}</span>
            <span className="ctx-item">🎯 {isGuest ? "4 metas activas" : (realGoals.length === 1 ? t("chat.goalActive") : t("chat.goalsActive", { count: realGoals.length }))}</span>
            <span className="ctx-item">📅 {currentPeriodLabel}</span>
          </div>

          <div className={`chat-layout${showHistory ? "" : " no-history"}`}>
            {/* HISTORY PANEL */}
            {showHistory && (
              <div className="history-panel">
                <div className="hist-head">
                  <div className="hist-title">{t("chat.conversations")}</div>
                  <button className="new-chat-btn" onClick={nuevaConversacion}>
                    ✦ {t("chat.newChat")}
                  </button>
                </div>
                <div className="hist-list">
                  <div className="hist-sep">{t("chat.noConversations")}</div>
                </div>
              </div>
            )}

            {/* CHAT AREA */}
            <div className="chat-area">
              <div className="messages">

                {/* Welcome / empty state */}
                {messages.length === 0 && (
                  <div className="welcome">
                    <div className="welcome-avatar">🤖</div>
                    <h2 className="welcome-title">{greeting}, {firstName} 👋</h2>
                    <p className="welcome-sub">{t("chat.welcome")}</p>
                    <div className="suggestions-grid">
                      {suggestions.map(s => (
                        <button key={s.id} className="sug-chip" onClick={() => sendMessage(s.texto)}>
                          <span className="sug-ico">{s.icono}</span>
                          <span className="sug-txt">{s.texto}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Messages */}
                {messages.map(msg => (
                  <div key={msg.id} className={`msg ${msg.role === "user" ? "user" : "fina"}`}>
                    <div className={`msg-avatar ${msg.role === "user" ? "user" : "fina"}`}>
                      {msg.role === "user" ? avatar : "🤖"}
                    </div>
                    <div className="msg-bubble">
                      <div className="msg-content">
                        {msg.role === "assistant"
                          ? renderMarkdown(msg.content)
                          : msg.content
                        }
                      </div>
                      <div className="msg-meta-row">
                        <span className="msg-time">{msg.time}</span>
                        {msg.role === "assistant" && msg.source && (
                          <span className={`msg-source ${msg.source}`} title={msg.error ? `Fallback: ${msg.error}` : msg.source === "action" ? "Acción aplicada dentro de Savia" : "Respuesta generada por Gemini"}>
                            {msg.source === "gemini" ? "Gemini" : msg.source === "action" ? "Acción" : "Local"}
                          </span>
                        )}
                      </div>
                      {/* Quick follow-ups after assistant messages */}
                      {msg.role === "assistant" && messages[messages.length-1]?.id === msg.id && !loading && (
                        <div className="msg-actions">
                          {["¿Qué más puedo mejorar?","Dame más detalles","¿Cómo lo comparo con el mes pasado?"].map((a,i) => (
                            <button key={i} className="msg-action-btn" onClick={() => sendMessage(a)}>{a}</button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {loading && (
                  <div className="typing">
                    <div className="msg-avatar fina">🤖</div>
                    <div className="typing-bubble">
                      <div className="typing-dot"/>
                      <div className="typing-dot"/>
                      <div className="typing-dot"/>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* INPUT AREA */}
              <div className="input-area">
                <div className="input-wrap">
                  <textarea
                    ref={inputRef}
                    className="chat-input"
                    placeholder={t("chat.placeholder")}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    style={{lineHeight:1.5}}
                  />
                  <div className="input-actions">
                    <button className="attach-btn" title="Adjuntar" onClick={() => {}}>📎</button>
                    <button className="send-btn" onClick={() => sendMessage()} disabled={!input.trim() || loading}>
                      {loading ? "⏳" : "➤"}
                    </button>
                  </div>
                </div>
                <div className="input-hint">{t("chat.hint")}</div>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </>
  );
}
