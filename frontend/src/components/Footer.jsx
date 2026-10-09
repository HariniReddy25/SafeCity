import React from 'react';
import { Shield, PhoneCall, Heart, ExternalLink } from 'lucide-react';

const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-subtle)',
        padding: '3rem 0 2rem 0',
        marginTop: 'auto',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '2.5rem',
            paddingBottom: '2.5rem',
            borderBottom: '1px solid var(--border-light)',
          }}
        >
          {/* Brand Column */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--pastel-blue)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Shield size={20} style={{ color: '#1E40AF' }} />
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>SafeCity</span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              A next-generation public safety & emergency reporting ecosystem empowering citizens, first responders, and administrators.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)' }}>
              Platform Navigation
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <li><a href="#overview">Public Safety Overview</a></li>
              <li><a href="#features">Planned AI Features</a></li>
              <li><a href="#roles">Role-Based Access</a></li>
              <li><a href="#status">Backend API Health</a></li>
            </ul>
          </div>

          {/* Emergency Helplines */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)' }}>
              Emergency Services
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', backgroundColor: 'var(--pastel-pink)', padding: '0.5rem 0.85rem', borderRadius: 'var(--radius-md)' }}>
                <PhoneCall size={16} style={{ color: '#9F1239' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#9F1239' }}>Emergency Response: 112 / 911</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', backgroundColor: 'var(--pastel-blue)', padding: '0.5rem 0.85rem', borderRadius: 'var(--radius-md)' }}>
                <PhoneCall size={16} style={{ color: '#1E40AF' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E40AF' }}>Medical Emergency: 108</span>
              </div>
            </div>
          </div>

          {/* Tech Stack Info */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)' }}>
              Phase 1 Tech Stack
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              <span className="badge badge-blue">Java 17</span>
              <span className="badge badge-mint">Spring Boot 3</span>
              <span className="badge badge-yellow">MySQL 8+</span>
              <span className="badge badge-lavender">React.js</span>
              <span className="badge badge-peach">Axios</span>
              <span className="badge badge-pink">Pastel UI</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            paddingTop: '1.5rem',
            fontSize: '0.825rem',
            color: 'var(--text-muted)',
          }}
        >
          <div>
            © {new Date().getFullYear()} SafeCity Platform. Phase 1 — Foundation Architecture.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            Built with calm, accessible pastel design principles.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
