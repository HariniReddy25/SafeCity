import React, { useEffect, useState } from 'react';
import { Clock, AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react';

const SlaBadge = ({ report, showDetails = false }) => {
  if (!report) return null;

  const { status, createdAt, priority, slaTargetMinutes, slaStatus: backendSlaStatus } = report;

  const isInactive = status === 'RESOLVED' || status === 'CLOSED';

  // Helper to calculate target minutes based on priority if not provided
  const getTargetMinutes = () => {
    if (slaTargetMinutes) return slaTargetMinutes;
    switch (priority) {
      case 'CRITICAL':
        return 10;
      case 'HIGH':
        return 30;
      case 'MEDIUM':
        return 60;
      case 'LOW':
        return 120;
      default:
        return 60;
    }
  };

  const targetMinutes = getTargetMinutes();
  const targetSeconds = targetMinutes * 60;

  const calculateRemainingSeconds = () => {
    if (!createdAt) return targetSeconds;
    const createdTime = new Date(createdAt).getTime();
    if (isNaN(createdTime)) return targetSeconds;

    const now = Date.now();
    const elapsedSec = Math.floor((now - createdTime) / 1000);
    return targetSeconds - elapsedSec;
  };

  const [remainingSec, setRemainingSec] = useState(calculateRemainingSeconds);

  useEffect(() => {
    if (isInactive) return;

    // Live update every second for active SLA monitoring
    const timer = setInterval(() => {
      setRemainingSec(calculateRemainingSeconds());
    }, 1000);

    return () => clearInterval(timer);
  }, [createdAt, targetMinutes, isInactive]);

  // Inactive / Resolved state
  if (isInactive) {
    return (
      <span
        className="badge badge-mint"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.825rem', fontWeight: 600 }}
      >
        <CheckCircle2 size={13} />
        SLA monitoring stopped
      </span>
    );
  }

  // Active SLA state calculation
  const elapsedSec = targetSeconds - remainingSec;
  const ratio = targetSeconds > 0 ? elapsedSec / targetSeconds : 0;
  const isBreached = remainingSec <= 0 || ratio >= 1.0;
  const isWarning = ratio >= 0.75 && !isBreached;

  if (isBreached) {
    const overdueMins = Math.max(1, Math.floor(Math.abs(remainingSec) / 60));
    return (
      <span
        className="badge badge-pink"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.825rem',
          fontWeight: 700,
          backgroundColor: '#FEE2E2',
          color: '#991B1B',
          border: '1px solid #FCA5A5',
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        }}
      >
        <ShieldAlert size={14} style={{ color: '#DC2626' }} />
        🚨 SLA BREACHED: {overdueMins} min overdue
      </span>
    );
  }

  if (isWarning) {
    const remainingMins = Math.max(0, Math.ceil(remainingSec / 60));
    return (
      <span
        className="badge badge-yellow"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.825rem',
          fontWeight: 700,
          backgroundColor: '#FEF3C7',
          color: '#92400E',
          border: '1px solid #FDE68A',
        }}
      >
        <AlertTriangle size={14} style={{ color: '#D97706' }} />
        ⚠️ SLA Warning: {remainingMins} min remaining
      </span>
    );
  }

  // NORMAL SLA State
  const remainingMins = Math.max(0, Math.ceil(remainingSec / 60));
  return (
    <span
      className="badge badge-blue"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        fontSize: '0.825rem',
        fontWeight: 600,
        backgroundColor: '#E0F2FE',
        color: '#0369A1',
        border: '1px solid #BAE6FD',
      }}
    >
      <Clock size={13} style={{ color: '#0284C7' }} />
      Response SLA: {remainingMins} min remaining
    </span>
  );
};

export default SlaBadge;
