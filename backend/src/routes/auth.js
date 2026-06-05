import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../db/db.js';

const router = Router();

router.post('/register', async (req, res) => {
  const { org_name, email, password } = req.body;
  if (!org_name || !email || !password) {
    return res.status(400).json({ error: 'org_name, email, and password are required' });
  }
  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const result = await pool.query(`
      WITH new_org AS (
        INSERT INTO organizations (name) VALUES ($1) RETURNING id
      ),
      new_user AS (
        INSERT INTO users (org_id, email, password_hash, role)
        SELECT id, $2, $3, 'admin' FROM new_org
        RETURNING id, org_id, email, role
      )
      SELECT new_user.*, new_org.id AS org_id FROM new_user, new_org
    `, [org_name, email, passwordHash]);

    const user = result.rows[0];
    const token = jwt.sign(
      { user_id: user.id, org_id: user.org_id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.status(201).json({ token, user: { id: user.id, email: user.email, role: user.role, org_id: user.org_id } });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Email already registered' });
    }
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }
  try {
    const result = await pool.query(
      'SELECT id, org_id, email, password_hash, role FROM users WHERE email = $1',
      [email]
    );
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { user_id: user.id, org_id: user.org_id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.json({ token, user: { id: user.id, email: user.email, role: user.role, org_id: user.org_id } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;
