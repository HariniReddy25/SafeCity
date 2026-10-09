import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from './Button';

const ErrorState = ({ title = 'Connection Error', message, onRetry }) => {
  return (
    <div
      style={{
        backgroundColor: 'var(--pastel-pink)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.75rem',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        color: '#881337',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <AlertTriangle size={24} style={{ color: 'var(--danger-accent)' }} />
        <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#881337' }}>
          {title}
        </h4>
      </div>
      <p style={{ fontSize: '0.925rem', margin: 0, lineHeight: 1.5 }}>
        {message}
      </p>
      {onRetry && (
        <div style={{ marginTop: '0.5rem' }}>
          <Button variant="danger" size="sm" icon={RefreshCw} onClick={onRetry}>
            Retry Connection
          </Button>
        </div>
      )}
    </div>
  );
};

export default ErrorState;
