import { useState, useMemo } from "react";
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";

/* ─────────────────────────────────────────
   DATA
───────────────────────────────────────── */
const METAS_INIT = [
  {
    id: 1, nombre: "Viaje a Europa", icon: "✈️", color: "#7EC8C0",
    meta: 8000, actual: 3200, aporteMensual: 400,
    fechaLimite: "2025-12-31", prioridad: "alta",
    descripcion: "Recorrer España, Francia e Italia por 3 semanas.",
    historial: [
      { mes: "Ene", aporte: 400 }, { mes: "Feb", aporte: 400 },
      { mes: "Mar", aporte: 500 }, { mes: "Abr", aporte: 400 },
      { mes: "May", aporte: 400 },
    ],
  },
  {
    id: 2, nombre: "Fondo de emergencia", icon: "🛡️", color: "#5AADA5",
    meta: 5000, actual: 4100, aporteMensual: 300,
    fechaLimite: "2025-07-31", prioridad: "alta",
    descripcion: "Colchón equivalente a 3 meses de gastos fijos.",
    historial: [
      { mes: "Ene", aporte: 300 }, { mes: "Feb", aporte: 300 },
      { mes: "Mar", aporte: 300 }, { mes: "Abr", aporte: 600 },
      { mes: "May", aporte: 300 },
    ],
  },
  {
    id: 3, nombre: "Laptop nueva", icon: "💻", color: "#C9A96E",
    meta: 3500, actual: 870, aporteMensual: 200,
    fechaLimite: "2026-03-31", prioridad: "media",
    descripcion: "MacBook Pro para trabajo y diseño.",
    historial: [
      { mes: "Ene", aporte: 150 }, { mes: "Feb", aporte: 200 },
      { mes: "Mar", aporte: 200 }, { mes: "Abr", aporte: 120 },
      { mes: "May", aporte: 200 },
    ],
  },
  {
    id: 4, nombre: "Auto propio", icon: "🚗", color: "#8AADA9",
    meta: 20000, actual: 2500, aporteMensual: 500,
    fechaLimite: "2027-06-30", prioridad: "baja",
    descripcion: "Vehículo para independencia de movilidad.",
    historial: [
      { mes: "Ene", aporte: 500 }, { mes: "Feb", aporte: 500 },
      { mes: "Mar", aporte: 500 }, { mes: "Abr", aporte: 500 },
      { mes: "May", aporte: 500 },
    ],
  },
  {
    id: 5, nombre: "Curso de inglés", icon: "🎓", color: "#A8DBD6",
    meta: 1200, actual: 1200, aporteMensual: 0,
    fechaLimite: "2025-04-30", prioridad: "media",
    descripcion: "Certificación Cambridge B2.",
    historial: [
      { mes: "Ene", aporte: 300 }, { mes: "Feb", aporte: 300 },
      { mes: "Mar", aporte: 300 }, { mes: "Abr", aporte: 300 },
    ],
  },
];

const NAV_ITEMS = [
  { id: "dashboard",  label: "Dashboard",  icon: "◉" },
  { id: "gastos",     label: "Gastos",     icon: "💳" },
  { id: "metas",      label: "Metas",      icon: "🎯" },
  { id: "calendario", label: "Calendario", icon: "📅" },
  { id: "chatbot",    label: "Chatbot IA", icon: "🤖" },
  { id: "perfil",     label: "Mi Perfil",  icon: "👤" },
];

const PRIORIDAD_CFG = {
  alta:  { label: "Alta",  bg: "#FEF0F0", color: "#E07070" },
  media: { label: "Media", bg: "#FFF8EC", color: "#C9A96E" },
  baja:  { label: "Baja",  bg: "#EDF8F7", color: "#5AADA5" },
};

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
  --sidebar-w:240px;--header-h:68px;
}
body{font-family:'DM Sans',sans-serif;background:var(--mint);color:var(--slate)}
.app{display:flex;min-height:100vh}

