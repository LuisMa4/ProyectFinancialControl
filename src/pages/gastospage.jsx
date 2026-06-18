import { useState, useMemo, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, LineChart, Line
} from "recharts";
import SidebarCards from "../components/SidebarCards";
import {
  EXPENSES_CHANGED_EVENT,
  loadStoredExpenses,
  getInitialExpenses,
  writeStoredExpenses,
} from "../utils/expensesStorage";

/* -----------------------------------------
   MOCK DATA
----------------------------------------- */
const CATEGORIAS_DEF = [
  { id:"alimentacion", name:"Alimentación",    icon:"🍔", color:"#7EC8C0", presupuesto:800  },
  { id:"transporte",   name:"Transporte",       icon:"🚗", color:"#5AADA5", presupuesto:400  },
  { id:"entrete",      name:"Entretenimiento",  icon:"🎬", color:"#A8DBD6", presupuesto:300  },
  { id:"salud",        name:"Salud",            icon:"💊", color:"#C9A96E", presupuesto:250  },
  { id:"educacion",    name:"Educación",        icon:"📚", color:"#8AADA9", presupuesto:200  },
  { id:"servicios",    name:"Servicios",        icon:"⚡", color:"#4A706C", presupuesto:350  },
  { id:"ropa",         name:"Ropa",             icon:"👗", color:"#D4B8A0", presupuesto:150  },
  { id:"otros",        name:"Otros",            icon:"📦", color:"#DDE9E7", presupuesto:200  },
];

const GASTOS_INIT = [
  { id:1,  desc:"Wong - Compras mensuales",   cat:"alimentacion", monto:185.50, fecha:"2025-05-24", nota:"Despensa completa",     recurrente:false },
  { id:2,  desc:"Uber",                        cat:"transporte",   monto:18.90,  fecha:"2025-05-23", nota:"",                      recurrente:false },
  { id:3,  desc:"Netflix",                     cat:"entrete",      monto:37.90,  fecha:"2025-05-23", nota:"Suscripción mensual",   recurrente:true  },
  { id:4,  desc:"Farmacia Inkafarma",          cat:"salud",        monto:62.00,  fecha:"2025-05-22", nota:"Medicamentos",          recurrente:false },
  { id:5,  desc:"Luz del Sur",                cat:"servicios",    monto:89.00,  fecha:"2025-05-21", nota:"Recibo mayo",           recurrente:true  },
  { id:6,  desc:"Plaza Vea",                  cat:"alimentacion", monto:134.20, fecha:"2025-05-20", nota:"",                      recurrente:false },
  { id:7,  desc:"Metropolitano",              cat:"transporte",   monto:50.00,  fecha:"2025-05-19", nota:"Recarga tarjeta",       recurrente:false },
  { id:8,  desc:"Spotify",                    cat:"entrete",      monto:19.90,  fecha:"2025-05-18", nota:"",                      recurrente:true  },
  { id:9,  desc:"Claro Internet",             cat:"servicios",    monto:89.00,  fecha:"2025-05-18", nota:"Plan Hogar",            recurrente:true  },
  { id:10, desc:"Librería",                   cat:"educacion",    monto:45.00,  fecha:"2025-05-15", nota:"Cuadernos y útiles",    recurrente:false },
  { id:11, desc:"Cineplanet",                 cat:"entrete",      monto:38.00,  fecha:"2025-05-14", nota:"Película + pop corn",   recurrente:false },
  { id:12, desc:"KFC",                        cat:"alimentacion", monto:52.80,  fecha:"2025-05-13", nota:"Almuerzo familiar",     recurrente:false },
  { id:13, desc:"Ripley - Camisas",           cat:"ropa",         monto:129.90, fecha:"2025-05-12", nota:"",                      recurrente:false },
  { id:14, desc:"Gimnasio",                   cat:"salud",        monto:80.00,  fecha:"2025-05-10", nota:"Mensualidad",           recurrente:true  },
  { id:15, desc:"Taxi",                       cat:"transporte",   monto:25.00,  fecha:"2025-05-09", nota:"",                      recurrente:false },
  { id:16, desc:"Dentista",                   cat:"salud",        monto:120.00, fecha:"2025-05-07", nota:"Limpieza dental",       recurrente:false },
  { id:17, desc:"Curso Udemy",                cat:"educacion",    monto:39.90,  fecha:"2025-05-06", nota:"Python para finanzas",  recurrente:false },
  { id:18, desc:"Agua Sedapal",              cat:"servicios",    monto:42.00,  fecha:"2025-05-05", nota:"",                      recurrente:true  },
  { id:19, desc:"Zara",                       cat:"ropa",         monto:89.00,  fecha:"2025-05-03", nota:"",                      recurrente:false },
  { id:20, desc:"Gas",                        cat:"otros",        monto:28.00,  fecha:"2025-05-02", nota:"Balón de gas",          recurrente:false },
];

