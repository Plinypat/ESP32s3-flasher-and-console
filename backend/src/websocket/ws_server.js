import { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import pool from '../db/db.js';
import { runAudioPipeline } from './audio_pipeline.js';

const sessions = new Map();

export function attachWebSocket(server) {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws, req) => {
    const sessionId = uuidv4();
    const session = { deviceId: null, audioBuffers: [], listening: false };
    sessions.set(sessionId, session);

    ws.send(JSON.stringify({ type: 'hello', session_id: sessionId }));

    ws.on('message', async (raw) => {
      let msg;
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        return;
      }

      if (msg.type === 'hello') {
        session.deviceId = msg.device_id;
        await pool.query(
          `UPDATE devices SET last_seen = NOW(), status = 'online', firmware_version = COALESCE($1, firmware_version)
           WHERE id = $2`,
          [msg.version || null, msg.device_id]
        ).catch(() => {});
      }

      if (msg.type === 'wake') {
        session.listening = true;
        session.audioBuffers = [];
      }

      if (msg.type === 'audio' && session.listening) {
        session.audioBuffers.push(Buffer.from(msg.data, 'base64'));
      }

      if (msg.type === 'end' && session.listening) {
        session.listening = false;
        const buffers = session.audioBuffers.splice(0);
        if (session.deviceId && buffers.length) {
          runAudioPipeline(session.deviceId, buffers, ws);
        }
      }
    });

    ws.on('close', async () => {
      sessions.delete(sessionId);
      if (session.deviceId) {
        await pool.query(
          `UPDATE devices SET status = 'offline' WHERE id = $1`,
          [session.deviceId]
        ).catch(() => {});
      }
    });

    ws.on('error', (err) => {
      console.error('WebSocket error:', err.message);
    });
  });

  console.log('WebSocket server attached at /ws');
  return wss;
}
