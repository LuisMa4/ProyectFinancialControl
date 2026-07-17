import { useState } from "react";
import SidebarCards from "../components/SidebarCards";

const S = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --agua:#7EC8C0;--agua-l:#A8DBD6;--agua-p:#D4F0ED;--agua-d:#5AADA5;
  --mint:#EDF8F7;--white:#FAFFFE;--slate:#2D4A47;--slate-m:#4A706C;
  --muted:#8AADA9;--border:#DDE9E7;--gold:#C9A96E;--red:#E07070;--green:#4CAF7D;
  --sw:240px;
  --page-max:1180px;
}
html,body{font-family:'DM Sans',sans-serif;background:var(--mint);color:var(--slate)}

/* ── SIDEBAR ── */
.app{display:flex;min-height:100vh}
.sidebar{width:var(--sw);background:var(--slate);display:flex;flex-direction:column;position:fixed;top:0;left:0;height:100vh;z-index:100;transition:transform .3s ease}
.sidebar.collapsed{transform:translateX(-100%)}
.sb-brand{display:flex;align-items:center;gap:10px;padding:22px 20px 18px;border-bottom:1px solid rgba(255,255,255,.08)}
.sb-ico{width:34px;height:34px;border-radius:9px;background:linear-gradient(135deg,var(--agua-d),var(--agua));display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0}
.sb-txt{font-family:'DM Serif Display',serif;font-size:21px;color:white;letter-spacing:-.3px}
.sb-nav{flex:1;padding:14px 10px;display:flex;flex-direction:column;gap:3px;overflow-y:auto}
.nav-item{display:flex;align-items:center;gap:11px;padding:10px 13px;border-radius:9px;font-size:13.5px;color:rgba(255,255,255,.5);cursor:pointer;transition:all .17s;border:none;background:none;width:100%;text-align:left;font-family:'DM Sans',sans-serif}
.nav-item:hover{background:rgba(255,255,255,.07);color:rgba(255,255,255,.85)}
.nav-item.active{background:linear-gradient(135deg,rgba(90,173,165,.35),rgba(126,200,192,.2));color:white;font-weight:500;box-shadow:inset 0 0 0 1px rgba(126,200,192,.22)}
.sb-footer{padding:14px 10px;border-top:1px solid rgba(255,255,255,.08)}
.user-chip{display:flex;align-items:center;gap:9px;padding:9px 11px;border-radius:9px;background:rgba(255,255,255,.06)}
.user-av{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,var(--agua-d),var(--agua));display:flex;align-items:center;justify-content:center;font-size:13px;color:white;font-weight:600;flex-shrink:0}
.user-nm{font-size:12.5px;font-weight:500;color:white;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.user-pl{font-size:10.5px;color:var(--agua-l)}
.sb-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:99}
.sb-overlay.show{display:block}

/* ── MAIN ── */
.main{margin-left:var(--sw);flex:1;display:flex;flex-direction:column;min-width:0}
.header{background:var(--white);border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;padding:0 32px;height:64px;position:sticky;top:0;z-index:50;gap:12px}
.hd-left{display:flex;align-items:center;gap:12px;min-width:0}
.hamburger{display:none;background:none;border:1px solid var(--border);border-radius:9px;padding:7px 9px;cursor:pointer;font-size:15px;color:var(--slate-m);transition:all .15s;flex-shrink:0}
.hamburger:hover{background:var(--mint);border-color:var(--agua-l)}
.hd-eye{font-size:12px;color:var(--muted);font-weight:300}
.hd-title{font-family:'DM Serif Display',serif;font-size:20px;color:var(--slate);letter-spacing:-.3px}

/* ── CONTENT ── */
.content{padding:48px clamp(24px,4vw,64px);display:flex;flex-direction:column;align-items:center;gap:48px;width:100%;max-width:calc(var(--page-max) + 128px);margin:0 auto}

