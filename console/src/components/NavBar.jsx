import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/devices', label: 'Devices' },
  { to: '/agents', label: 'Agents' },
  { to: '/firmware', label: 'Firmware' },
  { to: '/logs', label: 'Logs' },
];

export default function NavBar() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();

  return (
    <nav className="bg-gray-900 text-white px-6 py-3 flex items-center gap-6">
      <span className="font-bold text-yellow-400 text-lg mr-4">Hive Voice</span>
      {links.map(l => (
        <Link
          key={l.to}
          to={l.to}
          className={`text-sm hover:text-yellow-300 transition-colors ${pathname.startsWith(l.to) ? 'text-yellow-400 font-semibold' : 'text-gray-300'}`}
        >
          {l.label}
        </Link>
      ))}
      <div className="ml-auto flex items-center gap-4">
        <span className="text-xs text-gray-400">{user?.email}</span>
        <button onClick={logout} className="text-xs text-gray-400 hover:text-white">Logout</button>
      </div>
    </nav>
  );
}
