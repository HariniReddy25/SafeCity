import React from 'react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  className = '',
  type = 'button',
  icon: Icon,
  ...props
}) => {
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    fontWeight: '600',
    borderRadius: 'var(--radius-md)',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    transition: 'var(--transition-fast)',
    fontFamily: 'var(--font-body)',
  };

  const sizes = {
    sm: { padding: '0.4rem 0.85rem', fontSize: '0.875rem' },
    md: { padding: '0.65rem 1.25rem', fontSize: '0.95rem' },
    lg: { padding: '0.85rem 1.75rem', fontSize: '1.05rem' },
  };

  const variants = {
    primary: {
      backgroundColor: 'var(--pastel-blue)',
      color: '#1E3A8A',
      boxShadow: 'var(--shadow-sm)',
    },
    secondary: {
      backgroundColor: 'var(--pastel-lavender)',
      color: '#4C1D95',
      boxShadow: 'var(--shadow-sm)',
    },
    success: {
      backgroundColor: 'var(--pastel-mint)',
      color: '#14532D',
      boxShadow: 'var(--shadow-sm)',
    },
    warning: {
      backgroundColor: 'var(--pastel-yellow)',
      color: '#713F12',
      boxShadow: 'var(--shadow-sm)',
    },
    danger: {
      backgroundColor: 'var(--pastel-pink)',
      color: '#881337',
      boxShadow: 'var(--shadow-sm)',
    },
    peach: {
      backgroundColor: 'var(--pastel-peach)',
      color: '#7C2D12',
      boxShadow: 'var(--shadow-sm)',
    },
    outline: {
      backgroundColor: 'transparent',
      border: '1.5px solid var(--border-subtle)',
      color: 'var(--text-main)',
    },
  };

  const style = {
    ...baseStyle,
    ...sizes[size],
    ...variants[variant],
  };

  return (
    <button
      type={type}
      style={style}
      onClick={onClick}
      disabled={disabled}
      className={`custom-button ${className}`}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = variants[variant]?.boxShadow || 'none';
        }
      }}
      {...props}
    >
      {Icon && <Icon size={size === 'sm' ? 16 : size === 'lg' ? 22 : 18} />}
      {children}
    </button>
  );
};

export default Button;