/* ── HERO ── */
.hero{text-align:center;width:100%;max-width:760px;animation:fadeUp .4s ease}
.hero-eyebrow{display:inline-flex;align-items:center;gap:6px;background:var(--agua-p);border:1px solid var(--agua-l);border-radius:100px;padding:5px 14px;font-size:12px;font-weight:500;color:var(--agua-d);letter-spacing:.3px;text-transform:uppercase;margin-bottom:18px}
.hero-eyebrow-dot{width:6px;height:6px;border-radius:50%;background:var(--agua-d);animation:blink 2s ease infinite}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.35}}
.hero-title{font-family:'DM Serif Display',serif;font-size:clamp(38px,4.2vw,58px);color:var(--slate);letter-spacing:0;line-height:1.05;margin-bottom:14px}
.hero-title em{font-style:italic;color:var(--agua-d)}
.hero-sub{font-size:clamp(15px,1.15vw,18px);color:var(--muted);font-weight:300;line-height:1.7;max-width:620px;margin:0 auto 28px}

/* billing toggle */
.billing-toggle{display:inline-flex;background:var(--white);border:1.5px solid var(--border);border-radius:100px;padding:4px;gap:2px}
.bt-opt{padding:8px 20px;border-radius:100px;border:none;background:none;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;color:var(--muted);cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:6px}
.bt-opt.on{background:var(--agua-d);color:white;box-shadow:0 2px 10px rgba(90,173,165,.3)}
.save-badge{background:var(--gold);color:white;font-size:10px;font-weight:700;padding:2px 7px;border-radius:100px}

/* ── PLANS GRID ── */
.plans-grid{display:grid;grid-template-columns:repeat(2,minmax(320px,1fr));gap:clamp(22px,2.4vw,34px);width:100%;max-width:var(--page-max);animation:fadeUp .4s ease both;animation-delay:.1s;align-items:stretch}

/* ── PLAN CARD ── */
.plan-card{background:var(--white);border:2px solid var(--border);border-radius:24px;overflow:hidden;display:flex;flex-direction:column;transition:box-shadow .2s,transform .2s;position:relative}
.plan-card:hover{box-shadow:0 8px 40px rgba(90,173,165,.12);transform:translateY(-3px)}
.plan-card.featured{border-color:var(--agua-d);box-shadow:0 8px 40px rgba(90,173,165,.18)}
.plan-card.featured:hover{box-shadow:0 16px 56px rgba(90,173,165,.25);transform:translateY(-5px)}

/* popular badge */
.popular-badge{position:absolute;top:-1px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,var(--agua-d),var(--agua));color:white;font-size:11px;font-weight:700;padding:5px 18px;border-radius:0 0 12px 12px;letter-spacing:.5px;text-transform:uppercase;display:flex;align-items:center;gap:5px;white-space:nowrap}

/* plan top stripe */
.plan-stripe{height:5px;width:100%}

/* plan header */
.plan-header{padding:28px 28px 20px}
.plan-header.featured{padding-top:36px}
.plan-icon-wrap{width:52px;height:52px;border-radius:15px;display:flex;align-items:center;justify-content:center;font-size:26px;margin-bottom:16px}
.plan-name{font-family:'DM Serif Display',serif;font-size:24px;color:var(--slate);letter-spacing:-.3px;margin-bottom:6px}
.plan-desc{font-size:13.5px;color:var(--muted);font-weight:300;line-height:1.55}

/* price */
.price-wrap{margin-top:22px;display:flex;align-items:flex-end;gap:4px}
.price-currency{font-size:20px;font-weight:600;color:var(--slate);margin-bottom:8px;line-height:1}
.price-amount{font-family:'DM Serif Display',serif;font-size:56px;color:var(--slate);letter-spacing:-2px;line-height:1}
.price-amount.free{color:var(--agua-d)}
.price-period{font-size:14px;color:var(--muted);margin-bottom:10px;font-weight:300}
.price-anual-note{font-size:12px;color:var(--green);font-weight:500;margin-top:4px;display:flex;align-items:center;gap:4px}
.price-original{font-size:13px;color:var(--muted);text-decoration:line-through;margin-right:4px}

