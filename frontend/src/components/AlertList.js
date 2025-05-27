import React, { useState, useEffect } from 'react';
import { Alert, Snackbar } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { getBackendUrl } from '../utils/getBackendUrl';

const AlertList = () => {
  const [currentAlert, setCurrentAlert] = useState(null);
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const backendUrl = getBackendUrl();
    let eventSource = null;
    let reconnectTimeout = null;
    let reconnectAttempts = 0;

    const setupSSE = () => {
      if (eventSource) {
        eventSource.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }

      console.log(`Setting up SSE connection for user: ${user._id}`);
      eventSource = new EventSource(`${backendUrl}/api/alerts/events/${user._id}`);

      eventSource.onopen = () => {
        console.log(`SSE connection established for user: ${user._id}`);
        reconnectAttempts = 0;
      };

      eventSource.onmessage = (event) => {
        console.log(`Received notification for user: ${user._id}`, event.data);
        const alert = JSON.parse(event.data);
        setCurrentAlert(alert);
        setOpen(true);
      };

      eventSource.onerror = (error) => {
        console.error(`SSE error for user: ${user._id}`, error);
        eventSource.close();
        reconnectAttempts++;
        const backoff = Math.min(30000, 1000 * Math.pow(2, reconnectAttempts));
        console.log(`Reconnecting SSE for user: ${user._id} in ${backoff / 1000}s (attempt ${reconnectAttempts})`);
        reconnectTimeout = setTimeout(setupSSE, backoff);
      };
    };

        clearTimeout(reconnectTimeout);
      }
    };
  }, [user]);

  const handleClose = () => {
    setOpen(false);
    setCurrentAlert(null);
  };

  if (!currentAlert) return null;

  return (
    <Snackbar
      open={open}
      autoHideDuration={5000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert 
        onClose={handleClose} 
        severity={currentAlert.type === 'error' ? 'error' : 'info'}
        sx={{ width: '100%' }}
      >
        {currentAlert.message}
      </Alert>
    </Snackbar>
  );
};

export default AlertList;