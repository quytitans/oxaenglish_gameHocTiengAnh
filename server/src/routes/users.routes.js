const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth, requireAdmin);

const PIN_REGEX = /^\d{4}$/;

function toPublicUser(row) {
  return { id: row.id, username: row.username, role: row.role, createdAt: row.created_at };
}

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM users ORDER BY created_at DESC').all();
  res.json({ users: rows.map(toPublicUser) });
});

router.post('/', (req, res) => {
  const { username, password, role } = req.body || {};
  if (!username || !username.trim()) {
    return res.status(400).json({ message: 'Username is required' });
  }
  if (!PIN_REGEX.test(String(password || ''))) {
    return res.status(400).json({ message: 'Password must be exactly 4 digits' });
  }
  if (!['admin', 'user'].includes(role)) {
    return res.status(400).json({ message: 'Role must be admin or user' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username.trim());
  if (existing) return res.status(409).json({ message: 'Username already exists' });

  const passwordHash = bcrypt.hashSync(String(password), 10);
  const info = db
    .prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)')
    .run(username.trim(), passwordHash, role);

  const created = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json({ user: toPublicUser(created) });
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { username, role } = req.body || {};
  const target = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  if (!target) return res.status(404).json({ message: 'User not found' });

  const nextUsername = username && username.trim() ? username.trim() : target.username;
  const nextRole = ['admin', 'user'].includes(role) ? role : target.role;

  if (nextUsername !== target.username) {
    const dup = db.prepare('SELECT id FROM users WHERE username = ? AND id != ?').get(nextUsername, id);
    if (dup) return res.status(409).json({ message: 'Username already exists' });
  }

  db.prepare('UPDATE users SET username = ?, role = ? WHERE id = ?').run(nextUsername, nextRole, id);
  const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  res.json({ user: toPublicUser(updated) });
});

router.post('/:id/reset-password', (req, res) => {
  const { id } = req.params;
  const { password } = req.body || {};
  if (!PIN_REGEX.test(String(password || ''))) {
    return res.status(400).json({ message: 'Password must be exactly 4 digits' });
  }

  const target = db.prepare('SELECT id FROM users WHERE id = ?').get(id);
  if (!target) return res.status(404).json({ message: 'User not found' });

  const passwordHash = bcrypt.hashSync(String(password), 10);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(passwordHash, id);
  res.json({ message: 'Password reset successfully' });
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;

  if (Number(id) === req.user.id) {
    return res.status(400).json({ message: 'Cannot delete the account you are logged in as' });
  }

  const target = db.prepare('SELECT id FROM users WHERE id = ?').get(id);
  if (!target) return res.status(404).json({ message: 'User not found' });

  db.prepare('DELETE FROM users WHERE id = ?').run(id);
  res.json({ message: 'Account deleted' });
});

module.exports = router;
