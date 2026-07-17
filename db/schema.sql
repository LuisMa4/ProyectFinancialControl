PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT DEFAULT '',
  password_hash TEXT,
  password_salt TEXT,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'premium')),
  currency TEXT NOT NULL DEFAULT 'PEN',
  language TEXT NOT NULL DEFAULT 'es',
  timezone TEXT NOT NULL DEFAULT 'America/Lima',
  avatar TEXT NOT NULL DEFAULT '👤',
  avatar_color TEXT NOT NULL DEFAULT '#5AADA5',
  monthly_budget REAL NOT NULL DEFAULT 0,
  registered_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS app_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  session_mode TEXT NOT NULL CHECK (session_mode IN ('user')),
  current_page TEXT NOT NULL DEFAULT 'login',
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  token_hash TEXT NOT NULL DEFAULT '',
  remember_me INTEGER NOT NULL DEFAULT 0 CHECK (remember_me IN (0, 1)),
  started_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ended_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS expense_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  default_budget REAL NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS payment_cards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  alias TEXT NOT NULL,
  holder_name TEXT NOT NULL,
  brand TEXT NOT NULL,
  last4 TEXT NOT NULL,
  expiry_month INTEGER,
  expiry_year INTEGER,
  card_type TEXT NOT NULL DEFAULT 'credit' CHECK (card_type IN ('credit', 'debit', 'virtual')),
  color TEXT NOT NULL DEFAULT '#5AADA5',
  is_primary INTEGER NOT NULL DEFAULT 0 CHECK (is_primary IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS savings_goals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '🎯',
  color TEXT NOT NULL DEFAULT '#5AADA5',
  target_amount REAL NOT NULL,
  current_amount REAL NOT NULL DEFAULT 0,
  monthly_contribution REAL NOT NULL DEFAULT 0,
  due_date TEXT,
  priority TEXT NOT NULL DEFAULT 'media' CHECK (priority IN ('alta', 'media', 'baja')),
  description TEXT DEFAULT '',
  is_shared INTEGER NOT NULL DEFAULT 0 CHECK (is_shared IN (0, 1)),
  share_code TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  category_id TEXT,
  goal_id INTEGER,
  card_id INTEGER,
  type TEXT NOT NULL CHECK (type IN ('expense', 'income', 'goal_contribution', 'payment', 'transfer')),
  title TEXT NOT NULL,
  amount REAL NOT NULL,
  transaction_date TEXT NOT NULL,
  note TEXT DEFAULT '',
  is_recurring INTEGER NOT NULL DEFAULT 0 CHECK (is_recurring IN (0, 1)),
  icon TEXT DEFAULT '',
  color TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES expense_categories(id) ON DELETE SET NULL,
  FOREIGN KEY (goal_id) REFERENCES savings_goals(id) ON DELETE SET NULL,
  FOREIGN KEY (card_id) REFERENCES payment_cards(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS calendar_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('pago', 'ingreso', 'meta')),
  title TEXT NOT NULL,
  amount REAL NOT NULL,
  day_of_month INTEGER NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  is_recurring INTEGER NOT NULL DEFAULT 0 CHECK (is_recurring IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON app_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_cards_user_id ON payment_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON savings_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_goal ON transactions(goal_id);
CREATE INDEX IF NOT EXISTS idx_events_user_day ON calendar_events(user_id, day_of_month);
