import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, LogOut } from 'lucide-react';

export const AdminNavbar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header class="navbar">
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div class="navbar-brand">
          <span class="brand-title">FitSense <span class="brand-sub">AI</span></span>
          <span class="nav-separator">|</span>
          <span class="brand-context">Admin Dashboard</span>
        </div>
        <nav class="admin-nav" style={{ display: 'flex', gap: '20px', marginLeft: '30px' }}>
          <span style={{ color: '#4facfe', fontWeight: 600, fontSize: '0.95rem' }}>Dashboard</span>
        </nav>
      </div>

      <div class="navbar-actions">
        <button
          class="btn btn-nav"
          onClick={() => navigate('/app/overview')}
        >
          <Home size={16} />
          Home Tracker
        </button>
        <button
          class="btn btn-danger"
          onClick={logout}
        >
          <LogOut size={16} />
          Log Out
        </button>
      </div>
    </header>
  );
};
