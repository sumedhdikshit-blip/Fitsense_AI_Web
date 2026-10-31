import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, LogOut } from 'lucide-react';

export const AdminNavbar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="navbar">
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div className="navbar-brand">
          <span className="brand-title">FitSense <span className="brand-sub">AI</span></span>
          <span className="nav-separator">|</span>
          <span className="brand-context">Admin Dashboard</span>
        </div>
        <nav className="admin-nav" style={{ display: 'flex', gap: '20px', marginLeft: '30px' }}>
          <span style={{ color: '#4facfe', fontWeight: 600, fontSize: '0.95rem' }}>Dashboard</span>
        </nav>
      </div>

      <div className="navbar-actions">
        <button
          className="btn btn-nav"
          onClick={() => navigate('/app/overview')}
        >
          <Home size={16} />
          Home Tracker
        </button>
        <button
          className="btn btn-danger"
          onClick={logout}
        >
          <LogOut size={16} />
          Log Out
        </button>
      </div>
    </header>
  );
};
