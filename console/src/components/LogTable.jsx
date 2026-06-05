import React from 'react';

export default function LogTable({ logs }) {
  if (!logs?.length) return <p className="text-gray-500 text-sm">No logs yet.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
        <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
          <tr>
            <th className="px-4 py-2 text-left">Time</th>
            <th className="px-4 py-2 text-left">Type</th>
            <th className="px-4 py-2 text-left">Transcript</th>
            <th className="px-4 py-2 text-left">Response</th>
            <th className="px-4 py-2 text-right">ms</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {logs.map(log => (
            <tr key={log.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 text-gray-500 whitespace-nowrap">
                {new Date(log.created_at).toLocaleString()}
              </td>
              <td className="px-4 py-2">
                <span className={`px-1.5 py-0.5 rounded text-xs ${log.event_type === 'error' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                  {log.event_type}
                </span>
              </td>
              <td className="px-4 py-2 max-w-xs truncate">{log.transcript || '—'}</td>
              <td className="px-4 py-2 max-w-xs truncate">{log.response || '—'}</td>
              <td className="px-4 py-2 text-right text-gray-500">{log.duration_ms ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
