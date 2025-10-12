// Componente Card reutilizável
import { getCardStyle, theme } from '../styles/theme';

const Card = ({
  children,
  title,
  subtitle,
  className = '',
  style = {},
  padding = '2rem',
  width = '100%',
  maxWidth = '400px',
  ...props
}) => {
  const cardStyle = getCardStyle();
  
  const combinedStyle = {
    ...cardStyle,
    padding,
    width,
    maxWidth,
    ...style
  };

  return (
    <div 
      className={`card animate-scaleIn ${className}`}
      style={combinedStyle}
      {...props}
    >
      {title && (
        <h1 
          style={{
            color: theme.colors.white,
            fontSize: theme.typography.fontSize['2xl'],
            marginBottom: theme.spacing[4],
            fontWeight: theme.typography.fontWeight.bold,
            letterSpacing: '1px'
          }}
        >
          {title}
        </h1>
      )}
      
      {subtitle && (
        <p 
          style={{
            color: theme.colors.white,
            fontSize: theme.typography.fontSize.base,
            marginBottom: theme.spacing[6],
            opacity: 0.9
          }}
        >
          {subtitle}
        </p>
      )}
      
      {children}
    </div>
  );
};

export default Card;
