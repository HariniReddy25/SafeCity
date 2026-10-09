import React from 'react';
import { Compass, Sparkles, Clock, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';

const PlaceholderPage = ({ title, featureName, phaseNumber, description, icon: Icon = Compass, pastelBg = 'lavender' }) => {
  return (
    <div style={{ maxWidth: '720px', margin: '2rem auto' }}>
      <Card pastelBg={pastelBg} hoverEffect={false}>
        <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: '#FFFFFF',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <Icon size={32} style={{ color: 'var(--primary-accent)' }} />
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
            <span className="badge badge-lavender">
              <Clock size={13} /> Scheduled for Phase {phaseNumber}
            </span>
          </div>

          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-main)' }}>
            {title || featureName}
          </h1>

          <p style={{ fontSize: '1rem', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '540px', margin: '0 auto 2rem auto' }}>
            {description || `The ${featureName} platform expansion is planned for Phase ${phaseNumber}. Core authentication, emergency reporting, and tracking services are active in Phase 3.`}
          </p>

          <Link to="/citizen/dashboard">
            <Button variant="primary" size="md" icon={ArrowLeft}>
              Back to Citizen Dashboard
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default PlaceholderPage;
