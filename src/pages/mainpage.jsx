import { useEffect, useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import AppShell from "../components/AppShell";
import { loadStoredCards, readStoredCards, writeStoredCards } from "../utils/cardsStorage";
import { loadStoredExpenses, EXPENSE_CATEGORIES } from "../utils/expensesStorage";
import { loadStoredGoals } from "../utils/goalsStorage";
import { apiRequest } from "../utils/apiClient";
import { useI18n } from "../i18n/index.jsx";
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

const TIPO_CAMBIO = { USD: 3.74, EUR: 4.05, BTC: 0.000011 };

const CARD_FORM_DEF = {
  titular: "",
  numero: "",
  vencimiento: "",
  alias: "",
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

const onlyDigits = (value) => value.replace(/\D/g, "");

const formatCardInput = (value) => {
  const digits = onlyDigits(value).slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
};

const formatExpiryInput = (value) => {
  const digits = onlyDigits(value).slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
};

const maskCardNumber = (value) => {
  const digits = onlyDigits(value);
  return digits ? `**** **** **** ${digits.slice(-4)}` : "**** **** **** ----";
};

const getCardLastDigits = (value) => {
  const digits = onlyDigits(value);
  return digits.slice(-4);
};

const getCardBrand = (value) => {
  const digits = onlyDigits(value);
  const firstTwo = Number(digits.slice(0, 2));
  const firstFour = Number(digits.slice(0, 4));

  if (!digits) return { name: "Tarjeta", icon: "💳", className: "generic" };
  if (digits.startsWith("4")) return { name: "Visa", icon: "V", className: "visa" };
  if ((firstTwo >= 51 && firstTwo <= 55) || (firstFour >= 2221 && firstFour <= 2720)) {
    return { name: "Mastercard", icon: "MC", className: "mastercard" };
  }
  if (digits.startsWith("34") || digits.startsWith("37")) return { name: "American Express", icon: "AX", className: "amex" };
  if (digits.startsWith("36") || digits.startsWith("38") || digits.startsWith("39")) return { name: "Diners Club", icon: "DC", className: "diners" };
  if (digits.startsWith("6011") || digits.startsWith("65")) return { name: "Discover", icon: "DS", className: "discover" };

  return { name: "Tarjeta bancaria", icon: "💳", className: "generic" };
};

const scaleCategories = (categories, total) => {
  const baseTotal = categories.reduce((sum, category) => sum + category.value, 0);

  if (!baseTotal || !total) return categories.map((category) => ({ ...category, value: 0 }));

  return categories.map((category) => ({
    ...category,
    value: Math.round((category.value / baseTotal) * total),
  }));
};

/* ── Datos reales: agregaciones desde la API ── */

const toISODate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);

const monthlyIncomeFromEvents = (events) =>
  events.filter((event) => event.tipo === "ingreso").reduce((total, event) => total + Math.abs(event.monto), 0);

const buildRealPeriodData = (expenses, events) => {
  const today = new Date();
  const incomePerMonth = monthlyIncomeFromEvents(events);

  const daily = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const iso = toISODate(date);
    const gastos = expenses.filter((item) => item.fecha === iso).reduce((total, item) => total + item.monto, 0);
    const ingresos = events
      .filter((event) => event.tipo === "ingreso" && event.dia === date.getDate())
      .reduce((total, event) => total + Math.abs(event.monto), 0);
    daily.push({ label: capitalize(date.toLocaleDateString("es-PE", { weekday: "short" })), gastos, ingresos });
  }

  const weekly = [];
  for (let week = 3; week >= 0; week--) {
    const end = new Date(today);
    end.setDate(today.getDate() - week * 7);
    const start = new Date(end);
    start.setDate(end.getDate() - 6);
    const startISO = toISODate(start);
    const endISO = toISODate(end);
    const gastos = expenses
      .filter((item) => item.fecha >= startISO && item.fecha <= endISO)
      .reduce((total, item) => total + item.monto, 0);
    const ingresos = events
      .filter((event) => event.tipo === "ingreso" && (
        (start.getDate() <= end.getDate())
          ? event.dia >= start.getDate() && event.dia <= end.getDate()
          : event.dia >= start.getDate() || event.dia <= end.getDate()
      ))
      .reduce((total, event) => total + Math.abs(event.monto), 0);
    weekly.push({ label: `Sem ${4 - week}`, gastos, ingresos });
  }

  const monthly = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const gastos = expenses
      .filter((item) => String(item.fecha).slice(0, 7) === key)
      .reduce((total, item) => total + item.monto, 0);
    monthly.push({
      label: capitalize(date.toLocaleDateString("es-PE", { month: "short" })),
      gastos,
      ingresos: incomePerMonth,
    });
  }

  return { daily, weekly, monthly };
};

