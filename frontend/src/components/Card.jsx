import React from 'react';

const Card = ({
  children,
  className = '',
  pastelBg = null, // 'blue' | 'pink' | 'yellow' | 'mint' | 'lavender' | 'peach'
  hoverEffect = true,
  style = {},
  ...props
}) => {
  const pastelColors = {
    blue: 'var(--pastel-blue)',
    pink: 'var(--pastel-pink)',
    yellow: 'var(--pastel-yellow)',
    mint: 'var(--pastel-mint)',
    lavender: 'var(--pastel-lavender)',
    peach: 'var(--pastel-peach)',
  };

  const cardStyle = {
    backgroundColor: pastelBg ? pastelColors[pastelBg] : 'var(--bg-surface)',
    borderRadius: 'var(--radius-lg)',
    padding: '1.75rem',
    border: pastelBg ? '1px solid rgba(255, 255, 255, 0.7)' : '1px solid var(--border-subtle)',
    boxShadow: 'var(--shadow-sm)',
    transition: 'var(--transition-normal)',
    ...style,
  };

  return (
    <div
      style={cardStyle}
      className={`custom-card ${className}`}
      onMouseEnter={(e) => {
        if (hoverEffect) {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        }
      }}
      onMouseLeave={(e) => {
        if (hoverEffect) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        }
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
