import { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import "./mainpage.css";

const GASTOS_MES = [
  { label: "Ene", gastos: 1820, ingresos: 3200 },
  { label: "Feb", gastos: 2100, ingresos: 3200 },
  { label: "Mar", gastos: 1650, ingresos: 3400 },
  { label: "Abr", gastos: 2400, ingresos: 3400 },
  { label: "May", gastos: 1980, ingresos: 3600 },
  { label: "Jun", gastos: 2250, ingresos: 3600 },
];

const PERIOD_DATA = {
  "Días": {
    label: "Últimos 7 días",
    shortLabel: "7 días",
    chartSub: "Comparativa diaria",
    budget: 700,
    data: [
      { label: "Lun", gastos: 98, ingresos: 0 },
      { label: "Mar", gastos: 135, ingresos: 250 },
      { label: "Mié", gastos: 82, ingresos: 0 },
      { label: "Jue", gastos: 190, ingresos: 0 },
      { label: "Vie", gastos: 156, ingresos: 0 },
      { label: "Sáb", gastos: 214, ingresos: 0 },
      { label: "Dom", gastos: 115, ingresos: 0 },
    ],
  },
  "Mes": {
    label: "Últimas 4 semanas",
    shortLabel: "4 semanas",
    chartSub: "Comparativa semanal",
    budget: 2500,
    data: [
      { label: "Sem 1", gastos: 510, ingresos: 900 },
      { label: "Sem 2", gastos: 620, ingresos: 900 },
      { label: "Sem 3", gastos: 475, ingresos: 900 },
      { label: "Sem 4", gastos: 645, ingresos: 900 },
    ],
  },
  "Año": {
    label: "Últimos 6 meses",
    shortLabel: "6 meses",
    chartSub: "Comparativa mensual",
    budget: 15000,
    data: GASTOS_MES,
  },
};

const CATEGORIAS = [
  { name: "Alimentación", value: 680, color: "#7EC8C0", icon: "🍔" },
  { name: "Transporte", value: 320, color: "#5AADA5", icon: "🚗" },
  { name: "Entretenimiento", value: 240, color: "#A8DBD6", icon: "🎬" },
  { name: "Salud", value: 180, color: "#C9A96E", icon: "💊" },
  { name: "Educación", value: 150, color: "#8AADA9", icon: "📚" },
  { name: "Otros", value: 130, color: "#DDE9E7", icon: "📦" },
];

const TRANSACCIONES = [
  { id: 1, desc: "Wong - Compras del mes", cat: "Alimentación", icon: "🛒", monto: -185.5, fecha: "Hoy, 10:32", tipo: "gasto" },
  { id: 2, desc: "Sueldo Mayo", cat: "Ingresos", icon: "💼", monto: 3600, fecha: "Hoy, 09:00", tipo: "ingreso" },
  { id: 3, desc: "Uber", cat: "Transporte", icon: "🚗", monto: -18.9, fecha: "Ayer, 19:15", tipo: "gasto" },
  { id: 4, desc: "Netflix", cat: "Entretenimiento", icon: "🎬", monto: -37.9, fecha: "Ayer, 00:00", tipo: "gasto" },
  { id: 5, desc: "Farmacia Inkafarma", cat: "Salud", icon: "💊", monto: -62, fecha: "23 May", tipo: "gasto" },
  { id: 6, desc: "Transferencia recibida", cat: "Ingresos", icon: "💸", monto: 250, fecha: "22 May", tipo: "ingreso" },
  { id: 7, desc: "Luz del Sur", cat: "Servicios", icon: "⚡", monto: -89, fecha: "21 May", tipo: "gasto" },
];

const METAS = [
  { id: 1, name: "Viaje a Europa", icon: "✈️", meta: 8000, actual: 3200, color: "#7EC8C0", fechaCreacion: "2025-01-12" },
  { id: 2, name: "Fondo emergencia", icon: "🛡️", meta: 5000, actual: 4100, color: "#5AADA5", fechaCreacion: "2025-02-03" },
  { id: 3, name: "Laptop nueva", icon: "💻", meta: 3500, actual: 870, color: "#C9A96E", fechaCreacion: "2025-04-18" },
];

const PAGOS_PROXIMOS = [
  { id: 1, desc: "Alquiler", monto: 1200, fecha: "01 Jun", dias: 7, icon: "🏠" },
  { id: 2, desc: "Internet", monto: 89, fecha: "05 Jun", dias: 11, icon: "📡" },
  { id: 3, desc: "Seguro auto", monto: 220, fecha: "10 Jun", dias: 16, icon: "🚘" },
];

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "◉" },
  { id: "gastos", label: "Gastos", icon: "💳" },
  { id: "metas", label: "Metas", icon: "🎯" },
  { id: "calendario", label: "Calendario", icon: "📅" },
  { id: "chatbot", label: "Chatbot IA", icon: "🤖" },
  { id: "perfil", label: "Mi Perfil", icon: "👤" },
];