/* cta button */
.plan-cta{margin:22px 28px 0;padding:14px;border-radius:12px;font-family:'DM Sans',sans-serif;font-size:15px;font-weight:600;cursor:pointer;border:none;width:calc(100% - 56px);transition:all .18s;display:flex;align-items:center;justify-content:center;gap:8px;letter-spacing:.1px}
.cta-free{background:var(--mint);color:var(--slate-m);border:1.5px solid var(--border)}
.cta-free:hover{background:var(--agua-p);border-color:var(--agua-l);color:var(--agua-d)}
.cta-premium{background:linear-gradient(135deg,var(--agua-d),var(--agua));color:white;box-shadow:0 4px 18px rgba(90,173,165,.35)}
.cta-premium:hover{transform:translateY(-1px);box-shadow:0 6px 26px rgba(90,173,165,.45)}

.plan-trial{text-align:center;font-size:12px;color:var(--muted);padding:10px 28px 0;display:flex;align-items:center;justify-content:center;gap:5px}

/* features list */
.plan-features{padding:20px 28px 28px;flex:1;display:flex;flex-direction:column;gap:0;border-top:1px solid var(--border);margin-top:20px}
.features-label{font-size:11px;font-weight:700;color:var(--muted);letter-spacing:.6px;text-transform:uppercase;margin-bottom:14px}
.feature-item{display:flex;align-items:flex-start;gap:11px;padding:9px 0;border-bottom:1px solid var(--border)}
.feature-item:last-child{border-bottom:none;padding-bottom:0}
.feat-check{width:20px;height:20px;border-radius:6px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;margin-top:1px}
.feat-check.yes{background:var(--agua-p);color:var(--agua-d)}
.feat-check.yes.prem{background:linear-gradient(135deg,var(--agua-d),var(--agua));color:white}
.feat-check.no{background:#F5F5F5;color:var(--muted)}
.feat-info{flex:1}
.feat-label{font-size:13.5px;color:var(--slate);line-height:1.3}
.feat-label.dimmed{color:var(--muted)}
.feat-sub{font-size:11px;color:var(--muted);margin-top:2px;font-weight:300}
.feat-tag{font-size:10px;font-weight:600;padding:2px 7px;border-radius:100px;margin-left:6px;vertical-align:middle}
.tag-new{background:#E8F7F0;color:var(--green)}
.tag-pro{background:var(--agua-p);color:var(--agua-d)}
.tag-soon{background:#F5F5F5;color:var(--muted)}

/* ── COMPARISON TABLE ── */
.compare-wrap{width:100%;max-width:var(--page-max);animation:fadeUp .4s ease both;animation-delay:.2s}
.compare-toggle{display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:20px;cursor:pointer;font-size:14px;color:var(--muted);font-weight:500;background:none;border:none;font-family:'DM Sans',sans-serif}
.compare-toggle:hover{color:var(--agua-d)}
.compare-arrow{transition:transform .3s;font-size:12px}
.compare-arrow.open{transform:rotate(180deg)}
.compare-table-wrap{background:var(--white);border:1px solid var(--border);border-radius:18px;overflow:hidden}
.compare-table{width:100%;border-collapse:collapse}
.compare-table th{padding:14px 20px;text-align:left;font-size:12px;font-weight:700;color:var(--muted);letter-spacing:.5px;text-transform:uppercase;background:var(--mint);border-bottom:1px solid var(--border)}
.compare-table th.col-plan{background:rgba(90,173,165,.08);color:var(--agua-d)}
.compare-table td{padding:12px 20px;border-bottom:1px solid var(--border);font-size:13.5px;vertical-align:middle}
.compare-table tr:last-child td{border-bottom:none}
.compare-table tr:hover td{background:var(--mint)}
.compare-table .feat-col{color:var(--slate-m);font-weight:400}
.compare-table .val-col{text-align:center}
.check-yes{color:var(--agua-d);font-size:16px;font-weight:700}
.check-no{color:var(--muted);font-size:16px}
.val-text{font-size:12.5px;font-weight:500;color:var(--slate-m)}
.val-text.premium{color:var(--agua-d)}
.group-header td{background:var(--mint);font-size:11px;font-weight:700;color:var(--muted);letter-spacing:.5px;text-transform:uppercase;padding:10px 20px}

/* ── FAQ ── */
.faq-wrap{width:100%;max-width:min(760px,var(--page-max));animation:fadeUp .4s ease both;animation-delay:.3s}
.faq-title{font-family:'DM Serif Display',serif;font-size:26px;color:var(--slate);text-align:center;margin-bottom:24px;letter-spacing:-.3px}
.faq-item{background:var(--white);border:1px solid var(--border);border-radius:14px;margin-bottom:10px;overflow:hidden;transition:box-shadow .2s}
.faq-item.open{box-shadow:0 4px 20px rgba(90,173,165,.1);border-color:var(--agua-l)}
.faq-q{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;cursor:pointer;gap:12px;transition:background .15s}
.faq-q:hover{background:var(--mint)}
.faq-q-text{font-size:14px;font-weight:500;color:var(--slate)}
.faq-arrow{font-size:12px;color:var(--muted);transition:transform .25s;flex-shrink:0}
.faq-item.open .faq-arrow{transform:rotate(180deg);color:var(--agua-d)}
.faq-a{font-size:13.5px;color:var(--muted);line-height:1.7;padding:0 20px;font-weight:300;max-height:0;overflow:hidden;transition:max-height .3s ease,padding .3s ease}
.faq-item.open .faq-a{max-height:200px;padding:0 20px 18px}

/* ── TRUST STRIP ── */
.trust-strip{display:flex;align-items:center;justify-content:center;gap:clamp(18px,2.5vw,36px);flex-wrap:wrap;width:100%;max-width:var(--page-max);animation:fadeUp .4s ease both;animation-delay:.35s}
.trust-item{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--muted)}
.trust-ico{font-size:18px}

/* ── TOAST ── */
.toast{position:fixed;bottom:24px;right:24px;background:var(--slate);color:white;padding:13px 20px;border-radius:12px;font-size:13px;display:flex;align-items:center;gap:9px;box-shadow:0 6px 24px rgba(45,74,71,.25);animation:slideUp .3s ease;z-index:300}
@keyframes slideUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}

@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}

