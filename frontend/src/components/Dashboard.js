import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './Dashboard.css';

// Get the backend URL based on environment
export const getBackendUrl = () => {
  console.log('DEBUG: NODE_ENV:', process.env.NODE_ENV, 'REACT_APP_BACKEND_URL:', process.env.REACT_APP_BACKEND_URL);
  // 1. Use deployed backend in production (Render, Vercel, Netlify, etc.)
  if (process.env.NODE_ENV === 'production') {
    return process.env.REACT_APP_BACKEND_URL || 'https://notification-app-backend.onrender.com';
  }
  // 2. Use .env override for local dev if set
  if (process.env.REACT_APP_ENV === 'ngrok' && process.env.REACT_APP_NGROK_BACKEND_URL) {
    return process.env.REACT_APP_NGROK_BACKEND_URL;
  }
  if (process.env.REACT_APP_ENV === 'local' && process.env.REACT_APP_LOCAL_BACKEND_URL) {
    return process.env.REACT_APP_LOCAL_BACKEND_URL;
  }
  // 3. Fallbacks for local dev
  const hostname = window.location.hostname;
  const port = window.location.port;
  if (hostname === 'localhost' && port === '3003') {
    return 'http://localhost:3002';
  }
  // 4. IIS fallback
  if (process.env.REACT_APP_IIS_BACKEND_URL) {
    return process.env.REACT_APP_IIS_BACKEND_URL;
  }
  // 5. Final fallback
  return 'http://localhost:82';
};

