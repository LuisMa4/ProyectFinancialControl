# Database

This folder contains the SQLite schema and seed data for the app.

- `schema.sql`: creates the core tables for users, sessions, categories, cards, goals, and transactions.
- `seed.sql`: inserts demo data that matches the current React app mock data.

Recommended database file name:

- `financial_control.sqlite`

Rebuild flow:

1. Create an empty SQLite database file.
2. Run `schema.sql`.
3. Run `seed.sql`.
