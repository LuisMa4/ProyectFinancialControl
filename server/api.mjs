import { createServer } from "node:http";
import { readFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";
import crypto from "node:crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, "..");

try {
  process.loadEnvFile(resolve(projectRoot, ".env"));
} catch {
  // sin .env: el chat usará el modo local
}

const dbDir = process.env.FINVERDE_DB_DIR ? resolve(process.env.FINVERDE_DB_DIR) : resolve(projectRoot, "db");
const dbPath = resolve(dbDir, "financial_control.sqlite");
const schemaPath = resolve(projectRoot, "db", "schema.sql");
const seedPath = resolve(projectRoot, "db", "seed.sql");

if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true });
}

const db = new DatabaseSync(dbPath);
db.exec("PRAGMA foreign_keys = ON");

const schemaSql = readFileSync(schemaPath, "utf8");
const seedSql = readFileSync(seedPath, "utf8");
db.exec(schemaSql);

const paymentCardColumns = db.prepare("PRAGMA table_info(payment_cards)").all().map((column) => column.name);
if (!paymentCardColumns.includes("alias")) {
  db.exec("ALTER TABLE payment_cards ADD COLUMN alias TEXT DEFAULT ''");
}
if (!paymentCardColumns.includes("holder_name")) {
  db.exec("ALTER TABLE payment_cards ADD COLUMN holder_name TEXT DEFAULT ''");
}

db.exec(`
  UPDATE payment_cards
  SET alias = COALESCE(alias, card_name, brand || ' ' || last4),
      holder_name = COALESCE(holder_name, 'Juan Pérez')
  WHERE COALESCE(alias, '') = '' OR COALESCE(holder_name, '') = ''
`);

const userColumns = db.prepare("PRAGMA table_info(users)").all().map((column) => column.name);
if (!userColumns.includes("password_salt")) {
  db.exec("ALTER TABLE users ADD COLUMN password_salt TEXT DEFAULT ''");
}

const sessionColumns = db.prepare("PRAGMA table_info(app_sessions)").all().map((column) => column.name);
if (!sessionColumns.includes("token_hash")) {
  db.exec("ALTER TABLE app_sessions ADD COLUMN token_hash TEXT DEFAULT ''");
}
if (!sessionColumns.includes("remember_me")) {
  db.exec("ALTER TABLE app_sessions ADD COLUMN remember_me INTEGER DEFAULT 0");
}

const hashValue = (value) => crypto.createHash("sha256").update(String(value)).digest("hex");
const createSalt = () => crypto.randomBytes(16).toString("hex");
const hashPassword = (password, salt) => hashValue(`${salt}:${password}`);
const createToken = () => crypto.randomBytes(32).toString("hex");
const hashToken = (token) => hashValue(token);

const defaultPassword = "Savia123!";
const existingUser = db.prepare("SELECT id, password_hash, password_salt FROM users WHERE id = 1").get();
if (existingUser && (!existingUser.password_hash || !existingUser.password_hash.length)) {
  db.prepare("UPDATE users SET password_hash = ?, password_salt = '' WHERE id = 1").run(hashValue(defaultPassword));
}

const userCount = db.prepare("SELECT COUNT(*) AS total FROM users").get().total;
if (userCount === 0) {
  db.exec(seedSql);
}

const cardCount = db.prepare("SELECT COUNT(*) AS total FROM payment_cards").get().total;
if (cardCount === 0) {
  db.exec(seedSql);
}

const port = Number(process.env.PORT || 3001);

const json = (res, statusCode, payload) => {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  });
  res.end(body);
};

const notFound = (res) => json(res, 404, { error: "Not found" });

const readBody = async (req) => {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : null;
};

const onlyDigits = (value) => String(value || "").replace(/\D/g, "");

const maskNumber = (last4) => `**** **** **** ${String(last4 || "----")}`;

const normalizeCardRow = (row) => ({
  id: row.id,
  alias: row.alias,
  titular: row.holder_name,
  numero: maskNumber(row.last4),
  ultimos: row.last4,
  marca: row.brand,
  marcaClass: row.brand === "Visa" ? "visa" : row.brand === "Mastercard" ? "mastercard" : "generic",
  marcaIcon: row.brand === "Visa" ? "V" : row.brand === "Mastercard" ? "MC" : "💳",
  vencimiento: `${String(row.expiry_month).padStart(2, "0")}/${String(row.expiry_year).slice(-2)}`,
  estado: row.is_primary ? "Verificada" : "Activa",
  color: row.color,
});

