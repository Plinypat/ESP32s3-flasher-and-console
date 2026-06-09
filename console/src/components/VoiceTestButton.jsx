import React, { useState } from 'react';
import client from '../api/client.js';

export default function VoiceTestButton({ voiceId, stability, similarity }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function testVoice() {
    if (!voiceId) return setError('Select or enter a Voice ID first');
    setLoading(true);
    setError(null);
    try {
      const res = await client.post('/agents/test-voice', {
        elevenlabs_voice_id: voiceId,
        elevenlabs_stability: stability ?? 0.5,
        elevenlabs_similarity: similarity ?? 0.75,
      }, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      new Audio(url).play();
    } catch (e) {
      setError(e.response?.data?.error || e.message);
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
