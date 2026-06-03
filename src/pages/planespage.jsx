import { useState } from "react";

const PLANES = [
  {
    id: "free",
    icon: "🌱",
    name: "Plan Gratuito",
    price: "S/ 0",
    period: "para siempre",
    description: "Para ordenar tus finanzas personales sin automatizaciones, ideal si recién empiezas a registrar tus hábitos.",
    features: [
      "Dashboard con saldo, ingresos, gastos y metas principales.",
      "Registro manual de movimientos para llevar control diario.",
      "Metas de ahorro con progreso visual y abonos manuales.",
      "Calendario de pagos para revisar vencimientos importantes.",
      "Vista de perfil y preferencias básicas de la cuenta.",
    ],
    cta: "Plan actual",
  },
  {
    id: "premium",
    icon: "⭐",
    name: "Plan Premium",
    price: "S/ 9.90",
    period: "al mes",
    description: "Para tener más automatización, alertas útiles y análisis financiero con menos esfuerzo manual.",
    features: [
      "Sincronización de tarjetas cuando la integración bancaria esté disponible.",
      "Alertas inteligentes de pagos próximos, exceso de presupuesto y gastos inusuales.",
      "Chatbot financiero con contexto de tus movimientos, metas y patrones de gasto.",
      "Reportes por categoría para identificar en qué se va tu dinero cada mes.",
      "Resumen mensual con recomendaciones prácticas para ahorrar mejor.",
      "Prioridad para nuevas funciones de automatización y análisis.",
    ],
    cta: "Elegir Premium",
    featured: true,
  },
];

const CSS = `
.planes-app{--agua:#7EC8C0;--agua-light:#A8DBD6;--agua-deep:#5AADA5;--mint:#EDF8F7;--white:#FAFFFE;--slate:#2D4A47;--muted:#8AADA9;--border:#DDE9E7;--gold:#C9A96E;min-height:100vh;min-height:100svh;width:100vw;max-width:none;background:var(--mint);color:var(--slate);font-family:'DM Sans',sans-serif;overflow-x:hidden}
.planes-app *{box-sizing:border-box}
.planes-main{width:100%;min-height:100vh;display:flex;flex-direction:column}
.planes-header{min-height:72px;background:var(--white);border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;gap:16px;padding:12px clamp(16px,3vw,40px);position:sticky;top:0;z-index:20}
.brand-row{display:flex;align-items:center;gap:12px;min-width:0}
.brand-mini{width:38px;height:38px;border-radius:11px;background:linear-gradient(135deg,var(--agua-deep),var(--agua));display:flex;align-items:center;justify-content:center;color:white;flex-shrink:0}
.hd-sub{font-size:13px;color:var(--muted)}
.hd-title{font-family:'DM Serif Display',serif;font-size:24px;line-height:1.05;color:var(--slate)}
.plan-badge{font-size:12px;font-weight:600;color:var(--agua-deep);background:var(--mint);border:1px solid var(--border);padding:7px 12px;border-radius:999px;white-space:nowrap;flex-shrink:0}
.planes-content{width:100%;padding:clamp(18px,2.8vw,40px);display:flex;flex-direction:column;gap:24px}
.intro-band{background:linear-gradient(135deg,var(--agua-deep),var(--agua));color:white;border-radius:16px;padding:clamp(20px,2.5vw,32px);display:flex;align-items:center;justify-content:space-between;gap:18px;min-width:0}
.intro-copy{min-width:0}
.intro-title{font-family:'DM Serif Display',serif;font-size:clamp(24px,3vw,34px);line-height:1.05}
.intro-text{margin-top:7px;color:rgba(255,255,255,.78);font-size:15px;line-height:1.5;max-width:820px}
.intro-pill{background:rgba(255,255,255,.18);padding:10px 14px;border-radius:12px;font-size:13px;font-weight:600;white-space:nowrap;flex-shrink:0}
.plans-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px;align-items:stretch;width:100%}
.plan-card{position:relative;background:var(--white);border:1px solid var(--border);border-radius:18px;padding:34px;display:flex;flex-direction:column;gap:24px;min-width:0;min-height:100%;box-shadow:0 6px 24px rgba(90,173,165,.1)}
.plan-card.featured{border-color:var(--agua);box-shadow:0 12px 34px rgba(90,173,165,.18)}
.popular{position:absolute;top:20px;right:20px;background:#FFF8EC;color:#9A7A35;border:1px solid #F0D9A0;border-radius:999px;padding:5px 11px;font-size:12px;font-weight:700}
.plan-top{display:flex;align-items:flex-start;gap:16px;min-width:0}
.plan-icon{width:54px;height:54px;border-radius:15px;background:var(--mint);display:flex;align-items:center;justify-content:center;font-size:26px;flex-shrink:0}
.plan-info{min-width:0}
.plan-name{font-family:'DM Serif Display',serif;font-size:28px;color:var(--slate);line-height:1.08}
.plan-desc{font-size:15px;line-height:1.5;color:var(--muted);margin-top:6px}
.plan-price{display:flex;align-items:flex-end;gap:6px;min-width:0}
.price{font-family:'DM Serif Display',serif;font-size:44px;line-height:1;color:var(--slate)}
.period{font-size:14px;color:var(--muted);padding-bottom:6px}
.features{display:flex;flex-direction:column;gap:13px;flex:1}
.feature{display:flex;align-items:flex-start;gap:10px;font-size:14.5px;color:var(--slate);line-height:1.45}
.check{color:var(--agua-deep);font-weight:800;flex-shrink:0}
.plan-btn{width:100%;min-height:48px;padding:13px 16px;border:none;border-radius:11px;background:var(--mint);color:var(--agua-deep);font-family:'DM Sans',sans-serif;font-size:15px;font-weight:700;cursor:pointer;transition:all .18s}
.plan-card.featured .plan-btn{background:linear-gradient(135deg,var(--agua-deep),var(--agua));color:white;box-shadow:0 5px 18px rgba(90,173,165,.3)}
.plan-btn:hover{transform:translateY(-1px)}
.planes-actions{display:flex;justify-content:center;padding:4px 0 10px}
.home-link{min-height:44px;border:1px solid var(--border);background:var(--white);color:var(--slate);border-radius:10px;padding:0 18px;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:700;cursor:pointer;box-shadow:0 4px 18px rgba(90,173,165,.08);transition:all .18s}
.home-link:hover{transform:translateY(-1px);border-color:var(--agua-light);color:var(--agua-deep)}
.toast{position:fixed;bottom:24px;right:24px;z-index:300;background:#2D4A47;color:white;padding:12px 16px;border-radius:12px;box-shadow:0 12px 30px rgba(45,74,71,.25);font-size:13px;max-width:min(340px,calc(100vw - 32px))}
@media(min-width:1500px){.plans-grid{gap:28px}.plan-card{padding:40px}.intro-band{padding:36px}}
@media(max-width:1100px){.plans-grid{grid-template-columns:1fr}.intro-band{align-items:flex-start;flex-direction:column}.intro-pill{white-space:normal}.plan-card{padding:30px}}
@media(max-width:700px){.planes-header{position:static;align-items:stretch;flex-direction:column;gap:12px}.plan-badge{text-align:center;white-space:normal}.planes-content{padding:16px;gap:18px}.intro-band{border-radius:14px;padding:20px}.plan-card{padding:22px;gap:20px}.plan-price{align-items:flex-start;flex-direction:column;gap:3px}.period{padding-bottom:0}.plan-btn{min-width:0}.home-link{width:100%}.toast{left:16px;right:16px;bottom:16px;max-width:none;text-align:center}}
@media(max-width:460px){.planes-content{padding:12px}.planes-header{padding:14px}.intro-band{padding:18px}.plan-card{padding:18px;gap:17px}.price{font-size:34px}.plan-name{font-size:24px}.plan-desc{font-size:13.5px}.feature{font-size:13px}.plan-top{gap:11px}.plan-icon{width:42px;height:42px;border-radius:12px;font-size:21px}.popular{position:static;align-self:flex-start;order:-1;width:max-content}.plan-card.featured{padding-top:18px}}
@media(max-width:360px){.intro-text,.plan-desc,.feature{font-size:12.5px}.plan-name{font-size:22px}.price{font-size:31px}.plan-btn{padding:11px 10px}}
`;