const toCardRecord = (card) => {
  const digits = onlyDigits(card.numero || card.last4 || "");
  return {
    alias: card.alias || card.card_name || card.nombre || "Tarjeta",
    holder_name: card.titular || card.holder_name || "Juan Pérez",
    brand: card.marca || card.brand || "Visa",
    last4: digits.slice(-4) || String(card.ultimos || card.last4 || "0000").slice(-4),
    expiry_month: Number(String(card.vencimiento || card.expiry || "12/25").slice(0, 2)) || 12,
    expiry_year: 2000 + (Number(String(card.vencimiento || card.expiry || "12/25").slice(-2)) || 25),
    card_type: card.card_type || "credit",
    color: card.color || "#5AADA5",
    is_primary: card.estado === "Verificada" ? 1 : Number(Boolean(card.is_primary)),
  };
};

const normalizeExpenseRow = (row) => ({
  id: row.id,
  desc: row.title,
  cat: row.category_id || "otros",
  monto: Number(row.amount),
  fecha: row.transaction_date,
  nota: row.note || "",
  recurrente: Boolean(row.is_recurring),
});

const toExpenseRecord = (expense) => ({
  category_id: expense.cat || expense.category_id || "otros",
  type: "expense",
  title: expense.desc || expense.title || "Gasto",
  amount: Number(expense.monto ?? expense.amount ?? 0),
  transaction_date: expense.fecha || expense.transaction_date || new Date().toISOString().slice(0, 10),
  note: expense.nota || expense.note || "",
  is_recurring: Number(Boolean(expense.recurrente ?? expense.is_recurring)),
  icon: expense.icon || "",
  color: expense.color || "",
});

const getUser = () => db.prepare("SELECT * FROM users ORDER BY id LIMIT 1").get();

const normalizeUserRow = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone || "",
    plan: row.plan,
    currency: row.currency,
    language: row.language,
    timezone: row.timezone,
    avatar: row.avatar,
    avatarColor: row.avatar_color,
    monthlyBudget: Number(row.monthly_budget || 0),
    registeredAt: row.registered_at || "",
    fullName: `${row.first_name} ${row.last_name}`.trim(),
  };
};

const normalizeSessionRow = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    tokenHash: row.token_hash,
    rememberMe: Boolean(row.remember_me),
    currentPage: row.current_page,
    isActive: Boolean(row.is_active),
    startedAt: row.started_at,
    endedAt: row.ended_at,
  };
};

const getUserByEmail = (email) => db.prepare("SELECT * FROM users WHERE lower(email) = lower(?) LIMIT 1").get(email);

const getUserByToken = (token) => {
  const tokenHash = hashToken(token);
  const session = db.prepare("SELECT * FROM app_sessions WHERE token_hash = ? AND is_active = 1 ORDER BY id DESC LIMIT 1").get(tokenHash);
  if (!session) return null;
  const user = db.prepare("SELECT * FROM users WHERE id = ? LIMIT 1").get(session.user_id);
  return { user, session: normalizeSessionRow(session) };
};

const getCurrentUserFromRequest = (req) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) return null;
  return getUserByToken(token)?.user || null;
};

const createSession = (userId, rememberMe = false) => {
  const token = createToken();
  db.prepare(`
    INSERT INTO app_sessions (user_id, session_mode, current_page, is_active, token_hash, remember_me)
    VALUES (?, 'user', 'mainpage', 1, ?, ?)
  `).run(userId, hashToken(token), Number(Boolean(rememberMe)));
  return token;
};

const completeAuth = (res, user, token) => json(res, 200, { token, user: normalizeUserRow(user) });

