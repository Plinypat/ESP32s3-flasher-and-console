import { Router } from 'express';
import multer from 'multer';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import pool from '../db/db.js';
import { authMiddleware, adminOnly } from '../middleware/auth.js';

const router = Router();

const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION || 'auto',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Public — device polls this on boot
router.get('/latest', async (req, res) => {
  const { device_id, version } = req.query;
  if (!device_id || !version) {
    return res.status(400).json({ error: 'device_id and version are required' });
  }
  try {
    const fwResult = await pool.query(
      'SELECT * FROM firmware_versions WHERE is_latest = TRUE LIMIT 1'
    );
    if (!fwResult.rows.length) {
      return res.json({ update_available: false });
    }
    const latest = fwResult.rows[0];
    if (latest.version === version) {
      return res.json({ update_available: false });
    }

    const url = await getSignedUrl(
      s3,
      new GetObjectCommand({ Bucket: process.env.S3_BUCKET, Key: latest.s3_key }),
      { expiresIn: 3600 }
    );

    await pool.query(
      `UPDATE devices SET last_seen = NOW(), firmware_version = $1 WHERE id = $2`,
      [version, device_id]
    );

    res.json({ update_available: true, version: latest.version, url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'OTA check failed' });
  }
});

// Public — flasher fetches version list
router.get('/versions', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, version, release_notes, is_latest, created_at FROM firmware_versions ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch versions' });
  }
});

// Authenticated admin — upload new firmware
router.post('/upload', authMiddleware, adminOnly, upload.single('firmware'), async (req, res) => {
  const { version, release_notes, set_latest } = req.body;
  if (!version || !req.file) {
    return res.status(400).json({ error: 'version and firmware file are required' });
  }
  const s3Key = `firmware/${version}.bin`;
  try {
    await s3.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: s3Key,
      Body: req.file.buffer,
      ContentType: 'application/octet-stream',
    }));

    if (set_latest === 'true' || set_latest === true) {
      await pool.query('UPDATE firmware_versions SET is_latest = FALSE');
    }

    const result = await pool.query(
      `INSERT INTO firmware_versions (version, s3_key, release_notes, is_latest)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (version) DO UPDATE SET s3_key = EXCLUDED.s3_key,
         release_notes = EXCLUDED.release_notes, is_latest = EXCLUDED.is_latest
       RETURNING *`,
      [version, s3Key, release_notes || null, set_latest === 'true' || set_latest === true]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Firmware upload failed' });
  }
});

export default router;
