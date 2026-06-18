import { createServer } from "node:http";
import { readFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";
import crypto from "node:crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, "..");
const dbDir = resolve(projectRoot, "db");
const dbPath = resolve(dbDir, "financial_control.sqlite");
const schemaPath = resolve(dbDir, "schema.sql");
const seedPath = resolve(dbDir, "seed.sql");

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
    "Access-Control-Allow-Headers": "Content-Type",
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

const createSession = (userId, rememberMe = false) => {
  const token = createToken();
  db.prepare(`
    INSERT INTO app_sessions (user_id, session_mode, current_page, is_active, token_hash, remember_me)
    VALUES (?, 'user', 'mainpage', 1, ?, ?)
  `).run(userId, hashToken(token), Number(Boolean(rememberMe)));
  return token;
};

const completeAuth = (res, user, token) => json(res, 200, { token, user: normalizeUserRow(user) });

const getCards = () => db.prepare("SELECT * FROM payment_cards WHERE user_id = 1 ORDER BY is_primary DESC, id DESC").all().map(normalizeCardRow);
const getExpenses = () => db.prepare("SELECT * FROM transactions WHERE user_id = 1 AND type = 'expense' ORDER BY transaction_date DESC, id DESC").all().map(normalizeExpenseRow);
const getGoals = () => {
  const goals = db.prepare("SELECT * FROM savings_goals WHERE user_id = 1 ORDER BY id ASC").all();
  const contributions = db.prepare("SELECT goal_id, transaction_date, amount FROM transactions WHERE user_id = 1 AND type = 'goal_contribution' ORDER BY transaction_date ASC, id ASC").all();
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

const replaceCards = (cards) => {
  const insert = db.prepare(`
    INSERT INTO payment_cards (
      user_id, alias, holder_name, brand, last4, expiry_month, expiry_year, card_type, color, is_primary
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const transaction = db.transaction((items) => {
    db.prepare("DELETE FROM payment_cards WHERE user_id = 1").run();
    for (const card of items) {
      const record = toCardRecord(card);
      insert.run(1, record.alias, record.holder_name, record.brand, record.last4, record.expiry_month, record.expiry_year, record.card_type, record.color, record.is_primary);
    }
  });

  transaction(Array.isArray(cards) ? cards : []);
  return getCards();
};

const replaceExpenses = (expenses) => {
  const insert = db.prepare(`
    INSERT INTO transactions (
      user_id, category_id, goal_id, card_id, type, title, amount, transaction_date, note, is_recurring, icon, color
    ) VALUES (?, ?, NULL, NULL, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const transaction = db.transaction((items) => {
    db.prepare("DELETE FROM transactions WHERE user_id = 1 AND type = 'expense'").run();
    for (const expense of items) {
      const record = toExpenseRecord(expense);
      insert.run(1, record.category_id, record.type, record.title, record.amount, record.transaction_date, record.note, record.is_recurring, record.icon, record.color);
    }
  });

  transaction(Array.isArray(expenses) ? expenses : []);
  return getExpenses();
};

const server = createServer(async (req, res) => {
  if (!req.url) return notFound(res);

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
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

  if (url.pathname === "/api/user") {
    return json(res, 200, normalizeUserRow(getUser()));
  }

  if (url.pathname === "/api/cards") {
    if (req.method === "GET") return json(res, 200, getCards());
    if (req.method === "PUT") return json(res, 200, replaceCards((await readBody(req))?.cards || []));
  }

  if (url.pathname === "/api/expenses") {
    if (req.method === "GET") return json(res, 200, getExpenses());
    if (req.method === "PUT") return json(res, 200, replaceExpenses((await readBody(req))?.expenses || []));
  }

  if (url.pathname === "/api/goals" && req.method === "GET") {
    return json(res, 200, getGoals());
  }

  return notFound(res);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`API ready at http://127.0.0.1:${port}`);
});