/* SIDEBAR */
.sidebar{width:var(--sidebar-w);background:var(--slate);display:flex;flex-direction:column;position:fixed;top:0;left:0;height:100vh;z-index:50}
.sb-brand{display:flex;align-items:center;gap:10px;padding:24px 24px 20px;border-bottom:1px solid rgba(255,255,255,.08)}
.sb-ico{width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,var(--agua-d),var(--agua));display:flex;align-items:center;justify-content:center;font-size:18px}
.sb-txt{font-family:'DM Serif Display',serif;font-size:22px;color:white;letter-spacing:-.3px}
.sb-nav{flex:1;padding:16px 12px;display:flex;flex-direction:column;gap:4px;overflow-y:auto}
.nav-item{display:flex;align-items:center;gap:12px;padding:11px 14px;border-radius:10px;font-size:14px;color:rgba(255,255,255,.55);cursor:pointer;transition:all .18s;border:none;background:none;width:100%;text-align:left}
.nav-item:hover{background:rgba(255,255,255,.07);color:rgba(255,255,255,.85)}
.nav-item.active{background:linear-gradient(135deg,rgba(90,173,165,.35),rgba(126,200,192,.2));color:white;font-weight:500;box-shadow:inset 0 0 0 1px rgba(126,200,192,.25)}
.sb-footer{padding:16px 12px;border-top:1px solid rgba(255,255,255,.08)}
.user-chip{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;background:rgba(255,255,255,.06)}
.user-av{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,var(--agua-d),var(--agua));display:flex;align-items:center;justify-content:center;font-size:14px;color:white;font-weight:600;flex-shrink:0}
.user-nm{font-size:13px;font-weight:500;color:white}
.user-pl{font-size:11px;color:var(--agua-l)}

/* MAIN */
.main{margin-left:var(--sidebar-w);flex:1;display:flex;flex-direction:column}

/* HEADER */
.header{height:var(--header-h);background:var(--white);border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;padding:0 32px;position:sticky;top:0;z-index:40}
.hd-eye{font-size:13px;color:var(--muted);font-weight:300}
.hd-title{font-family:'DM Serif Display',serif;font-size:22px;color:var(--slate);letter-spacing:-.3px}
.hd-right{display:flex;align-items:center;gap:10px}
.btn-primary{display:flex;align-items:center;gap:7px;padding:10px 18px;background:linear-gradient(135deg,var(--agua-d),var(--agua));color:white;border:none;border-radius:10px;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:500;cursor:pointer;box-shadow:0 3px 14px rgba(90,173,165,.3);transition:all .18s}
.btn-primary:hover{transform:translateY(-1px);box-shadow:0 5px 20px rgba(90,173,165,.4)}
.btn-icon{padding:9px 11px;background:none;border:1px solid var(--border);border-radius:10px;cursor:pointer;font-size:15px;color:var(--slate-m);transition:all .18s}
.btn-icon:hover{background:var(--mint);border-color:var(--agua-l)}
.view-toggle{display:flex;border:1px solid var(--border);border-radius:10px;overflow:hidden}
.vt-btn{padding:8px 12px;background:none;border:none;cursor:pointer;font-size:14px;color:var(--muted);transition:all .15s}
.vt-btn.on{background:var(--agua-d);color:white}

/* CONTENT */
.content{padding:28px 32px;display:flex;flex-direction:column;gap:22px}