const TIPO_CAMBIO = { USD: 3.74, EUR: 4.05, BTC: 0.000011 };

const getTodayLabel = () => {
  const today = new Date();
  return today.toLocaleDateString("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Buenos días";
  if (hour < 19) return "Buenas tardes";
  return "Buenas noches";
};

const getMonthlyVariation = (months, key, increaseIsGood = true) => {
  if (months.length < 2) {
    return { className: "neu", label: "0%" };
  }

  const current = Number(months[months.length - 1]?.[key] || 0);
  const previous = Number(months[months.length - 2]?.[key] || 0);

  if (!previous && !current) {
    return { className: "neu", label: "0%" };
  }

  if (!previous) {
    return { className: increaseIsGood ? "up" : "down", label: "Nuevo" };
  }

  const variation = ((current - previous) / previous) * 100;
  const isPositive = variation > 0;
  const isNeutral = Math.abs(variation) < 0.05;
  const isGood = isNeutral || (isPositive ? increaseIsGood : !increaseIsGood);

  return {
    className: isNeutral ? "neu" : isGood ? "up" : "down",
    label: `${isPositive ? "▲" : variation < 0 ? "▼" : ""} ${Math.abs(variation).toFixed(1)}%`,
  };
};

const isRecentGoal = (goal) => {
  if (!goal.fechaCreacion) return false;

  const createdAt = new Date(goal.fechaCreacion + "T12:00:00");
  const today = new Date();
  const diffDays = (today - createdAt) / (1000 * 60 * 60 * 24);

  return diffDays >= 0 && diffDays <= 7;
};

const getGoalsTrend = (goals) => {
  const recentGoals = goals.filter(isRecentGoal).length;

  if (recentGoals > 0) {
    return {
      className: "up",
      label: `${recentGoals} ${recentGoals === 1 ? "nueva" : "nuevas"}`,
    };
  }

  return {
    className: goals.length ? "neu" : "neu",
    label: `${goals.length} ${goals.length === 1 ? "meta" : "metas"}`,
  };
};

const sumPeriod = (data, key) => data.reduce((total, item) => total + Number(item[key] || 0), 0);

const scaleCategories = (categories, total) => {
  const baseTotal = categories.reduce((sum, category) => sum + category.value, 0);

  if (!baseTotal || !total) return categories.map((category) => ({ ...category, value: 0 }));

  return categories.map((category) => ({
    ...category,
    value: Math.round((category.value / baseTotal) * total),
  }));
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tip">
      <div className="custom-tip-label">{label}</div>
      <div className="custom-tip-row">
        {payload.map((p, i) => (
          <span key={i} style={{ color: p.color }}>
            {p.name}: S/ {p.value.toLocaleString()}
          </span>
        ))}
      </div>
    </div>
  );
};