/* ── RESPONSIVE ── */
@media(min-width:1440px){
  :root{--page-max:1320px}
  .content{padding-top:56px;padding-bottom:64px}
  .plans-grid{grid-template-columns:repeat(2,minmax(420px,1fr))}
  .plan-header{padding:34px 34px 24px}
  .plan-header.featured{padding-top:42px}
  .plan-cta{margin-left:34px;margin-right:34px;width:calc(100% - 68px)}
  .plan-features{padding:24px 34px 34px}
}
@media(min-width:1800px){
  :root{--page-max:1480px}
  .content{gap:56px}
  .hero{max-width:860px}
}
@media(max-width:1100px){
  :root{--page-max:980px}
  .plans-grid{grid-template-columns:repeat(2,minmax(300px,1fr))}
}
@media(max-width:900px){
  .sidebar{transform:translateX(-100%)}
  .sidebar.open{transform:translateX(0)}
  .hamburger{display:flex}
  .main{margin-left:0}
  .header{padding:0 20px}
  .content{padding:28px 20px;gap:36px}
  .hero-title{font-size:36px}
}
@media(max-width:760px){
  .plans-grid{grid-template-columns:1fr;max-width:520px}
  .plan-card.featured{order:-1}
  .compare-wrap,.faq-wrap{max-width:520px}
}
@media(max-width:640px){
  .header{height:auto;min-height:60px;padding:12px 14px;align-items:flex-start}
  .hd-left{width:100%;align-items:flex-start}
  .hd-eye{font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:calc(100vw - 80px)}
  .hd-title{font-size:18px;line-height:1.2}
  .hero{max-width:100%}
  .hero-eyebrow{font-size:10.5px;padding:5px 10px;max-width:100%;justify-content:center;text-align:center}
  .plans-grid{max-width:420px;gap:18px}
  .plan-card.featured{order:-1}
  .hero-title{font-size:30px}
  .hero-sub{font-size:14px}
  .billing-toggle{width:100%;max-width:340px;display:grid;grid-template-columns:1fr 1fr;border-radius:14px}
  .bt-opt{justify-content:center;padding:9px 10px}
  .plan-card{border-radius:18px}
  .plan-header{padding:22px 20px 16px}
  .plan-header.featured{padding-top:32px}
  .plan-cta{margin:18px 20px 0;width:calc(100% - 40px);min-height:46px}
  .plan-trial{padding-left:20px;padding-right:20px;line-height:1.35}
  .plan-features{padding:18px 20px 22px}
  .price-amount{font-size:48px}
  .price-anual-note{line-height:1.35}
  .compare-table-wrap{overflow-x:auto}
  .compare-table{min-width:560px}
  .compare-table th,.compare-table td{padding:10px 12px;font-size:12.5px}
  .content{padding:20px 14px;gap:30px}
  .trust-strip{gap:16px}
  .toast{left:14px;right:14px;bottom:16px;width:auto;justify-content:center;text-align:center}
}
@media(max-width:380px){
  .billing-toggle{display:flex;flex-direction:column;border-radius:14px}
  .hero-title{font-size:27px}
  .plan-name{font-size:22px}
  .price-amount{font-size:46px}
  .popular-badge{font-size:10px;padding:5px 12px}
}
`;

const NAV_ITEMS = [
  { id:"dashboard",  label:"Dashboard",  icon:"◉" },
  { id:"gastos",     label:"Gastos",     icon:"💳" },
  { id:"metas",      label:"Metas",      icon:"🎯" },
  { id:"calendario", label:"Calendario", icon:"📅" },
  { id:"chatbot",    label:"Chatbot IA", icon:"🤖" },
  { id:"perfil",     label:"Mi Perfil",  icon:"👤" },
];

const FEATURES = [
  // [label, sub, free, premium, tag?]
  ["Registro de gastos e ingresos",    "Ilimitado en ambos planes",         true,  true,  null],
  ["Dashboard financiero",             "Métricas y gráficos esenciales",     true,  true,  null],
  ["Historial de transacciones",       "Últimos 3 meses",                    true,  false, null],
  ["Historial extendido",              "12+ meses de historial completo",    false, true,  "pro"],
  ["Metas de ahorro",                  "Hasta 2 metas activas",              true,  false, null],
  ["Metas ilimitadas",                 "Sin límite de metas simultáneas",    false, true,  null],
  ["Metas colaborativas",              "Ahorra en equipo con otros",         false, true,  "pro"],
  ["Calendario financiero",            "Pagos y recordatorios básicos",      true,  false, null],
  ["Calendario avanzado",              "Recurrencias, alarmas y vista semanal", false, true, null],
  ["Alertas de presupuesto",           "Avisos al 80% del límite",           true,  true,  null],
  ["Alertas personalizadas",           "Reglas y umbrales a tu medida",      false, true,  "pro"],
  ["Chatbot Fina con IA",              "10 consultas mensuales",             true,  false, null],
  ["Chatbot ilimitado",                "Consultas sin límite + análisis",    false, true,  "new"],
  ["Exportar datos (PDF / CSV)",       "Descarga tus reportes",              false, true,  null],
  ["Conversión de monedas",            "Tipo de cambio en tiempo real",      true,  true,  null],
  ["Soporte prioritario",              "Respuesta en menos de 24 horas",     false, true,  null],
];

const COMPARE_GROUPS = [
  {
    group: "Registro y seguimiento",
    rows: [0,1,2,3],
  },
  {
    group: "Metas de ahorro",
    rows: [4,5,6],
  },
  {
    group: "Calendario y alertas",
    rows: [7,8,9,10],
  },
  {
    group: "IA y exportación",
    rows: [11,12,13,14,15],
  },
];

const FAQS = [
  {
    q: "¿Puedo cambiar de plan en cualquier momento?",
    a: "Sí. Puedes actualizar a Premium o volver al plan gratuito cuando quieras. Si bajas de plan, mantendrás el acceso Premium hasta el final del período facturado.",
  },
  {
    q: "¿Hay un período de prueba gratuita del plan Premium?",
    a: "Sí, ofrecemos 14 días de prueba gratuita del plan Premium sin necesidad de tarjeta de crédito. Al finalizar, se te pedirá que elijas un plan.",
  },
  {
    q: "¿Cómo funciona el pago anual?",
    a: "El plan anual se cobra una sola vez por S/ 96 (equivalente a S/ 8/mes) en lugar de S/ 10/mes. Ahorras S/ 24 al año comparado con el pago mensual.",
  },
  {
    q: "¿Mis datos están seguros si cancelo?",
    a: "Absolutamente. Tienes 30 días para exportar toda tu información antes de que se elimine definitivamente. Nunca vendemos ni compartimos tus datos con terceros.",
  },
  {
    q: "¿Puedo usar FinVerde en varios dispositivos?",
    a: "Sí, tu cuenta funciona en web, móvil y tablet. El plan Premium permite hasta 3 sesiones activas simultáneas.",
  },
];

export default function PlanesPage({ onNavigate, onLogout, isGuest = false, user = null }) {
  const [billing, setBilling]       = useState("mensual"); // mensual | anual
  const [activeNav, setActiveNav]   = useState("perfil");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [openFaq, setOpenFaq]       = useState(null);
  const [toast, setToast]           = useState(null);
  const [currentPlan, setCurrentPlan] = useState("free"); // free | premium

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3500); };

  const precioMensual = 10;
  const precioAnual   = 8; // por mes
  const precio = billing === "anual" ? precioAnual : precioMensual;
  const displayName = user?.fullName || user?.email || (isGuest ? "Juan Pérez" : "Cuenta nueva");
  const avatar = user?.avatar || `${(user?.firstName?.[0] || displayName[0] || "C").toUpperCase()}${(user?.lastName?.[0] || "").toUpperCase()}`.slice(0, 2);

  const handleSelect = (plan) => {
    if (plan === "free") {
      setCurrentPlan("free");
      showToast("✓ Cambiado al plan Gratuito");
    } else {
      setCurrentPlan("premium");
      showToast("🎉 ¡Plan Premium activado! Disfruta de todas las funciones");
    }
  };

  const handleNavClick = (id) => {
    setActiveNav(id);
    setSidebarOpen(false);
    if (onNavigate) onNavigate(id);
  };

  return (
    <>
      <style>{S}</style>
      {toast && <div className="toast">{toast}</div>}
      <div className={`sb-overlay${sidebarOpen ? " show" : ""}`} onClick={() => setSidebarOpen(false)} />

      <div className="app planes-app">
        {/* SIDEBAR */}
        <aside className={`sidebar${sidebarOpen ? " open" : ""}`}>
          <div className="sb-brand">
            <div className="sb-ico">💎</div>
            <span className="sb-txt">FinVerde</span>
          </div>
          <nav className="sb-nav">
            {NAV_ITEMS.map(item => (
              <button key={item.id} className={`nav-item${activeNav === item.id ? " active" : ""}`}
                onClick={() => handleNavClick(item.id)}>
                <span style={{ fontSize:15, width:19, textAlign:"center", flexShrink:0 }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
            <SidebarCards onManage={() => handleNavClick("dashboard")} />
          </nav>
          <div className="sb-footer">
            <div className="user-chip">
              <div className="user-av">{avatar}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div className="user-nm">{displayName}</div>
                <div className="user-pl">{currentPlan === "premium" ? "⭐ Premium" : "Plan Gratuito"}</div>
              </div>
              {onLogout && <button className="logout-btn" title="Cerrar sesión" onClick={onLogout}>⏻</button>}
            </div>
          </div>
        </aside>

        <div className="main">
          {/* HEADER */}
          <header className="header">
            <div className="hd-left">
              <button className="hamburger" onClick={() => setSidebarOpen(v => !v)}>☰</button>
              <div>
                <div className="hd-eye">Cuenta · {displayName}</div>
                <div className="hd-title">Planes y Suscripción</div>
              </div>
            </div>
          </header>

          <div className="content">

            {/* ── HERO ── */}
            <div className="hero">
              <div className="hero-eyebrow">
                <div className="hero-eyebrow-dot" />
                Sin compromisos · Cancela cuando quieras
              </div>
              <h1 className="hero-title">
                El plan perfecto para<br /><em>tus finanzas</em>
              </h1>
              <p className="hero-sub">
                Comienza gratis y escala cuando lo necesites. Sin cobros ocultos, sin letras pequeñas.
              </p>
              {/* Billing toggle */}
              <div className="billing-toggle">
                <button className={`bt-opt${billing === "mensual" ? " on" : ""}`}
                  onClick={() => setBilling("mensual")}>
                  Mensual
                </button>
                <button className={`bt-opt${billing === "anual" ? " on" : ""}`}
                  onClick={() => setBilling("anual")}>
                  Anual
                  <span className="save-badge">-20%</span>
                </button>
              </div>
            </div>

            {/* ── PLANS GRID ── */}
            <div className="plans-grid">

              {/* ── FREE ── */}
              <div className="plan-card">
                <div className="plan-stripe" style={{ background: "var(--agua-l)" }} />
                <div className="plan-header">
                  <div className="plan-icon-wrap" style={{ background: "var(--mint)" }}>🌱</div>
                  <div className="plan-name">Gratuito</div>
                  <div className="plan-desc">Todo lo esencial para empezar a ordenar tus finanzas personales sin costo alguno.</div>
                  <div className="price-wrap">
                    <div className="price-amount free">S/ 0</div>
                    <div className="price-period" style={{ marginBottom:8 }}>&nbsp;/ siempre</div>
                  </div>
                </div>

                <button
                  className={`plan-cta cta-free`}
                  onClick={() => handleSelect("free")}
                  style={currentPlan === "free" ? { background:"var(--agua-p)", borderColor:"var(--agua)", color:"var(--agua-d)" } : {}}>
                  {currentPlan === "free" ? "✓ Plan actual" : "Comenzar gratis"}
                </button>
                <div className="plan-trial" style={{ paddingBottom:8 }}>
                  <span>Sin tarjeta de crédito</span>
                </div>

                <div className="plan-features">
                  <div className="features-label">Incluye</div>
                  {FEATURES.slice(0, 8).map((f, i) => (
                    <div className="feature-item" key={i}>
                      <div className={`feat-check${f[2] ? " yes" : " no"}`}>
                        {f[2] ? "✓" : "—"}
                      </div>
                      <div className="feat-info">
                        <div className={`feat-label${!f[2] ? " dimmed" : ""}`}>
                          {f[0]}
                          {f[4] && f[2] && <span className={`feat-tag tag-${f[4]}`}>{f[4] === "new" ? "Nuevo" : f[4] === "pro" ? "Pro" : "Próximo"}</span>}
                        </div>
                        {f[1] && <div className="feat-sub">{f[1]}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── PREMIUM ── */}
              <div className="plan-card featured">
                <div className="popular-badge">⭐ Más popular</div>
                <div className="plan-stripe" style={{ background: "linear-gradient(90deg, var(--agua-d), var(--agua))" }} />
                <div className="plan-header featured">
                  <div className="plan-icon-wrap" style={{ background: "linear-gradient(135deg,var(--agua-d),var(--agua))", boxShadow:"0 4px 14px rgba(90,173,165,.3)" }}>⭐</div>
                  <div className="plan-name">Premium</div>
                  <div className="plan-desc">Acceso completo a todas las funciones. Ideal para quienes toman en serio su salud financiera.</div>
                  <div className="price-wrap" style={{ alignItems:"flex-start", flexDirection:"column", gap:0 }}>
                    {billing === "anual" && (
                      <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                        <span className="price-original">S/ {precioMensual}</span>
                        <span style={{ fontSize:11, fontWeight:600, color:"var(--green)", background:"#E8F7F0", padding:"2px 7px", borderRadius:100 }}>-20%</span>
                      </div>
                    )}
                    <div style={{ display:"flex", alignItems:"flex-end", gap:4 }}>
                      <span className="price-currency">S/</span>
                      <span className="price-amount">{precio}</span>
                      <span className="price-period">&nbsp;/ mes</span>
                    </div>
                    {billing === "anual" && (
                      <div className="price-anual-note">
                        💡 Facturado como S/ {precio * 12} al año · ahorras S/ {(precioMensual - precio) * 12}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  className="plan-cta cta-premium"
                  onClick={() => handleSelect("premium")}
                  style={currentPlan === "premium" ? { background:"var(--slate)", boxShadow:"none" } : {}}>
                  {currentPlan === "premium" ? "✓ Plan actual" : billing === "anual" ? `Suscribirme · S/ ${precio * 12}/año` : `Suscribirme · S/ ${precio}/mes`}
                </button>
                <div className="plan-trial">
                  <span>🎁</span>
                  <span>14 días de prueba gratis · Sin tarjeta</span>
                </div>

                <div className="plan-features">
                  <div className="features-label">Todo del gratuito, más</div>
                  {FEATURES.map((f, i) => {
                    // show only premium-exclusive or all features briefly
                    if (i < 3) return null; // skip basic free ones
                    return (
                      <div className="feature-item" key={i}>
                        <div className={`feat-check${f[3] ? " yes prem" : " no"}`}>
                          {f[3] ? "✓" : "—"}
                        </div>
                        <div className="feat-info">
                          <div className={`feat-label${!f[3] ? " dimmed" : ""}`}>
                            {f[0]}
                            {f[4] && f[3] && <span className={`feat-tag tag-${f[4]}`}>{f[4] === "new" ? "Nuevo" : f[4] === "pro" ? "Pro" : "Próximo"}</span>}
                          </div>
                          {f[1] && <div className="feat-sub">{f[1]}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* ── COMPARISON TABLE ── */}
            <div className="compare-wrap">
              <button className="compare-toggle" onClick={() => setShowCompare(v => !v)}>
                <span>{showCompare ? "Ocultar" : "Ver"} comparación completa</span>
                <span className={`compare-arrow${showCompare ? " open" : ""}`}>▼</span>
              </button>

              {showCompare && (
                <div className="compare-table-wrap">
                  <table className="compare-table">
                    <thead>
                      <tr>
                        <th style={{ width:"55%" }}>Funcionalidad</th>
                        <th className="col-plan" style={{ textAlign:"center" }}>🌱 Gratuito</th>
                        <th className="col-plan" style={{ textAlign:"center" }}>⭐ Premium</th>
                      </tr>
                    </thead>
                    <tbody>
                      {COMPARE_GROUPS.map(({ group, rows }) => (
                        <>
                          <tr className="group-header" key={group}>
                            <td colSpan={3}>{group}</td>
                          </tr>
                          {rows.map(i => {
                            const f = FEATURES[i];
                            return (
                              <tr key={i}>
                                <td className="feat-col">
                                  {f[0]}
                                  {f[4] && <span className={`feat-tag tag-${f[4]}`}>{f[4] === "new" ? "Nuevo" : f[4] === "pro" ? "Pro" : "Próximo"}</span>}
                                </td>
                                <td className="val-col">
                                  {f[2] === true
                                    ? <span className="check-yes">✓</span>
                                    : f[2] === false
                                    ? <span className="check-no">—</span>
                                    : <span className="val-text">{f[2]}</span>
                                  }
                                </td>
                                <td className="val-col">
                                  {f[3] === true
                                    ? <span className="check-yes">✓</span>
                                    : f[3] === false
                                    ? <span className="check-no">—</span>
                                    : <span className="val-text premium">{f[3]}</span>
                                  }
                                </td>
                              </tr>
                            );
                          })}
                        </>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* ── TRUST STRIP ── */}
            <div className="trust-strip">
              {[
                ["🔒", "Datos cifrados"],
                ["🚫", "Sin anuncios"],
                ["💳", "Cancela cuando quieras"],
                ["🇵🇪", "Hecho para Perú"],
                ["⚡", "99.9% disponibilidad"],
              ].map(([ico, txt]) => (
                <div className="trust-item" key={txt}>
                  <span className="trust-ico">{ico}</span>
                  <span>{txt}</span>
                </div>
              ))}
            </div>

            {/* ── FAQ ── */}
            <div className="faq-wrap">
              <div className="faq-title">Preguntas frecuentes</div>
              {FAQS.map((faq, i) => (
                <div key={i} className={`faq-item${openFaq === i ? " open" : ""}`}>
                  <div className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    <span className="faq-q-text">{faq.q}</span>
                    <span className="faq-arrow">▼</span>
                  </div>
                  <div className="faq-a">{faq.a}</div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
