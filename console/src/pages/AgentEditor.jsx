import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAgent, createAgent, updateAgent } from '../api/agents.js';
import VoiceTestButton from '../components/VoiceTestButton.jsx';

const MODELS = {
  anthropic: ['claude-sonnet-4-5', 'claude-opus-4-5', 'claude-haiku-4-5'],
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'],
};

const DEFAULT = {
  name: '',
  system_prompt: 'You are a helpful voice assistant. Keep responses concise and conversational.',
  llm_provider: 'anthropic',
  llm_model: 'claude-sonnet-4-5',
  elevenlabs_voice_id: '',
  elevenlabs_stability: 0.5,
  elevenlabs_similarity: 0.75,
};

export default function AgentEditor() {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const [form, setForm] = useState(DEFAULT);
  const [devices, setDevices] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isNew) {
      getAgent(id).then(a => {
        setForm({
          name: a.name,
          system_prompt: a.system_prompt,
          llm_provider: a.llm_provider,
          llm_model: a.llm_model,
          elevenlabs_voice_id: a.elevenlabs_voice_id || '',
          elevenlabs_stability: a.elevenlabs_stability,
          elevenlabs_similarity: a.elevenlabs_similarity,
        });
        setDevices(a.devices || []);
      });
    }
  }, [id]);

  const set = (k) => (e) => {
    const val = e.target.type === 'range' ? parseFloat(e.target.value) : e.target.value;
    setForm(f => {
      const next = { ...f, [k]: val };
      if (k === 'llm_provider') next.llm_model = MODELS[val][0];
      return next;
    });
  };

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (isNew) {
        const a = await createAgent(form);
        navigate(`/agents/${a.id}`);
      } else {
        await updateAgent(id, form);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-bold text-gray-900 mb-6">{isNew ? 'New Agent' : 'Edit Agent'}</h2>
      <form onSubmit={submit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input value={form.name} onChange={set('name')} required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-400 outline-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">System Prompt</label>
          <textarea value={form.system_prompt} onChange={set('system_prompt')} required rows={10}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono resize-y focus:ring-2 focus:ring-yellow-400 outline-none" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">LLM Provider</label>
            <select value={form.llm_provider} onChange={set('llm_provider')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-400 outline-none">
              <option value="anthropic">Anthropic (Claude)</option>
              <option value="openai">OpenAI</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
            <select value={form.llm_model} onChange={set('llm_model')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-400 outline-none">
              {MODELS[form.llm_provider].map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ElevenLabs Voice ID</label>
          <input value={form.elevenlabs_voice_id} onChange={set('elevenlabs_voice_id')} placeholder="Paste voice ID from ElevenLabs"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-yellow-400 outline-none" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stability: {form.elevenlabs_stability.toFixed(2)}</label>
            <input type="range" min="0" max="1" step="0.05" value={form.elevenlabs_stability} onChange={set('elevenlabs_stability')}
              className="w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Similarity: {form.elevenlabs_similarity.toFixed(2)}</label>
            <input type="range" min="0" max="1" step="0.05" value={form.elevenlabs_similarity} onChange={set('elevenlabs_similarity')}
              className="w-full" />
          </div>
        </div>

        <VoiceTestButton
          voiceId={form.elevenlabs_voice_id}
          stability={form.elevenlabs_stability}
          similarity={form.elevenlabs_similarity}
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button type="submit" disabled={saving}
          className="px-6 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-lg text-sm disabled:opacity-50">
          {saving ? 'Saving…' : 'Save Agent'}
        </button>
      </form>

      {!isNew && devices.length > 0 && (
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-700 mb-3">Assigned Devices</h3>
          <ul className="space-y-1">
            {devices.map(d => (
              <li key={d.id} className="text-sm text-gray-600">
                {d.name || d.id}
                <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${d.status === 'online' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {d.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
