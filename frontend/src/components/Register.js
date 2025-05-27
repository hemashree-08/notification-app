// frontend/src/components/Register.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './Register.css'; // Optional: Remove if not using custom styles
import { getBackendUrl } from './Dashboard';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("❌ Passwords do not match");
      return;
    }

    try {
      await axios.post(`${getBackendUrl()}/api/auth/register`, {
        username,
        password,
      });

      toast.success('Registration successful! You can now log in.');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Server error';
      toast.error(`❌ Registration failed: ${msg}`);
    }
  };

  return (
    <div className="form-container">
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          required
          onChange={(e) => setUsername(e.target.value)}
        />

        <div className="password-field">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="password-field">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Confirm Password"
            value={confirmPassword}
            required
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            style={{ cursor: 'pointer', marginLeft: '8px' }}
          >
            {showPassword ? '🙈' : '👁️'}
          </span>
        </div>

        {error && <p className="error">{error}</p>}

        <button type="submit">Register</button>
        <p onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          Already have an account? Login
        </p>
      </form>
    </div>
  );
}

export default Register;