/* KPI STRIP */
.kpi-strip{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
.kpi{background:var(--white);border:1px solid var(--border);border-radius:14px;padding:18px 20px;animation:fadeUp .35s ease both}
.kpi.hl{background:linear-gradient(135deg,var(--agua-d),var(--agua));border-color:transparent}
.kpi-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
.kpi-ico{font-size:22px}
.kpi-badge{font-size:10px;font-weight:600;padding:3px 8px;border-radius:100px}
.b-wh{background:rgba(255,255,255,.2);color:rgba(255,255,255,.9)}
.b-gr{background:#E8F7F0;color:var(--green)}
.b-go{background:#FFF8EC;color:var(--gold)}
.b-mu{background:var(--mint);color:var(--muted)}
.kpi-val{font-family:'DM Serif Display',serif;font-size:26px;letter-spacing:-.4px;color:var(--slate)}
.kpi.hl .kpi-val{color:white}
.kpi-lbl{font-size:12px;color:var(--muted);margin-top:3px}
.kpi.hl .kpi-lbl{color:rgba(255,255,255,.7)}

/* GRID CARDS */
.cards-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
.cards-grid.list-view{grid-template-columns:1fr}

/* META CARD */
.meta-card{background:var(--white);border:1px solid var(--border);border-radius:18px;overflow:hidden;transition:box-shadow .2s,transform .2s;animation:fadeUp .4s ease both;cursor:pointer}
.meta-card:hover{box-shadow:0 6px 28px rgba(90,173,165,.13);transform:translateY(-2px)}
.meta-card.done-card{opacity:.85}

.mc-header{padding:20px 22px 0;display:flex;align-items:flex-start;justify-content:space-between}
.mc-left{display:flex;align-items:center;gap:12px}
.mc-ico{width:48px;height:48px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0}
.mc-info{}
.mc-name{font-family:'DM Serif Display',serif;font-size:17px;color:var(--slate);letter-spacing:-.2px;line-height:1.2}
.mc-desc{font-size:12px;color:var(--muted);margin-top:3px;max-width:200px}
.mc-right{display:flex;flex-direction:column;align-items:flex-end;gap:6px}
.prio-badge{font-size:10px;font-weight:600;padding:3px 9px;border-radius:100px;letter-spacing:.3px;text-transform:uppercase}
.done-badge{font-size:10px;font-weight:600;padding:3px 9px;border-radius:100px;background:#E8F7F0;color:var(--green)}

.mc-body{padding:18px 22px}
.mc-ring-row{display:flex;align-items:center;gap:16px;margin-bottom:14px}
.mc-ring{flex-shrink:0}
.mc-stats{flex:1;display:flex;flex-direction:column;gap:5px}
.mc-stat-row{display:flex;justify-content:space-between;font-size:12px}
.mc-stat-lbl{color:var(--muted)}
.mc-stat-val{font-weight:500;color:var(--slate)}

.mc-track{height:8px;background:var(--mint);border-radius:4px;overflow:hidden;margin-bottom:10px}
.mc-fill{height:100%;border-radius:4px;transition:width .8s ease}

.mc-footer{display:flex;align-items:center;justify-content:space-between;padding:12px 22px;border-top:1px solid var(--border);background:var(--mint)}
.mc-date{font-size:11px;color:var(--muted);display:flex;align-items:center;gap:5px}
.mc-actions{display:flex;gap:6px}
.mc-btn{background:none;border:1px solid var(--border);border-radius:8px;padding:5px 11px;font-size:12px;font-weight:500;cursor:pointer;transition:all .15s;font-family:'DM Sans',sans-serif;color:var(--slate-m)}
.mc-btn:hover{background:var(--agua-p);border-color:var(--agua);color:var(--agua-d)}
.mc-btn.abonar{background:linear-gradient(135deg,var(--agua-d),var(--agua));color:white;border-color:transparent;box-shadow:0 2px 8px rgba(90,173,165,.25)}
.mc-btn.abonar:hover{transform:translateY(-1px);box-shadow:0 4px 14px rgba(90,173,165,.35)}

/* LIST VIEW overrides */
.cards-grid.list-view .meta-card{display:grid;grid-template-columns:auto 1fr auto;align-items:center}
.cards-grid.list-view .mc-header{padding:16px 22px;border-right:1px solid var(--border)}
.cards-grid.list-view .mc-body{border-right:1px solid var(--border)}
.cards-grid.list-view .mc-ring-row{margin-bottom:0}
.cards-grid.list-view .mc-track{display:none}
.cards-grid.list-view .mc-footer{border-top:none;flex-direction:column;gap:8px;align-items:flex-end;padding:16px 22px}

/* MODAL */
.overlay{position:fixed;inset:0;background:rgba(45,74,71,.45);backdrop-filter:blur(5px);z-index:200;display:flex;align-items:center;justify-content:center;animation:fadeIn .2s ease}
.modal{background:var(--white);border-radius:22px;padding:34px;width:100%;max-width:500px;box-shadow:0 24px 64px rgba(45,74,71,.2);animation:slideUp .25s ease;max-height:90vh;overflow-y:auto}
.modal-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:26px}
.modal-title{font-family:'DM Serif Display',serif;font-size:24px;color:var(--slate)}
.modal-close{background:none;border:none;cursor:pointer;font-size:20px;color:var(--muted);padding:2px}
.modal-close:hover{color:var(--slate)}
.fg{margin-bottom:16px}
.fl{display:block;font-size:13px;font-weight:500;color:var(--slate-m);margin-bottom:6px}
.fi{width:100%;padding:11px 14px;border:1.5px solid var(--border);border-radius:10px;font-size:14px;font-family:'DM Sans',sans-serif;color:var(--slate);background:var(--white);outline:none;transition:border-color .2s,box-shadow .2s}
.fi:focus{border-color:var(--agua);box-shadow:0 0 0 3px rgba(126,200,192,.15)}
.fg2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.icon-grid{display:flex;flex-wrap:wrap;gap:8px;margin-top:4px}
.icon-opt{width:44px;height:44px;border-radius:10px;border:1.5px solid var(--border);background:none;cursor:pointer;font-size:22px;transition:all .15s;display:flex;align-items:center;justify-content:center}
.icon-opt:hover{border-color:var(--agua-l);background:var(--mint)}
.icon-opt.sel{border-color:var(--agua-d);background:var(--agua-p)}
.color-grid{display:flex;gap:8px;margin-top:4px;flex-wrap:wrap}
.color-opt{width:28px;height:28px;border-radius:50%;cursor:pointer;border:2.5px solid transparent;transition:all .15s}
.color-opt.sel{border-color:var(--slate);transform:scale(1.15)}
.prio-grid{display:flex;gap:8px}
.prio-opt{flex:1;padding:8px;border-radius:10px;border:1.5px solid var(--border);cursor:pointer;font-size:12px;font-weight:500;text-align:center;transition:all .15s;background:none;font-family:'DM Sans',sans-serif}
.mf{display:flex;gap:10px;margin-top:24px}
.btn-cancel{flex:1;padding:12px;background:none;border:1.5px solid var(--border);border-radius:10px;font-family:'DM Sans',sans-serif;font-size:14px;color:var(--muted);cursor:pointer;transition:all .18s}
.btn-cancel:hover{background:var(--mint);border-color:var(--agua-l)}
.btn-save{flex:2;padding:12px;background:linear-gradient(135deg,var(--agua-d),var(--agua));color:white;border:none;border-radius:10px;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:500;cursor:pointer;box-shadow:0 3px 14px rgba(90,173,165,.3);transition:all .18s}
.btn-save:hover{transform:translateY(-1px);box-shadow:0 5px 20px rgba(90,173,165,.4)}

/* ABONAR MODAL */
.abono-meta-info{display:flex;align-items:center;gap:14px;background:var(--mint);border-radius:14px;padding:16px 18px;margin-bottom:22px}
.abono-ico{font-size:32px}
.abono-name{font-family:'DM Serif Display',serif;font-size:18px;color:var(--slate)}
.abono-pct{font-size:13px;color:var(--muted);margin-top:2px}
.quick-grid{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}
.quick-btn{padding:7px 14px;border:1.5px solid var(--border);border-radius:100px;background:none;cursor:pointer;font-size:13px;font-weight:500;color:var(--slate-m);transition:all .15s;font-family:'DM Sans',sans-serif}
.quick-btn:hover{border-color:var(--agua);background:var(--agua-p);color:var(--agua-d)}

/* DETAIL MODAL */
.detail-hist{display:flex;flex-direction:column;gap:8px;margin-top:4px}
.hist-item{display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:var(--mint);border-radius:8px;font-size:13px}
.hist-mes{color:var(--slate-m)}
.hist-val{font-weight:500;color:var(--agua-d)}

/* TOAST */
.toast{position:fixed;bottom:28px;right:28px;background:var(--slate);color:white;padding:13px 20px;border-radius:12px;font-size:13px;display:flex;align-items:center;gap:10px;box-shadow:0 6px 24px rgba(45,74,71,.25);animation:slideUp .3s ease;z-index:300}

/* EMPTY */
.empty{text-align:center;padding:64px 0;color:var(--muted)}
.empty-ico{font-size:44px;margin-bottom:14px}
.empty-txt{font-size:15px}

@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}

@media(max-width:1050px){.cards-grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:768px){
  :root{--sidebar-w:0px}
  .sidebar{display:none}
  .main{margin-left:0}
  .content{padding:16px}
  .header{padding:0 16px}
  .kpi-strip{grid-template-columns:1fr 1fr}
  .cards-grid{grid-template-columns:1fr}
}
`;

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */
const fmt = (n) => `S/ ${Number(n).toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const mesesRestantes = (fechaLimite) => {
  const hoy = new Date();
  const fin = new Date(fechaLimite);
  const diff = (fin.getFullYear() - hoy.getFullYear()) * 12 + (fin.getMonth() - hoy.getMonth());
  return Math.max(0, diff);
};

const fmtFecha = (f) => new Date(f + "T12:00:00").toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" });

const ICONS = ["✈️","🛡️","💻","🚗","🎓","🏠","💍","📱","🏖️","🎸","🐶","👶","🏋️","🌍","💊","🎮"];
const COLORS = ["#7EC8C0","#5AADA5","#C9A96E","#8AADA9","#A8DBD6","#4A706C","#E07070","#4CAF7D","#7B9DD4","#D4A0C8"];

/* Radial ring custom */
const MetaRing = ({ pct, color, size = 90 }) => {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} className="mc-ring">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#EDF8F7" strokeWidth={10} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={10}
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: "stroke-dasharray .8s ease" }}
      />
      <text x={size/2} y={size/2 + 5} textAnchor="middle"
        style={{ fontSize: 14, fontWeight: 700, fill: pct >= 100 ? "#4CAF7D" : color, fontFamily: "'DM Sans', sans-serif" }}>
        {pct >= 100 ? "✓" : `${pct}%`}
      </text>
    </svg>
  );
};

