import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  AlertTriangle,
  Radio,
  Flame,
  Ambulance,
  Car,
  Eye,
  Brain,
  MapPin,
  Users,
  Activity,
  CheckCircle2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';


const LandingPage = () => {
  const navigate = useNavigate();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem', paddingBottom: '3rem' }}>
      
      {/* HERO SECTION */}
      <section id="overview" style={{ paddingTop: '1rem' }}>
        <div
          style={{
            backgroundColor: 'var(--pastel-blue)',
            borderRadius: 'var(--radius-lg)',
            padding: '3.5rem 2.5rem',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid rgba(255, 255, 255, 0.8)',
          }}
        >
          {/* Decorative subtle background accents */}
          <div
            style={{
              position: 'absolute',
              top: '-30px',
              right: '-30px',
              width: '280px',
              height: '280px',
              borderRadius: '50%',
              backgroundColor: 'var(--pastel-lavender)',
              opacity: 0.6,
              filter: 'blur(40px)',
              zIndex: 0,
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-40px',
              left: '20%',
              width: '220px',
              height: '220px',
              borderRadius: '50%',
              backgroundColor: 'var(--pastel-pink)',
              opacity: 0.5,
              filter: 'blur(40px)',
              zIndex: 0,
            }}
          />

          <div style={{ position: 'relative', zIndex: 1, maxWidth: '820px' }}>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              <span className="badge badge-mint">
                <Sparkles size={14} /> Phase 1 Foundation Active
              </span>
              <span className="badge badge-lavender">
                Enterprise Java 17 + React Stack
              </span>
            </div>

            <h1
              style={{
                fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
                lineHeight: 1.15,
                fontWeight: 800,
                color: '#1E3A8A',
                marginBottom: '1.25rem',
              }}
            >
              Public Safety and Emergency Reporting System
            </h1>

            <p
              style={{
                fontSize: '1.15rem',
                lineHeight: 1.6,
                color: '#1E293B',
                marginBottom: '2rem',
                fontWeight: 450,
              }}
            >
              SafeCity connects citizens, emergency response teams, and municipal administrators on a unified, real-time safety network. Built for rapid incident reporting, intelligent responder dispatch, and data-driven civic protection.
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Button variant="primary" size="lg" icon={AlertTriangle} onClick={() => navigate('/citizen/report-emergency')}>
                Report Emergency Demo
              </Button>
              <Button variant="secondary" size="lg" icon={Activity}>
                Explore System Architecture
              </Button>
            </div>
          </div>
        </div>
      </section>



      {/* CORE SYSTEM CAPABILITIES */}
      <section id="features">
        <div style={{ textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
          Platform Capabilities
        </div>
        <h2 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '1rem' }}>
          Engineered for Rapid Response & Civic Security
        </h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '700px', marginBottom: '2.5rem' }}>
          SafeCity combines citizen accessibility with responder tools and administrative oversight to streamline emergency lifecycle management.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem',
          }}
        >
          <Card pastelBg="pink" onClick={() => navigate('/citizen/report-emergency')} style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ padding: '0.65rem', borderRadius: 'var(--radius-md)', backgroundColor: '#FFFFFF' }}>
                <Flame size={24} style={{ color: '#9F1239' }} />
              </div>
              <h3 style={{ fontSize: '1.2rem', color: '#881337' }}>Emergency Reporting</h3>
            </div>
            <p style={{ fontSize: '0.925rem', color: '#9F1239', lineHeight: 1.6 }}>
              Instant distress reports covering fires, road accidents, medical crises, public hazards, and crime with geolocation and evidence uploads.
            </p>
          </Card>

          <Card pastelBg="mint">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ padding: '0.65rem', borderRadius: 'var(--radius-md)', backgroundColor: '#FFFFFF' }}>
                <Radio size={24} style={{ color: '#15803D' }} />
              </div>
              <h3 style={{ fontSize: '1.2rem', color: '#14532D' }}>Responder Dispatch</h3>
            </div>
            <p style={{ fontSize: '0.925rem', color: '#14532D', lineHeight: 1.6 }}>
              Real-time assignment tracking for police, fire departments, and medical responders with live status updates and field notes.
            </p>
          </Card>

          <Card pastelBg="lavender">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ padding: '0.65rem', borderRadius: 'var(--radius-md)', backgroundColor: '#FFFFFF' }}>
                <Brain size={24} style={{ color: '#6B21A8' }} />
              </div>
              <h3 style={{ fontSize: '1.2rem', color: '#581C87' }}>AI Incident Classification</h3>
            </div>
            <p style={{ fontSize: '0.925rem', color: '#581C87', lineHeight: 1.6 }}>
              Smart priority prediction, duplicate detection, and automated classification algorithms designed for upcoming expansion phases.
            </p>
          </Card>
        </div>
      </section>

      {/* USER ROLES PREVIEW */}
      <section id="roles">
        <div style={{ textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
          Role-Based Access Architecture
        </div>
        <h2 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '2rem' }}>
          Tailored Interfaces for Citizens, Responders, & Admins
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          
          {/* Citizen Role */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              padding: '2rem',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <span className="badge badge-blue">Role 1: CITIZEN</span>
              <Users size={20} style={{ color: 'var(--text-muted)' }} />
            </div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>Public Citizen Portal</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--success-accent)' }} /> Submit distress reports & SOS triggers
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--success-accent)' }} /> View safety map & nearby emergency services
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--success-accent)' }} /> Track resolution history & safety alerts
              </li>
            </ul>
          </div>

          {/* Responder Role */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              padding: '2rem',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <span className="badge badge-mint">Role 2: RESPONDER</span>
              <Ambulance size={20} style={{ color: 'var(--text-muted)' }} />
            </div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>First Responder Terminal</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--success-accent)' }} /> Accept & navigate to assigned emergency sites
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--success-accent)' }} /> Update response status & attach field notes
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--success-accent)' }} /> Review historical dispatch metrics
              </li>
            </ul>
          </div>

          {/* Admin Role */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              padding: '2rem',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <span className="badge badge-lavender">Role 3: ADMIN</span>
              <Shield size={20} style={{ color: 'var(--text-muted)' }} />
            </div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>System Administrator Command</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--success-accent)' }} /> Monitor active emergencies & safety heatmap
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--success-accent)' }} /> Manage citizen & responder accounts
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--success-accent)' }} /> Audit logs, verification & system analytics
              </li>
            </ul>
          </div>

        </div>
      </section>

    </div>
  );
};

export default LandingPage;
