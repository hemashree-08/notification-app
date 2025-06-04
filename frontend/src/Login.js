import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBackendUrl } from './components/Dashboard';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/auth/login`,  {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (response.ok) {
        const userData = {
          userId: data.userId,
          username: data.username,
          timestamp: new Date().toISOString()
        };
        if (onLogin) onLogin(userData);
        navigate('/dashboard');
      } else {
        alert(data.message || 'Login failed!');
      }
    } catch (error) {
      alert('An error occurred during login.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }}>
      <div className="login-card" style={{
        background: 'rgba(255,255,255,0.95)',
        borderRadius: '18px',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.25)',
        padding: '2.2rem 1.5rem 2rem 1.5rem',
        minWidth: 260,
        maxWidth: 320,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <h1 style={{
          fontFamily: 'Segoe UI, sans-serif',
          fontWeight: 700,
          fontSize: '2rem',
          color: '#4f3ca7',
          marginBottom: '1.5rem',
          letterSpacing: 1
        }}>Welcome Back</h1>
        <form onSubmit={handleLogin} style={{ width: '100%' }}>
          <div style={{ marginBottom: '1.3rem' }}>
            <label htmlFor="username" style={{
              display: 'block',
              marginBottom: 7,
              color: '#4f3ca7',
              fontWeight: 500
            }}>Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              autoComplete="username"
              required
              style={{
                width: '90%',
                padding: '0.5rem 0.7rem',
                borderRadius: 7,
                border: '1.2px solid #bdb6e2',
                fontSize: '0.98rem',
                outline: 'none',
                background: '#f7f7fb',
                transition: 'border 0.2s',
                margin: '0 auto',
                display: 'block'
              }}
            />
          </div>
          <div style={{ marginBottom: '1.6rem' }}>
            <label htmlFor="password" style={{
              display: 'block',
              marginBottom: 7,
              color: '#4f3ca7',
              fontWeight: 500
            }}>Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              style={{
                width: '90%',
                padding: '0.5rem 0.7rem',
                borderRadius: 7,
                border: '1.2px solid #bdb6e2',
                fontSize: '0.98rem',
                outline: 'none',
                background: '#f7f7fb',
                transition: 'border 0.2s',
                margin: '0 auto',
                display: 'block'
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              width: '90%',
              padding: '0.7rem',
              borderRadius: 7,
              border: 'none',
              background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '1.05rem',
              letterSpacing: 1,
              cursor: 'pointer',
              boxShadow: '0 2px 8px 0 rgba(118, 75, 162, 0.10)',
              transition: 'background 0.2s, transform 0.1s',
              margin: '0 auto 8px auto',
              display: 'block'
            }}
            onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(90deg, #764ba2 0%, #667eea 100%)'}
            onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