/* ─────────────────────────────────────────
   COMPONENT
───────────────────────────────────────── */
export default function MetasPage() {
  const [metas, setMetas]         = useState(METAS_INIT);
  const [activeNav, setActiveNav] = useState("metas");
  const [viewMode, setViewMode]   = useState("grid"); // grid | list
  const [filtro, setFiltro]       = useState("todas"); // todas | activas | completadas
  const [toast, setToast]         = useState(null);

  // Modals
  const [modalNueva, setModalNueva]   = useState(false);
  const [modalAbonar, setModalAbonar] = useState(null); // meta id
  const [modalDetalle, setModalDetalle] = useState(null); // meta id
  const [editMeta, setEditMeta]       = useState(null); // meta id

  // Form nueva/editar
  const FORM_DEF = { nombre: "", icon: "🎯", color: "#7EC8C0", meta: "", actual: "", aporteMensual: "", fechaLimite: "", prioridad: "media", descripcion: "" };
  const [form, setForm] = useState(FORM_DEF);

  // Abono
  const [montoAbono, setMontoAbono] = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const metasFiltradas = useMemo(() => {
    if (filtro === "activas")    return metas.filter(m => m.actual < m.meta);
    if (filtro === "completadas") return metas.filter(m => m.actual >= m.meta);
    return metas;
  }, [metas, filtro]);

  // KPIs
  const totalMeta    = metas.reduce((a, m) => a + m.meta, 0);
  const totalAhorrado = metas.reduce((a, m) => a + Math.min(m.actual, m.meta), 0);
  const completadas  = metas.filter(m => m.actual >= m.meta).length;
  const aporteTotal  = metas.reduce((a, m) => a + m.aporteMensual, 0);

  const openNueva = () => { setForm(FORM_DEF); setEditMeta(null); setModalNueva(true); };
  const openEditar = (m) => {
    setForm({ nombre: m.nombre, icon: m.icon, color: m.color, meta: String(m.meta), actual: String(m.actual), aporteMensual: String(m.aporteMensual), fechaLimite: m.fechaLimite, prioridad: m.prioridad, descripcion: m.descripcion });
    setEditMeta(m.id);
    setModalNueva(true);
  };

  const guardarMeta = () => {
    if (!form.nombre.trim() || !form.meta || isNaN(+form.meta)) { showToast("⚠ Completa nombre y monto"); return; }
    const entry = { ...form, meta: +form.meta, actual: +form.actual || 0, aporteMensual: +form.aporteMensual || 0 };
    if (editMeta) {
      setMetas(prev => prev.map(m => m.id === editMeta ? { ...m, ...entry } : m));
      showToast("✓ Meta actualizada");
    } else {
      setMetas(prev => [...prev, { id: Date.now(), ...entry, historial: [] }]);
      showToast("✓ Meta creada");
    }
    setModalNueva(false);
  };

  const eliminarMeta = (id) => { setMetas(prev => prev.filter(m => m.id !== id)); showToast("✓ Meta eliminada"); };

  const hacerAbono = () => {
    const n = +montoAbono;
    if (!n || n <= 0) { showToast("⚠ Ingresa un monto válido"); return; }
    const hoy = new Date();
    const mes = hoy.toLocaleDateString("es-PE", { month: "short" });
    setMetas(prev => prev.map(m => m.id === modalAbonar
      ? { ...m, actual: Math.min(m.actual + n, m.meta * 1.5), historial: [...m.historial, { mes, aporte: n }] }
      : m
    ));
    showToast(`✓ Abono de ${fmt(n)} registrado`);
    setMontoAbono("");
    setModalAbonar(null);
  };

  const metaAbono = metas.find(m => m.id === modalAbonar);
  const metaDetalle = metas.find(m => m.id === modalDetalle);

  return (
    <>
      <style>{S}</style>

      {toast && <div className="toast">{toast}</div>}

      {/* ── MODAL NUEVA / EDITAR ── */}
      {modalNueva && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setModalNueva(false)}>
          <div className="modal">
            <div className="modal-hd">
              <h2 className="modal-title">{editMeta ? "Editar meta" : "Nueva meta de ahorro"}</h2>
              <button className="modal-close" onClick={() => setModalNueva(false)}>✕</button>
            </div>

            <div className="fg">
              <label className="fl">Nombre de la meta</label>
              <input className="fi" placeholder="Ej: Viaje a Japón" value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} />
            </div>

            <div className="fg">
              <label className="fl">Ícono</label>
              <div className="icon-grid">
                {ICONS.map(ic => (
                  <button key={ic} className={`icon-opt${form.icon === ic ? " sel" : ""}`} onClick={() => setForm(p => ({ ...p, icon: ic }))}>{ic}</button>
                ))}
              </div>
            </div>

            <div className="fg">
              <label className="fl">Color</label>
              <div className="color-grid">
                {COLORS.map(c => (
                  <div key={c} className={`color-opt${form.color === c ? " sel" : ""}`}
                    style={{ background: c }} onClick={() => setForm(p => ({ ...p, color: c }))} />
                ))}
              </div>
            </div>

            <div className="fg2">
              <div className="fg" style={{ marginBottom: 0 }}>
                <label className="fl">Monto objetivo (S/)</label>
                <input className="fi" type="number" placeholder="0.00" value={form.meta} onChange={e => setForm(p => ({ ...p, meta: e.target.value }))} />
              </div>
              <div className="fg" style={{ marginBottom: 0 }}>
                <label className="fl">Ya ahorré (S/)</label>
                <input className="fi" type="number" placeholder="0.00" value={form.actual} onChange={e => setForm(p => ({ ...p, actual: e.target.value }))} />
              </div>
            </div>

            <div className="fg2" style={{ marginTop: 16 }}>
              <div className="fg" style={{ marginBottom: 0 }}>
                <label className="fl">Aporte mensual (S/)</label>
                <input className="fi" type="number" placeholder="0.00" value={form.aporteMensual} onChange={e => setForm(p => ({ ...p, aporteMensual: e.target.value }))} />
              </div>
              <div className="fg" style={{ marginBottom: 0 }}>
                <label className="fl">Fecha límite</label>
                <input className="fi" type="date" value={form.fechaLimite} onChange={e => setForm(p => ({ ...p, fechaLimite: e.target.value }))} />
              </div>
            </div>

            <div className="fg" style={{ marginTop: 16 }}>
              <label className="fl">Prioridad</label>
              <div className="prio-grid">
                {Object.entries(PRIORIDAD_CFG).map(([k, v]) => (
                  <button key={k} className="prio-opt"
                    style={{ borderColor: form.prioridad === k ? v.color : "var(--border)", background: form.prioridad === k ? v.bg : "none", color: form.prioridad === k ? v.color : "var(--muted)" }}
                    onClick={() => setForm(p => ({ ...p, prioridad: k }))}>
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="fg" style={{ marginBottom: 0 }}>
              <label className="fl">Descripción <span style={{ fontWeight: 300, color: "var(--muted)" }}>(opcional)</span></label>
              <input className="fi" placeholder="¿Para qué es esta meta?" value={form.descripcion} onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))} />
            </div>

            <div className="mf">
              <button className="btn-cancel" onClick={() => setModalNueva(false)}>Cancelar</button>
              <button className="btn-save" onClick={guardarMeta}>{editMeta ? "Guardar cambios" : "Crear meta"} →</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL ABONAR ── */}
      {modalAbonar && metaAbono && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setModalAbonar(null)}>
          <div className="modal" style={{ maxWidth: 400 }}>
            <div className="modal-hd">
              <h2 className="modal-title">Registrar abono</h2>
              <button className="modal-close" onClick={() => setModalAbonar(null)}>✕</button>
            </div>

            <div className="abono-meta-info">
              <span className="abono-ico">{metaAbono.icon}</span>
              <div>
                <div className="abono-name">{metaAbono.nombre}</div>
                <div className="abono-pct">
                  {fmt(metaAbono.actual)} de {fmt(metaAbono.meta)} · {Math.round((metaAbono.actual / metaAbono.meta) * 100)}% completado
                </div>
              </div>
            </div>

            <div className="fg">
              <label className="fl">Monto a abonar (S/)</label>
              <input className="fi" type="number" placeholder="0.00" value={montoAbono}
                onChange={e => setMontoAbono(e.target.value)} autoFocus />
            </div>

            <div className="fg" style={{ marginBottom: 0 }}>
              <label className="fl">Montos rápidos</label>
              <div className="quick-grid">
                {[50, 100, 200, 500, metaAbono.aporteMensual].filter((v, i, a) => v > 0 && a.indexOf(v) === i).sort((a,b)=>a-b).map(v => (
                  <button key={v} className="quick-btn" onClick={() => setMontoAbono(String(v))}>S/ {v}</button>
                ))}
              </div>
            </div>

            <div className="mf">
              <button className="btn-cancel" onClick={() => setModalAbonar(null)}>Cancelar</button>
              <button className="btn-save" onClick={hacerAbono}>Registrar abono →</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL DETALLE ── */}
      {modalDetalle && metaDetalle && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setModalDetalle(null)}>
          <div className="modal" style={{ maxWidth: 440 }}>
            <div className="modal-hd">
              <h2 className="modal-title">{metaDetalle.icon} {metaDetalle.nombre}</h2>
              <button className="modal-close" onClick={() => setModalDetalle(null)}>✕</button>
            </div>

            {/* Ring grande */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
              <MetaRing pct={Math.min(Math.round((metaDetalle.actual / metaDetalle.meta) * 100), 100)} color={metaDetalle.color} size={120} />
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
              {[
                ["Ahorrado", fmt(metaDetalle.actual)],
                ["Objetivo", fmt(metaDetalle.meta)],
                ["Restante", fmt(Math.max(metaDetalle.meta - metaDetalle.actual, 0))],
                ["Aporte mensual", fmt(metaDetalle.aporteMensual)],
                ["Meses restantes", mesesRestantes(metaDetalle.fechaLimite) + " meses"],
                ["Fecha límite", fmtFecha(metaDetalle.fechaLimite)],
              ].map(([l, v]) => (
                <div key={l} style={{ background: "var(--mint)", borderRadius: 10, padding: "10px 14px" }}>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 3 }}>{l}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--slate)" }}>{v}</div>
                </div>
              ))}
            </div>

            {/* Historial aportes */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--slate-m)", marginBottom: 10 }}>Historial de aportes</div>
              {metaDetalle.historial.length === 0
                ? <div style={{ fontSize: 13, color: "var(--muted)", textAlign: "center", padding: "12px 0" }}>Sin aportes registrados aún.</div>
                : (
                  <div style={{ height: 120 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={metaDetalle.historial} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                        <defs>
                          <linearGradient id={`grad-${metaDetalle.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={metaDetalle.color} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={metaDetalle.color} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#EEF5F4" />
                        <XAxis dataKey="mes" tick={{ fontSize: 10, fill: "#8AADA9" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: "#8AADA9" }} axisLine={false} tickLine={false} />
                        <Tooltip formatter={v => [`S/ ${v}`, "Aporte"]} contentStyle={{ borderRadius: 8, fontSize: 12, border: "none", boxShadow: "0 4px 16px rgba(0,0,0,.1)" }} />
                        <Area type="monotone" dataKey="aporte" stroke={metaDetalle.color} strokeWidth={2.5}
                          fill={`url(#grad-${metaDetalle.id})`} dot={false} activeDot={{ r: 4 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )
              }
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn-cancel" style={{ flex: 1 }} onClick={() => { setModalDetalle(null); openEditar(metaDetalle); }}>✏️ Editar</button>
              <button className="btn-save" style={{ flex: 2 }} onClick={() => { setModalDetalle(null); setModalAbonar(metaDetalle.id); }}>+ Abonar →</button>
            </div>
          </div>
        </div>
      )}

      {/* ── APP ── */}
      <div className="app">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="sb-brand">
            <div className="sb-ico">💎</div>
            <span className="sb-txt">FinVerde</span>
          </div>
          <nav className="sb-nav">
            {NAV_ITEMS.map(item => (
              <button key={item.id} className={`nav-item${activeNav === item.id ? " active" : ""}`}
                onClick={() => setActiveNav(item.id)}>
                <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
          <div className="sb-footer">
            <div className="user-chip">
              <div className="user-av">JP</div>
              <div style={{ flex: 1 }}>
                <div className="user-nm">Juan Pérez</div>
                <div className="user-pl">⭐ Premium</div>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <div className="main">
          <header className="header">
            <div>
              <div className="hd-eye">Gestión financiera · 2025</div>
              <div className="hd-title">Metas de Ahorro</div>
            </div>
            <div className="hd-right">
              {/* filtro tabs */}
              <div className="view-toggle">
                {[["todas","Todas"],["activas","Activas"],["completadas","✓ Listas"]].map(([k,l]) => (
                  <button key={k} className={`vt-btn${filtro===k?" on":""}`} onClick={() => setFiltro(k)}>{l}</button>
                ))}
              </div>
              <div className="view-toggle">
                <button className={`vt-btn${viewMode==="grid"?" on":""}`} onClick={() => setViewMode("grid")}>▦</button>
                <button className={`vt-btn${viewMode==="list"?" on":""}`} onClick={() => setViewMode("list")}>☰</button>
              </div>
              <button className="btn-primary" onClick={openNueva}>
                <span style={{ fontSize: 16 }}>＋</span> Nueva meta
              </button>
            </div>
          </header>

          <div className="content">

            {/* KPI STRIP */}
            <div className="kpi-strip">
              <div className="kpi hl" style={{ animationDelay: "0s" }}>
                <div className="kpi-top">
                  <span className="kpi-ico">🎯</span>
                  <span className="kpi-badge b-wh">{metas.length} metas</span>
                </div>
                <div className="kpi-val">{fmt(totalAhorrado)}</div>
                <div className="kpi-lbl">Total ahorrado en metas</div>
              </div>
              <div className="kpi" style={{ animationDelay: ".07s" }}>
                <div className="kpi-top">
                  <span className="kpi-ico">🏆</span>
                  <span className="kpi-badge b-gr">{completadas} de {metas.length}</span>
                </div>
                <div className="kpi-val">{completadas}</div>
                <div className="kpi-lbl">Metas completadas</div>
              </div>
              <div className="kpi" style={{ animationDelay: ".12s" }}>
                <div className="kpi-top">
                  <span className="kpi-ico">💸</span>
                  <span className="kpi-badge b-go">Mensual</span>
                </div>
                <div className="kpi-val">{fmt(aporteTotal)}</div>
                <div className="kpi-lbl">Aportes mensuales totales</div>
              </div>
              <div className="kpi" style={{ animationDelay: ".17s" }}>
                <div className="kpi-top">
                  <span className="kpi-ico">📈</span>
                  <span className="kpi-badge b-mu">{Math.round((totalAhorrado / totalMeta) * 100)}%</span>
                </div>
                <div className="kpi-val">{fmt(totalMeta - totalAhorrado)}</div>
                <div className="kpi-lbl">Falta para completar todo</div>
              </div>
            </div>

            {/* CARDS */}
            {metasFiltradas.length === 0 ? (
              <div className="empty">
                <div className="empty-ico">🎯</div>
                <div className="empty-txt">No hay metas en esta categoría.</div>
              </div>
            ) : (
              <div className={`cards-grid${viewMode === "list" ? " list-view" : ""}`}>
                {metasFiltradas.map((m, idx) => {
                  const pct  = Math.min(Math.round((m.actual / m.meta) * 100), 100);
                  const done = m.actual >= m.meta;
                  const meses = mesesRestantes(m.fechaLimite);
                  const prio  = PRIORIDAD_CFG[m.prioridad];
                  return (
                    <div key={m.id} className={`meta-card${done ? " done-card" : ""}`}
                      style={{ animationDelay: `${.22 + idx * .06}s` }}
                      onClick={() => setModalDetalle(m.id)}>

                      <div className="mc-header">
                        <div className="mc-left">
                          <div className="mc-ico" style={{ background: m.color + "22" }}>{m.icon}</div>
                          <div className="mc-info">
                            <div className="mc-name">{m.nombre}</div>
                            {m.descripcion && <div className="mc-desc">{m.descripcion}</div>}
                          </div>
                        </div>
                        <div className="mc-right">
                          {done
                            ? <span className="done-badge">✓ Completada</span>
                            : <span className="prio-badge" style={{ background: prio.bg, color: prio.color }}>{prio.label}</span>
                          }
                        </div>
                      </div>

                      <div className="mc-body">
                        <div className="mc-ring-row">
                          <MetaRing pct={pct} color={done ? "#4CAF7D" : m.color} size={88} />
                          <div className="mc-stats">
                            {[
                              ["Ahorrado",  fmt(m.actual)],
                              ["Objetivo",  fmt(m.meta)],
                              ["Restante",  fmt(Math.max(m.meta - m.actual, 0))],
                              ["Mensual",   fmt(m.aporteMensual)],
                            ].map(([l, v]) => (
                              <div className="mc-stat-row" key={l}>
                                <span className="mc-stat-lbl">{l}</span>
                                <span className="mc-stat-val">{v}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="mc-track">
                          <div className="mc-fill" style={{ width: `${pct}%`, background: done ? "#4CAF7D" : m.color }} />
                        </div>
                      </div>

                      <div className="mc-footer" onClick={e => e.stopPropagation()}>
                        <div className="mc-date">
                          📅 {m.fechaLimite ? fmtFecha(m.fechaLimite) : "Sin fecha"}
                          {!done && meses > 0 && <span style={{ color: meses <= 2 ? "var(--red)" : "var(--muted)" }}>· {meses}m restantes</span>}
                        </div>
                        <div className="mc-actions">
                          <button className="mc-btn" onClick={() => openEditar(m)}>✏️</button>
                          <button className="mc-btn" onClick={() => eliminarMeta(m.id)}>🗑</button>
                          {!done && (
                            <button className="mc-btn abonar" onClick={() => { setMontoAbono(""); setModalAbonar(m.id); }}>
                              + Abonar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}