export default function Dashboard({ onLogout, onNavigate, isGuest = false }) {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [periodo, setPeriodo] = useState("Mes");
  const [showAlert, setShowAlert] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activePeriod = PERIOD_DATA[periodo];
  const periodData = isGuest ? activePeriod.data : [];
  const ingresosMes = isGuest ? sumPeriod(periodData, "ingresos") : 0;
  const totalGastos = isGuest ? sumPeriod(periodData, "gastos") : 0;
  const categorias = isGuest ? scaleCategories(CATEGORIAS, totalGastos) : [];
  const transacciones = isGuest ? TRANSACCIONES : [];
  const metas = isGuest ? METAS : [];
  const pagosProximos = isGuest ? PAGOS_PROXIMOS : [];
  const presupuesto = isGuest ? activePeriod.budget : 0;
  const totalAhorrado = metas.reduce((a, m) => a + Math.min(m.actual, m.meta), 0);
  const pctUsado = presupuesto ? Math.round((totalGastos / presupuesto) * 100) : 0;
  const pctLibre = Math.max(0, Math.min(100, 100 - pctUsado));
  const saldo = ingresosMes - totalGastos;
  const ingresosTrend = getMonthlyVariation(periodData, "ingresos", true);
  const gastosTrend = getMonthlyVariation(periodData, "gastos", false);
  const metasTrend = getGoalsTrend(metas);
  const todayLabel = getTodayLabel();
  const greeting = getGreeting();
  const displayName = isGuest ? "Juan Pérez" : "Cuenta nueva";
  const firstName = isGuest ? "Juan" : "Cuenta";
  const avatar = isGuest ? "JP" : "CN";
  const planLabel = isGuest ? "⭐ Premium" : "Plan gratuito";

  const handleNavClick = (id) => {
    setActiveNav(id);
    setSidebarOpen(false);
    if (onNavigate) onNavigate(id);
  };

  return (
    <div className="app dashboard-app">
      <aside className={`sidebar${sidebarOpen ? " open" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-ico">💎</div>
          <span className="brand-txt">FinVerde</span>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`nav-item${activeNav === item.id ? " active" : ""}`}
              onClick={() => handleNavClick(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-chip">
            <div className="user-avatar">{avatar}</div>
            <div className="user-info">
              <div className="user-name">{displayName}</div>
              <div className="user-plan">{planLabel}</div>
            </div>
            <button className="logout-btn" title="Cerrar sesión" onClick={onLogout}>⏻</button>
          </div>
        </div>
      </aside>

      <div className="main">
        <header className="header">
          <div className="header-left">
            <span className="header-greeting">{todayLabel} - Lima, PE</span>
            <span className="header-title">{greeting}, {firstName}</span>
          </div>
          <div className="header-right">
            <div className="periodo-sel">
              {["Días", "Mes", "Año"].map((p) => (
                <button key={p} className={`per-btn${periodo === p ? " active" : ""}`} onClick={() => setPeriodo(p)}>
                  {p}
                </button>
              ))}
            </div>
            <button className="badge-btn" title="Notificaciones">
              🔔
              <div className="notif-dot" />
            </button>
            <button className="badge-btn" title="Ajustes">⚙️</button>
          </div>
        </header>

        <div className="content">
          {showAlert && isGuest && (
            <div className="alert-banner">
              <span className="alert-icon">⚠️</span>
              <div className="alert-body">
                <div className="alert-title">Cerca de tu límite mensual</div>
                <div className="alert-msg">
                  Has usado el {pctUsado}% de tu presupuesto. Te quedan S/ {Math.max(presupuesto - totalGastos, 0).toLocaleString()} disponibles.
                </div>
              </div>
              <button className="alert-close" onClick={() => setShowAlert(false)}>✕</button>
            </div>
          )}

          <div className="ticker">
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--agua-deep)", letterSpacing: ".5px", textTransform: "uppercase" }}>
              Tipo de Cambio
            </span>
            {Object.entries(TIPO_CAMBIO).map(([k, v], i) => (
              <span className="ticker-item" key={k}>
                {i > 0 && <span className="ticker-sep">·</span>}
                <span className="ticker-label">{k}/PEN</span>
                <span className="ticker-val">S/ {v.toFixed(k === "BTC" ? 6 : 2)}</span>
                <span className="ticker-up">▲ 0.{(i + 1) * 3}%</span>
              </span>
            ))}
          </div>

          <div className="kpi-grid">
            <div className="kpi-card highlight">
              <div className="kpi-top">
                <div className="kpi-icon">💰</div>
                <div className="kpi-trend neu">{activePeriod.shortLabel}</div>
              </div>
              <div>
                <div className="kpi-val">S/ {saldo.toLocaleString()}</div>
                <div className="kpi-label">Saldo disponible</div>
              </div>
              <div className="kpi-progress">
                <div className="kpi-prog-track">
                  <div className="kpi-prog-fill" style={{ width: `${pctLibre}%` }} />
                </div>
                <div className="kpi-prog-label">{pctLibre}% del presupuesto libre</div>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-top">
                <div className="kpi-icon">📈</div>
                <div className={`kpi-trend ${ingresosTrend.className}`}>{ingresosTrend.label}</div>
              </div>
              <div className="kpi-val" style={{ color: "#4CAF7D" }}>S/ {ingresosMes.toLocaleString()}</div>
              <div className="kpi-label">Ingresos del periodo</div>
            </div>

            <div className="kpi-card">
              <div className="kpi-top">
                <div className="kpi-icon">📉</div>
                <div className={`kpi-trend ${gastosTrend.className}`}>{gastosTrend.label}</div>
              </div>
              <div className="kpi-val" style={{ color: "var(--red)" }}>S/ {totalGastos.toLocaleString()}</div>
              <div className="kpi-label">Gastos del periodo</div>
            </div>

            <div className="kpi-card">
              <div className="kpi-top">
                <div className="kpi-icon">🎯</div>
                <div className={`kpi-trend ${metasTrend.className}`}>{metasTrend.label}</div>
              </div>
              <div className="kpi-val">S/ {totalAhorrado.toLocaleString()}</div>
              <div className="kpi-label">Total ahorrado</div>
            </div>
          </div>

          <div className="charts-row">
            <div className="card" style={{ animationDelay: "0.25s" }}>
              <div className="card-header">
                <div>
                  <div className="card-title">Ingresos vs Gastos</div>
                  <div className="card-sub">{activePeriod.chartSub}</div>
                </div>
                <div className="card-badge">{activePeriod.label}</div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={periodData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gIngresos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#5AADA5" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#5AADA5" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gGastos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E07070" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#E07070" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EEF5F4" />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#8AADA9" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#8AADA9" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="ingresos" name="Ingresos" stroke="#5AADA5" strokeWidth={2.5} fill="url(#gIngresos)" dot={false} activeDot={{ r: 5, fill: "#5AADA5" }} />
                  <Area type="monotone" dataKey="gastos" name="Gastos" stroke="#E07070" strokeWidth={2.5} fill="url(#gGastos)" dot={false} activeDot={{ r: 5, fill: "#E07070" }} />
                </AreaChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", gap: 20, marginTop: 12, justifyContent: "center" }}>
                {[["#5AADA5", "Ingresos"], ["#E07070", "Gastos"]].map(([c, l]) => (
                  <div key={l} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--muted)" }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: c }} />
                    {l}
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ animationDelay: "0.3s" }}>
              <div className="card-header">
                <div>
                  <div className="card-title">Por Categoría</div>
                  <div className="card-sub">Distribución de gastos</div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={categorias} cx="50%" cy="50%" innerRadius={42} outerRadius={65} paddingAngle={3} dataKey="value" strokeWidth={0}>
                    {categorias.map((c, i) => <Cell key={i} fill={c.color} />)}
                  </Pie>
                  <Tooltip formatter={(v) => [`S/ ${v}`, ""]} contentStyle={{ borderRadius: 10, fontSize: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.12)" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pie-legend">
                {categorias.map((c, i) => (
                  <div className="pie-legend-item" key={i}>
                    <div className="pie-legend-left">
                      <div className="pie-dot" style={{ background: c.color }} />
                      <span className="pie-name">{c.icon} {c.name}</span>
                    </div>
                    <span className="pie-val">S/ {c.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bottom-row">
            <div className="card" style={{ animationDelay: "0.35s" }}>
              <div className="card-header">
                <div>
                  <div className="card-title">Últimos movimientos</div>
                  <div className="card-sub">Actividad reciente</div>
                </div>
                <div className="card-badge">{activePeriod.label}</div>
              </div>
              <div className="tx-list">
                {transacciones.map((tx) => (
                  <div className="tx-item" key={tx.id}>
                    <div className="tx-ico">{tx.icon}</div>
                    <div className="tx-info">
                      <div className="tx-desc">{tx.desc}</div>
                      <div className="tx-meta">{tx.cat} · {tx.fecha}</div>
                    </div>
                    <div className={`tx-amount ${tx.tipo}`}>
                      {tx.monto > 0 ? "+" : ""}S/ {Math.abs(tx.monto).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              <button className="view-all" onClick={() => handleNavClick("gastos")}>Ver todos los movimientos →</button>
            </div>

            <div className="card" style={{ animationDelay: "0.4s" }}>
              <div className="card-header">
                <div>
                  <div className="card-title">Metas de Ahorro</div>
                  <div className="card-sub">Progreso actual</div>
                </div>
              </div>
              <div className="meta-list">
                {metas.map((m) => {
                  const pct = Math.round((m.actual / m.meta) * 100);
                  return (
                    <div className="meta-item" key={m.id}>
                      <div className="meta-top">
                        <div className="meta-left">
                          <span className="meta-ico">{m.icon}</span>
                          <span className="meta-name">{m.name}</span>
                        </div>
                        <span className="meta-pct" style={{ color: m.color }}>{pct}%</span>
                      </div>
                      <div className="meta-track">
                        <div className="meta-fill" style={{ width: `${pct}%`, background: m.color }} />
                      </div>
                      <div className="meta-vals">
                        <span>S/ {m.actual.toLocaleString()}</span>
                        <span>S/ {m.meta.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button className="add-meta-btn" onClick={() => handleNavClick("metas")}>+ Nueva meta de ahorro</button>
            </div>

            <div className="card" style={{ animationDelay: "0.45s" }}>
              <div className="card-header">
                <div>
                  <div className="card-title">Próximos Pagos</div>
                  <div className="card-sub">Vencimientos en junio</div>
                </div>
              </div>
              <div className="pagos-list">
                {pagosProximos.map((p) => (
                  <div className="pago-item" key={p.id}>
                    <div className="pago-ico">{p.icon}</div>
                    <div className="pago-info">
                      <div className="pago-desc">{p.desc}</div>
                      <div className="pago-fecha">{p.fecha}</div>
                    </div>
                    <div className="pago-right">
                      <div className="pago-monto">S/ {p.monto}</div>
                      <div className={`pago-dias ${p.dias <= 8 ? "urgent" : p.dias <= 12 ? "soon" : "ok"}`}>
                        en {p.dias}d
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 10 }}>Total comprometido junio</div>
                <ResponsiveContainer width="100%" height={80}>
                  <BarChart data={pagosProximos.map((p) => ({ name: p.desc, monto: p.monto }))} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#8AADA9" }} axisLine={false} tickLine={false} />
                    <Bar dataKey="monto" radius={[5, 5, 0, 0]}>
                      {pagosProximos.map((p, i) => (
                        <Cell key={i} fill={p.dias <= 8 ? "#E07070" : p.dias <= 12 ? "#C9A96E" : "#7EC8C0"} />
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
  );
}
