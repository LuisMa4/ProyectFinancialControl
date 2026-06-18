INSERT INTO users (
  id, first_name, last_name, email, phone, password_hash, password_salt, plan, currency, language, timezone,
  avatar, avatar_color, monthly_budget, registered_at
) VALUES (
  1, 'Juan', 'Pérez', 'juan.perez@gmail.com', '+51 999 888 777', '16bdfaad8d7a6f3adbdc0cc87cfb4f2d4f0b2b8e4e3c7cae0f8f2c7a25a40df4', '', 'premium', 'PEN', 'es', 'America/Lima',
  'JP', '#5AADA5', 2500, '12 enero 2025'
);

INSERT INTO expense_categories (id, name, icon, color, default_budget, sort_order) VALUES
  ('alimentacion', 'Alimentación', '🍔', '#7EC8C0', 800, 1),
  ('transporte', 'Transporte', '🚗', '#5AADA5', 400, 2),
  ('entrete', 'Entretenimiento', '🎬', '#A8DBD6', 300, 3),
  ('salud', 'Salud', '💊', '#C9A96E', 250, 4),
  ('educacion', 'Educación', '📚', '#8AADA9', 200, 5),
  ('servicios', 'Servicios', '⚡', '#4A706C', 350, 6),
  ('ropa', 'Ropa', '👗', '#D4B8A0', 150, 7),
  ('otros', 'Otros', '📦', '#DDE9E7', 200, 8);

INSERT INTO payment_cards (
  id, user_id, alias, holder_name, brand, last4, expiry_month, expiry_year, card_type, color, is_primary
) VALUES
  (1, 1, 'Visa Personal', 'Juan Pérez', 'Visa', '4581', 12, 2028, 'debit', '#5AADA5', 1),
  (2, 1, 'Mastercard Premium', 'Juan Pérez', 'Mastercard', '9012', 8, 2029, 'credit', '#C9A96E', 0),
  (3, 1, 'Tarjeta Digital', 'Juan Pérez', 'Visa', '7734', 3, 2027, 'virtual', '#8AADA9', 0);

INSERT INTO savings_goals (
  id, user_id, name, icon, color, target_amount, current_amount, monthly_contribution,
  due_date, priority, description, is_shared, share_code
) VALUES
  (1, 1, 'Viaje a Europa', '✈️', '#7EC8C0', 8000, 3200, 400, '2025-12-31', 'alta', 'Recorrer España, Francia e Italia por 3 semanas.', 1, 'EUROPA-2025'),
  (2, 1, 'Fondo de emergencia', '🛡️', '#5AADA5', 5000, 4100, 300, '2025-07-31', 'alta', 'Colchón equivalente a 3 meses de gastos fijos.', 0, NULL),
  (3, 1, 'Laptop nueva', '💻', '#C9A96E', 3500, 870, 200, '2026-03-31', 'media', 'MacBook Pro para trabajo y diseño.', 0, NULL),
  (4, 1, 'Auto propio', '🚗', '#8AADA9', 20000, 2500, 500, '2027-06-30', 'baja', 'Vehículo para independencia de movilidad.', 0, NULL),
  (5, 1, 'Curso de inglés', '🎓', '#A8DBD6', 1200, 1200, 0, '2025-04-30', 'media', 'Certificación Cambridge B2.', 0, NULL);

