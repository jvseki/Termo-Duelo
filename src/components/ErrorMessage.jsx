// Componente ErrorMessage reutilizável
import { theme } from '../styles/theme';

const ErrorMessage = ({
  message,
  type = 'error',
  icon,
  className = '',
  style = {},
  onClose,
  ...props
}) => {
  if (!message) return null;

  const typeStyles = {
    error: {
      backgroundColor: `${theme.colors.danger}15`,
      borderColor: theme.colors.danger,
      color: theme.colors.danger
    },
    warning: {
      backgroundColor: `${theme.colors.warning}15`,
      borderColor: theme.colors.warning,
      color: theme.colors.warning
    },
    info: {
      backgroundColor: `${theme.colors.info}15`,
      borderColor: theme.colors.info,
      color: theme.colors.info
    },
    success: {
      backgroundColor: `${theme.colors.success}15`,
      borderColor: theme.colors.success,
      color: theme.colors.success
    }
  };

  const defaultIcons = {
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
    success: '✅'
  };

  const currentStyle = typeStyles[type] || typeStyles.error;
  const currentIcon = icon || defaultIcons[type] || defaultIcons.error;

  const combinedStyle = {
    padding: theme.spacing[3],
    borderRadius: theme.borderRadius.base,
    border: `1px solid ${currentStyle.borderColor}`,
    backgroundColor: currentStyle.backgroundColor,
    color: currentStyle.color,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[2],
    marginBottom: theme.spacing[4],
    animation: 'shake 0.5s ease-in-out',
    ...style
  };

  return (
    <div 
      className={`error-message animate-fadeIn ${className}`}
      style={combinedStyle}
      {...props}
    >
      <span style={{ fontSize: '16px' }}>
        {currentIcon}
      </span>
      
      <span style={{ flex: 1 }}>
        {message}
      </span>
      
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            fontSize: '18px',
            padding: '0',
            marginLeft: theme.spacing[2]
          }}
          aria-label="Fechar mensagem"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
