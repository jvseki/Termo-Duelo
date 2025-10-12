// Componente LoadingSpinner reutilizável
import { theme } from '../styles/theme';

const LoadingSpinner = ({
  size = 'md',
  color = theme.colors.primary.main,
  text,
  className = '',
  style = {}
}) => {
  const sizes = {
    sm: '16px',
    md: '24px',
    lg: '32px',
    xl: '48px'
  };

  const spinnerSize = sizes[size] || sizes.md;

  const spinnerStyle = {
    width: spinnerSize,
    height: spinnerSize,
    border: `2px solid ${color}20`,
    borderTop: `2px solid ${color}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    ...style
  };

  return (
    <div 
      className={`loading-spinner ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing[3]
      }}
    >
      <div style={spinnerStyle} />
      {text && (
        <p 
          style={{
            color: color,
            fontSize: theme.typography.fontSize.sm,
            fontWeight: theme.typography.fontWeight.medium,
            margin: 0
          }}
        >
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
