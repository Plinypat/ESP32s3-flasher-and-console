import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDevices } from '../api/devices.js';
import { getAgents } from '../api/agents.js';

function StatCard({ label, value, to }) {
  const inner = (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
  return to ? <Link to={to}>{inner}</Link> : inner;
}

export default function Dashboard() {
  const [devices, setDevices] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDevices(), getAgents()])
      .then(([d, a]) => { setDevices(d); setAgents(a); })
      .finally(() => setLoading(false));
  }, []);

  const online = devices.filter(d => d.status === 'online').length;

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Dashboard</h2>
      {loading ? <p className="text-gray-400">Loading…</p> : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Devices" value={devices.length} to="/devices" />
          <StatCard label="Online Now" value={online} to="/devices" />
          <StatCard label="Agents" value={agents.length} to="/agents" />
          <StatCard label="Offline" value={devices.length - online} to="/devices" />
        </div>
      )}

      <h3 className="text-lg font-semibold text-gray-800 mt-10 mb-4">Recent Devices</h3>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {devices.slice(0, 5).map(d => (
          <Link key={d.id} to={`/devices/${d.id}`}
            className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0">
            <div>
              <p className="font-medium text-gray-800">{d.name || d.id}</p>
              <p className="text-xs text-gray-400">FW: {d.firmware_version || 'unknown'}</p>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full ${d.status === 'online' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {d.status}
            </span>
          </Link>
        ))}
        {!devices.length && <p className="text-gray-400 text-sm px-6 py-4">No devices registered yet.</p>}
      </div>
    </div>
  );
}
