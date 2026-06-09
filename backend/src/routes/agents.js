import { Router } from 'express';
import pool from '../db/db.js';
import { authMiddleware } from '../middleware/auth.js';
import { synthesizeSpeech } from '../services/tts.js';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, COUNT(d.id)::int AS device_count
       FROM agents a
       LEFT JOIN devices d ON d.agent_id = a.id
       WHERE a.org_id = $1
       GROUP BY a.id
       ORDER BY a.created_at DESC`,
      [req.user.org_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
});

router.post('/', async (req, res) => {
  const {
    name, system_prompt, llm_provider, llm_model,
    elevenlabs_voice_id, elevenlabs_stability, elevenlabs_similarity
  } = req.body;
  if (!name || !system_prompt) {
    return res.status(400).json({ error: 'name and system_prompt are required' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO agents (org_id, name, system_prompt, llm_provider, llm_model,
        elevenlabs_voice_id, elevenlabs_stability, elevenlabs_similarity)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [
        req.user.org_id, name, system_prompt,
        llm_provider || 'anthropic',
        llm_model || 'claude-sonnet-4-5',
        elevenlabs_voice_id || null,
        elevenlabs_stability ?? 0.5,
        elevenlabs_similarity ?? 0.75
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create agent' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, COALESCE(json_agg(d.*) FILTER (WHERE d.id IS NOT NULL), '[]') AS devices
       FROM agents a
       LEFT JOIN devices d ON d.agent_id = a.id
       WHERE a.id = $1 AND a.org_id = $2
       GROUP BY a.id`,
      [req.params.id, req.user.org_id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Agent not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch agent' });
  }
});

router.put('/:id', async (req, res) => {
  const {
    name, system_prompt, llm_provider, llm_model,
    elevenlabs_voice_id, elevenlabs_stability, elevenlabs_similarity
  } = req.body;
  try {
    const result = await pool.query(
      `UPDATE agents SET
        name = COALESCE($1, name),
        system_prompt = COALESCE($2, system_prompt),
        llm_provider = COALESCE($3, llm_provider),
        llm_model = COALESCE($4, llm_model),
        elevenlabs_voice_id = COALESCE($5, elevenlabs_voice_id),
        elevenlabs_stability = COALESCE($6, elevenlabs_stability),
        elevenlabs_similarity = COALESCE($7, elevenlabs_similarity)
       WHERE id = $8 AND org_id = $9
       RETURNING *`,
      [
        name, system_prompt, llm_provider, llm_model,
        elevenlabs_voice_id,
        elevenlabs_stability !== undefined ? elevenlabs_stability : null,
        elevenlabs_similarity !== undefined ? elevenlabs_similarity : null,
        req.params.id, req.user.org_id
      ]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Agent not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update agent' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM agents WHERE id = $1 AND org_id = $2 RETURNING id',
      [req.params.id, req.user.org_id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Agent not found' });
    res.json({ deleted: req.params.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete agent' });
  }
});

router.post('/test-voice', async (req, res) => {
  const { elevenlabs_voice_id, elevenlabs_stability, elevenlabs_similarity } = req.body;
  if (!elevenlabs_voice_id) return res.status(400).json({ error: 'voice_id is required' });
  try {
    const audio = await synthesizeSpeech(
      'Hello, I am your Hive voice assistant. How can I help you today?',
      { elevenlabs_voice_id, elevenlabs_stability: elevenlabs_stability ?? 0.5, elevenlabs_similarity: elevenlabs_similarity ?? 0.75 }
    );
    res.set('Content-Type', 'audio/mpeg');
    res.send(audio);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
