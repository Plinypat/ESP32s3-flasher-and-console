import { Router } from 'express';
import pool from '../db/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT d.*, a.name AS agent_name
       FROM devices d
       LEFT JOIN agents a ON d.agent_id = a.id
       WHERE d.org_id = $1
       ORDER BY d.created_at DESC`,
      [req.user.org_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
});

router.post('/', async (req, res) => {
  const { id, name, agent_id } = req.body;
  if (!id) return res.status(400).json({ error: 'Device id (UUID) is required' });
  try {
    const result = await pool.query(
      `INSERT INTO devices (id, org_id, name, agent_id)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, agent_id = EXCLUDED.agent_id
       RETURNING *`,
      [id, req.user.org_id, name || null, agent_id || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to register device' });
  }
});

router.put('/:id', async (req, res) => {
  const { name, agent_id } = req.body;
  try {
    const result = await pool.query(
      `UPDATE devices SET name = COALESCE($1, name), agent_id = COALESCE($2, agent_id)
       WHERE id = $3 AND org_id = $4
       RETURNING *`,
      [name || null, agent_id || null, req.params.id, req.user.org_id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Device not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update device' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM devices WHERE id = $1 AND org_id = $2 RETURNING id',
      [req.params.id, req.user.org_id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Device not found' });
    res.json({ deleted: req.params.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete device' });
  }
});

export default router;