export default function PlanesPage({ onNavigate, isGuest = false }) {
  const [toast, setToast] = useState(null);

  const goHome = () => {
    if (onNavigate) onNavigate("mainpage");
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2600);
  };

  return (
    <div className="planes-app">
      <style>{CSS}</style>

      {toast && <div className="toast">{toast}</div>}

      <main className="planes-main">
        <header className="planes-header">
          <div className="brand-row">
            <div className="brand-mini">💎</div>
            <div>
              <div className="hd-sub">Suscripción y beneficios</div>
              <div className="hd-title">Planes de Savia</div>
            </div>
          </div>
          <div className="plan-badge">{isGuest ? "Plan actual: Premium" : "Plan actual: Gratuito"}</div>
        </header>

        <section className="planes-content">
          <div className="intro-band">
            <div className="intro-copy">
              <div className="intro-title">Elige cómo quieres manejar tu dinero</div>
              <div className="intro-text">Empieza gratis y activa herramientas premium cuando necesites automatizar pagos, alertas y análisis más detallados.</div>
            </div>
            <div className="intro-pill">Sin conexión a pasarela todavía</div>
          </div>

          <div className="plans-grid">
            {PLANES.map((plan) => (
              <article className={`plan-card${plan.featured ? " featured" : ""}`} key={plan.id}>
                {plan.featured && <div className="popular">Popular</div>}
                <div className="plan-top">
                  <div className="plan-icon">{plan.icon}</div>
                  <div className="plan-info">
                    <div className="plan-name">{plan.name}</div>
                    <div className="plan-desc">{plan.description}</div>
                  </div>
                </div>
                <div className="plan-price">
                  <span className="price">{plan.price}</span>
                  <span className="period">{plan.period}</span>
                </div>
                <div className="features">
                  {plan.features.map((feature) => (
                    <div className="feature" key={feature}>
                      <span className="check">✓</span>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <button className="plan-btn" onClick={() => plan.id === "free" ? goHome() : showToast("Gestión de planes próximamente")}>
                  {plan.cta}
                </button>
              </article>
            ))}
          </div>

          <div className="planes-actions">
            <button className="home-link" onClick={goHome}>Ir a página principal</button>
          </div>
        </section>
      </main>
    </div>
  );
}
