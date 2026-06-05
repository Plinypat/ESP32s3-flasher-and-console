import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAgents, deleteAgent } from '../api/agents.js';

export default function Agents() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => getAgents().then(setAgents).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  async function remove(id) {
    if (!confirm('Delete this agent?')) return;
    await deleteAgent(id);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Agents</h2>
        <Link to="/agents/new" className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium rounded-lg text-sm">
          + New Agent
        </Link>
      </div>
      {loading ? <p className="text-gray-400">Loading…</p> : (
        <div className="grid gap-4">
          {agents.map(a => (
            <div key={a.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center justify-between">
              <div>
                <Link to={`/agents/${a.id}`} className="font-semibold text-gray-800 hover:text-yellow-600">{a.name}</Link>
                <p className="text-xs text-gray-400 mt-0.5">{a.llm_provider} / {a.llm_model} · {a.device_count} device{a.device_count !== 1 ? 's' : ''}</p>
              </div>
              <div className="flex gap-3">
                <Link to={`/agents/${a.id}`} className="text-sm text-blue-500 hover:underline">Edit</Link>
                <button onClick={() => remove(a.id)} className="text-sm text-red-400 hover:text-red-600">Delete</button>
              </div>
            </div>
          ))}
          {!agents.length && <p className="text-gray-400 text-sm">No agents yet.</p>}
        </div>
      )}
    </div>
  );
}