const NAV_ITEMS = [
  { id:"dashboard",  label:"Dashboard",  icon:"◉" },
  { id:"gastos",     label:"Gastos",     icon:"💳" },
  { id:"metas",      label:"Metas",      icon:"🎯" },
  { id:"calendario", label:"Calendario", icon:"📅" },
  { id:"chatbot",    label:"Chatbot IA", icon:"🤖" },
  { id:"perfil",     label:"Mi Perfil",  icon:"👤" },
];

/* -----------------------------------------
   STYLES
----------------------------------------- */
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
#root:has(.gastos-app){width:100%;max-width:none;min-height:100svh;margin:0;border:0;text-align:left}

/* LAYOUT */
.app{display:flex;min-height:100vh}
.gastos-app{display:flex;width:100%;min-height:100svh;background:var(--mint)}

/* SIDEBAR */
.sidebar{
  width:var(--sidebar-w);background:var(--slate);
  display:flex;flex-direction:column;
  position:fixed;top:0;left:0;height:100vh;z-index:50;
}
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
.main{margin-left:var(--sidebar-w);flex:1;display:flex;flex-direction:column;min-width:0}
.gastos-app .main{width:calc(100% - var(--sidebar-w))}

/* HEADER */
.header{height:var(--header-h);background:var(--white);border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;padding:0 32px;position:sticky;top:0;z-index:40}
.hd-left{display:flex;flex-direction:column}
.hd-eye{font-size:13px;color:var(--muted);font-weight:300}
.hd-title{font-family:'DM Serif Display',serif;font-size:22px;color:var(--slate);letter-spacing:-.3px}
.hd-right{display:flex;align-items:center;gap:10px}

.btn-primary{display:flex;align-items:center;gap:7px;padding:10px 18px;background:linear-gradient(135deg,var(--agua-d),var(--agua));color:white;border:none;border-radius:10px;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:500;cursor:pointer;box-shadow:0 3px 14px rgba(90,173,165,.3);transition:all .18s}
.btn-primary:hover{transform:translateY(-1px);box-shadow:0 5px 20px rgba(90,173,165,.4)}
.btn-icon{padding:9px 11px;background:none;border:1px solid var(--border);border-radius:10px;cursor:pointer;font-size:15px;color:var(--slate-m);transition:all .18s}
.btn-icon:hover{background:var(--mint);border-color:var(--agua-l)}

/* CONTENT */
.content{padding:clamp(18px,2.5vw,32px);display:flex;flex-direction:column;gap:22px;width:100%}