const getCards = (userId) => db.prepare("SELECT * FROM payment_cards WHERE user_id = ? ORDER BY is_primary DESC, id DESC").all(userId).map(normalizeCardRow);
const getExpenses = (userId) => db.prepare("SELECT * FROM transactions WHERE user_id = ? AND type = 'expense' ORDER BY transaction_date DESC, id DESC").all(userId).map(normalizeExpenseRow);
const getGoals = (userId) => {
  const goals = db.prepare("SELECT * FROM savings_goals WHERE user_id = ? ORDER BY id ASC").all(userId);
  const contributions = db.prepare("SELECT goal_id, transaction_date, amount FROM transactions WHERE user_id = ? AND type = 'goal_contribution' ORDER BY transaction_date ASC, id ASC").all(userId);
  return goals.map((goal) => {
    const history = contributions
      .filter((item) => item.goal_id === goal.id)
      .reduce((acc, item) => {
        const monthLabel = new Date(`${item.transaction_date}T12:00:00`).toLocaleDateString("es-PE", { month: "short" });
        acc.push({ mes: monthLabel, aporte: Number(item.amount) });
        return acc;
      }, []);

    return {
      id: goal.id,
      nombre: goal.name,
      icon: goal.icon,
      color: goal.color,
      meta: Number(goal.target_amount),
      actual: Number(goal.current_amount),
      aporteMensual: Number(goal.monthly_contribution),
      fechaLimite: goal.due_date,
      prioridad: goal.priority,
      descripcion: goal.description,
      historial: history,
      isShared: Boolean(goal.is_shared),
      shareCode: goal.share_code,
    };
  });
};

const normalizeGoalRow = (row) => ({
  id: row.id,
  nombre: row.name,
  icon: row.icon,
  color: row.color,
  meta: Number(row.target_amount),
  actual: Number(row.current_amount),
  aporteMensual: Number(row.monthly_contribution),
  fechaLimite: row.due_date,
  prioridad: row.priority,
  descripcion: row.description,
  historial: [],
  compartida: Boolean(row.is_shared),
  shareLink: row.share_code || "",
});

const normalizeEventRow = (row) => ({
  id: row.id,
  tipo: row.event_type,
  desc: row.title,
  monto: Number(row.amount),
  dia: Number(row.day_of_month),
  icono: row.icon,
  color: row.color,
  recurrente: Boolean(row.is_recurring),
});

const toEventRecord = (event) => ({
  event_type: event.tipo || event.event_type || "pago",
  title: event.desc || event.title || "Evento",
  amount: Number(event.monto ?? event.amount ?? 0),
  day_of_month: Number(event.dia ?? event.day_of_month ?? 1),
  icon: event.icono || event.icon || "💳",
  color: event.color || (event.tipo === "ingreso" ? "#4CAF7D" : event.tipo === "meta" ? "#7EC8C0" : "#E07070"),
  is_recurring: Number(Boolean(event.recurrente ?? event.is_recurring)),
});

const toGoalRecord = (goal) => ({
  name: goal.nombre || goal.name || "Meta",
  icon: goal.icon || "🎯",
  color: goal.color || "#7EC8C0",
  target_amount: Number(goal.meta ?? goal.target_amount ?? 0),
  current_amount: Number(goal.actual ?? goal.current_amount ?? 0),
  monthly_contribution: Number(goal.aporteMensual ?? goal.monthly_contribution ?? 0),
  due_date: goal.fechaLimite || goal.due_date || null,
  priority: goal.prioridad || goal.priority || "media",
  description: goal.descripcion || goal.description || "",
  is_shared: Number(Boolean(goal.compartida ?? goal.is_shared)),
  share_code: goal.shareLink || goal.share_code || null,
});

