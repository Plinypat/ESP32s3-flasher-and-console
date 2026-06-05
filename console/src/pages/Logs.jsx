import React, { useEffect, useState } from 'react';
import { getDevices } from '../api/devices.js';
import { getLogs } from '../api/logs.js';
import LogTable from '../components/LogTable.jsx';

export default function Logs() {
  const [devices, setDevices] = useState([]);
  const [selected, setSelected] = useState('');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getDevices().then(d => { setDevices(d); if (d.length) setSelected(d[0].id); });
  }, []);

  useEffect(() => {
    if (!selected) return;
    setLoading(true);
    getLogs(selected, { limit: 100 })
      .then(l => setLogs(l.logs || []))
      .finally(() => setLoading(false));
  }, [selected]);

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-xl font-bold text-gray-900">Event Logs</h2>
        <select value={selected} onChange={e => setSelected(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-yellow-400 outline-none">
          {devices.map(d => <option key={d.id} value={d.id}>{d.name || d.id}</option>)}
        </select>
      </div>
      {loading ? <p className="text-gray-400">Loading…</p> : <LogTable logs={logs} />}
    </div>
  );
}
