import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const userLogin = username.trim();
      const data = await login({ username: userLogin, password });
      navigate(data?.is_admin ? '/admin' : '/app/overview');
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(Array.isArray(detail) ? detail.map((item) => item.msg).join(' ') : detail || 'Invalid username or password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#121212',
        backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(0, 230, 118, 0.08) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(68, 23, 255, 0.08) 0%, transparent 40%)',
        color: '#ffffff',
        fontFamily: "'Inter', sans-serif"
      }}
    >
      <div style={{ width: '100%', maxWidth: '420px', padding: '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <span
            style={{
              fontWeight: 800,
              fontSize: '2.2rem',
              background: 'linear-gradient(135deg, #ffffff 30%, #00e676 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-1px'
            }}
          >
            FitSense
          </span>
          <span
            style={{
              fontWeight: 800,
              fontSize: '1.2rem',
              color: '#00e676',
              border: '1.5px solid #00e676',
              padding: '1px 6px',
              borderRadius: '4px',
              marginLeft: '4px',
              verticalAlign: 'middle'
            }}
          >
            AI
          </span>
        </div>

        <div
          style={{
            background: 'rgba(30, 30, 30, 0.75)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '40px 30px',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
          }}
        >
          <div style={{ marginBottom: '25px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '6px' }}>Welcome Back</h2>
            <p style={{ color: '#aaaaaa', fontSize: '0.9rem' }}>Sign in to track your workout session</p>
          </div>

          {error && (
            <div className="feedback-badge badge-red" role="alert" style={{ marginBottom: '16px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  color: '#aaaaaa',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username (e.g. demo or admin)"
                autoComplete="username"
                className="form-control"
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  color: '#ffffff',
                  fontSize: '0.95rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  color: '#aaaaaa',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                className="form-control"
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  color: '#ffffff',
                  fontSize: '0.95rem'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%',
                background: '#00e676',
                color: '#0b0f19',
                border: 'none',
                borderRadius: '8px',
                padding: '13px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                marginTop: '10px',
                transition: 'all 0.2s ease'
              }}
            >
              Sign In
            </button>
          </form>

          <div style={{ marginTop: '25px', textAlign: 'center', fontSize: '0.88rem', color: '#aaaaaa' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#00e676', textDecoration: 'none', fontWeight: 500 }}>
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
