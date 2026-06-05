import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Devices from './pages/Devices.jsx';
import DeviceDetail from './pages/DeviceDetail.jsx';
import Agents from './pages/Agents.jsx';
import AgentEditor from './pages/AgentEditor.jsx';
import Firmware from './pages/Firmware.jsx';
import Logs from './pages/Logs.jsx';
import NavBar from './components/NavBar.jsx';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
          <Route path="/devices" element={<ProtectedRoute><Layout><Devices /></Layout></ProtectedRoute>} />
          <Route path="/devices/:id" element={<ProtectedRoute><Layout><DeviceDetail /></Layout></ProtectedRoute>} />
          <Route path="/agents" element={<ProtectedRoute><Layout><Agents /></Layout></ProtectedRoute>} />
          <Route path="/agents/:id" element={<ProtectedRoute><Layout><AgentEditor /></Layout></ProtectedRoute>} />
          <Route path="/agents/new" element={<ProtectedRoute><Layout><AgentEditor /></Layout></ProtectedRoute>} />
          <Route path="/firmware" element={<ProtectedRoute><Layout><Firmware /></Layout></ProtectedRoute>} />
          <Route path="/logs" element={<ProtectedRoute><Layout><Logs /></Layout></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