const runInTransaction = (fn) => {
  db.exec("BEGIN");
  try {
    fn();
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
};

const replaceGoals = (userId, goals) => {
  const insert = db.prepare(`
    INSERT INTO savings_goals (
      user_id, name, icon, color, target_amount, current_amount, monthly_contribution,
      due_date, priority, description, is_shared, share_code
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const applyItems = (items) => runInTransaction(() => {
    db.prepare("DELETE FROM savings_goals WHERE user_id = ?").run(userId);
    db.prepare("DELETE FROM transactions WHERE user_id = ? AND type = 'goal_contribution'").run(userId);
    for (const goal of items) {
      const record = toGoalRecord(goal);
      insert.run(userId, record.name, record.icon, record.color, record.target_amount, record.current_amount, record.monthly_contribution, record.due_date, record.priority, record.description, record.is_shared, record.share_code);
    }
  });

  applyItems(Array.isArray(goals) ? goals : []);
  return getGoals(userId);
};

const getEvents = (userId) => db.prepare("SELECT * FROM calendar_events WHERE user_id = ? ORDER BY day_of_month ASC, id ASC").all(userId).map(normalizeEventRow);

const replaceEvents = (userId, events) => {
  const insert = db.prepare(`
    INSERT INTO calendar_events (
      user_id, event_type, title, amount, day_of_month, icon, color, is_recurring
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const applyItems = (items) => runInTransaction(() => {
    db.prepare("DELETE FROM calendar_events WHERE user_id = ?").run(userId);
    for (const event of items) {
      const record = toEventRecord(event);
      insert.run(userId, record.event_type, record.title, record.amount, record.day_of_month, record.icon, record.color, record.is_recurring);
    }
  });

  applyItems(Array.isArray(events) ? events : []);
  return getEvents(userId);
};

const replaceCards = (userId, cards) => {
  const insert = db.prepare(`
    INSERT INTO payment_cards (
      user_id, alias, holder_name, brand, last4, expiry_month, expiry_year, card_type, color, is_primary
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const applyItems = (items) => runInTransaction(() => {
    db.prepare("DELETE FROM payment_cards WHERE user_id = ?").run(userId);
    for (const card of items) {
      const record = toCardRecord(card);
      insert.run(userId, record.alias, record.holder_name, record.brand, record.last4, record.expiry_month, record.expiry_year, record.card_type, record.color, record.is_primary);
    }
  });

  applyItems(Array.isArray(cards) ? cards : []);
  return getCards(userId);
};

const replaceExpenses = (userId, expenses) => {
  const insert = db.prepare(`
    INSERT INTO transactions (
      user_id, category_id, goal_id, card_id, type, title, amount, transaction_date, note, is_recurring, icon, color
    ) VALUES (?, ?, NULL, NULL, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const applyItems = (items) => runInTransaction(() => {
    db.prepare("DELETE FROM transactions WHERE user_id = ? AND type = 'expense'").run(userId);
    for (const expense of items) {
      const record = toExpenseRecord(expense);
      insert.run(userId, record.category_id, record.type, record.title, record.amount, record.transaction_date, record.note, record.is_recurring, record.icon, record.color);
    }
  });

  applyItems(Array.isArray(expenses) ? expenses : []);
  return getExpenses(userId);
};

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "";
const GEMINI_MODEL = process.env.GEMINI_MODEL || process.env.VITE_GEMINI_MODEL || "gemini-2.5-flash";
const GEMINI_FALLBACK_MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite"];

const monthKey = (date) => String(date).slice(0, 7);

const buildFinancialContext = (user, language = "es") => {
  const expenses = getExpenses(user.id);
  const goals = getGoals(user.id);
  const events = getEvents(user.id);
  const currency = user.currency || "PEN";
  const symbol = currency === "PEN" ? "S/" : currency;
  const currentMonth = monthKey(new Date().toISOString());
  const monthExpenses = expenses.filter((item) => monthKey(item.fecha) === currentMonth);
  const monthTotal = monthExpenses.reduce((total, item) => total + item.monto, 0);
  const totalSaved = goals.reduce((total, goal) => total + Math.min(goal.actual, goal.meta), 0);
  const budget = Number(user.monthly_budget || 0);

  const byCategory = {};
  for (const item of monthExpenses) {
    byCategory[item.cat] = (byCategory[item.cat] || 0) + item.monto;
  }

  const fmt = (value) => `${symbol} ${Number(value).toFixed(2)}`;
  const isEn = language === "en";

  const lines = [];
  if (isEn) {
    lines.push("You are Fina, the personal finance assistant of Savia, a personal finance management app.");
    lines.push("Your role is to help the user understand their finances, give personalized advice and answer questions about their financial situation.");
    lines.push(`USER DATA (${user.first_name} ${user.last_name}):`);
  } else {
    lines.push("Eres Fina, la asistente financiera personal de Savia, una aplicación de gestión de finanzas personales.");
    lines.push("Tu rol es ayudar al usuario a entender sus finanzas, dar consejos personalizados y responder preguntas sobre su situación económica.");
    lines.push(`DATOS DEL USUARIO (${user.first_name} ${user.last_name}):`);
  }

  lines.push(isEn ? `- Monthly budget: ${budget ? fmt(budget) : "not set"}` : `- Presupuesto mensual: ${budget ? fmt(budget) : "sin definir"}`);
  lines.push(isEn ? `- Spending this month: ${fmt(monthTotal)} (${monthExpenses.length} recorded expenses)` : `- Gastos de este mes: ${fmt(monthTotal)} (${monthExpenses.length} gastos registrados)`);
  lines.push(isEn ? `- Total saved toward goals: ${fmt(totalSaved)}` : `- Total ahorrado en metas: ${fmt(totalSaved)}`);

  if (goals.length) {
    lines.push(isEn ? "ACTIVE GOALS:" : "METAS ACTIVAS:");
    for (const goal of goals) {
      const pct = goal.meta ? Math.round((goal.actual / goal.meta) * 100) : 0;
      lines.push(`- ${goal.nombre}: ${fmt(goal.actual)} / ${fmt(goal.meta)} (${pct}%)`);
    }
  } else {
    lines.push(isEn ? "The user has no savings goals yet. Help them define their first one." : "El usuario aún no tiene metas de ahorro. Ayúdalo a definir la primera.");
  }

  const categoryEntries = Object.entries(byCategory);
  if (categoryEntries.length) {
    lines.push(isEn ? "SPENDING BY CATEGORY (this month):" : "GASTOS POR CATEGORÍA (este mes):");
    for (const [category, total] of categoryEntries) {
      lines.push(`- ${category}: ${fmt(total)}`);
    }
  }

  if (events.length) {
    lines.push(isEn ? "MONTHLY CALENDAR EVENTS:" : "EVENTOS DEL CALENDARIO MENSUAL:");
    for (const event of events.slice(0, 12)) {
      lines.push(`- ${event.desc}: ${fmt(event.monto)} (${isEn ? "day" : "día"} ${event.dia}, ${event.tipo})`);
    }
  }

  if (!expenses.length && !goals.length && !events.length) {
    lines.push(isEn
      ? "The account is brand new with no data. Suggest first steps: initial categories, realistic budgets and a first savings goal. Do not invent personal financial figures."
      : "La cuenta es nueva y no tiene datos. Sugiere primeros pasos: categorías iniciales, presupuestos realistas y una primera meta de ahorro. No inventes datos financieros personales.");
  }

  lines.push(isEn
    ? "ALWAYS answer in English, warm and concise, with moderate emoji use. Use simple markdown (bold, lists) when it helps. If asked about non-finance topics, kindly redirect. Max 200 words unless a detailed analysis is requested."
    : "Responde SIEMPRE en español, de forma cálida y concisa, con emojis moderados. Usa formato markdown simple (negritas, listas) cuando ayude. Si el usuario pregunta algo ajeno a finanzas, redirígelo amablemente. Máximo 200 palabras salvo que pida un análisis detallado.");

  return lines.join("\n");
};

const callGemini = async ({ systemPrompt, messages }) => {
  if (!GEMINI_API_KEY) {
    return { content: "", source: "local", error: "missing-api-key" };
  }

  const contents = messages.slice(-10).map((message) => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: [{ text: String(message.content || "") }],
  }));

  const requestBody = JSON.stringify({
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents,
    generationConfig: { temperature: 0.7, topP: 0.9, maxOutputTokens: 700 },
  });

  const modelsToTry = [...new Set([GEMINI_MODEL, ...GEMINI_FALLBACK_MODELS])];
  let lastError = null;

  for (const model of modelsToTry) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_API_KEY,
        },
        body: requestBody,
      });

      if (!response.ok) {
        lastError = `gemini-${response.status}`;
        continue;
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim();
      if (text) {
        return { content: text, source: "gemini", error: null };
      }
      lastError = "empty-response";
    } catch {
      lastError = "network";
    }
  }

  return { content: "", source: "local", error: lastError };
};

