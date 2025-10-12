// Componente Button reutilizável
import { getButtonStyle } from '../styles/theme';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = '',
  style = {},
  ...props 
}) => {
  const buttonStyle = getButtonStyle(variant, size);
  
  const handleClick = (e) => {
    if (disabled || loading) return;
    if (onClick) onClick(e);
  };

  const combinedStyle = {
    ...buttonStyle,
    ...style,
    opacity: disabled ? 0.6 : 1,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    position: 'relative'
  };

  return (
    <button
      type={type}
      className={`transition-all ${className}`}
      style={combinedStyle}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span 
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: '16px',
            height: '16px',
            border: '2px solid transparent',
            borderTop: '2px solid currentColor',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}
        />
      )}
      <span style={{ opacity: loading ? 0 : 1 }}>
        {children}
      </span>
    </button>
  );
};

export default Button;
