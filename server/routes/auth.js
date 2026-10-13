// server/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

function generateToken(user) {
  return jwt.sign(
    { id: user.id, author_id: user.author_id, email: user.email, role: user.role },
    config.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(email.trim());
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const valid = bcrypt.compareSync(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = generateToken(user);
  const { password_hash, ...safeUser } = user;

  res.json({
    token,
    user: safeUser
  });
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// GET /api/auth/personas - Lists authors and admin for reviewer demo switching
router.get('/personas', (req, res) => {
  const users = db.prepare(`
    SELECT author_id, name, email, role, city, joined_date
    FROM users
    ORDER BY role DESC, author_id ASC
  `).all();

  res.json({ personas: users });
});

// POST /api/auth/switch-persona - Switch directly into any seeded user for effortless testing
router.post('/switch-persona', (req, res) => {
  const { author_id, email } = req.body;
  let user;

  if (author_id) {
    user = db.prepare('SELECT * FROM users WHERE author_id = ?').get(author_id);
  } else if (email) {
    user = db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(email);
  }

  if (!user) {
    return res.status(404).json({ error: 'Persona not found.' });
  }

  const token = generateToken(user);
  const { password_hash, ...safeUser } = user;

  res.json({
    token,
    user: safeUser
  });
});

module.exports = router;
