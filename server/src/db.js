const path = require('path');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');
const bcrypt = require('bcryptjs');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new DatabaseSync(path.join(dataDir, 'app.db'));
db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS flashcard_sets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    visibility TEXT NOT NULL DEFAULT 'public',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS flashcards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    set_id INTEGER NOT NULL REFERENCES flashcard_sets(id) ON DELETE CASCADE,
    vi TEXT NOT NULL,
    en TEXT NOT NULL,
    order_index INTEGER NOT NULL
  );
`);

// Migration: older databases were created before `visibility` existed.
const setColumns = db.prepare('PRAGMA table_info(flashcard_sets)').all();
if (!setColumns.some((c) => c.name === 'visibility')) {
  db.exec("ALTER TABLE flashcard_sets ADD COLUMN visibility TEXT NOT NULL DEFAULT 'public'");
}

// Seed default accounts (idempotent: only inserts ones that don't exist yet).
const insertUser = db.prepare(
  'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)'
);
const findUser = db.prepare('SELECT id FROM users WHERE username = ?');
const defaultAccounts = [
  { username: 'admin', password: process.env.SEED_ADMIN_PASSWORD || '0000', role: 'admin' },
  { username: 'user', password: process.env.SEED_USER_PASSWORD || '1111', role: 'user' },
];
for (const acc of defaultAccounts) {
  if (!findUser.get(acc.username)) {
    insertUser.run(acc.username, bcrypt.hashSync(acc.password, 10), acc.role);
    console.log(`Seeded default account -> ${acc.username}/${acc.password} (${acc.role})`);
  }
}

module.exports = db;
