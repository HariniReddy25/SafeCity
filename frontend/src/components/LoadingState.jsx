import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingState = ({ message = 'Loading SafeCity service status...' }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 2rem',
        gap: '1rem',
        color: 'var(--text-muted)',
      }}
    >
      <Loader2
        size={36}
        style={{
          animation: 'spin 1.2s linear infinite',
          color: 'var(--primary-accent)',
        }}
      />
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      <p style={{ fontSize: '0.95rem', fontWeight: 500 }}>{message}</p>
    </div>
  );
};

export default LoadingState;
