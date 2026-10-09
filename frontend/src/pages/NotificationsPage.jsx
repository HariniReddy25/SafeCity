import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import {
  getNotificationsApi,
  markNotificationAsReadApi,
  markAllNotificationsAsReadApi,
} from '../services/notificationService';
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Info,
  Clock,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'UNREAD'

  const loadNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getNotificationsApi();
      setNotifications(data || []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    setError('');
    try {
      await markNotificationAsReadApi(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      setError(err.response?.data?.message || err.message || 'Failed to mark notification as read.');
    }
  };

  const handleMarkAllAsRead = async () => {
    setError('');
    try {
      await markAllNotificationsAsReadApi();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
      setError(err.response?.data?.message || err.message || 'Failed to mark all notifications as read.');
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'UNREAD') return !n.read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getTypeIcon = (type) => {
    switch (type) {
      case 'SOS':
        return <AlertOctagon size={20} style={{ color: '#DC2626' }} />;
      case 'ALERT':
        return <AlertTriangle size={20} style={{ color: '#EA580C' }} />;
      case 'ASSIGNMENT':
        return <ShieldAlert size={20} style={{ color: '#7C3AED' }} />;
      case 'STATUS_CHANGE':
        return <CheckCircle2 size={20} style={{ color: '#2563EB' }} />;
      default:
        return <Info size={20} style={{ color: '#0284C7' }} />;
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'SOS':
        return <span className="badge badge-pink">🚨 SOS DISTRESS</span>;
      case 'ALERT':
        return <span className="badge badge-peach">⚠️ HIGH ALERT</span>;
      case 'ASSIGNMENT':
        return <span className="badge badge-lavender">DISPATCH ASSIGNMENT</span>;
      case 'STATUS_CHANGE':
        return <span className="badge badge-mint">STATUS UPDATE</span>;
      default:
        return <span className="badge badge-blue">NOTIFICATION</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '900px', margin: '0 auto' }}>
      {/* HEADER BANNER */}
      <div
        style={{
          backgroundColor: 'var(--pastel-lavender)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem 1.75rem',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
            <span className="badge badge-lavender">NOTIFICATION CENTER</span>
            <span style={{ fontSize: '0.8rem', color: '#581C87', fontWeight: 600 }}>Phase 7 Active</span>
          </div>
          <h1 style={{ fontSize: '2.2rem', color: '#581C87', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell size={30} style={{ color: '#7C3AED' }} /> In-App Safety Alerts & Broadcasts
          </h1>
          <p style={{ color: '#6B21A8', fontSize: '0.925rem', marginTop: '0.3rem', margin: 0 }}>
            Stay updated on incident report status, dispatch assignments, and critical sector alerts.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button variant="outline" size="sm" icon={CheckCheck} onClick={handleMarkAllAsRead} style={{ borderColor: '#7C3AED', color: '#7C3AED' }}>
            Mark All as Read ({unreadCount})
          </Button>
        )}
      </div>

      {/* FILTER TABS & COUNT BAR */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setFilter('ALL')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: filter === 'ALL' ? '2px solid #7C3AED' : '1px solid var(--border-subtle)',
              backgroundColor: filter === 'ALL' ? '#FFFFFF' : 'transparent',
              color: filter === 'ALL' ? '#581C87' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            All Notifications ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('UNREAD')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: filter === 'UNREAD' ? '2px solid #7C3AED' : '1px solid var(--border-subtle)',
              backgroundColor: filter === 'UNREAD' ? '#FFFFFF' : 'transparent',
              color: filter === 'UNREAD' ? '#581C87' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            Unread Only ({unreadCount})
          </button>
        </div>
      </div>

      {/* NOTIFICATION LIST */}
      {loading ? (
        <LoadingState message="Loading your notification stream..." />
      ) : error ? (
        <ErrorState title="Notifications Error" message={error} onRetry={loadNotifications} />
      ) : filteredNotifications.length === 0 ? (
        <Card hoverEffect={false}>
          <div style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-muted)' }}>
            <Bell size={40} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 0.25rem 0' }}>
              No Notifications Found
            </h3>
            <p style={{ fontSize: '0.875rem', margin: 0 }}>
              {filter === 'UNREAD' ? 'You have read all your notifications!' : 'Your alert stream is clean.'}
            </p>
          </div>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {filteredNotifications.map((n) => (
            <Card
              key={n.id}
              hoverEffect={true}
              style={{
                padding: '1.25rem',
                borderLeft: n.read ? '4px solid #CBD5E1' : '4px solid #7C3AED',
                backgroundColor: n.read ? '#FFFFFF' : 'var(--pastel-blue)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.85rem', flex: 1 }}>
                  <div style={{ marginTop: '0.15rem' }}>{getTypeIcon(n.type)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                      {getTypeBadge(n.type)}
                      <strong style={{ fontSize: '1rem', color: 'var(--text-main)' }}>{n.title}</strong>
                      {!n.read && <span style={{ width: '8px', height: '8px', borderRadius: '9999px', backgroundColor: '#7C3AED' }} />}
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', margin: '0 0 0.5rem 0', lineHeight: 1.45 }}>{n.message}</p>
                    <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Clock size={13} /> {new Date(n.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                  {!n.read && (
                    <button
                      onClick={() => handleMarkAsRead(n.id)}
                      style={{ border: 'none', background: 'none', color: '#7C3AED', fontSize: '0.775rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Mark Read
                    </button>
                  )}

                  {n.relatedReportId && (
                    <Link to={`/citizen/reports/${n.relatedReportId}`}>
                      <Button variant="outline" size="sm" icon={ChevronRight} style={{ fontSize: '0.775rem' }}>
                        View Report
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
