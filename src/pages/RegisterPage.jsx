import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    await register({
      name: name.trim() || 'Demo Athlete',
      username: username.trim() || 'demo',
      password
    });

    navigate('/app/overview');
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
      <div style={{ width: '100%', maxWidth: '440px', padding: '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
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
            padding: '30px 25px',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
          }}
        >
          <div style={{ marginBottom: '20px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '6px' }}>Create Account</h2>
            <p style={{ color: '#aaaaaa', fontSize: '0.88rem' }}>Register to start custom workout logging</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  color: '#aaaaaa',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  color: '#ffffff',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '0.8rem',
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
                placeholder="Choose a username"
                autoComplete="username"
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  color: '#ffffff',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '0.8rem',
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
                placeholder="Choose a password"
                autoComplete="new-password"
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  color: '#ffffff',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  color: '#aaaaaa',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                autoComplete="new-password"
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  color: '#ffffff',
                  fontSize: '0.9rem'
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
                padding: '12px',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: 'pointer',
                marginTop: '10px'
              }}
            >
              Sign Up
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.85rem', color: '#aaaaaa' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#00e676', textDecoration: 'none', fontWeight: 500 }}>
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
