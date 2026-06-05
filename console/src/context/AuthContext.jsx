import React, { createContext, useContext, useState } from 'react';
import client from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hive_user')); } catch { return null; }
  });

  async function login(email, password) {
    const res = await client.post('/auth/login', { email, password });
    localStorage.setItem('hive_token', res.data.token);
    localStorage.setItem('hive_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  }

  async function register(orgName, email, password) {
    const res = await client.post('/auth/register', { org_name: orgName, email, password });
    localStorage.setItem('hive_token', res.data.token);
    localStorage.setItem('hive_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  }

  function logout() {
    localStorage.removeItem('hive_token');
    localStorage.removeItem('hive_user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
