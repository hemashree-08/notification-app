// src/api/authApi.js
import axios from 'axios';
import { getBackendUrl } from '../components/Dashboard';

// Login function to send credentials to backend
export const loginUser = async (username, password) => {
  try {
    const response = await axios.post(`${getBackendUrl()}/api/auth/login`, {
      username,
      password,
    });
    return response.data; // Return the data, which includes the token
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};