INSERT INTO transactions (
  user_id, category_id, goal_id, card_id, type, title, amount, transaction_date, note, is_recurring, icon, color
) VALUES
  (1, 'alimentacion', NULL, 1, 'expense', 'Wong - Compras mensuales', 185.50, '2025-05-24', 'Despensa completa', 0, '🍔', '#7EC8C0'),
  (1, 'transporte', NULL, 1, 'expense', 'Uber', 18.90, '2025-05-23', '', 0, '🚗', '#5AADA5'),
  (1, 'entrete', NULL, 2, 'expense', 'Netflix', 37.90, '2025-05-23', 'Suscripción mensual', 1, '🎬', '#A8DBD6'),
  (1, 'salud', NULL, NULL, 'expense', 'Farmacia Inkafarma', 62.00, '2025-05-22', 'Medicamentos', 0, '💊', '#C9A96E'),
  (1, 'servicios', NULL, NULL, 'expense', 'Luz del Sur', 89.00, '2025-05-21', 'Recibo mayo', 1, '⚡', '#4A706C'),
  (1, 'alimentacion', NULL, 1, 'expense', 'Plaza Vea', 134.20, '2025-05-20', '', 0, '🍔', '#7EC8C0'),
  (1, 'transporte', NULL, 1, 'expense', 'Metropolitano', 50.00, '2025-05-19', 'Recarga tarjeta', 0, '🚗', '#5AADA5'),
  (1, 'entrete', NULL, 2, 'expense', 'Spotify', 19.90, '2025-05-18', '', 1, '🎬', '#A8DBD6'),
  (1, 'servicios', NULL, NULL, 'expense', 'Claro Internet', 89.00, '2025-05-18', 'Plan Hogar', 1, '⚡', '#4A706C'),
  (1, 'educacion', NULL, NULL, 'expense', 'Librería', 45.00, '2025-05-15', 'Cuadernos y útiles', 0, '📚', '#8AADA9'),
  (1, 'entrete', NULL, NULL, 'expense', 'Cineplanet', 38.00, '2025-05-14', 'Película + pop corn', 0, '🎬', '#A8DBD6'),
  (1, 'alimentacion', NULL, 1, 'expense', 'KFC', 52.80, '2025-05-13', 'Almuerzo familiar', 0, '🍔', '#7EC8C0'),
  (1, 'ropa', NULL, 2, 'expense', 'Ripley - Camisas', 129.90, '2025-05-12', '', 0, '👗', '#D4B8A0'),
  (1, 'salud', NULL, NULL, 'expense', 'Gimnasio', 80.00, '2025-05-10', 'Mensualidad', 1, '💊', '#C9A96E'),
  (1, 'transporte', NULL, 1, 'expense', 'Taxi', 25.00, '2025-05-09', '', 0, '🚗', '#5AADA5'),
  (1, 'salud', NULL, NULL, 'expense', 'Dentista', 120.00, '2025-05-07', 'Limpieza dental', 0, '💊', '#C9A96E'),
  (1, 'educacion', NULL, NULL, 'expense', 'Curso Udemy', 39.90, '2025-05-06', 'Python para finanzas', 0, '📚', '#8AADA9'),
  (1, 'servicios', NULL, NULL, 'expense', 'Agua Sedapal', 42.00, '2025-05-05', '', 1, '⚡', '#4A706C'),
  (1, 'ropa', NULL, NULL, 'expense', 'Zara', 89.00, '2025-05-03', '', 0, '👗', '#D4B8A0'),
  (1, 'otros', NULL, NULL, 'expense', 'Gas', 28.00, '2025-05-02', 'Balón de gas', 0, '📦', '#DDE9E7'),
  (1, NULL, NULL, NULL, 'income', 'Sueldo', 3600.00, '2025-05-05', 'Ingreso mensual', 1, '💼', '#4CAF7D'),
  (1, NULL, NULL, NULL, 'income', 'Freelance diseño', 800.00, '2025-05-22', 'Proyecto puntual', 0, '🎨', '#4CAF7D'),
  (1, NULL, 1, NULL, 'goal_contribution', 'Aporte Europa', 400.00, '2025-05-06', '', 1, '✈️', '#7EC8C0'),
  (1, NULL, 2, NULL, 'goal_contribution', 'Aporte Emergencia', 300.00, '2025-05-28', '', 1, '🛡️', '#5AADA5'),
  (1, NULL, 3, NULL, 'goal_contribution', 'Aporte Laptop', 200.00, '2025-05-15', '', 1, '💻', '#C9A96E'),
  (1, NULL, 4, NULL, 'goal_contribution', 'Aporte Auto', 500.00, '2025-05-01', '', 1, '🚗', '#8AADA9');

INSERT INTO app_sessions (id, user_id, session_mode, current_page, is_active, started_at) VALUES
  (1, 1, 'user', 'perfil', 1, CURRENT_TIMESTAMP);
