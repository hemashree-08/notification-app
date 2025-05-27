import { io } from 'socket.io-client';
import config from './config';

let socket = null;

const getSocket = () => {
  if (!socket) {
    const userId = localStorage.getItem('userId');
    socket = io(config.getBackendUrl(), {
      withCredentials: true,
      query: userId ? { userId } : undefined,
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 1000,
      timeout: 5000
    });

    socket.on('connect', () => {
      console.log('Socket connected');
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }
  return socket;
};

export default getSocket;