/* SUMMARY STRIP */
.summary-strip{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}
.sum-card{background:var(--white);border:1px solid var(--border);border-radius:14px;padding:18px 20px;display:flex;flex-direction:column;gap:6px;animation:fadeUp .35s ease both}
.sum-card.accent{background:linear-gradient(135deg,var(--agua-d),var(--agua));border-color:transparent}
.sum-top{display:flex;align-items:center;justify-content:space-between}
.sum-icon{font-size:20px}
.sum-badge{font-size:10px;font-weight:600;padding:3px 8px;border-radius:100px;letter-spacing:.3px}
.badge-red{background:#FEF0F0;color:var(--red)}
.badge-green{background:#E8F7F0;color:var(--green)}
.badge-neu{background:var(--mint);color:var(--muted)}
.badge-white{background:rgba(255,255,255,.2);color:rgba(255,255,255,.9)}
.sum-val{font-family:'DM Serif Display',serif;font-size:26px;letter-spacing:-.4px;color:var(--slate)}
.sum-card.accent .sum-val{color:white}
.sum-lbl{font-size:12px;color:var(--muted)}
.sum-card.accent .sum-lbl{color:rgba(255,255,255,.7)}

/* PROG BAR inline */
.prog-row{display:flex;align-items:center;gap:8px;margin-top:2px}
.prog-track{flex:1;height:5px;border-radius:4px;background:rgba(255,255,255,.25);overflow:hidden}
.prog-fill{height:100%;border-radius:4px;background:rgba(255,255,255,.8);transition:width .6s ease}
.prog-txt{font-size:10px;color:rgba(255,255,255,.7);white-space:nowrap}

/* MAIN GRID */
.main-grid{display:grid;grid-template-columns:minmax(0,1fr);gap:20px;align-items:start}

/* CARD */
.card{background:var(--white);border:1px solid var(--border);border-radius:16px;padding:22px;animation:fadeUp .4s ease both;min-width:0}
.card-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px}
.card-title{font-family:'DM Serif Display',serif;font-size:17px;color:var(--slate);letter-spacing:-.2px}
.card-sub{font-size:11px;color:var(--muted);margin-top:2px}

/* FILTERS */
.filters{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:16px}
.search-wrap{position:relative;flex:1;min-width:180px}
.search-ico{position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:14px;color:var(--muted)}
.search-inp{width:100%;padding:9px 12px 9px 36px;border:1px solid var(--border);border-radius:10px;font-size:13px;font-family:'DM Sans',sans-serif;color:var(--slate);background:var(--white);outline:none;transition:border-color .2s,box-shadow .2s}
.search-inp:focus{border-color:var(--agua);box-shadow:0 0 0 3px rgba(126,200,192,.15)}
.search-inp::placeholder{color:#B8CECC}

.filter-sel{padding:9px 12px;border:1px solid var(--border);border-radius:10px;font-size:13px;font-family:'DM Sans',sans-serif;color:var(--slate-m);background:var(--white);cursor:pointer;outline:none;transition:border-color .2s}
.filter-sel:focus{border-color:var(--agua)}

.chip{padding:7px 14px;border-radius:100px;border:1px solid var(--border);background:none;font-size:12px;font-weight:500;color:var(--muted);cursor:pointer;transition:all .15s;font-family:'DM Sans',sans-serif}
.chip.on{background:var(--agua-d);color:white;border-color:var(--agua-d)}

/* TABLE */
.tx-table{width:100%;border-collapse:collapse}
.tx-table th{text-align:left;font-size:11px;font-weight:600;color:var(--muted);letter-spacing:.5px;text-transform:uppercase;padding:0 8px 10px;border-bottom:1px solid var(--border)}
.tx-table td{padding:12px 8px;border-bottom:1px solid var(--border);font-size:13.5px;vertical-align:middle}
.tx-table tr:last-child td{border-bottom:none}
.tx-table tr:hover td{background:var(--mint)}
.tx-table tr{transition:background .15s;cursor:pointer}

.tx-main{display:flex;align-items:center;gap:11px}
.tx-emo{width:36px;height:36px;border-radius:10px;background:var(--mint);display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0}
.tx-desc{font-weight:400;color:var(--slate);max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tx-nota{font-size:11px;color:var(--muted);margin-top:1px}

.cat-pill{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:100px;font-size:11px;font-weight:500}

.rec-badge{font-size:10px;background:var(--mint);color:var(--agua-d);padding:2px 7px;border-radius:100px;font-weight:500}

.amount-cell{font-weight:600;font-size:14px;color:var(--red);white-space:nowrap}
.actions-cell{display:flex;gap:6px;justify-content:flex-end}
.act-btn{background:none;border:none;cursor:pointer;font-size:14px;padding:5px;border-radius:7px;transition:background .15s;color:var(--muted)}
.act-btn:hover{background:var(--mint);color:var(--agua-d)}
.act-btn.del:hover{background:#FEF0F0;color:var(--red)}

.empty-state{text-align:center;padding:48px 0;color:var(--muted)}
.empty-icon{font-size:36px;margin-bottom:12px}
.empty-txt{font-size:14px}

/* PAGINATION */
.pagination{display:flex;align-items:center;justify-content:space-between;margin-top:16px;font-size:13px;color:var(--muted)}
.page-btns{display:flex;gap:4px}
.page-btn{width:30px;height:30px;border-radius:8px;border:1px solid var(--border);background:none;cursor:pointer;font-size:13px;font-family:'DM Sans',sans-serif;color:var(--muted);transition:all .15s}
.page-btn.on{background:var(--agua-d);color:white;border-color:var(--agua-d)}
.page-btn:hover:not(.on){background:var(--mint);border-color:var(--agua-l);color:var(--agua-d)}

/* INSIGHTS PANEL */
.right-panel{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;align-items:stretch}
.right-panel .card{height:100%}

/* Category bars */
.cat-bars{display:flex;flex-direction:column;gap:12px}
.cat-bar-item{}
.cat-bar-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:5px}
.cat-bar-left{display:flex;align-items:center;gap:7px;font-size:13px;color:var(--slate-m)}
.cat-bar-val{font-size:12px;font-weight:500;color:var(--slate)}
.cat-track{height:7px;background:var(--mint);border-radius:4px;overflow:hidden}
.cat-fill{height:100%;border-radius:4px;transition:width .7s ease}
.cat-pct{font-size:10px;color:var(--muted);margin-top:3px;text-align:right}

/* MODAL */
.modal-overlay{position:fixed;inset:0;background:rgba(45,74,71,.4);backdrop-filter:blur(4px);z-index:200;display:flex;align-items:center;justify-content:center;animation:fadeIn .2s ease}
.modal{background:var(--white);border-radius:20px;padding:32px;width:100%;max-width:460px;box-shadow:0 20px 60px rgba(45,74,71,.2);animation:slideUp .25s ease}
.modal-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px}
.modal-title{font-family:'DM Serif Display',serif;font-size:22px;color:var(--slate)}
.modal-close{background:none;border:none;cursor:pointer;font-size:20px;color:var(--muted);line-height:1;padding:2px}
.modal-close:hover{color:var(--slate)}
.form-group{margin-bottom:16px}
.form-label{display:block;font-size:13px;font-weight:500;color:var(--slate-m);margin-bottom:6px}
.form-input{width:100%;padding:11px 14px;border:1.5px solid var(--border);border-radius:10px;font-size:14px;font-family:'DM Sans',sans-serif;color:var(--slate);background:var(--white);outline:none;transition:border-color .2s,box-shadow .2s}
.form-input:focus{border-color:var(--agua);box-shadow:0 0 0 3px rgba(126,200,192,.15)}
.form-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.cat-select-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:2px}
.cat-opt{display:flex;flex-direction:column;align-items:center;gap:4px;padding:10px 6px;border:1.5px solid var(--border);border-radius:10px;cursor:pointer;transition:all .15s;background:none;font-family:'DM Sans',sans-serif}
.cat-opt:hover{border-color:var(--agua-l);background:var(--mint)}
.cat-opt.sel{border-color:var(--agua-d);background:rgba(90,173,165,.08)}
.cat-opt-ico{font-size:20px}
.cat-opt-lbl{font-size:9px;color:var(--muted);text-align:center;line-height:1.2}
.cat-opt.sel .cat-opt-lbl{color:var(--agua-d);font-weight:500}
.check-row{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--slate-m);cursor:pointer}
.check-row input{accent-color:var(--agua-d);width:15px;height:15px}
.modal-foot{display:flex;gap:10px;margin-top:24px}
.btn-cancel{flex:1;padding:12px;background:none;border:1.5px solid var(--border);border-radius:10px;font-family:'DM Sans',sans-serif;font-size:14px;color:var(--muted);cursor:pointer;transition:all .18s}
.btn-cancel:hover{background:var(--mint);border-color:var(--agua-l)}
.btn-save{flex:2;padding:12px;background:linear-gradient(135deg,var(--agua-d),var(--agua));color:white;border:none;border-radius:10px;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:500;cursor:pointer;box-shadow:0 3px 14px rgba(90,173,165,.3);transition:all .18s}
.btn-save:hover{transform:translateY(-1px);box-shadow:0 5px 20px rgba(90,173,165,.4)}