const handleRequest = async (req, res) => {
  if (!req.url) return notFound(res);

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    });
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === "/api/health") {
    return json(res, 200, { ok: true });
  }

  if (url.pathname === "/api/auth/register" && req.method === "POST") {
    const body = await readBody(req);
    const firstName = String(body?.firstName || "").trim();
    const lastName = String(body?.lastName || "").trim();
    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "");
    const phone = String(body?.phone || "").trim();
    const currency = String(body?.currency || "PEN").trim() || "PEN";
    const plan = body?.plan === "premium" ? "premium" : "free";
    const rememberMe = Boolean(body?.rememberMe);

    if (!firstName || !lastName || !email || !password) {
      return json(res, 400, { error: "Faltan datos obligatorios" });
    }

    if (getUserByEmail(email)) {
      return json(res, 409, { error: "Ya existe una cuenta con ese correo" });
    }

    const salt = createSalt();
    const passwordHash = hashPassword(password, salt);
    const avatar = `${firstName[0] || "U"}${lastName[0] || "N"}`.toUpperCase();
    const avatarColor = plan === "premium" ? "#5AADA5" : "#8AADA9";
    const registeredAt = new Date().toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" });

    const insert = db.prepare(`
      INSERT INTO users (
        first_name, last_name, email, phone, password_hash, password_salt, plan,
        currency, language, timezone, avatar, avatar_color, monthly_budget, registered_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'es', 'America/Lima', ?, ?, 0, ?)
    `);

    const info = insert.run(firstName, lastName, email, phone, passwordHash, salt, plan, currency, avatar, avatarColor, registeredAt);
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(info.lastInsertRowid);
    const token = createSession(user.id, rememberMe);
    return completeAuth(res, user, token);
  }

  if (url.pathname === "/api/auth/login" && req.method === "POST") {
    const body = await readBody(req);
    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "");
    const rememberMe = Boolean(body?.rememberMe);

    if (!email || !password) {
      return json(res, 400, { error: "Faltan credenciales" });
    }

    const user = getUserByEmail(email);
    if (!user) {
      return json(res, 401, { error: "Correo o contraseña incorrectos" });
    }

    const expected = user.password_hash || "";
    const candidate = user.password_salt ? hashPassword(password, user.password_salt) : hashValue(password);
    if (candidate !== expected) {
      return json(res, 401, { error: "Correo o contraseña incorrectos" });
    }

    const token = createSession(user.id, rememberMe);
    return completeAuth(res, user, token);
  }

  if (url.pathname === "/api/auth/me" && req.method === "GET") {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!token) return json(res, 401, { error: "No autenticado" });

    const record = getUserByToken(token);
    if (!record) return json(res, 401, { error: "Sesión inválida" });

    return json(res, 200, { user: normalizeUserRow(record.user), session: record.session });
  }

  if (url.pathname === "/api/auth/logout" && req.method === "POST") {
    const body = await readBody(req);
    const token = String(body?.token || "");
    if (token) {
      db.prepare("UPDATE app_sessions SET is_active = 0, ended_at = CURRENT_TIMESTAMP WHERE token_hash = ?").run(hashToken(token));
    }
    return json(res, 200, { ok: true });
  }

  if (url.pathname === "/api/user" && req.method === "PUT") {
    const currentUser = getCurrentUserFromRequest(req);
    if (!currentUser) return json(res, 401, { error: "No autenticado" });
    const body = await readBody(req);

    const firstName = String(body?.firstName ?? currentUser.first_name).trim() || currentUser.first_name;
    const lastName = String(body?.lastName ?? currentUser.last_name).trim() || currentUser.last_name;
    const phone = String(body?.phone ?? currentUser.phone ?? "").trim();
    const currency = String(body?.currency ?? currentUser.currency).trim() || "PEN";
    const language = body?.language === "en" ? "en" : body?.language === "es" ? "es" : currentUser.language;
    const timezone = String(body?.timezone ?? currentUser.timezone).trim() || currentUser.timezone;
    const avatar = String(body?.avatar ?? currentUser.avatar).trim() || currentUser.avatar;
    const avatarColor = String(body?.avatarColor ?? currentUser.avatar_color).trim() || currentUser.avatar_color;
    const monthlyBudget = Number.isFinite(Number(body?.monthlyBudget)) ? Number(body.monthlyBudget) : Number(currentUser.monthly_budget || 0);

    db.prepare(`
      UPDATE users SET first_name = ?, last_name = ?, phone = ?, currency = ?, language = ?,
        timezone = ?, avatar = ?, avatar_color = ?, monthly_budget = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(firstName, lastName, phone, currency, language, timezone, avatar, avatarColor, monthlyBudget, currentUser.id);

    const updated = db.prepare("SELECT * FROM users WHERE id = ?").get(currentUser.id);
    return json(res, 200, { user: normalizeUserRow(updated) });
  }

  if (url.pathname === "/api/auth/password" && req.method === "POST") {
    const currentUser = getCurrentUserFromRequest(req);
    if (!currentUser) return json(res, 401, { error: "No autenticado" });
    const body = await readBody(req);
    const currentPassword = String(body?.currentPassword || "");
    const newPassword = String(body?.newPassword || "");

    if (newPassword.length < 8) {
      return json(res, 400, { error: "La contraseña nueva debe tener al menos 8 caracteres" });
    }

    const expected = currentUser.password_hash || "";
    const candidate = currentUser.password_salt ? hashPassword(currentPassword, currentUser.password_salt) : hashValue(currentPassword);
    if (candidate !== expected) {
      return json(res, 401, { error: "La contraseña actual no es correcta" });
    }

    const salt = createSalt();
    db.prepare("UPDATE users SET password_hash = ?, password_salt = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
      .run(hashPassword(newPassword, salt), salt, currentUser.id);
    return json(res, 200, { ok: true });
  }

  if (url.pathname === "/api/user") {
    const user = getCurrentUserFromRequest(req) || getUser();
    return json(res, 200, normalizeUserRow(user));
  }

  if (url.pathname === "/api/cards") {
    const currentUser = getCurrentUserFromRequest(req);
    if (!currentUser) return json(res, 401, { error: "No autenticado" });
    if (req.method === "GET") return json(res, 200, getCards(currentUser.id));
    if (req.method === "PUT") return json(res, 200, replaceCards(currentUser.id, (await readBody(req))?.cards || []));
  }

  if (url.pathname === "/api/expenses") {
    const currentUser = getCurrentUserFromRequest(req);
    if (!currentUser) return json(res, 401, { error: "No autenticado" });
    if (req.method === "GET") return json(res, 200, getExpenses(currentUser.id));
    if (req.method === "PUT") return json(res, 200, replaceExpenses(currentUser.id, (await readBody(req))?.expenses || []));
  }

  if (url.pathname === "/api/goals" && req.method === "GET") {
    const currentUser = getCurrentUserFromRequest(req);
    if (!currentUser) return json(res, 401, { error: "No autenticado" });
    return json(res, 200, getGoals(currentUser.id));
  }

  if (url.pathname === "/api/goals" && req.method === "PUT") {
    const currentUser = getCurrentUserFromRequest(req);
    if (!currentUser) return json(res, 401, { error: "No autenticado" });
    return json(res, 200, replaceGoals(currentUser.id, (await readBody(req))?.goals || []));
  }

  if (url.pathname === "/api/chat" && req.method === "POST") {
    const currentUser = getCurrentUserFromRequest(req);
    if (!currentUser) return json(res, 401, { error: "No autenticado" });
    const body = await readBody(req);
    const messages = Array.isArray(body?.messages) ? body.messages : [];
    const language = body?.language === "en" ? "en" : "es";
    if (!messages.length) return json(res, 400, { error: "Sin mensajes" });

    const systemPrompt = buildFinancialContext(currentUser, language);
    const reply = await callGemini({ systemPrompt, messages });
    return json(res, 200, reply);
  }

  if (url.pathname === "/api/events") {
    const currentUser = getCurrentUserFromRequest(req);
    if (!currentUser) return json(res, 401, { error: "No autenticado" });
    if (req.method === "GET") return json(res, 200, getEvents(currentUser.id));
    if (req.method === "PUT") return json(res, 200, replaceEvents(currentUser.id, (await readBody(req))?.events || []));
  }

  return notFound(res);
};

const server = createServer(async (req, res) => {
  try {
    await handleRequest(req, res);
  } catch (error) {
    console.error("API error:", error);
    if (!res.headersSent) {
      json(res, 500, { error: "Error interno del servidor" });
    }
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`API ready at http://127.0.0.1:${port}`);
});