// Create axios instance with both URLs
const api = axios.create({
  baseURL: getBackendUrl(),
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

const Dashboard = ({ userInfo, setUserInfo, alerts, setAlerts, stats, setStats }) => {
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('theme') === 'dark');
  const [filter, setFilter] = useState('all');
  const [autoInterval, setAutoInterval] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [loadedPages, setLoadedPages] = useState(new Set([1]));
  const observerRef = useRef(null);
  const loadingRef = useRef(false);
  const lastElementRef = useRef(null);
  const navigate = useNavigate();
  const initialLoadRef = useRef(false);

  // Defensive fallback for stats
  const safeStats = stats || { unread: 0, read: 0, total: 0 };

  // Defensive fallback for alerts
  const safeAlerts = alerts || [];

  // Function to fetch alerts with pagination and filtering
  const fetchAlerts = useCallback(async (page, resetList = false) => {
    if (loadingRef.current) return;
    if (!resetList && loadedPages.has(page)) return;
    if (!hasMore && page > 1 && !resetList) return;

    loadingRef.current = true;
    setIsLoading(true);

    try {
      const startTime = performance.now();
      console.log(`[${new Date().toLocaleTimeString()}] Fetching page ${page} with filter: ${filter}`);
      
      const response = await api.get(`/api/alerts/${userInfo.userId}`, {
        params: {
          page,
          limit: 50,
          filter
        }
      });
      
      const { alerts: newAlerts, currentPage, totalPages } = response.data;
      // Do NOT update stats here; stats are only updated by SSE or mark as read
      if (resetList) {
        setAlerts(newAlerts);
        setLoadedPages(new Set([1]));
      } else {
        setAlerts(prev => {
          const existingIds = new Set(prev.map(a => a._id));
          const uniqueAlerts = newAlerts.filter(alert => !existingIds.has(alert._id));
          return [...prev, ...uniqueAlerts];
        });
        setLoadedPages(prev => new Set([...prev, page]));
      }
      
      setTotalPages(totalPages);
      setHasMore(currentPage < totalPages);
      setCurrentPage(currentPage);
      
      const processingTime = (performance.now() - startTime).toFixed(2);
      console.log(`[${new Date().toLocaleTimeString()}] Loaded ${newAlerts.length} alerts in ${processingTime}ms (Page ${page}/${totalPages})`);
      
    } catch (error) {
      console.error('Error fetching alerts:', error);
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, [userInfo.userId, filter, setAlerts]);

  // Setup SSE connection
  useEffect(() => {
    if (!userInfo?.userId) return;

    let eventSource = null;
    const baseUrl = getBackendUrl();
    
    const setupSSE = () => {
      if (eventSource) {
        eventSource.close();
      }

      console.log('Setting up SSE connection to:', `${baseUrl}/api/alerts/events/${userInfo.userId}`);
      eventSource = new EventSource(`${baseUrl}/api/alerts/events/${userInfo.userId}`);

      eventSource.onmessage = (event) => {
        const alert = JSON.parse(event.data);
        if (alert.type === 'connected') {
          console.log('SSE Connection established:', alert.message);
        } else {
          setAlerts(prev => {
            // Prevent duplicate alerts
            if (prev.some(a => a._id === alert._id)) return prev;
            // Only update stats if alert is new
            setStats(statsPrev => ({
              ...statsPrev,
              unread: statsPrev.unread + 1,
              total: statsPrev.total + 1
            }));
            return [alert, ...prev];
          });
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE Error:', error);
        // Attempt to reconnect after a delay
        setTimeout(setupSSE, 5000);
      };
    };

    setupSSE();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [userInfo?.userId, setAlerts, setStats]);

  // Callback ref for the last notification (infinite scrolling)
  const lastNotificationRef = useCallback(node => {
    if (loadingRef.current) return;
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new window.IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loadingRef.current) {
        const nextPage = currentPage + 1;
        if (!loadedPages.has(nextPage)) {
          console.log(`Loading next page ${nextPage} due to scroll`);
          fetchAlerts(nextPage, false);
        }
      }
    }, {
      root: null,
      rootMargin: '100px',
      threshold: 0.1
    });
    if (node) observerRef.current.observe(node);
  }, [currentPage, hasMore, loadedPages, fetchAlerts]);

  // Reset and reload when filter changes
  useEffect(() => {
    if (!initialLoadRef.current) {
      initialLoadRef.current = true;
      return;
    }
    setCurrentPage(1);
    setHasMore(true);
    setLoadedPages(new Set([1]));
    fetchAlerts(1, true);
  }, [filter, fetchAlerts]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => {
      const newMode = !prevMode;
      localStorage.setItem('theme', newMode ? 'dark' : 'light');
      document.body.className = newMode ? 'dark' : 'light';
      return newMode;
    });
  };

  // Mark alert as read/unread
  const toggleReadStatus = (alertId) => {
    api.patch(`/api/alerts/${alertId}/read`)
      .then((res) => {
        setAlerts((prev) => prev.map(alert => 
          alert._id === alertId ? { ...alert, isRead: true } : alert
        ));
        // Update stats
        setStats(prev => ({
          ...prev,
          unread: Math.max(0, prev.unread - 1),
          read: prev.read + 1
        }));
      })
      .catch((err) => {
        console.error('Error marking alert as read:', err);
        toast.error('Failed to mark alert as read');
      });
  };

  // Set auto-notification interval
  const setAutoNotificationInterval = () => {
    if (!autoInterval || isNaN(autoInterval) || autoInterval < 1) {
      toast.error('Please enter a valid interval in minutes');
      return;
    }

    api.post('/api/alerts/set-interval', {
      interval: parseInt(autoInterval, 10)
    })
    .then(() => {
      toast.success(`Auto-notification interval set to ${autoInterval} minutes`);
    })
    .catch((err) => {
      console.error('Error setting interval:', err);
      toast.error('Failed to set auto-notification interval');
    });
  };

  // Mark all alerts as read
  const markAllAsRead = () => {
    api.put(`/api/alerts/${userInfo.userId}/read-all`).then(() => {
      setAlerts((prev) => prev.map((alert) => ({ ...alert, isRead: true })));
      // Update stats
      setStats(prev => ({
        ...prev,
        unread: 0,
        read: prev.total
      }));
    });
  };

  // Logout and clear localStorage
  const logout = () => {
    localStorage.removeItem('userInfo');
    setUserInfo(null);
    navigate('/');
  };

  return (
    <div className={`dashboard ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="header">
        <div className="user-info">
          <h1>Welcome, {userInfo?.username}</h1>
          <div className="user-id-display">
            <h3>Your User ID:</h3>
            <div className="user-id-box">
              <code>{userInfo?.userId}</code>
              <button 
                className="copy-button"
                onClick={() => {
                  navigator.clipboard.writeText(userInfo?.userId);
                  toast.success('User ID copied to clipboard!', {
                    toastId: 'copy-id-' + Date.now(),
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true
                  });
                }}
              >
                Copy ID
              </button>
            </div>
          </div>
        </div>
        <div className="header-buttons">
          <button onClick={toggleDarkMode}>
            {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
          <button onClick={logout}>🚪 Logout</button>
        </div>
      </div>

      <div className="auto-notification-settings">
        <h3>Auto-Notification Settings</h3>
        <div className="interval-input">
          <input
            type="number"
            value={autoInterval}
            onChange={(e) => setAutoInterval(e.target.value)}
            placeholder="Enter interval in minutes"
            min="1"
          />
          <button onClick={setAutoNotificationInterval}>Set Interval</button>
        </div>
      </div>

      <div className="notification-filters">
        <button 
          className={filter === 'all' ? 'active' : ''} 
          onClick={() => setFilter('all')}
        >
          All Notifications ({safeStats.total})
        </button>
        <button 
          className={filter === 'unread' ? 'active' : ''} 
          onClick={() => setFilter('unread')}
        >
          Unread ({safeStats.unread})
        </button>
        <button 
          className={filter === 'read' ? 'active' : ''} 
          onClick={() => setFilter('read')}
        >
          Read ({safeStats.read})
        </button>
        <button onClick={markAllAsRead}>Mark All as Read</button>
      </div>

      <div className="notifications">
        {safeAlerts.length === 0 && !isLoading ? (
          <p>No notifications to display.</p>
        ) : (
          <>
            {safeAlerts.map((alert, index) => {
              const isLast = index === safeAlerts.length - 1;
              return (
                <div
                  key={alert._id}
                  className={`notification ${alert.isRead ? 'read' : 'unread'}`}
                  ref={isLast ? lastNotificationRef : null}
                >
              <div className="notification-content">
              <p>{alert.message}</p>
                <div className="notification-details">
                  <small>Type: {alert.type}</small>
              <small>{new Date(alert.timestamp).toLocaleString()}</small>
                </div>
              </div>
              {!alert.isRead && (
                <button 
                  className="mark-read-button"
                      onClick={() => toggleReadStatus(alert._id)}
                >
                  Mark as Read
              </button>
              )}
            </div>
              );
            })}
            <div style={{ height: '20px', margin: '10px 0' }}>
              {isLoading ? (
                <div className="loading-indicator">
                  Loading more notifications...
                </div>
              ) : hasMore ? (
                <div className="load-more-trigger">
                  Scroll for more notifications...
                </div>
              ) : (
                <div className="no-more-notifications">
                  No more notifications to load
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
