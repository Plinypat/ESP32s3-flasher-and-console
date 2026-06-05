import React, { useState } from 'react';

export default function VoiceTestButton({ voiceId, stability, similarity }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function testVoice() {
    if (!voiceId) return setError('Enter a Voice ID first');
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'xi-api-key': '',
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        body: JSON.stringify({
          text: 'Hello, I am your Hive voice assistant. How can I help you today?',
          model_id: 'eleven_monolingual_v1',
          voice_settings: { stability: stability ?? 0.5, similarity_boost: similarity ?? 0.75 },
        }),
      });
      if (!res.ok) throw new Error(`ElevenLabs returned ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      new Audio(url).play();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={testVoice}
        disabled={loading}
        className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 text-sm"
      >
        {loading ? 'Generating…' : 'Test Voice'}
      </button>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