const buildRealCategories = (expenses, periodFilter) => {
  const filtered = periodFilter ? expenses.filter(periodFilter) : expenses;
  return EXPENSE_CATEGORIES
    .map((category) => ({
      name: category.name,
      icon: category.icon,
      color: category.color,
      value: Math.round(filtered
        .filter((item) => item.cat === category.id)
        .reduce((total, item) => total + item.monto, 0)),
    }))
    .filter((category) => category.value > 0);
};

const buildRealTransactions = (expenses) =>
  [...expenses]
    .sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)))
    .slice(0, 7)
    .map((item) => {
      const category = EXPENSE_CATEGORIES.find((cat) => cat.id === item.cat);
      return {
        id: item.id,
        desc: item.desc,
        cat: category?.name || "Otros",
        icon: category?.icon || "📦",
        monto: -item.monto,
        fecha: new Date(`${item.fecha}T12:00:00`).toLocaleDateString("es-PE", { day: "numeric", month: "short" }),
        tipo: "gasto",
      };
    });

const buildRealUpcomingPayments = (events) => {
  const today = new Date();
  const currentDay = today.getDate();
  return events
    .filter((event) => event.tipo === "pago")
    .map((event) => {
      const nextDate = event.dia >= currentDay
        ? new Date(today.getFullYear(), today.getMonth(), event.dia)
        : new Date(today.getFullYear(), today.getMonth() + 1, event.dia);
      const dias = Math.max(0, Math.round((nextDate - today) / (1000 * 60 * 60 * 24)));
      return {
        id: event.id,
        desc: event.desc,
        monto: Math.abs(event.monto),
        fecha: capitalize(nextDate.toLocaleDateString("es-PE", { day: "2-digit", month: "short" })),
        dias,
        icon: event.icono || "💳",
      };
    })
    .sort((a, b) => a.dias - b.dias)
    .slice(0, 5);
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

export default function Dashboard({ onLogout, onNavigate, isGuest = false, user = null }) {
  const { t, locale } = useI18n();
  const [periodo, setPeriodo] = useState("Mes");
  const [showAlert, setShowAlert] = useState(true);
  const [cards, setCards] = useState(readStoredCards);
  const [cardModalStep, setCardModalStep] = useState(null);
  const [cardForm, setCardForm] = useState(CARD_FORM_DEF);
  const [cardErrors, setCardErrors] = useState({});
  const [pendingCard, setPendingCard] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [goals, setGoals] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (isGuest) return;
    let alive = true;
    void loadStoredExpenses([]).then((data) => alive && setExpenses(Array.isArray(data) ? data : []));
    void loadStoredGoals([]).then((data) => alive && setGoals(Array.isArray(data) ? data : []));
    void apiRequest("/events").then((data) => alive && setEvents(Array.isArray(data) ? data : [])).catch(() => null);
    return () => { alive = false; };
  }, [isGuest]);

  const activePeriod = PERIOD_DATA[periodo];
  const periodLabel = t(periodo === "Días" ? "period.last7" : periodo === "Mes" ? "period.last4w" : "period.last6m");
  const periodCompareLabel = t(periodo === "Días" ? "period.dailyCompare" : periodo === "Mes" ? "period.weeklyCompare" : "period.monthlyCompare");
  const realPeriods = buildRealPeriodData(expenses, events);
  const realPeriodData = periodo === "Días" ? realPeriods.daily : periodo === "Mes" ? realPeriods.weekly : realPeriods.monthly;
  const periodData = isGuest ? activePeriod.data : realPeriodData;
  const ingresosMes = sumPeriod(periodData, "ingresos");
  const totalGastos = sumPeriod(periodData, "gastos");
  const monthlyBudget = Number(user?.monthlyBudget || 0);
  const realBudget = periodo === "Días" ? (monthlyBudget / 30) * 7 : periodo === "Mes" ? monthlyBudget : monthlyBudget * 6;

  const todayRef = new Date();
  const periodStart = new Date(todayRef);
  if (periodo === "Días") periodStart.setDate(todayRef.getDate() - 6);
  else if (periodo === "Mes") periodStart.setDate(todayRef.getDate() - 27);
  else periodStart.setMonth(todayRef.getMonth() - 5, 1);
  const periodStartISO = toISODate(periodStart);

  const categorias = isGuest
    ? scaleCategories(CATEGORIAS, totalGastos)
    : buildRealCategories(expenses, (item) => item.fecha >= periodStartISO);
  const transacciones = isGuest ? TRANSACCIONES : buildRealTransactions(expenses);
  const metas = isGuest
    ? METAS
    : goals.map((goal) => ({ id: goal.id, name: goal.nombre, icon: goal.icon, meta: goal.meta, actual: goal.actual, color: goal.color, fechaCreacion: goal.fechaCreacion || null }));
  const pagosProximos = isGuest ? PAGOS_PROXIMOS : buildRealUpcomingPayments(events);
  const presupuesto = isGuest ? activePeriod.budget : Math.round(realBudget);
  const totalAhorrado = metas.reduce((a, m) => a + Math.min(m.actual, m.meta), 0);
  const pctUsado = presupuesto ? Math.round((totalGastos / presupuesto) * 100) : 0;
  const pctLibre = Math.max(0, Math.min(100, 100 - pctUsado));
  const saldo = ingresosMes - totalGastos;
  const ingresosTrend = getMonthlyVariation(periodData, "ingresos", true);
  const gastosTrend = getMonthlyVariation(periodData, "gastos", false);
  const metasTrend = getGoalsTrend(metas);
  const todayLabel = new Date().toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long" });
  const hour = new Date().getHours();
  const greeting = t(hour < 12 ? "greeting.morning" : hour < 19 ? "greeting.afternoon" : "greeting.evening");
  const displayName = user?.fullName || user?.email || (isGuest ? "Juan Pérez" : t("common.newAccount"));
  const firstName = user?.firstName || displayName.split(" ")[0] || "";
  const currentCardBrand = getCardBrand(cardForm.numero);
  const currentMonthName = new Date().toLocaleDateString(locale, { month: "long" });

  useEffect(() => {
    void loadStoredCards().then(setCards);
  }, []);

  const handleNavClick = (id) => {
    if (onNavigate) onNavigate(id);
  };

  const openCardsModal = () => {
    setCardErrors({});
    setCardForm(CARD_FORM_DEF);
    setPendingCard(null);
    setCardModalStep("list");
  };

  const closeCardsModal = () => {
    setCardModalStep(null);
    setCardErrors({});
    setPendingCard(null);
  };

  const startAddCard = () => {
    setCardForm(CARD_FORM_DEF);
    setCardErrors({});
    setCardModalStep("form");
  };

  const handleCardField = (field, value) => {
    const nextValue =
      field === "numero" ? formatCardInput(value) :
      field === "vencimiento" ? formatExpiryInput(value) :
      value;

    setCardForm((prev) => ({ ...prev, [field]: nextValue }));
    setCardErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const verifyCard = async (event) => {
    event.preventDefault();
    const digits = onlyDigits(cardForm.numero);
    const errors = {};
    const detectedBrand = getCardBrand(cardForm.numero);

    if (!cardForm.titular.trim()) errors.titular = "Escribe el titular de la tarjeta.";
    if (digits.length < 13) errors.numero = "El número debe tener al menos 13 dígitos.";
    if (!/^\d{2}\/\d{2}$/.test(cardForm.vencimiento)) errors.vencimiento = "Usa el formato MM/AA.";
    if (!cardForm.alias.trim()) errors.alias = "Agrega un alias para reconocerla.";

    if (Object.keys(errors).length) {
      setCardErrors(errors);
      return;
    }

    const verifiedCard = {
      id: Date.now(),
      alias: cardForm.alias.trim(),
      titular: cardForm.titular.trim(),
      numero: maskCardNumber(cardForm.numero),
      ultimos: getCardLastDigits(cardForm.numero),
      marca: detectedBrand.name,
      marcaClass: detectedBrand.className,
      marcaIcon: detectedBrand.icon,
      vencimiento: cardForm.vencimiento,
      estado: "Verificada",
    };

    let nextCards = [];
    setCards((prev) => {
      nextCards = [verifiedCard, ...prev];
      return nextCards;
    });
    await writeStoredCards(nextCards);
    setPendingCard(verifiedCard);
    setCardModalStep("sync");
  };

  const cancelSync = () => {
    setCardModalStep("list");
    setPendingCard(null);
  };

  const acceptSync = () => {
    setCardModalStep("soon");
  };

  return (
    <AppShell
      active="dashboard"
      onNavigate={handleNavClick}
      onLogout={onLogout}
      user={user}
      isGuest={isGuest}
      fullBleed
      onManageCards={openCardsModal}
      headerLeft={(
        <div className="header-left">
          <span className="header-greeting">{todayLabel} · Lima, PE</span>
          <span className="header-title">{greeting}{firstName ? `, ${firstName}` : ""}</span>
        </div>
      )}
      headerRight={(
        <div className="periodo-sel">
          {["Días", "Mes", "Año"].map((p) => (
            <button key={p} className={`per-btn${periodo === p ? " active" : ""}`} onClick={() => setPeriodo(p)}>
              {t(p === "Días" ? "dash.days" : p === "Mes" ? "dash.month" : "dash.year")}
            </button>
          ))}
        </div>
      )}
    >
      {cardModalStep && (
        <div className="card-modal-overlay" onClick={e => e.target === e.currentTarget && closeCardsModal()}>
          <div className="card-modal">
            <div className="card-modal-hd">
              <div>
                <h2 className="card-modal-title">
                  {cardModalStep === "form" ? "Agregar tarjeta" : cardModalStep === "sync" ? "Sincronizar pagos" : cardModalStep === "soon" ? "Próximamente" : "Mis tarjetas"}
                </h2>
                <p className="card-modal-sub">
                  {cardModalStep === "list" ? "Tarjetas disponibles para registrar pagos." : cardModalStep === "form" ? "Completa los datos para verificarla localmente." : "Tu tarjeta ya quedó agregada."}
                </p>
              </div>
              <button className="card-modal-close" onClick={closeCardsModal}>✕</button>
            </div>

            {cardModalStep === "list" && (
              <>
                <div className="cards-wallet">
                  {cards.length === 0 ? (
                    <div className="cards-empty">
                      <div className="cards-empty-ico">💳</div>
                      <div className="cards-empty-title">Aún no tienes tarjetas</div>
                      <div className="cards-empty-text">Agrega una tarjeta para que luego pueda asociarse a tus pagos registrados.</div>
                    </div>
                  ) : (
                    cards.map((card) => (
                      <div className="saved-card" key={card.id}>
                        <div>
                          <div className="saved-card-bank">{card.marca}</div>
                          <div className="saved-card-number">{card.numero}</div>
                          <div className="saved-card-owner">{card.alias} · {card.titular}</div>
                        </div>
                        <div className="saved-card-state">{card.estado}</div>
                      </div>
                    ))
                  )}
                </div>
                <div className="card-modal-foot">
                  <button className="btn-save-card" onClick={startAddCard}>+ Agregar tarjeta</button>
                  <button className="btn-cancel-card" onClick={closeCardsModal}>Cerrar</button>
                </div>
              </>
            )}

            {cardModalStep === "form" && (
              <form onSubmit={verifyCard}>
                <div className="card-form-grid">
                  <label className="card-field full">
                    <span>Titular</span>
                    <input value={cardForm.titular} onChange={(e) => handleCardField("titular", e.target.value)} placeholder="Nombre como figura en la tarjeta" />
                    {cardErrors.titular && <small>{cardErrors.titular}</small>}
                  </label>
                  <label className="card-field full">
                    <span>Número de tarjeta</span>
                    <input inputMode="numeric" value={cardForm.numero} onChange={(e) => handleCardField("numero", e.target.value)} placeholder="0000 0000 0000 0000" />
                    <div className={`card-brand-hint ${currentCardBrand.className}`}>
                      <span className="card-brand-mark">{currentCardBrand.icon}</span>
                      <span>{onlyDigits(cardForm.numero) ? `Reconocida como ${currentCardBrand.name}` : "Se reconocerá al escribir el número"}</span>
                    </div>
                    {cardErrors.numero && <small>{cardErrors.numero}</small>}
                  </label>
                  <label className="card-field">
                    <span>Vencimiento</span>
                    <input inputMode="numeric" value={cardForm.vencimiento} onChange={(e) => handleCardField("vencimiento", e.target.value)} placeholder="MM/AA" />
                    {cardErrors.vencimiento && <small>{cardErrors.vencimiento}</small>}
                  </label>
                  <label className="card-field full">
                    <span>Alias</span>
                    <input value={cardForm.alias} onChange={(e) => handleCardField("alias", e.target.value)} placeholder="Ej: Tarjeta principal" />
                    {cardErrors.alias && <small>{cardErrors.alias}</small>}
                  </label>
                </div>
                <div className="card-modal-foot">
                  <button type="submit" className="btn-save-card">Verificar tarjeta</button>
                  <button type="button" className="btn-cancel-card" onClick={() => setCardModalStep("list")}>Cancelar</button>
                </div>
              </form>
            )}

            {cardModalStep === "sync" && pendingCard && (
              <>
                <div className="sync-box">
                  <div className="sync-ico">✓</div>
                  <div className="sync-title">{pendingCard.alias} fue agregada</div>
                  <div className="sync-text">¿Deseas sincronizar pagos de esta tarjeta cuando la integración esté disponible?</div>
                </div>
                <div className="card-modal-foot">
                  <button className="btn-save-card" onClick={acceptSync}>Aceptar</button>
                  <button className="btn-cancel-card" onClick={cancelSync}>Cancelar</button>
                </div>
              </>
            )}

            {cardModalStep === "soon" && (
              <>
                <div className="sync-box">
                  <div className="sync-ico soon">⏳</div>
                  <div className="sync-title">Próximamente</div>
                  <div className="sync-text">La sincronización automática de pagos se activará cuando estén listas las APIs.</div>
                </div>
                <div className="card-modal-foot">
                  <button className="btn-save-card" onClick={cancelSync}>Ver tarjetas</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

        <div className="content">
          {showAlert && presupuesto > 0 && pctUsado >= 80 && (
            <div className="alert-banner">
              <span className="alert-icon">⚠️</span>
              <div className="alert-body">
                <div className="alert-title">{t("dash.alertTitle")}</div>
                <div className="alert-msg">
                  {t("dash.alertMsg", { pct: pctUsado, left: Math.max(presupuesto - totalGastos, 0).toLocaleString() })}
                </div>
              </div>
              <button className="alert-close" onClick={() => setShowAlert(false)}>✕</button>
            </div>
          )}

          <div className="ticker">
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--agua-deep)", letterSpacing: ".5px", textTransform: "uppercase" }}>
              {t("dash.exchangeRate")}
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
                <div className="kpi-label">{t("dash.balance")}</div>
              </div>
              <div className="kpi-progress">
                <div className="kpi-prog-track">
                  <div className="kpi-prog-fill" style={{ width: `${pctLibre}%` }} />
                </div>
                <div className="kpi-prog-label">{pctLibre}{t("dash.budgetFree")}</div>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-top">
                <div className="kpi-icon">📈</div>
                <div className={`kpi-trend ${ingresosTrend.className}`}>{ingresosTrend.label}</div>
              </div>
              <div className="kpi-val" style={{ color: "#4CAF7D" }}>S/ {ingresosMes.toLocaleString()}</div>
              <div className="kpi-label">{t("dash.income")}</div>
            </div>

            <div className="kpi-card">
              <div className="kpi-top">
                <div className="kpi-icon">📉</div>
                <div className={`kpi-trend ${gastosTrend.className}`}>{gastosTrend.label}</div>
              </div>
              <div className="kpi-val" style={{ color: "var(--red)" }}>S/ {totalGastos.toLocaleString()}</div>
              <div className="kpi-label">{t("dash.expenses")}</div>
            </div>

            <div className="kpi-card">
              <div className="kpi-top">
                <div className="kpi-icon">🎯</div>
                <div className={`kpi-trend ${metasTrend.className}`}>{metasTrend.label}</div>
              </div>
              <div className="kpi-val">S/ {totalAhorrado.toLocaleString()}</div>
              <div className="kpi-label">{t("dash.saved")}</div>
            </div>
          </div>

          <div className="charts-row">
            <div className="card" style={{ animationDelay: "0.25s" }}>
              <div className="card-header">
                <div>
                  <div className="card-title">{t("dash.incomeVsExpenses")}</div>
                  <div className="card-sub">{periodCompareLabel}</div>
                </div>
                <div className="card-badge">{periodLabel}</div>
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
                  <div className="card-title">{t("dash.byCategory")}</div>
                  <div className="card-sub">{t("dash.categorySub")}</div>
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
                  <div className="card-title">{t("dash.recentMoves")}</div>
                  <div className="card-sub">{t("dash.recentSub")}</div>
                </div>
                <div className="card-badge">{periodLabel}</div>
              </div>
              <div className="tx-list">
                {transacciones.length === 0 && (
                  <div className="card-empty">{t("dash.emptyMoves")}</div>
                )}
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
              <button className="view-all" onClick={() => handleNavClick("gastos")}>{t("dash.viewAll")}</button>
            </div>

            <div className="card" style={{ animationDelay: "0.4s" }}>
              <div className="card-header">
                <div>
                  <div className="card-title">{t("dash.savingGoals")}</div>
                  <div className="card-sub">{t("dash.goalsSub")}</div>
                </div>
              </div>
              <div className="meta-list">
                {metas.length === 0 && (
                  <div className="card-empty">{t("dash.emptyGoals")}</div>
                )}
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
              <button className="add-meta-btn" onClick={() => handleNavClick("metas")}>{t("dash.newGoal")}</button>
            </div>

            <div className="card" style={{ animationDelay: "0.45s" }}>
              <div className="card-header">
                <div>
                  <div className="card-title">{t("dash.upcoming")}</div>
                  <div className="card-sub">{t("dash.upcomingSub", { month: currentMonthName })}</div>
                </div>
              </div>
              <div className="pagos-list">
                {pagosProximos.length === 0 && (
                  <div className="card-empty">{t("dash.emptyPayments")}</div>
                )}
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

              {pagosProximos.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 10 }}>{t("dash.committed", { month: currentMonthName })}</div>
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
              )}
            </div>
          </div>
        </div>
    </AppShell>
  );
}
