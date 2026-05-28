import { useState, useEffect, useRef } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import "./mainpage.css";

/* ─────────────────────────────────────────
   MOCK DATA
───────────────────────────────────────── */
const GASTOS_MES = [
  { mes: "Ene", gastos: 1820, ingresos: 3200 },
  { mes: "Feb", gastos: 2100, ingresos: 3200 },
  { mes: "Mar", gastos: 1650, ingresos: 3400 },
  { mes: "Abr", gastos: 2400, ingresos: 3400 },
  { mes: "May", gastos: 1980, ingresos: 3600 },
  { mes: "Jun", gastos: 2250, ingresos: 3600 },
];

const CATEGORIAS = [
  { name: "Alimentación", value: 680, color: "#7EC8C0", icon: "🍔" },
  { name: "Transporte",   value: 320, color: "#5AADA5", icon: "🚗" },
  { name: "Entretenimiento", value: 240, color: "#A8DBD6", icon: "🎬" },
  { name: "Salud",        value: 180, color: "#C9A96E", icon: "💊" },
  { name: "Educación",    value: 150, color: "#8AADA9", icon: "📚" },
  { name: "Otros",        value: 130, color: "#DDE9E7", icon: "📦" },
];

const TRANSACCIONES = [
  { id:1, desc:"Wong - Compras del mes",    cat:"Alimentación", icon:"🛒", monto:-185.50, fecha:"Hoy, 10:32",  tipo:"gasto" },
  { id:2, desc:"Sueldo Mayo",               cat:"Ingresos",     icon:"💼", monto:+3600,   fecha:"Hoy, 09:00",  tipo:"ingreso" },
  { id:3, desc:"Uber",                      cat:"Transporte",   icon:"🚗", monto:-18.90,  fecha:"Ayer, 19:15", tipo:"gasto" },
  { id:4, desc:"Netflix",                   cat:"Entretenimiento",icon:"🎬",monto:-37.90, fecha:"Ayer, 00:00", tipo:"gasto" },
  { id:5, desc:"Farmacia Inkafarma",        cat:"Salud",        icon:"💊", monto:-62.00,  fecha:"23 May",      tipo:"gasto" },
  { id:6, desc:"Transferencia recibida",    cat:"Ingresos",     icon:"💸", monto:+250,    fecha:"22 May",      tipo:"ingreso" },
  { id:7, desc:"Luz del Sur",              cat:"Servicios",    icon:"⚡", monto:-89.00,  fecha:"21 May",      tipo:"gasto" },
];

const METAS = [
  { id:1, name:"Viaje a Europa",  icon:"✈️",  meta:8000,  actual:3200, color:"#7EC8C0" },
  { id:2, name:"Fondo emergencia",icon:"🛡️",  meta:5000,  actual:4100, color:"#5AADA5" },
  { id:3, name:"Laptop nueva",    icon:"💻",  meta:3500,  actual:870,  color:"#C9A96E" },
];

const PAGOS_PROXIMOS = [
  { id:1, desc:"Alquiler",   monto:1200, fecha:"01 Jun", dias:7,  icon:"🏠" },
  { id:2, desc:"Internet",   monto:89,   fecha:"05 Jun", dias:11, icon:"📡" },
  { id:3, desc:"Seguro auto",monto:220,  fecha:"10 Jun", dias:16, icon:"🚘" },
];

const NAV_ITEMS = [
  { id:"dashboard",    label:"Dashboard",   icon:"◉" },
  { id:"gastos",       label:"Gastos",      icon:"💳" },
  { id:"metas",        label:"Metas",       icon:"🎯" },
  { id:"calendario",   label:"Calendario",  icon:"📅" },
  { id:"chatbot",      label:"Chatbot IA",  icon:"🤖" },
  { id:"perfil",       label:"Mi Perfil",   icon:"👤" },
];

const TIPO_CAMBIO = { USD: 3.74, EUR: 4.05, BTC: 0.000011 };



/* ── CUSTOM TOOLTIP ── */
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

