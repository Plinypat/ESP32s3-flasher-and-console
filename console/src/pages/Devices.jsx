import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDevices, deleteDevice } from '../api/devices.js';
import { getAgents } from '../api/agents.js';
import StatusBadge from '../components/StatusBadge.jsx';

export default function Devices() {
  const [devices, setDevices] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => Promise.all([getDevices(), getAgents()])
    .then(([d, a]) => { setDevices(d); setAgents(a); })
    .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  async function remove(id) {
    if (!confirm('Delete this device?')) return;
    await deleteDevice(id);
    load();
  }

  const agentMap = Object.fromEntries(agents.map(a => [a.id, a.name]));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Devices</h2>
      </div>
      {loading ? <p className="text-gray-400">Loading…</p> : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 text-left">Name / ID</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Agent</th>
                <th className="px-6 py-3 text-left">Firmware</th>
                <th className="px-6 py-3 text-left">Last Seen</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {devices.map(d => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3">
                    <Link to={`/devices/${d.id}`} className="font-medium text-gray-800 hover:text-yellow-600">
                      {d.name || 'Unnamed'}
                    </Link>
                    <p className="text-xs text-gray-400 font-mono">{d.id}</p>
                  </td>
                  <td className="px-6 py-3"><StatusBadge status={d.status} /></td>
                  <td className="px-6 py-3 text-gray-600">{agentMap[d.agent_id] || '—'}</td>
                  <td className="px-6 py-3 text-gray-500">{d.firmware_version || '—'}</td>
                  <td className="px-6 py-3 text-gray-400">
                    {d.last_seen ? new Date(d.last_seen).toLocaleString() : '—'}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button onClick={() => remove(d.id)} className="text-red-400 hover:text-red-600 text-xs">Delete</button>
                  </td>
                </tr>
              ))}
              {!devices.length && (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">No devices yet. Flash a board to register it automatically.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
