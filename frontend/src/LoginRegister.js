import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './LoginRegister.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getBackendUrl } from './components/Dashboard';

function LoginRegister({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [formData, setFormData] = useState({ 
    username: '', 
    password: '', 
    confirmPassword: '' 
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'register') {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    }

    try {
      const url = `${getBackendUrl()}/api/auth/${mode}`;
      const data = {
        username: formData.username,
        password: formData.password
      };
        
      const res = await axios.post(url, data);
      
      if (res.data.userId) {
        if (mode === 'register') {
          // After successful registration, switch to login mode
          setMode('login');
          setFormData({ username: '', password: '', confirmPassword: '' });
          setError('');
          toast.success('Registration successful! Please login.');
        } else {
          // For login, proceed with the login flow
          onLogin({
            userId: res.data.userId,
            username: res.data.username
          });
          // Navigation will be handled by the router
        }
      } else {
        setError('Invalid response from server');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="login-register-container">
      <h2>{mode === 'login' ? 'Login' : 'Register'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input 
            type="text"
            id="username"
            name="username" 
            value={formData.username}
            onChange={handleChange} 
            autoComplete="username"
            required 
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input 
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange} 
            autoComplete="current-password"
            required 
          />
          <button
            type="button"
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        {mode === 'register' && (
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input 
              type={showPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange} 
              autoComplete="new-password"
              required 
            />
          </div>
        )}
        <button type="submit" className="submit-button">
          {mode === 'login' ? 'Login' : 'Register'}
        </button>
      </form>
      <p className="switch-mode">
        {mode === 'login' ? 'New user?' : 'Already have an account?'}{' '}
        <button 
          className="switch-button"
          onClick={() => {
            setMode(mode === 'login' ? 'register' : 'login');
            setFormData({ username: '', password: '', confirmPassword: '' });
            setError('');
          }}
        >
          {mode === 'login' ? 'Register' : 'Login'}
        </button>
      </p>
      {error && <p className="error-msg">{error}</p>}
    </div>
  );
}

export default LoginRegister;
