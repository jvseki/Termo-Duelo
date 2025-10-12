// Componente Toast para notificações
import { useState, useEffect } from 'react';
import { theme } from '../styles/theme';

const Toast = ({
  message,
  type = 'info',
  duration = 5000,
  position = 'top-right',
  onClose,
  className = '',
  style = {},
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 300);
  };

  if (!isVisible) return null;

  const typeStyles = {
    success: {
      backgroundColor: theme.colors.success,
      color: theme.colors.white,
      icon: '✅'
    },
    error: {
      backgroundColor: theme.colors.danger,
      color: theme.colors.white,
      icon: '❌'
    },
    warning: {
      backgroundColor: theme.colors.warning,
      color: theme.colors.white,
      icon: '⚠️'
    },
    info: {
      backgroundColor: theme.colors.info,
      color: theme.colors.white,
      icon: 'ℹ️'
    }
  };

  const positionStyles = {
    'top-right': {
      top: theme.spacing[4],
      right: theme.spacing[4]
    },
    'top-left': {
      top: theme.spacing[4],
      left: theme.spacing[4]
    },
    'bottom-right': {
      bottom: theme.spacing[4],
      right: theme.spacing[4]
    },
    'bottom-left': {
      bottom: theme.spacing[4],
      left: theme.spacing[4]
    },
    'top-center': {
      top: theme.spacing[4],
      left: '50%',
      transform: 'translateX(-50%)'
    },
    'bottom-center': {
      bottom: theme.spacing[4],
      left: '50%',
      transform: 'translateX(-50%)'
    }
  };

  const currentTypeStyle = typeStyles[type] || typeStyles.info;
  const currentPositionStyle = positionStyles[position] || positionStyles['top-right'];

  const combinedStyle = {
    position: 'fixed',
    zIndex: theme.zIndex.toast,
    padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
    borderRadius: theme.borderRadius.base,
    backgroundColor: currentTypeStyle.backgroundColor,
    color: currentTypeStyle.color,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    boxShadow: theme.shadows.lg,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[2],
    minWidth: '300px',
    maxWidth: '400px',
    animation: isLeaving ? 'fadeOut 0.3s ease-in-out' : 'slideInFromRight 0.3s ease-out',
    ...currentPositionStyle,
    ...style
  };

  return (
    <div 
      className={`toast ${className}`}
      style={combinedStyle}
      {...props}
    >
      <span style={{ fontSize: '16px' }}>
        {currentTypeStyle.icon}
      </span>
      
      <span style={{ flex: 1 }}>
        {message}
      </span>
      
      <button
        onClick={handleClose}
        style={{
          background: 'none',
          border: 'none',
          color: 'inherit',
          cursor: 'pointer',
          fontSize: '18px',
          padding: '0',
          marginLeft: theme.spacing[2],
          opacity: 0.7
        }}
        aria-label="Fechar notificação"
      >
        ×
      </button>
    </div>
  );
};

// Hook para usar Toast facilmente
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = (toast) => {
    const id = Date.now().toString();
    const newToast = { ...toast, id };
    
    setToasts(prev => [...prev, newToast]);
    
    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const showSuccess = (message, options = {}) => {
    return addToast({ message, type: 'success', ...options });
  };

  const showError = (message, options = {}) => {
    return addToast({ message, type: 'error', ...options });
  };

  const showWarning = (message, options = {}) => {
    return addToast({ message, type: 'warning', ...options });
  };

  const showInfo = (message, options = {}) => {
    return addToast({ message, type: 'info', ...options });
  };

  const ToastContainer = () => (
    <div style={{ position: 'fixed', zIndex: theme.zIndex.toast }}>
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );

  return {
    addToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    ToastContainer
  };
};

export default Toast;
