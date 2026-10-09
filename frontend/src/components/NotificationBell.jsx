import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { getUnreadNotificationCountApi } from '../services/notificationService';

const NotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const data = await getUnreadNotificationCountApi();
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.warn('Failed to fetch unread notification count:', err);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, []);

  return (
    <Link
      to="/notifications"
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.45rem',
        borderRadius: 'var(--radius-full)',
        backgroundColor: unreadCount > 0 ? '#FEF2F2' : 'transparent',
        border: unreadCount > 0 ? '1px solid #FECACA' : '1px solid transparent',
        color: unreadCount > 0 ? '#DC2626' : 'var(--text-muted)',
        transition: 'all 0.2s ease',
        textDecoration: 'none',
      }}
      title={`${unreadCount} Unread Notifications`}
    >
      <Bell size={20} />
      {unreadCount > 0 && (
        <span
          style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            backgroundColor: '#DC2626',
            color: '#FFFFFF',
            fontSize: '0.7rem',
            fontWeight: 900,
            borderRadius: '9999px',
            minWidth: '18px',
            height: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 4px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
          }}
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  );
};

export default NotificationBell;
