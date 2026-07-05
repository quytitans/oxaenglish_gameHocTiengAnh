const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { requireAuth, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

router.post('/login', (req, res) => {
  const { account, password } = req.body || {};
  if (!account || !password) {
    return res.status(400).json({ message: 'Account and password are required' });
  }

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(account);
  if (!user || !bcrypt.compareSync(String(password), user.password_hash)) {
    return res.status(401).json({ message: 'Sai tài khoản hoặc mật khẩu' });
  }

  // No expiresIn on purpose: session stays valid until the user logs out.
  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET
  );

  res.json({
    token,
    user: { id: user.id, username: user.username, role: user.role },
  });
});

router.get('/me', requireAuth, (req, res) => {
  const user = db
    .prepare('SELECT id, username, role FROM users WHERE id = ?')
    .get(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ user });
});

module.exports = router;