/* ── MAIN COMPONENT ── */
export default function Dashboard({ onLogout, onNavigate }) {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [periodo, setPeriodo]     = useState("Mes");
  const [showAlert, setShowAlert] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const totalGastos  = CATEGORIAS.reduce((a, c) => a + c.value, 0);
  const presupuesto  = 2500;
  const pctUsado     = Math.round((totalGastos / presupuesto) * 100);
  const saldo        = 3600 - totalGastos;

  const handleNavClick = (id) => {
    setActiveNav(id);
    setSidebarOpen(false);
    if (onNavigate) onNavigate(id);
  };

  return (
    <>
      <div className="app dashboard-app">
        {/* ── SIDEBAR ── */}
        <aside className={`sidebar${sidebarOpen ? " open" : ""}`}>
          <div className="sidebar-brand">
            <div className="brand-ico">💎</div>
            <span className="brand-txt">FinVerde</span>
          </div>

          <nav className="sidebar-nav">
            {NAV_ITEMS.map(item => (
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
              <div className="user-avatar">JP</div>
              <div className="user-info">
                <div className="user-name">Juan Pérez</div>
                <div className="user-plan">⭐ Premium</div>
              </div>
              <button className="logout-btn" title="Cerrar sesión" onClick={onLogout}>⏻</button>
            </div>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <div className="main">
          {/* HEADER */}
          <header className="header">
            <div className="header-left">
              <span className="header-greeting">Domingo, 25 de mayo · Lima, PE</span>
              <span className="header-title">Buenos días, Juan 👋</span>
            </div>
            <div className="header-right">
              <div className="periodo-sel">
                {["Semana","Mes","Año"].map(p => (
                  <button key={p} className={`per-btn${periodo===p?" active":""}`} onClick={()=>setPeriodo(p)}>{p}</button>
                ))}
              </div>
              <button className="badge-btn" title="Notificaciones">
                🔔
                <div className="notif-dot" />
              </button>
              <button className="badge-btn" title="Ajustes">⚙️</button>
            </div>
          </header>

          {/* CONTENT */}
          <div className="content">

            {/* ALERTA */}
            {showAlert && (
              <div className="alert-banner">
                <span className="alert-icon">⚠️</span>
                <div className="alert-body">
                  <div className="alert-title">Cerca de tu límite mensual</div>
                  <div className="alert-msg">Has usado el {pctUsado}% de tu presupuesto. Te quedan S/ {(presupuesto - totalGastos).toLocaleString()} disponibles.</div>
                </div>
                <button className="alert-close" onClick={() => setShowAlert(false)}>✕</button>
              </div>
            )}

            {/* TICKER TIPO CAMBIO */}
            <div className="ticker">
              <span style={{fontSize:11,fontWeight:600,color:"var(--agua-deep)",letterSpacing:".5px",textTransform:"uppercase"}}>Tipo de Cambio</span>
              {Object.entries(TIPO_CAMBIO).map(([k, v], i) => (
                <span className="ticker-item" key={k}>
                  {i > 0 && <span className="ticker-sep">·</span>}
                  <span className="ticker-label">{k}/PEN</span>
                  <span className="ticker-val">S/ {v.toFixed(k==="BTC"?6:2)}</span>
                  <span className="ticker-up">▲ 0.{(i+1)*3}%</span>
                </span>
              ))}
            </div>

            {/* KPI CARDS */}
            <div className="kpi-grid">
              {/* Saldo */}
              <div className="kpi-card highlight">
                <div className="kpi-top">
                  <div className="kpi-icon">💰</div>
                  <div className="kpi-trend neu">Este mes</div>
                </div>
                <div>
                  <div className="kpi-val">S/ {saldo.toLocaleString()}</div>
                  <div className="kpi-label">Saldo disponible</div>
                </div>
                <div className="kpi-progress">
                  <div className="kpi-prog-track">
                    <div className="kpi-prog-fill" style={{ width: `${100 - pctUsado}%` }} />
                  </div>
                  <div className="kpi-prog-label">{100 - pctUsado}% del presupuesto libre</div>
                </div>
              </div>

              {/* Ingresos */}
              <div className="kpi-card">
                <div className="kpi-top">
                  <div className="kpi-icon">📈</div>
                  <div className="kpi-trend up">▲ 5.6%</div>
                </div>
                <div className="kpi-val" style={{color:"#4CAF7D"}}>S/ 3,600</div>
                <div className="kpi-label">Ingresos del mes</div>
              </div>

              {/* Gastos */}
              <div className="kpi-card">
                <div className="kpi-top">
                  <div className="kpi-icon">📉</div>
                  <div className="kpi-trend down">▲ 12.3%</div>
                </div>
                <div className="kpi-val" style={{color:"var(--red)"}}>S/ {totalGastos.toLocaleString()}</div>
                <div className="kpi-label">Gastos del mes</div>
              </div>

              {/* Ahorro */}
              <div className="kpi-card">
                <div className="kpi-top">
                  <div className="kpi-icon">🎯</div>
                  <div className="kpi-trend up">▲ 3 metas</div>
                </div>
                <div className="kpi-val">S/ 8,170</div>
                <div className="kpi-label">Total ahorrado</div>
              </div>
            </div>

            {/* CHARTS */}
            <div className="charts-row">
              {/* Área: ingresos vs gastos */}
              <div className="card" style={{animationDelay:"0.25s"}}>
                <div className="card-header">
                  <div>
                    <div className="card-title">Ingresos vs Gastos</div>
                    <div className="card-sub">Comparativa mensual 2025</div>
                  </div>
                  <div className="card-badge">6 meses</div>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={GASTOS_MES} margin={{top:4,right:4,left:-20,bottom:0}}>
                    <defs>
                      <linearGradient id="gIngresos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#5AADA5" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#5AADA5" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="gGastos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#E07070" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#E07070" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EEF5F4" />
                    <XAxis dataKey="mes" tick={{fontSize:12,fill:"#8AADA9"}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fontSize:11,fill:"#8AADA9"}} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="ingresos" name="Ingresos" stroke="#5AADA5" strokeWidth={2.5} fill="url(#gIngresos)" dot={false} activeDot={{r:5,fill:"#5AADA5"}} />
                    <Area type="monotone" dataKey="gastos"   name="Gastos"   stroke="#E07070" strokeWidth={2.5} fill="url(#gGastos)"   dot={false} activeDot={{r:5,fill:"#E07070"}} />
                  </AreaChart>
                </ResponsiveContainer>
                <div style={{display:"flex",gap:20,marginTop:12,justifyContent:"center"}}>
                  {[["#5AADA5","Ingresos"],["#E07070","Gastos"]].map(([c,l])=>(
                    <div key={l} style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:"var(--muted)"}}>
                      <div style={{width:10,height:10,borderRadius:2,background:c}}/>
                      {l}
                    </div>
                  ))}
                </div>
              </div>

              {/* Pie: categorías */}
              <div className="card" style={{animationDelay:"0.3s"}}>
                <div className="card-header">
                  <div>
                    <div className="card-title">Por Categoría</div>
                    <div className="card-sub">Distribución de gastos</div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie data={CATEGORIAS} cx="50%" cy="50%" innerRadius={42} outerRadius={65}
                         paddingAngle={3} dataKey="value" strokeWidth={0}>
                      {CATEGORIAS.map((c, i) => <Cell key={i} fill={c.color} />)}
                    </Pie>
                    <Tooltip formatter={(v) => [`S/ ${v}`, ""]} contentStyle={{borderRadius:10,fontSize:12,border:"none",boxShadow:"0 4px 20px rgba(0,0,0,0.12)"}} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pie-legend">
                  {CATEGORIAS.map((c, i) => (
                    <div className="pie-legend-item" key={i}>
                      <div className="pie-legend-left">
                        <div className="pie-dot" style={{background:c.color}} />
                        <span className="pie-name">{c.icon} {c.name}</span>
                      </div>
                      <span className="pie-val">S/ {c.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* BOTTOM ROW */}
            <div className="bottom-row">
              {/* Transacciones */}
              <div className="card" style={{animationDelay:"0.35s"}}>
                <div className="card-header">
                  <div>
                    <div className="card-title">Últimos movimientos</div>
                    <div className="card-sub">Actividad reciente</div>
                  </div>
                  <div className="card-badge">Esta semana</div>
                </div>
                <div className="tx-list">
                  {TRANSACCIONES.map(tx => (
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
                <button className="view-all">Ver todos los movimientos →</button>
              </div>

              {/* Metas */}
              <div className="card" style={{animationDelay:"0.4s"}}>
                <div className="card-header">
                  <div>
                    <div className="card-title">Metas de Ahorro</div>
                    <div className="card-sub">Progreso actual</div>
                  </div>
                </div>
                <div className="meta-list">
                  {METAS.map(m => {
                    const pct = Math.round((m.actual / m.meta) * 100);
                    return (
                      <div className="meta-item" key={m.id}>
                        <div className="meta-top">
                          <div className="meta-left">
                            <span className="meta-ico">{m.icon}</span>
                            <span className="meta-name">{m.name}</span>
                          </div>
                          <span className="meta-pct" style={{color:m.color}}>{pct}%</span>
                        </div>
                        <div className="meta-track">
                          <div className="meta-fill" style={{width:`${pct}%`,background:m.color}} />
                        </div>
                        <div className="meta-vals">
                          <span>S/ {m.actual.toLocaleString()}</span>
                          <span>S/ {m.meta.toLocaleString()}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <button className="add-meta-btn">+ Nueva meta de ahorro</button>
              </div>

              {/* Pagos próximos */}
              <div className="card" style={{animationDelay:"0.45s"}}>
                <div className="card-header">
                  <div>
                    <div className="card-title">Próximos Pagos</div>
                    <div className="card-sub">Vencimientos en junio</div>
                  </div>
                </div>
                <div className="pagos-list">
                  {PAGOS_PROXIMOS.map(p => (
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

                {/* Mini bar chart */}
                <div style={{marginTop:20}}>
                  <div style={{fontSize:12,color:"var(--muted)",marginBottom:10}}>Total comprometido junio</div>
                  <ResponsiveContainer width="100%" height={80}>
                    <BarChart data={PAGOS_PROXIMOS.map(p=>({name:p.desc,monto:p.monto}))} margin={{top:0,right:0,left:-28,bottom:0}}>
                      <XAxis dataKey="name" tick={{fontSize:10,fill:"#8AADA9"}} axisLine={false} tickLine={false} />
                      <Bar dataKey="monto" radius={[5,5,0,0]}>
                        {PAGOS_PROXIMOS.map((p, i) => (
                          <Cell key={i} fill={p.dias<=8?"#E07070":p.dias<=12?"#C9A96E":"#7EC8C0"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

          </div>{/* /content */}
        </div>{/* /main */}
      </div>
    </>
  );
}
