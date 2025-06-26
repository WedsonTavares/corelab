import React from 'react';
import styles from './Button.module.scss';

interface IButton {
  onClick?: () => void;
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  outline?: boolean;
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  title?: string;
}

/**
 * Componente Button moderno e responsivo
 * 
 * @param onClick - Função executada ao clicar
 * @param children - Conteúdo do botão
 * @param variant - Variação visual (primary, secondary, danger)
 * @param size - Tamanho do botão (small, medium, large)
 * @param outline - Se deve ter apenas borda
 * @param fullWidth - Se deve ocupar toda a largura
 * @param loading - Se está em estado de carregamento
 * @param disabled - Se está desabilitado
 * @param className - Classes CSS adicionais
 * @param type - Tipo do botão HTML
 * @param title - Tooltip do botão
 */
const Button: React.FC<IButton> = ({ 
  onClick, 
  children, 
  variant = 'primary', 
  size = 'medium',
  outline = false,
  fullWidth = false,
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  title
}) => {
  const buttonClasses = [
    styles.button,
    styles[variant],
    size !== 'medium' && styles[size],
    outline && styles.outline,
    fullWidth && styles.fullWidth,
    loading && styles.loading,
    className
  ].filter(Boolean).join(' ');

  return (
    <button 
      type={type}
      onClick={disabled || loading ? undefined : onClick}
      className={buttonClasses}
      disabled={disabled || loading}
      title={title}
      aria-label={title}
    >
      {children}
    </button>
  );
};

export default Button;
