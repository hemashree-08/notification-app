import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../api/authApi'; // optional if you're using an API module
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Auth.css';
import { getBackendUrl } from './Dashboard';

function Login() {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [token, setToken] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Option 1: use your own API method
      // const data = await loginUser(emailOrUsername, password);

      // Option 2: use direct fetch
      const res = await fetch(`${getBackendUrl()}/api/auth/login`,{
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: emailOrUsername, // or email
          password
        })
      });

      const data = await res.json();
      console.log('Login response data:', data);

      if (!res.ok) {
        setError(data.message || 'Login failed');
        return;
      }

      // Save userId and token (if present)
      const userData = { userId: data.userId, username: emailOrUsername };
      localStorage.setItem('userInfo', JSON.stringify(userData));
      // Show a toast notification for successful login
      toast.success('Login successful!');
      setUserInfo(userData);
      navigate('/dashboard');
    } catch (err) {
      setError('Something went wrong. Try again.');
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Email or Username"
          required
          value={emailOrUsername}
          onChange={(e) => setEmailOrUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
        {error && <p className="error">{error}</p>}
        {token && <p className="success">Your token: {token}</p>}
        <p onClick={() => navigate('/register')} className="auth-link">
          Don't have an account? Register
        </p>
      </form>
    </div>
  );
}

export default Login;
