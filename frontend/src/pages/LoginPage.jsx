import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, LogIn, AlertCircle, Sparkles, AlertTriangle, UserCheck, Shield, Ambulance } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, sessionError, clearSessionError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const activeSessionNotice = sessionError || location.state?.message;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    clearSessionError();

    if (!email.trim() || !password.trim()) {
      setError('Please fill in both email and password.');
      return;
    }

    setLoading(true);

    try {
      const user = await login(email, password);
      // Redirect based on role
      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else if (user.role === 'RESPONDER') {
        navigate('/responder');
      } else {
        navigate('/citizen');
      }
    } catch (err) {
      let msg;
      if (
        err.response?.status === 502 ||
        err.response?.status === 503 ||
        err.response?.status === 504 ||
        err.code === 'ECONNABORTED' ||
        err.message?.includes('Network Error') ||
        err.message?.includes('502') ||
        !err.response
      ) {
        msg = 'Authentication service is temporarily unavailable. Please try again.';
      } else {
        msg = err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Quick fill helper for evaluation testing
  const fillCredentials = (testEmail, testPass) => {
    setEmail(testEmail);
    setPassword(testPass);
    setError('');
  };

  return (
    <div style={{ maxWidth: '480px', margin: '2rem auto' }}>
      <Card pastelBg="blue" hoverEffect={false}>
        <div style={{ textAlignment: 'center', marginBottom: '1.5rem', textAlign: 'center' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#FFFFFF',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <Lock size={28} style={{ color: '#1E40AF' }} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1E3A8A', marginBottom: '0.25rem' }}>
            Welcome Back to SafeCity
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#1E293B' }}>
            Enter your credentials to access your secure public safety dashboard.
          </p>
        </div>

        {activeSessionNotice && (
          <div
            style={{
              backgroundColor: '#FEF3C7',
              border: '1.5px solid #F59E0B',
              color: '#92400E',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.65rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <AlertTriangle size={20} style={{ color: '#D97706', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ display: 'block', fontWeight: 700, marginBottom: '0.15rem', color: '#78350F' }}>
                Session Expired
              </strong>
              <span>{activeSessionNotice}</span>
            </div>
          </div>
        )}

        {error && (
          <div
            style={{
              backgroundColor: 'var(--pastel-pink)',
              color: '#881337',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-main)' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--border-subtle)',
                  fontSize: '0.95rem',
                  fontFamily: 'var(--font-body)',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-main)' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--border-subtle)',
                  fontSize: '0.95rem',
                  fontFamily: 'var(--font-body)',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <Button type="submit" variant="primary" size="lg" icon={LogIn} disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </Button>
        </form>

        {/* Quick Fill Test Account Helper Card */}
        <div
          style={{
            marginTop: '2rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid rgba(0, 0, 0, 0.08)',
          }}
        >
          <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Sparkles size={14} style={{ color: 'var(--warning-accent)' }} /> Test Accounts (Auto-Seeded)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => fillCredentials('citizen@safecity.com', 'Citizen123!')}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '0.5rem 0.25rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#1E40AF',
                cursor: 'pointer',
              }}
            >
              Citizen
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('responder@safecity.com', 'Responder123!')}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '0.5rem 0.25rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#15803D',
                cursor: 'pointer',
              }}
            >
              Responder
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('admin@safecity.com', 'Admin123!')}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '0.5rem 0.25rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#6B21A8',
                cursor: 'pointer',
              }}
            >
              Admin
            </button>
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Don't have a SafeCity citizen account?{' '}
          <Link to="/register" style={{ fontWeight: 700, color: '#1E40AF' }}>
            Register Now
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
