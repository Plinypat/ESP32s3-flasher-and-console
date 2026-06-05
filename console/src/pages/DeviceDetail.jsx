import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getDevices, updateDevice } from '../api/devices.js';
import { getAgents } from '../api/agents.js';
import { getLogs } from '../api/logs.js';
import StatusBadge from '../components/StatusBadge.jsx';
import LogTable from '../components/LogTable.jsx';

export default function DeviceDetail() {
  const { id } = useParams();
  const [device, setDevice] = useState(null);
  const [agents, setAgents] = useState([]);
  const [logs, setLogs] = useState([]);
  const [name, setName] = useState('');
  const [agentId, setAgentId] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    Promise.all([getDevices(), getAgents(), getLogs(id)])
      .then(([devices, a, l]) => {
        const d = devices.find(x => x.id === id);
        setDevice(d);
        setName(d?.name || '');
        setAgentId(d?.agent_id || '');
        setAgents(a);
        setLogs(l.logs || []);
      });
  }, [id]);

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      await updateDevice(id, { name, agent_id: agentId || null });
      setMsg('Saved');
    } catch {
      setMsg('Save failed');
    } finally {
      setSaving(false);
    }
  }

  if (!device) return <p className="text-gray-400">Loading…</p>;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-xl font-bold text-gray-900">{device.name || 'Unnamed Device'}</h2>
        <StatusBadge status={device.status} />
      </div>
      <p className="text-xs text-gray-400 font-mono mb-6">{device.id}</p>

      <form onSubmit={save} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4 mb-8">
        <h3 className="font-semibold text-gray-800">Settings</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input value={name} onChange={e => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-400 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Agent</label>
          <select value={agentId} onChange={e => setAgentId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-400 outline-none">
            <option value="">— None —</option>
            {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-4">
          <button type="submit" disabled={saving}
            className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium rounded-lg text-sm disabled:opacity-50">
            {saving ? 'Saving…' : 'Save'}
          </button>
          {msg && <span className="text-sm text-gray-500">{msg}</span>}
        </div>
      </form>

      <h3 className="font-semibold text-gray-800 mb-3">Event Logs</h3>
      <LogTable logs={logs} />
    </div>
  );
}
