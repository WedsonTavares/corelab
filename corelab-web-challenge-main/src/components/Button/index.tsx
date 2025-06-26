import React from 'react';

interface IButton {
  onClick?: () => void;
  text?: string;
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  title?: string;
}

const Button = ({ 
  onClick, 
  text, 
  children, 
  variant = 'primary', 
  disabled = false,
  className = '',
  type = 'button',
  title
}: IButton) => {
  const getButtonStyle = () => {
    const baseStyle = {
      padding: '14px 28px',
      border: 'none',
      borderRadius: '12px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.3s ease',
      opacity: disabled ? 0.6 : 1,
      position: 'relative' as const,
      overflow: 'hidden' as const,
      textTransform: 'none' as const,
      letterSpacing: '0.5px',
      boxShadow: disabled ? 'none' : '0 4px 12px rgba(0, 0, 0, 0.15)',
    };

    const variants = {
      primary: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        transform: disabled ? 'none' : 'translateY(0)',
      },
      secondary: {
        background: 'linear-gradient(135deg, #6c757d 0%, #495057 100%)',
        color: 'white',
        transform: disabled ? 'none' : 'translateY(0)',
      },
      danger: {
        background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
        color: 'white',
        transform: disabled ? 'none' : 'translateY(0)',
      },
    };

    return { ...baseStyle, ...variants[variant] };
  };

  return (
    <button 
      type={type}
      onClick={disabled ? undefined : onClick}
      style={getButtonStyle()}
      disabled={disabled}
      className={className}
      title={title}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.25)';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        }
      }}
    >
      {children || text}
    </button>
  );
};

export default Button;
