import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  LogIn,
  UserPlus,
  LogOut,
  User,
  LayoutDashboard,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Users,
  Ambulance,
  MapPin,
  Sparkles,
} from 'lucide-react';
import NotificationBell from './NotificationBell';
import SosButton from './SosButton';
import Button from './Button';

const Navbar = () => {
  const { isAuthenticated, user, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = role === 'ADMIN';
  const isResponder = role === 'RESPONDER';

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'rgba(255, 255, 255, 0.94)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '0.85rem 0',
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: isAdmin ? 'var(--pastel-lavender)' : isResponder ? 'var(--pastel-mint)' : 'var(--pastel-blue)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <Shield size={24} style={{ color: isAdmin ? '#6B21A8' : isResponder ? '#14532D' : '#1E40AF' }} />
          </div>
          <div>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.03em' }}>
              Safe<span style={{ color: isAdmin ? '#7C3AED' : isResponder ? '#15803D' : '#2563EB' }}>City</span>
            </span>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {isAdmin ? 'Admin Operations' : isResponder ? 'Responder Dispatch' : 'Public Safety Platform'}
            </div>
          </div>
        </Link>

        {/* Authenticated Navigation */}
        {isAuthenticated ? (
          isAdmin ? (
            <nav
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                flexWrap: 'wrap',
              }}
            >
              <Link
                to="/admin/dashboard"
                style={{
                  color: location.pathname === '/admin/dashboard' ? '#7C3AED' : 'var(--text-muted)',
                  fontWeight: location.pathname === '/admin/dashboard' ? 700 : 600,
                }}
              >
                Admin Dashboard
              </Link>

              <Link
                to="/admin/reports"
                style={{
                  color: location.pathname.startsWith('/admin/reports') ? '#7C3AED' : 'var(--text-muted)',
                  fontWeight: location.pathname.startsWith('/admin/reports') ? 700 : 600,
                }}
              >
                Emergency Reports
              </Link>

              <Link
                to="/admin/duplicates"
                style={{
                  color: location.pathname === '/admin/duplicates' ? '#7C3AED' : 'var(--text-muted)',
                  fontWeight: location.pathname === '/admin/duplicates' ? 700 : 600,
                }}
              >
                Duplicate Review
              </Link>

              <Link
                to="/admin/responders"
                style={{
                  color: location.pathname === '/admin/responders' ? '#7C3AED' : 'var(--text-muted)',
                  fontWeight: location.pathname === '/admin/responders' ? 700 : 600,
                }}
              >
                Responder Roster
              </Link>

              <Link
                to="/admin/resources"
                style={{
                  color: location.pathname === '/admin/resources' ? '#7C3AED' : 'var(--text-muted)',
                  fontWeight: location.pathname === '/admin/resources' ? 700 : 600,
                }}
              >
                Resources
              </Link>

              <Link
                to="/admin/broadcasts"
                style={{
                  color: location.pathname === '/admin/broadcasts' ? '#7C3AED' : 'var(--text-muted)',
                  fontWeight: location.pathname === '/admin/broadcasts' ? 700 : 600,
                }}
              >
                Civil Defense Broadcasts
              </Link>

              <Link
                to="/admin/analytics"
                style={{
                  color: location.pathname === '/admin/analytics' ? '#7C3AED' : 'var(--text-muted)',
                  fontWeight: location.pathname === '/admin/analytics' ? 700 : 600,
                }}
              >
                Operations Analytics
              </Link>

              <Link
                to="/admin/shelters"
                style={{
                  color: location.pathname === '/admin/shelters' ? '#7C3AED' : 'var(--text-muted)',
                  fontWeight: location.pathname === '/admin/shelters' ? 700 : 600,
                }}
              >
                Emergency Shelters
              </Link>

              <Link
                to="/admin/volunteers"
                style={{
                  color: location.pathname === '/admin/volunteers' ? '#7C3AED' : 'var(--text-muted)',
                  fontWeight: location.pathname === '/admin/volunteers' ? 700 : 600,
                }}
              >
                Volunteer Roster
              </Link>

              <Link
                to="/citizen/dashboard"
                style={{
                  color: 'var(--text-subtle)',
                }}
              >
                Citizen Portal View
              </Link>
            </nav>
          ) : isResponder ? (
            <nav
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                flexWrap: 'wrap',
              }}
            >
              <Link
                to="/responder/dashboard"
                style={{
                  color: location.pathname === '/responder/dashboard' ? '#15803D' : 'var(--text-muted)',
                  fontWeight: location.pathname === '/responder/dashboard' ? 700 : 600,
                }}
              >
                Dashboard
              </Link>

              <Link
                to="/responder/emergencies"
                style={{
                  color: location.pathname.startsWith('/responder/emergencies') ? '#15803D' : 'var(--text-muted)',
                  fontWeight: location.pathname.startsWith('/responder/emergencies') ? 700 : 600,
                }}
              >
                Assigned Emergencies
              </Link>

              <Link
                to="/citizen/safety-map"
                style={{
                  color: location.pathname === '/citizen/safety-map' ? '#15803D' : 'var(--text-muted)',
                  fontWeight: location.pathname === '/citizen/safety-map' ? 700 : 600,
                }}
              >
                Safety Map
              </Link>
            </nav>
          ) : (
            <nav
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                flexWrap: 'wrap',
              }}
            >
              <Link
                to="/citizen/dashboard"
                style={{
                  color: location.pathname === '/citizen/dashboard' ? '#2563EB' : 'var(--text-muted)',
                  fontWeight: location.pathname === '/citizen/dashboard' ? 700 : 600,
                }}
              >
                Dashboard
              </Link>

              <Link
                to="/citizen/report-emergency"
                style={{
                  color: location.pathname === '/citizen/report-emergency' ? '#B91C1C' : '#DC2626',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  backgroundColor: 'var(--pastel-pink)',
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                <AlertTriangle size={14} /> Report Emergency
              </Link>

              <Link
                to="/citizen/my-reports"
                style={{
                  color: location.pathname.startsWith('/citizen/my-reports') || location.pathname.startsWith('/citizen/reports/') ? '#2563EB' : 'var(--text-muted)',
                  fontWeight: location.pathname.startsWith('/citizen/my-reports') ? 700 : 600,
                }}
              >
                My Reports
              </Link>

              <Link
                to="/citizen/safety-map"
                style={{
                  color: location.pathname === '/citizen/safety-map' ? '#2563EB' : 'var(--text-muted)',
                  fontWeight: location.pathname === '/citizen/safety-map' ? 700 : 600,
                }}
              >
                Safety Map
              </Link>

              <Link
                to="/citizen/community"
                style={{
                  color: location.pathname === '/citizen/community' ? '#2563EB' : 'var(--text-muted)',
                  fontWeight: location.pathname === '/citizen/community' ? 700 : 600,
                }}
              >
                Community Feed
              </Link>

              <Link
                to="/citizen/volunteer"
                style={{
                  color: location.pathname === '/citizen/volunteer' ? '#2563EB' : 'var(--text-muted)',
                  fontWeight: location.pathname === '/citizen/volunteer' ? 700 : 600,
                }}
              >
                Volunteer Center
              </Link>

              <Link
                to="/citizen/safety-tips"
                style={{
                  color: location.pathname === '/citizen/safety-tips' ? '#2563EB' : 'var(--text-muted)',
                  fontWeight: location.pathname === '/citizen/safety-tips' ? 700 : 600,
                }}
              >
                Safety Tips
              </Link>

              <Link
                to="/citizen/ai-assistant"
                style={{
                  color: location.pathname === '/citizen/ai-assistant' ? '#7C3AED' : 'var(--text-muted)',
                  fontWeight: location.pathname === '/citizen/ai-assistant' ? 700 : 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                <Sparkles size={14} style={{ color: '#7C3AED' }} /> AI Assistant
              </Link>
            </nav>
          )
        ) : (
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.75rem',
              fontSize: '0.925rem',
              fontWeight: 600,
              color: 'var(--text-muted)',
            }}
          >
            <Link to="/" style={{ color: 'var(--text-main)' }}>
              Home
            </Link>
          </nav>
        )}

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              {/* SOS Emergency Button for Citizens */}
              {role === 'CITIZEN' && <SosButton variant="navbar" />}

              {/* In-App Notification Bell */}
              <NotificationBell />

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className={`badge ${role === 'ADMIN' ? 'badge-lavender' : role === 'RESPONDER' ? 'badge-mint' : 'badge-blue'}`}>
                  <User size={13} /> {role}
                </span>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {user?.fullName?.split(' ')[0]}
                </span>
              </div>

              <Button variant="outline" size="sm" icon={LogOut} onClick={handleLogout}>
                Logout
              </Button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/login">
                <Button variant="outline" size="sm" icon={LogIn}>
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm" icon={UserPlus}>
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