/* TREND MINI */
.trend-card{animation-delay:.3s}

/* TOAST */
.gastos-toast{position:fixed;bottom:28px;right:28px;width:max-content;max-width:min(360px,calc(100vw - 32px));background:var(--slate);color:white;padding:13px 20px;border-radius:12px;font-size:13px;line-height:1.35;display:flex;align-items:center;gap:10px;box-shadow:0 6px 24px rgba(45,74,71,.25);animation:slideUp .3s ease;z-index:300}
.gastos-toast.error{background:#C0504D}

@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}

@media(max-width:1200px){
  .right-panel{grid-template-columns:repeat(2,minmax(0,1fr))}
  .trend-card{grid-column:1/-1}
}
@media(max-width:1050px){
  .main-grid{grid-template-columns:1fr}
  .right-panel{display:grid}
}
@media(max-width:768px){
  :root{--sidebar-w:0px}
  .sidebar{display:none}
  .main{margin-left:0}
  .gastos-app .main{width:100%}
  .content{padding:16px}
  .summary-strip{grid-template-columns:1fr 1fr}
  .right-panel{grid-template-columns:1fr}
  .trend-card{grid-column:auto}
  .header{padding:0 16px}
}
@media(max-width:560px){
  .header{height:auto;min-height:var(--header-h);align-items:flex-start;flex-direction:column;gap:12px;padding:14px 16px}
  .hd-right{width:100%;justify-content:space-between}
  .summary-strip{grid-template-columns:1fr}
  .card{padding:18px}
  .filters{align-items:stretch;flex-direction:column}
  .search-wrap{min-width:0;width:100%}
  .filter-sel,.chip{width:100%}
  .tx-table{display:block;overflow-x:auto;white-space:nowrap}
  .pagination{align-items:flex-start;flex-direction:column;gap:10px}
  .modal{max-width:calc(100vw - 24px);padding:22px}
  .form-grid-2,.cat-select-grid{grid-template-columns:1fr 1fr}
  .gastos-toast{left:16px;right:16px;bottom:18px;width:auto;max-width:none}
}
`;

const fmt = (n) => `S/ ${Number(n).toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtDate = (d) => new Date(d + "T12:00:00").toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" });
const getCurrentPeriod = () => {
  const now = new Date();
  const month = now.toLocaleDateString("es-PE", { month: "long" });
  const titleMonth = month.charAt(0).toUpperCase() + month.slice(1);
  return { month, label: `${titleMonth} ${now.getFullYear()}` };
};

const CustomTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#2D4A47", color: "white", borderRadius: 10, padding: "8px 12px", fontSize: 12 }}>
      <div style={{ color: "#A8DBD6", marginBottom: 3 }}>Día {label}</div>
      <div>S/ {payload[0].value}</div>
    </div>
  );
};

