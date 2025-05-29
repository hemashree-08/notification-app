// src/App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import LoginRegister from './LoginRegister';
import Dashboard from './components/Dashboard';
import { getBackendUrl } from './components/Dashboard';

const App = () => {
  const [userInfo, setUserInfo] = useState(() => {
    const savedUser = localStorage.getItem('userInfo');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [alerts, setAlerts] = useState([]);
  const [activeAlerts] = useState(new Set()); // Track active alerts
  const [stats, setStats] = useState({ unread: 0, read: 0, total: 0 }); // Add stats state

  // Setup SSE connection and fetch alerts
  useEffect(() => {
    if (!userInfo?.userId) return;

    let eventSource = null;
    let isComponentMounted = true;
    let reconnectTimeout = null;
    let connectionTimeout = null;
    let reconnectAttempts = 0;
    const backendUrl = getBackendUrl();

    const setupSSE = () => {
      if (eventSource) {
        eventSource.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (connectionTimeout) {
        clearTimeout(connectionTimeout);
      }

      const fetchAlerts = async () => {
        try {
          const startTime = performance.now();
          console.log(`[${new Date().toLocaleTimeString()}] Starting to fetch alerts...`);
          
          const res = await axios.get(`${backendUrl}/api/alerts/${userInfo.userId}`, {
            params: {
              page: 1,
              limit: 50,
              filter: 'all'
            },
            timeout: 5000
          });
          
          if (isComponentMounted) {
            setAlerts(res.data.alerts || []);
            setStats(res.data.stats || { unread: 0, read: 0, total: 0 });
          }
          
          const endTime = performance.now();
          const processingTime = (endTime - startTime).toFixed(2);
          console.log(`[${new Date().toLocaleTimeString()}] Finished loading alerts in ${processingTime}ms`);
          alert(`Notificationss loaded in ${processingTime}ms`);
        } catch (error) {
          console.error('Error fetching alerts:', error);
        }
      };

      fetchAlerts();

      eventSource = new EventSource(`${backendUrl}/api/alerts/events/${userInfo.userId}`);

      connectionTimeout = setTimeout(() => {
        if (eventSource && eventSource.readyState !== EventSource.OPEN) {
          console.log('SSE connection timeout - attempting reconnect');
          eventSource.close();
          if (isComponentMounted) {
            reconnectAttempts++;
            const backoff = Math.min(30000, 1000 * Math.pow(2, reconnectAttempts));
            console.log(`Reconnecting SSE in ${backoff / 1000}s (attempt ${reconnectAttempts})`);
            reconnectTimeout = setTimeout(setupSSE, backoff);
          }
        }
      }, 10000); // 10 seconds

      eventSource.onopen = () => {
        if (connectionTimeout) {
        clearTimeout(connectionTimeout);
        }
        reconnectAttempts = 0;
        console.log('SSE connection established');
      };

      eventSource.onmessage = (event) => {
        if (!isComponentMounted) return;
        try {
          const alert = JSON.parse(event.data);
          if (alert.type === 'connected') {
            console.log('SSE connection established');
            return;
          }
          if (activeAlerts.has(alert._id)) {
            console.log('Alert already active, skipping:', alert._id);
            return;
          }
          activeAlerts.add(alert._id);
          toast(alert.message, {
            toastId: alert._id,
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            onClose: () => {
              activeAlerts.delete(alert._id);
            }
          });
          setAlerts((prev) => {
            if (prev.some(a => a._id === alert._id)) {
              return prev;
            }
            return [{ ...alert, isRead: false }, ...prev];
          });
          setStats(prev => ({
            ...prev,
            total: prev.total + 1,
            unread: prev.unread + 1
          }));
        } catch (error) {
          console.error('Error parsing SSE message:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('EventSource failed:', error);
        if (connectionTimeout) {
        clearTimeout(connectionTimeout);
        }
        if (eventSource) {
          eventSource.close();
        }
        if (isComponentMounted) {
          reconnectAttempts++;
          const backoff = Math.min(30000, 1000 * Math.pow(2, reconnectAttempts));
          console.log(`Reconnecting SSE in ${backoff / 1000}s (attempt ${reconnectAttempts})`);
          reconnectTimeout = setTimeout(setupSSE, backoff);
        }
      };
    };

    setupSSE();

    return () => {
      isComponentMounted = false;
      if (eventSource) {
        eventSource.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (connectionTimeout) {
        clearTimeout(connectionTimeout);
      }
    };
  }, [userInfo, activeAlerts]);

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    setUserInfo(null);
    setAlerts([]);
    // Force a page reload to clear any existing SSE connections
    window.location.reload();
  };

  const handleLogin = (userData) => {
    localStorage.setItem('userInfo', JSON.stringify(userData));
    setUserInfo(userData);
  };

  if (!userInfo) {
    return (
      <Router>
        <Routes>
          <Route 
            path="/" 
            element={
              <LoginRegister onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <Navigate to="/" />
            } 
          />
        </Routes>
        <ToastContainer />
      </Router>
    );
  }

  return (
    <Router>
    <div className="app-container">
        <Routes>
          <Route 
            path="/" 
            element={
              userInfo ? <Navigate to="/dashboard" /> : <LoginRegister onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              userInfo ? (
                <Dashboard 
                  userInfo={userInfo} 
                  setUserInfo={setUserInfo} 
                  alerts={alerts}
                  setAlerts={setAlerts}
                  stats={stats}
                  setStats={setStats}
                  onLogout={handleLogout}
                />
        ) : (
                <Navigate to="/" />
              )
            } 
          />
        </Routes>
        <ToastContainer />
      </div>
    </Router>
  );
};

export default App;
