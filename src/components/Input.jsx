// Componente Input reutilizável
import { useState } from 'react';
import { getInputStyle, theme } from '../styles/theme';

const Input = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  icon,
  iconPosition = 'left',
  className = '',
  style = {},
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  
  const inputStyle = getInputStyle(!!error);
  
  const combinedStyle = {
    ...inputStyle,
    ...style,
    paddingLeft: icon && iconPosition === 'left' ? '40px' : inputStyle.paddingLeft,
    paddingRight: icon && iconPosition === 'right' ? '40px' : inputStyle.paddingRight,
    opacity: disabled ? 0.6 : 1,
    cursor: disabled ? 'not-allowed' : 'text'
  };

  const handleFocus = (e) => {
    setIsFocused(true);
    if (props.onFocus) props.onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (props.onBlur) props.onBlur(e);
  };

  return (
    <div className={`input-wrapper ${className}`} style={{ width: '100%', marginBottom: theme.spacing[4] }}>
      {label && (
        <label 
          style={{
            display: 'block',
            marginBottom: theme.spacing[2],
            fontSize: theme.typography.fontSize.sm,
            fontWeight: theme.typography.fontWeight.medium,
            color: error ? theme.colors.danger : theme.colors.gray[700]
          }}
        >
          {label}
          {required && <span style={{ color: theme.colors.danger, marginLeft: '4px' }}>*</span>}
        </label>
      )}
      
      <div style={{ position: 'relative' }}>
        {icon && iconPosition === 'left' && (
          <div 
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: error ? theme.colors.danger : theme.colors.gray[500],
              zIndex: 1
            }}
          >
            {icon}
          </div>
        )}
        
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          required={required}
          style={combinedStyle}
          {...props}
        />
        
        {icon && iconPosition === 'right' && (
          <div 
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: error ? theme.colors.danger : theme.colors.gray[500],
              zIndex: 1
            }}
          >
            {icon}
          </div>
        )}
      </div>
      
      {error && (
        <div 
          style={{
            marginTop: theme.spacing[1],
            fontSize: theme.typography.fontSize.xs,
            color: theme.colors.danger,
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <span>⚠️</span>
          {error}
        </div>
      )}
    </div>
  );
};

export default Input;