export default function GastosPage({ onLogout, onNavigate, isGuest = false }) {
  const [gastos, setGastos]         = useState(() => getInitialExpenses(isGuest ? GASTOS_INIT : []));
  const [search, setSearch]         = useState("");
  const [catFilter, setCatFilter]   = useState("todas");
  const [soloRec, setSoloRec]       = useState(false);
  const [sortBy, setSortBy]         = useState("fecha");
  const [page, setPage]             = useState(1);
  const [showModal, setShowModal]   = useState(false);
  const [toast, setToast]           = useState(null);
  const [activeNav, setActiveNav]   = useState("gastos");
  const PER_PAGE = 8;
  const currentPeriod = getCurrentPeriod();

  const handleNavClick = (id) => {
    setActiveNav(id);
    if (onNavigate) onNavigate(id);
  };

  // Form state
  const [form, setForm] = useState({ desc: "", monto: "", cat: "alimentacion", fecha: new Date().toISOString().slice(0, 10), nota: "", recurrente: false });
  const [editId, setEditId] = useState(null);

  const showToast = (msg, err = false) => {
    setToast({ msg, err });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    void loadStoredExpenses(isGuest ? GASTOS_INIT : []).then(setGastos);
  }, [isGuest]);

  const commitGastos = (updater) => {
    setGastos(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      void writeStoredExpenses(next);
      return next;
    });
  };

  useEffect(() => {
    const syncExpenses = (event) => {
      setGastos(event.detail || getInitialExpenses(isGuest ? GASTOS_INIT : []));
      setPage(1);
    };
    window.addEventListener(EXPENSES_CHANGED_EVENT, syncExpenses);
    return () => window.removeEventListener(EXPENSES_CHANGED_EVENT, syncExpenses);
  }, [isGuest]);

  // Derived
  const filtered = useMemo(() => {
    let list = [...gastos];
    if (search) list = list.filter(g => g.desc.toLowerCase().includes(search.toLowerCase()) || (g.nota && g.nota.toLowerCase().includes(search.toLowerCase())));
    if (catFilter !== "todas") list = list.filter(g => g.cat === catFilter);
    if (soloRec) list = list.filter(g => g.recurrente);
    list.sort((a, b) => {
      if (sortBy === "fecha")  return b.fecha.localeCompare(a.fecha);
      if (sortBy === "monto")  return b.monto - a.monto;
      if (sortBy === "desc")   return a.desc.localeCompare(b.desc);
      return 0;
    });
    return list;
  }, [gastos, search, catFilter, soloRec, sortBy]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const totalMes   = gastos.reduce((a, g) => a + g.monto, 0);
  const presTotal  = CATEGORIAS_DEF.reduce((a, c) => a + c.presupuesto, 0);
  const recurrTotal= gastos.filter(g => g.recurrente).reduce((a, g) => a + g.monto, 0);
  const mayorGasto = [...gastos].sort((a, b) => b.monto - a.monto)[0];
  const trendData = useMemo(() => {
    if (!gastos.length) return [];

    const dailyTotals = gastos.reduce((acc, gasto) => {
      const day = String(new Date(gasto.fecha + "T12:00:00").getDate());
      acc[day] = (acc[day] || 0) + gasto.monto;
      return acc;
    }, {});

    return Object.entries(dailyTotals)
      .map(([dia, monto]) => ({ dia, monto }))
      .sort((a, b) => Number(a.dia) - Number(b.dia));
  }, [gastos]);

  // Category totals
  const catTotals = useMemo(() => CATEGORIAS_DEF.map(c => ({
    ...c,
    gastado: gastos.filter(g => g.cat === c.id).reduce((a, g) => a + g.monto, 0),
  })).sort((a, b) => b.gastado - a.gastado), [gastos]);

  const openNew = () => {
    setForm({ desc: "", monto: "", cat: "alimentacion", fecha: new Date().toISOString().slice(0, 10), nota: "", recurrente: false });
    setEditId(null);
    setShowModal(true);
  };

  const openEdit = (g) => {
    setForm({ desc: g.desc, monto: String(g.monto), cat: g.cat, fecha: g.fecha, nota: g.nota, recurrente: g.recurrente });
    setEditId(g.id);
    setShowModal(true);
  };

  const saveGasto = () => {
    if (!form.desc.trim() || !form.monto || isNaN(Number(form.monto))) {
      showToast("Completa descripción y monto válido", true); return;
    }
    const entry = { ...form, monto: Number(form.monto) };
    if (editId) {
      commitGastos(prev => prev.map(g => g.id === editId ? { ...g, ...entry } : g));
      showToast("Gasto actualizado ✓");
    } else {
      commitGastos(prev => [{ id: Date.now(), ...entry }, ...prev]);
      showToast("Gasto registrado ✓");
    }
    setShowModal(false);
    setPage(1);
  };

  const deleteGasto = (id) => {
    commitGastos(prev => prev.filter(g => g.id !== id));
    showToast("Gasto eliminado");
  };

  const getCat = (id) => CATEGORIAS_DEF.find(c => c.id === id) || CATEGORIAS_DEF[7];

  return (
    <>
      <style>{S}</style>
      {toast && <div className={`gastos-toast${toast.err ? " error" : ""}`}>{toast.err ? "⚠" : "✓"} {toast.msg}</div>}

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-hd">
              <h2 className="modal-title">{editId ? "Editar gasto" : "Nuevo gasto"}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <div className="form-group">
              <label className="form-label">Descripción</label>
              <input className="form-input" placeholder="Ej: Almuerzo en restaurante" value={form.desc}
                onChange={e => setForm(p => ({ ...p, desc: e.target.value }))} />
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Monto (S/)</label>
                <input className="form-input" type="number" placeholder="0.00" value={form.monto}
                  onChange={e => setForm(p => ({ ...p, monto: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Fecha</label>
                <input className="form-input" type="date" value={form.fecha}
                  onChange={e => setForm(p => ({ ...p, fecha: e.target.value }))} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Categoría</label>
              <div className="cat-select-grid">
                {CATEGORIAS_DEF.map(c => (
                  <button key={c.id} className={`cat-opt${form.cat === c.id ? " sel" : ""}`}
                    onClick={() => setForm(p => ({ ...p, cat: c.id }))}>
                    <span className="cat-opt-ico">{c.icon}</span>
                    <span className="cat-opt-lbl">{c.name.split(" ")[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Nota <span style={{ fontWeight: 300, color: "var(--muted)" }}>(opcional)</span></label>
              <input className="form-input" placeholder="Agrega un detalle..." value={form.nota}
                onChange={e => setForm(p => ({ ...p, nota: e.target.value }))} />
            </div>

            <label className="check-row" style={{ marginBottom: 0 }}>
              <input type="checkbox" checked={form.recurrente} onChange={e => setForm(p => ({ ...p, recurrente: e.target.checked }))} />
              Gasto recurrente (se repite cada mes)
            </label>

            <div className="modal-foot">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn-save" onClick={saveGasto}>{editId ? "Guardar cambios" : "Registrar gasto"} →</button>
            </div>
          </div>
        </div>
      )}

      <div className="app gastos-app">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="sb-brand">
            <div className="sb-ico">💎</div>
            <span className="sb-txt">Savia</span>
          </div>
          <nav className="sb-nav">
            {NAV_ITEMS.map(item => (
              <button key={item.id} className={`nav-item${activeNav === item.id ? " active" : ""}`}
                onClick={() => handleNavClick(item.id)}>
                <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
            <SidebarCards onManage={() => handleNavClick("dashboard")} />
          </nav>
          <div className="sb-footer">
            <div className="user-chip">
              <div className="user-av">{isGuest ? "JP" : "CN"}</div>
              <div style={{ flex: 1 }}>
                <div className="user-nm">{isGuest ? "Juan Pérez" : "Cuenta nueva"}</div>
                <div className="user-pl">{isGuest ? "⭐ Premium" : "Plan gratuito"}</div>
              </div>
              {onLogout && <button className="logout-btn" title="Cerrar sesión" onClick={onLogout}>⏻</button>}
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <div className="main">
          <header className="header">
            <div className="hd-left">
              <span className="hd-eye">Gestión financiera · {currentPeriod.label}</span>
              <span className="hd-title">Mis Gastos</span>
            </div>
            <div className="hd-right">
              <button className="btn-icon" title="Exportar">📥</button>
              <button className="btn-primary" onClick={openNew}>
                <span style={{ fontSize: 16 }}>+</span> Nuevo gasto
              </button>
            </div>
          </header>

          <div className="content">

            {/* SUMMARY STRIP */}
            <div className="summary-strip">
              <div className="sum-card accent" style={{ animationDelay: "0s" }}>
                <div className="sum-top">
                  <span className="sum-icon">💳</span>
                  <span className="sum-badge badge-white">{Math.round((totalMes / presTotal) * 100)}% del ppto.</span>
                </div>
                <div className="sum-val">{fmt(totalMes)}</div>
                <div className="sum-lbl">Total gastado en {currentPeriod.month}</div>
                <div className="prog-row">
                  <div className="prog-track"><div className="prog-fill" style={{ width: `${Math.min((totalMes / presTotal) * 100, 100)}%` }} /></div>
                  <span className="prog-txt">{fmt(presTotal - totalMes)} restante</span>
                </div>
              </div>

              <div className="sum-card" style={{ animationDelay: ".07s" }}>
                <div className="sum-top">
                  <span className="sum-icon">🔁</span>
                  <span className="sum-badge badge-neu">{gastos.filter(g => g.recurrente).length} items</span>
                </div>
                <div className="sum-val">{fmt(recurrTotal)}</div>
                <div className="sum-lbl">Gastos recurrentes</div>
              </div>

              <div className="sum-card" style={{ animationDelay: ".12s" }}>
                <div className="sum-top">
                  <span className="sum-icon">⬆️</span>
                  <span className="sum-badge badge-red">Mayor</span>
                </div>
                <div className="sum-val">{fmt(mayorGasto?.monto || 0)}</div>
                <div className="sum-lbl">{mayorGasto?.desc || "—"}</div>
              </div>

              <div className="sum-card" style={{ animationDelay: ".17s" }}>
                <div className="sum-top">
                  <span className="sum-icon">📊</span>
                  <span className="sum-badge badge-green">{gastos.length} registros</span>
                </div>
                <div className="sum-val">{fmt(gastos.length ? totalMes / gastos.length : 0)}</div>
                <div className="sum-lbl">Gasto promedio por operación</div>
              </div>
            </div>

            {/* MAIN GRID */}
            <div className="main-grid">

              {/* LEFT: TABLE */}
              <div>
                <div className="card" style={{ animationDelay: ".22s" }}>
                  <div className="card-hd">
                    <div>
                      <div className="card-title">Registro de Gastos</div>
                      <div className="card-sub">{filtered.length} transacciones encontradas</div>
                    </div>
                    <select className="filter-sel" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                      <option value="fecha">Más reciente</option>
                      <option value="monto">Mayor monto</option>
                      <option value="desc">Alfabético</option>
                    </select>
                  </div>

                  {/* FILTERS */}
                  <div className="filters">
                    <div className="search-wrap">
                      <span className="search-ico">🔍</span>
                      <input className="search-inp" placeholder="Buscar gasto..." value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }} />
                    </div>
                    <select className="filter-sel" value={catFilter}
                      onChange={e => { setCatFilter(e.target.value); setPage(1); }}>
                      <option value="todas">Todas las categorías</option>
                      {CATEGORIAS_DEF.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                    </select>
                    <button className={`chip${soloRec ? " on" : ""}`} onClick={() => { setSoloRec(v => !v); setPage(1); }}>
                      🔁 Recurrentes
                    </button>
                  </div>

                  {/* TABLE */}
                  {paginated.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">🔍</div>
                      <div className="empty-txt">No se encontraron gastos con esos filtros.</div>
                    </div>
                  ) : (
                    <table className="tx-table">
                      <thead>
                        <tr>
                          <th>Descripción</th>
                          <th>Categoría</th>
                          <th>Fecha</th>
                          <th>Monto</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginated.map(g => {
                          const cat = getCat(g.cat);
                          return (
                            <tr key={g.id} onClick={() => openEdit(g)}>
                              <td>
                                <div className="tx-main">
                                  <div className="tx-emo">{cat.icon}</div>
                                  <div>
                                    <div className="tx-desc">{g.desc}</div>
                                    <div className="tx-nota">
                                      {g.nota && <span>{g.nota}</span>}
                                      {g.recurrente && <span className="rec-badge" style={{ marginLeft: g.nota ? 6 : 0 }}>🔁 Recurrente</span>}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <span className="cat-pill" style={{ background: cat.color + "22", color: cat.color }}>
                                  {cat.name}
                                </span>
                              </td>
                              <td style={{ color: "var(--muted)", fontSize: 12, whiteSpace: "nowrap" }}>{fmtDate(g.fecha)}</td>
                              <td><span className="amount-cell">{fmt(g.monto)}</span></td>
                              <td onClick={e => e.stopPropagation()}>
                                <div className="actions-cell">
                                  <button className="act-btn" title="Editar" onClick={() => openEdit(g)}>✏️</button>
                                  <button className="act-btn del" title="Eliminar" onClick={() => deleteGasto(g.id)}>🗑</button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}

                  {/* PAGINATION */}
                  {totalPages > 1 && (
                    <div className="pagination">
                      <span>Mostrando {Math.min((page - 1) * PER_PAGE + 1, filtered.length)}–{Math.min(page * PER_PAGE, filtered.length)} de {filtered.length}</span>
                      <div className="page-btns">
                        <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                          <button key={n} className={`page-btn${page === n ? " on" : ""}`} onClick={() => setPage(n)}>{n}</button>
                        ))}
                        <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>›</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT PANEL */}
              <div className="right-panel">

                {/* Trend line */}
                <div className="card trend-card" style={{ animationDelay: ".28s" }}>
                  <div className="card-hd">
                    <div>
                      <div className="card-title">Tendencia</div>
                      <div className="card-sub">Gastos diarios {currentPeriod.month}</div>
                    </div>
                  </div>
                  {trendData.length === 0 ? (
                    <div className="empty-state" style={{ padding: "24px 0" }}>
                      <div className="empty-icon">🔍</div>
                      <div className="empty-txt">Aún no hay gastos para mostrar tendencia.</div>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={110}>
                      <LineChart data={trendData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                        <XAxis dataKey="dia" tick={{ fontSize: 10, fill: "#8AADA9" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: "#8AADA9" }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTip />} />
                        <Line type="monotone" dataKey="monto" stroke="#5AADA5" strokeWidth={2.5}
                          dot={false} activeDot={{ r: 4, fill: "#5AADA5" }} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* Category breakdown */}
                <div className="card" style={{ animationDelay: ".34s" }}>
                  <div className="card-hd">
                    <div>
                      <div className="card-title">Por Categoría</div>
                      <div className="card-sub">vs presupuesto</div>
                    </div>
                  </div>
                  <div className="cat-bars">
                    {catTotals.filter(c => c.gastado > 0).map(c => {
                      const pct = Math.min((c.gastado / c.presupuesto) * 100, 100);
                      const over = c.gastado > c.presupuesto;
                      return (
                        <div className="cat-bar-item" key={c.id}>
                          <div className="cat-bar-top">
                            <div className="cat-bar-left">
                              <span>{c.icon}</span>
                              <span>{c.name}</span>
                            </div>
                            <span className="cat-bar-val" style={{ color: over ? "var(--red)" : "var(--slate)" }}>
                              {fmt(c.gastado)}
                            </span>
                          </div>
                          <div className="cat-track">
                            <div className="cat-fill" style={{ width: `${pct}%`, background: over ? "var(--red)" : c.color }} />
                          </div>
                          <div className="cat-pct" style={{ color: over ? "var(--red)" : "var(--muted)" }}>
                            {over ? `⚠ +${fmt(c.gastado - c.presupuesto)} sobre el límite` : `${Math.round(pct)}% de S/ ${c.presupuesto}`}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bar chart top categorias */}
                <div className="card" style={{ animationDelay: ".4s" }}>
                  <div className="card-hd">
                    <div>
                      <div className="card-title">Top gastos</div>
                      <div className="card-sub">Comparativa por categoría</div>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={catTotals.filter(c => c.gastado > 0).slice(0, 5)} layout="vertical"
                      margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                      <XAxis type="number" tick={{ fontSize: 10, fill: "#8AADA9" }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="icon" tick={{ fontSize: 16 }} axisLine={false} tickLine={false} width={28} />
                      <Tooltip formatter={v => [`S/ ${v}`, ""]} contentStyle={{ borderRadius: 10, fontSize: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,.1)" }} />
                      <Bar dataKey="gastado" radius={[0, 6, 6, 0]}>
                        {catTotals.filter(c => c.gastado > 0).slice(0, 5).map((c, i) => (
                          <Cell key={i} fill={c.gastado > c.presupuesto ? "#E07070" : c.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


