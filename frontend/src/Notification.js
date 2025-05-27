import React from 'react';
import { FaBell } from 'react-icons/fa';

const Notification = ({ unreadCount, alerts, markAllAsRead, markSingleAsRead }) => {
  return (
    <div style={{ padding: '20px', backgroundColor: '#f4f4f9', borderRadius: '8px', width: '300px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        {/* Mark All as Read Button */}
        <button
          onClick={markAllAsRead}
          style={{
            padding: '8px 15px',
            background: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Mark All as Read
        </button>

        {/* Bell Icon with Unread Count */}
        <div style={{ marginLeft: '20px', position: 'relative' }}>
          <FaBell size={24} color="#007bff" />
          {unreadCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                background: 'red',
                color: 'white',
                borderRadius: '50%',
                padding: '4px 7px',
                fontSize: '12px',
              }}
            >
              {unreadCount}
            </span>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <ul style={{ padding: 0, listStyleType: 'none' }}>
        {alerts.length === 0 ? (
          <li>No notifications found.</li>
        ) : (
          alerts.map((alert) => (
            <li
              key={alert._id}
              style={{
                marginBottom: '10px',
                padding: '10px',
                backgroundColor: alert.isRead ? '#e0e0e0' : '#fff',
                borderRadius: '5px',
                border: '1px solid #ddd',
              }}
            >
              <strong>{alert.type.toUpperCase()}</strong>: {alert.message}{' '}
              {alert.isRead ? (
                '✅'
              ) : (
                <button
                  onClick={() => markSingleAsRead(alert._id)}
                  style={{
                    marginLeft: '10px',
                    backgroundColor: '#28a745',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                  }}
                >
                  Mark Read
                </button>
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default Notification;
