import { useState, useRef, useEffect } from "react";

/* ─────────────────────────────────────────
   DATA & CONFIG
───────────────────────────────────────── */
const NAV_ITEMS = [
  { id:"dashboard",  label:"Dashboard",  icon:"◉" },
  { id:"gastos",     label:"Gastos",     icon:"💳" },
  { id:"metas",      label:"Metas",      icon:"🎯" },
  { id:"calendario", label:"Calendario", icon:"📅" },
  { id:"chatbot",    label:"Chatbot IA", icon:"🤖" },
  { id:"perfil",     label:"Mi Perfil",  icon:"👤" },
];

const CONTEXTO_FINANCIERO = `
Eres Fina, la asistente financiera personal de FinVerde, una aplicación de gestión de finanzas personales.
Tu rol es ayudar al usuario a entender sus finanzas, dar consejos personalizados y responder preguntas sobre su situación económica.

DATOS DEL USUARIO (Juan Pérez, Lima, Perú):
- Saldo disponible: S/ 1,700
- Ingresos del mes (mayo 2025): S/ 3,600 (sueldo + freelance)
- Gastos del mes: S/ 1,700 aprox
- Presupuesto mensual: S/ 2,500
- Total ahorrado en metas: S/ 8,170

METAS ACTIVAS:
- Viaje a Europa: S/ 3,200 / S/ 8,000 (40%) — aporte mensual S/ 400
- Fondo de emergencia: S/ 4,100 / S/ 5,000 (82%) — casi completa
- Laptop nueva: S/ 870 / S/ 3,500 (25%) — aporte mensual S/ 200
- Auto propio: S/ 2,500 / S/ 20,000 (12.5%) — aporte mensual S/ 500

GASTOS POR CATEGORÍA (mayo):
- Alimentación: S/ 372 (presupuesto S/ 800)
- Transporte: S/ 94 (presupuesto S/ 400)
- Entretenimiento: S/ 96 (presupuesto S/ 300)
- Salud: S/ 262 (presupuesto S/ 250) — SOBRE PRESUPUESTO
- Servicios (luz, agua, internet): S/ 220 (presupuesto S/ 350)
- Ropa: S/ 219 (presupuesto S/ 150) — SOBRE PRESUPUESTO

PRÓXIMOS PAGOS (junio):
- Alquiler: S/ 1,200 — día 1
- Claro Internet: S/ 89 — día 5
- Seguro auto: S/ 220 — día 15

TIPO DE CAMBIO HOY: USD/PEN = 3.74, EUR/PEN = 4.05

Responde SIEMPRE en español, de forma cálida, concisa y con emojis moderados.
Usa formato markdown simple (negritas, listas) cuando ayude a la claridad.
Si el usuario pregunta algo que no tenga que ver con finanzas, redirígelo amablemente.
Sé proactivo: ofrece consejos específicos basados en los datos del usuario.
IMPORTANTE: responde en máximo 200 palabras salvo que el usuario pida un análisis detallado.
`;

const SUGERENCIAS_INIT = [
  { id:1, texto:"¿Cómo va mi presupuesto este mes?",   icono:"📊" },
  { id:2, texto:"¿Cuándo terminaré mi meta de Europa?", icono:"✈️" },
  { id:3, texto:"¿En qué categorías me estoy pasando?", icono:"⚠️" },
  { id:4, texto:"Dame 3 tips para ahorrar más",         icono:"💡" },
  { id:5, texto:"¿Cuánto debería guardar cada mes?",    icono:"🎯" },
  { id:6, texto:"Analiza mi salud financiera",          icono:"🩺" },
];

