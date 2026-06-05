import pool from '../db/db.js';
import { transcribeAudio } from '../services/stt.js';
import { getLLMResponse } from '../services/llm.js';
import { synthesizeSpeech } from '../services/tts.js';

export async function runAudioPipeline(deviceId, audioBuffers, ws) {
  const start = Date.now();
  let transcript = null;
  let responseText = null;

  try {
    const combined = Buffer.concat(audioBuffers);

    transcript = await transcribeAudio(combined);
    if (!transcript?.trim()) {
      ws.send(JSON.stringify({ type: 'error', message: 'Could not transcribe audio' }));
      return;
    }

    const deviceResult = await pool.query(
      `SELECT d.*, a.* FROM devices d
       LEFT JOIN agents a ON d.agent_id = a.id
       WHERE d.id = $1`,
      [deviceId]
    );
    const device = deviceResult.rows[0];
    if (!device || !device.agent_id) {
      ws.send(JSON.stringify({ type: 'error', message: 'No agent assigned to this device' }));
      return;
    }

    const agent = {
      llm_provider: device.llm_provider,
      llm_model: device.llm_model,
      system_prompt: device.system_prompt,
      elevenlabs_voice_id: device.elevenlabs_voice_id,
      elevenlabs_stability: device.elevenlabs_stability,
      elevenlabs_similarity: device.elevenlabs_similarity,
    };

    responseText = await getLLMResponse(transcript, agent);

    const audioMp3 = await synthesizeSpeech(responseText, agent);

    ws.send(JSON.stringify({ type: 'tts_start' }));

    const CHUNK = 4096;
    for (let i = 0; i < audioMp3.length; i += CHUNK) {
      ws.send(JSON.stringify({
        type: 'audio',
        data: audioMp3.slice(i, i + CHUNK).toString('base64'),
      }));
    }

    ws.send(JSON.stringify({ type: 'tts_end' }));

    const duration = Date.now() - start;
    await pool.query(
      `INSERT INTO event_logs (device_id, event_type, transcript, response, duration_ms)
       VALUES ($1, 'wake', $2, $3, $4)`,
      [deviceId, transcript, responseText, duration]
    );
  } catch (err) {
    console.error('Audio pipeline error:', err);
    ws.send(JSON.stringify({ type: 'error', message: 'Pipeline failed: ' + err.message }));
    await pool.query(
      `INSERT INTO event_logs (device_id, event_type, transcript, response, duration_ms)
       VALUES ($1, 'error', $2, $3, $4)`,
      [deviceId, transcript, err.message, Date.now() - start]
    ).catch(() => {});
  }
}
