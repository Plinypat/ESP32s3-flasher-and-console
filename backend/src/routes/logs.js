import { Router } from 'express';
import pool from '../db/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

router.get('/:device_id', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 50, 500);
  const offset = parseInt(req.query.offset) || 0;
  try {
    const deviceCheck = await pool.query(
      'SELECT id FROM devices WHERE id = $1 AND org_id = $2',
      [req.params.device_id, req.user.org_id]
    );
    if (!deviceCheck.rows.length) return res.status(404).json({ error: 'Device not found' });

    const result = await pool.query(
      `SELECT * FROM event_logs
       WHERE device_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.params.device_id, limit, offset]
    );
    const total = await pool.query(
      'SELECT COUNT(*)::int FROM event_logs WHERE device_id = $1',
      [req.params.device_id]
    );
    res.json({ logs: result.rows, total: total.rows[0].count, limit, offset });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

export default router;