const CONVERSACIONES_PREV = [
  { id:"c1", titulo:"Análisis de abril",     fecha:"20 mayo",  preview:"¿Cómo me fue comparado a marzo?" },
  { id:"c2", titulo:"Plan de ahorro Europa", fecha:"15 mayo",  preview:"Quiero llegar a S/ 8,000 antes de..." },
  { id:"c3", titulo:"Tips de inversión",     fecha:"10 mayo",  preview:"¿Vale la pena poner dinero en..." },
  { id:"c4", titulo:"Presupuesto mayo",      fecha:"1 mayo",   preview:"Ayúdame a planificar este mes" },
];

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

/* ── CHAT LAYOUT ── */
.chat-layout{display:grid;grid-template-columns:minmax(220px,260px) minmax(0,1fr);flex:1;overflow:hidden;min-height:0}
.chat-layout.no-history{grid-template-columns:1fr}

/* ── HISTORY PANEL ── */
.history-panel{background:var(--white);border-right:1px solid var(--border);display:flex;flex-direction:column;overflow:hidden}
.hist-head{padding:16px 16px 12px;border-bottom:1px solid var(--border);flex-shrink:0}
.hist-title{font-size:13px;font-weight:600;color:var(--slate-m);letter-spacing:.3px;text-transform:uppercase;margin-bottom:10px}
.new-chat-btn{width:100%;padding:9px;background:linear-gradient(135deg,var(--agua-d),var(--agua));color:white;border:none;border-radius:9px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;box-shadow:0 2px 10px rgba(90,173,165,.25);transition:all .17s}
.new-chat-btn:hover{transform:translateY(-1px);box-shadow:0 4px 16px rgba(90,173,165,.35)}
.hist-list{flex:1;overflow-y:auto;padding:10px 10px}
.hist-item{padding:10px 12px;border-radius:10px;cursor:pointer;transition:background .15s;margin-bottom:4px}
.hist-item:hover{background:var(--mint)}
.hist-item.active{background:var(--agua-p);border:1px solid var(--agua-l)}
.hist-item-title{font-size:13px;font-weight:500;color:var(--slate);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hist-item-date{font-size:11px;color:var(--muted);margin-top:2px}
.hist-item-preview{font-size:11.5px;color:var(--muted);margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hist-sep{font-size:10px;font-weight:600;color:var(--muted);letter-spacing:.5px;text-transform:uppercase;padding:8px 12px 4px}

/* ── CHAT AREA ── */
.chat-area{display:flex;flex-direction:column;min-height:0;flex:1;overflow:hidden;background:var(--mint)}

/* Messages */
.messages{flex:1;overflow-y:auto;padding:24px 28px;display:flex;flex-direction:column;gap:18px;scroll-behavior:smooth}
.messages::-webkit-scrollbar{width:4px}
.messages::-webkit-scrollbar-track{background:transparent}
.messages::-webkit-scrollbar-thumb{background:var(--border);border-radius:2px}

/* Welcome screen */
.welcome{display:flex;flex-direction:column;align-items:center;text-align:center;padding:40px 24px 24px;animation:fadeUp .5s ease}
.welcome-avatar{width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,var(--agua-d),var(--agua));display:flex;align-items:center;justify-content:center;font-size:32px;margin-bottom:16px;box-shadow:0 6px 24px rgba(90,173,165,.3);animation:pulse 3s ease-in-out infinite}
@keyframes pulse{0%,100%{box-shadow:0 6px 24px rgba(90,173,165,.3)}50%{box-shadow:0 6px 32px rgba(90,173,165,.5)}}
.welcome-title{font-family:'DM Serif Display',serif;font-size:26px;color:var(--slate);letter-spacing:-.3px;margin-bottom:8px}
.welcome-sub{font-size:14px;color:var(--muted);font-weight:300;line-height:1.6;max-width:380px;margin-bottom:28px}

/* Suggestion chips */
.suggestions-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;width:100%;max-width:660px}
.sug-chip{display:flex;align-items:flex-start;gap:10px;padding:12px 14px;background:var(--white);border:1.5px solid var(--border);border-radius:12px;cursor:pointer;transition:all .18s;text-align:left;font-family:'DM Sans',sans-serif}
.sug-chip:hover{border-color:var(--agua);background:var(--agua-p);transform:translateY(-1px);box-shadow:0 4px 16px rgba(90,173,165,.12)}
.sug-ico{font-size:18px;flex-shrink:0;margin-top:1px}
.sug-txt{font-size:12.5px;color:var(--slate-m);line-height:1.4}

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
.msg-time{font-size:10px;color:var(--muted);padding:0 4px}

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
  .chat-layout{grid-template-columns:220px 1fr}
  .suggestions-grid{grid-template-columns:repeat(2,1fr)}
}

