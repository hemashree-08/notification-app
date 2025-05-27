// src/api/authApi.js
import axios from 'axios';
import { getBackendUrl } from '../components/Dashboard';

// Register function to send data to backend
export const registerUser = async (username, password) => {
  try {
    const response = await axios.post(`${getBackendUrl()}/api/auth/register`, {
      username,
      password,
    });
    return response.data; // Return the data if registration is successful
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

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
