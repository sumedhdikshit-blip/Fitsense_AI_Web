import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, LogOut, Shield } from 'lucide-react';

export const Navbar = () => {
  const { user, profile, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const displayName = profile?.name || user?.name || user?.username || 'Athlete';
  const avatarLetter = displayName ? displayName[0].toUpperCase() : 'A';

  const navItems = [
    { path: '/app/overview', label: 'Overview' },
    { path: '/app/workout', label: 'Workout' },
    { path: '/app/history', label: 'History' },
    { path: '/app/profile-page', label: 'Profile' },
    { path: '/app/calculator', label: 'Calculator' }
  ];

  return (
    <header class="app-header">
      <div class="logo-area" onClick={() => navigate('/app/overview')} style={{ cursor: 'pointer' }}>
        <span class="logo-accent">FitSense</span>
        <span class="logo-sub">AI</span>
      </div>

      <nav class="main-nav">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div class="header-right">
        <div
          class="user-badge"
          style={{ position: 'relative', cursor: isAdmin ? 'pointer' : 'default' }}
          onClick={() => isAdmin && setDropdownOpen(!dropdownOpen)}
        >
          <div class="avatar">{avatarLetter}</div>
          <span>{displayName}</span>

          {isAdmin && dropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: '0',
                marginTop: '8px',
                background: 'var(--panel-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '8px',
                zIndex: 1000,
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                minWidth: '130px'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: 'var(--text-main)',
                  padding: '6px 12px',
                  fontSize: '13px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  setDropdownOpen(false);
                  navigate('/admin');
                }}
              >
                <Shield size={14} color="#3b82f6" />
                Admin Panel
              </div>
            </div>
          )}
        </div>

        <button
          id="themeToggleBtn"
          class="btn btn-secondary"
          onClick={toggleTheme}
          style={{
            marginLeft: '10px',
            padding: 0,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            border: '2px solid var(--border-color)',
            background: 'var(--panel-bg)',
            cursor: 'pointer'
          }}
          title="Toggle Light/Dark Mode"
        >
          {theme === 'dark' ? (
            <Sun size={18} color="#f5a623" />
          ) : (
            <Moon size={18} color="#8b9dc3" />
          )}
        </button>

        <button
          class="btn btn-danger btn-sm"
          onClick={logout}
          style={{ marginLeft: '10px' }}
        >
          Log Out
        </button>
      </div>
    </header>
  );
};