@media(max-width:640px){
  .history-panel{display:none}
  .chat-layout{grid-template-columns:1fr}
  .chatbot-app .sidebar{transform:translateX(-100%)}
  .chatbot-app .sidebar.open{transform:translateX(0);width:240px;min-width:240px;max-width:240px}
  .hamburger{display:flex}
  .main{margin-left:0}
  .chatbot-app .main{margin-left:0;width:100vw}
  .suggestions-grid{grid-template-columns:repeat(2,1fr);max-width:100%}
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
  .welcome{padding:28px 16px 16px}
  .welcome-title{font-size:21px}
  .welcome-avatar{width:60px;height:60px;font-size:26px}
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

/* ─────────────────────────────────────────
   COMPONENT
───────────────────────────────────────── */
export default function ChatbotPage({ onNavigate }) {
  const [messages, setMessages]     = useState([]);
  const [input, setInput]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [activeNav, setActiveNav]   = useState("chatbot");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const [activeConv, setActiveConv] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);

  const handleNavClick = (id) => {
    setActiveNav(id);
    setSidebarOpen(false);
    if (onNavigate) onNavigate(id);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const content = (text || input).trim();
    if (!content || loading) return;
    setInput("");

    const userMsg = { id: Date.now(), role: "user", content, time: timestamp() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const historyForApi = messages.slice(-10).map(m => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: CONTEXTO_FINANCIERO,
          messages: [...historyForApi, { role: "user", content }],
        }),
      });

      const data = await response.json();
      const reply = data.content?.[0]?.text || "Lo siento, no pude procesar tu consulta. Intenta de nuevo.";

      const finaMsg = { id: Date.now() + 1, role: "assistant", content: reply, time: timestamp() };
      setMessages(prev => [...prev, finaMsg]);
    } catch (err) {
      const errMsg = {
        id: Date.now() + 1, role: "assistant", time: timestamp(),
        content: "Ups, hubo un problema de conexión. Verifica tu acceso y vuelve a intentarlo. 🌐",
      };
      setMessages(prev => [...prev, errMsg]);
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
    setActiveConv(null);
    inputRef.current?.focus();
  };

  const now = new Date();
  const greeting = now.getHours() < 12 ? "Buenos días" : now.getHours() < 19 ? "Buenas tardes" : "Buenas noches";
  const currentPeriodLabel = getCurrentPeriodLabel();

  return (
    <>
      <style>{S}</style>
      <div className={`sb-overlay${sidebarOpen?" show":""}`} onClick={() => setSidebarOpen(false)} />

      <div className="app chatbot-app">
        {/* SIDEBAR */}
        <aside className={`sidebar${sidebarOpen?" open":""}`}>
          <div className="sb-brand">
            <div className="sb-ico">💎</div>
            <span className="sb-txt">FinVerde</span>
          </div>
          <nav className="sb-nav">
            {NAV_ITEMS.map(item => (
              <button key={item.id} className={`nav-item${activeNav===item.id?" active":""}`}
                onClick={() => handleNavClick(item.id)}>
                <span style={{fontSize:15,width:19,textAlign:"center",flexShrink:0}}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
          <div className="sb-footer">
            <div className="user-chip">
              <div className="user-av">JP</div>
              <div style={{flex:1,minWidth:0}}>
                <div className="user-nm">Juan Pérez</div>
                <div className="user-pl">⭐ Premium</div>
              </div>
            </div>
          </div>
        </aside>

        <div className="main">
          {/* HEADER */}
          <header className="header">
            <div className="hd-left">
              <button className="hamburger" onClick={() => setSidebarOpen(v => !v)}>☰</button>
              <div style={{width:38,height:38,borderRadius:"50%",background:"linear-gradient(135deg,var(--agua-d),var(--agua))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>🤖</div>
              <div className="hd-titles">
                <div className="hd-eye">Asistente financiero con IA</div>
                <div className="hd-title">Fina · FinVerde IA</div>
              </div>
            </div>
            <div className="hd-right">
              <button className={`btn-ghost${showHistory?" active-btn":""}`}
                onClick={() => setShowHistory(v => !v)}
                style={{display:"flex"}}>
                🕐 <span style={{marginLeft:4,display:"var(--show-hist,inline)"}}>Historial</span>
              </button>
              <button className="btn-ghost" onClick={nuevaConversacion}>✦ Nueva</button>
            </div>
          </header>

          {/* CONTEXT BAR */}
          <div className="context-bar">
            <span className="ctx-label">Contexto activo:</span>
            <span className="ctx-item"><span className="ctx-dot"/>{" "}Perfil de Juan</span>
            <span className="ctx-item">💰 Saldo S/ 1,700</span>
            <span className="ctx-item">🎯 4 metas activas</span>
            <span className="ctx-item">📅 {currentPeriodLabel}</span>
          </div>

          <div className={`chat-layout${showHistory ? "" : " no-history"}`}>
            {/* HISTORY PANEL */}
            {showHistory && (
              <div className="history-panel">
                <div className="hist-head">
                  <div className="hist-title">Conversaciones</div>
                  <button className="new-chat-btn" onClick={nuevaConversacion}>
                    ✦ Nueva conversación
                  </button>
                </div>
                <div className="hist-list">
                  <div className="hist-sep">Este mes</div>
                  {CONVERSACIONES_PREV.map(c => (
                    <div key={c.id} className={`hist-item${activeConv===c.id?" active":""}`}
                      onClick={() => setActiveConv(c.id)}>
                      <div className="hist-item-title">{c.titulo}</div>
                      <div className="hist-item-date">{c.fecha}</div>
                      <div className="hist-item-preview">{c.preview}</div>
                    </div>
                  ))}
                  <div className="hist-sep" style={{marginTop:8}}>Anterior</div>
                  {["Análisis de marzo","Metas Q1","Tips inversión"].map((t, i) => (
                    <div key={i} className="hist-item">
                      <div className="hist-item-title">{t}</div>
                      <div className="hist-item-date">{["28 abr","15 abr","2 abr"][i]}</div>
                    </div>
                  ))}
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
                    <h2 className="welcome-title">{greeting}, Juan 👋</h2>
                    <p className="welcome-sub">
                      Soy <strong>Fina</strong>, tu asistente financiera personal. Tengo acceso a tus datos de FinVerde y puedo ayudarte a entender tus finanzas, optimizar tus ahorros y tomar mejores decisiones de dinero.
                    </p>
                    <div className="suggestions-grid">
                      {SUGERENCIAS_INIT.map(s => (
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
                      {msg.role === "user" ? "JP" : "🤖"}
                    </div>
                    <div className="msg-bubble">
                      <div className="msg-content">
                        {msg.role === "assistant"
                          ? renderMarkdown(msg.content)
                          : msg.content
                        }
                      </div>
                      <div className="msg-time">{msg.time}</div>
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
                    placeholder="Pregunta sobre tus finanzas… (Enter para enviar)"
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
                <div className="input-hint">
                  Fina tiene acceso a tu perfil financiero · Los consejos son orientativos, no asesoría profesional
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
