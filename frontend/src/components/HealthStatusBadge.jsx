import React, { useEffect, useState } from 'react';
import { checkHealth } from '../services/api';
import { ShieldCheck, Server, Database, RefreshCw, AlertCircle } from 'lucide-react';
import Button from './Button';
import LoadingState from './LoadingState';

const HealthStatusBadge = () => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = async () => {
    setLoading(true);
    const result = await checkHealth();
    setHealth(result);
    setLoading(false);
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  if (loading) {
    return <LoadingState message="Checking connection to Spring Boot backend..." />;
  }

  const isConnected = health?.success && health?.data?.status === 'OK';
  const dbConnected = health?.data?.database === 'CONNECTED';

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1.5px solid var(--border-subtle)',
        padding: '1.5rem',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1rem',
          paddingBottom: '0.75rem',
          borderBottom: '1px solid var(--border-light)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <ShieldCheck size={22} style={{ color: 'var(--primary-accent)' }} />
          <h3 style={{ fontSize: '1.1rem', margin: 0 }}>
            Phase 1 Full-Stack Connection Proof
          </h3>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={RefreshCw}
          onClick={fetchHealth}
        >
          Check Status
        </Button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1rem',
        }}
      >
        {/* Backend Server Status */}
        <div
          style={{
            backgroundColor: isConnected ? 'var(--pastel-mint)' : 'var(--pastel-pink)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              padding: '0.6rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Server size={22} style={{ color: isConnected ? '#15803D' : '#B91C1C' }} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Spring Boot REST API
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span className={`pulse-indicator ${isConnected ? 'pulse-green' : 'pulse-red'}`}></span>
              {isConnected ? 'Running (Port 8080)' : 'Disconnected'}
            </div>
          </div>
        </div>

        {/* Database Connection Status */}
        <div
          style={{
            backgroundColor: dbConnected ? 'var(--pastel-blue)' : 'var(--pastel-yellow)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              padding: '0.6rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Database size={22} style={{ color: dbConnected ? '#1E40AF' : '#A16207' }} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              MySQL 8+ Database
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span className={`pulse-indicator ${dbConnected ? 'pulse-green' : 'pulse-amber'}`}></span>
              {dbConnected ? 'Connected (safecity_db)' : health?.data?.database || 'Pending Credentials'}
            </div>
          </div>
        </div>
      </div>

      {/* Response Data Detail */}
      <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        {isConnected ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span><strong>Message:</strong> {health?.data?.message}</span>
            <span><strong>Timestamp:</strong> {new Date(health?.data?.timestamp).toLocaleTimeString()}</span>
            <span><strong>Version:</strong> {health?.data?.version}</span>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--danger-accent)' }}>
            <AlertCircle size={16} />
            <span>{health?.error || 'Unable to establish connection to Spring Boot backend'}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthStatusBadge;
