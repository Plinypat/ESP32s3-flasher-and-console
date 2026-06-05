import React from 'react';

export default function StatusBadge({ status }) {
  const colors = {
    online: 'bg-green-100 text-green-800',
    offline: 'bg-gray-100 text-gray-600',
    error: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors[status] || colors.offline}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`} />
      {status}
    </span>
  );
}
