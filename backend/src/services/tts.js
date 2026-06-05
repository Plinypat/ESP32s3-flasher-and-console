const ELEVENLABS_BASE = 'https://api.elevenlabs.io/v1';

export async function synthesizeSpeech(text, agent) {
  const {
    elevenlabs_voice_id: voiceId,
    elevenlabs_stability: stability = 0.5,
    elevenlabs_similarity: similarity = 0.75,
  } = agent;

  if (!voiceId) throw new Error('No ElevenLabs voice_id configured on agent');

  const response = await fetch(`${ELEVENLABS_BASE}/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': process.env.ELEVENLABS_API_KEY,
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_monolingual_v1',
      voice_settings: { stability, similarity_boost: similarity },
    }),
  });

  if (!response.ok) {
    const msg = await response.text();
    throw new Error(`ElevenLabs error ${response.status}: ${msg}`);
  }

  return Buffer.from(await response.arrayBuffer());
}
