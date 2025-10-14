// Design System - Theme centralizado
export const theme = {
  colors: {
    primary: {
      main: '#2563eb', // Azul profissional
      light: '#3b82f6',
      dark: '#1d4ed8',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    secondary: {
      main: '#10b981', // Verde esmeralda
      light: '#34d399',
      dark: '#059669'
    },
    accent: {
      main: '#f59e0b', // Âmbar
      light: '#fbbf24',
      dark: '#d97706'
    },
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
    white: '#ffffff',
    black: '#111827',
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827'
    },
    surface: {
      primary: '#ffffff',
      secondary: '#f8fafc',
      tertiary: '#f1f5f9'
    }
  },
  
  typography: {
    fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif',
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem'  // 36px
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75
    }
  },
  
  spacing: {
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem',     // 96px
    32: '8rem'      // 128px
  },
  
  borderRadius: {
    none: '0',
    sm: '0.25rem',   // 4px
    base: '0.5rem',  // 8px
    md: '0.75rem',   // 12px
    lg: '1rem',      // 16px
    xl: '1.5rem',    // 24px
    full: '9999px'
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    glass: '0 0 20px rgba(0, 0, 0, 0.2)'
  },
  
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },
  
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800
  },
  
  transitions: {
    duration: {
      fastest: '150ms',
      fast: '200ms',
      normal: '300ms',
      slow: '500ms',
      slowest: '1000ms'
    },
    easing: {
      linear: 'linear',
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out'
    }
  }
};

// Funções helper para gerar estilos
export const createStyles = (styleObject) => styleObject;

export const getGlassmorphismStyle = (opacity = 0.15) => ({
  background: `rgba(255, 255, 255, ${opacity})`,
  backdropFilter: 'blur(10px)',
  borderRadius: theme.borderRadius.lg,
  boxShadow: theme.shadows.glass
});

export const getGradientBackground = (gradient = theme.colors.primary.gradient) => ({
  background: gradient,
  backgroundSize: '400% 400%',
  animation: 'gradient 10s ease infinite'
});

export const getButtonStyle = (variant = 'primary', size = 'md') => {
  const baseStyle = {
    border: 'none',
    borderRadius: theme.borderRadius.base,
    cursor: 'pointer',
    fontFamily: theme.typography.fontFamily,
    fontWeight: theme.typography.fontWeight.medium,
    transition: `all ${theme.transitions.duration.fast} ${theme.transitions.easing.easeInOut}`,
    outline: 'none',
    '&:hover': {
      transform: 'translateY(-1px)',
      boxShadow: theme.shadows.md
    },
    '&:active': {
      transform: 'translateY(0)'
    },
    '&:disabled': {
      opacity: 0.6,
      cursor: 'not-allowed',
      transform: 'none'
    }
  };

  const variants = {
    primary: {
      background: theme.colors.primary.main,
      color: theme.colors.white,
      '&:hover': {
        ...baseStyle['&:hover'],
        background: theme.colors.primary.dark
      }
    },
    secondary: {
      background: theme.colors.secondary.main,
      color: theme.colors.white,
      '&:hover': {
        ...baseStyle['&:hover'],
        background: theme.colors.secondary.dark
      }
    },
    success: {
      background: theme.colors.success,
      color: theme.colors.white,
      '&:hover': {
        ...baseStyle['&:hover'],
        background: '#45a049'
      }
    },
    danger: {
      background: theme.colors.danger,
      color: theme.colors.white,
      '&:hover': {
        ...baseStyle['&:hover'],
        background: '#d32f2f'
      }
    },
    warning: {
      background: theme.colors.warning,
      color: theme.colors.white,
      '&:hover': {
        ...baseStyle['&:hover'],
        background: '#f57c00'
      }
    }
  };

  const sizes = {
    sm: {
      padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
      fontSize: theme.typography.fontSize.sm
    },
    md: {
      padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
      fontSize: theme.typography.fontSize.base
    },
    lg: {
      padding: `${theme.spacing[4]} ${theme.spacing[6]}`,
      fontSize: theme.typography.fontSize.lg
    }
  };

  return {
    ...baseStyle,
    ...variants[variant],
    ...sizes[size]
  };
};

export const getInputStyle = (hasError = false) => ({
  width: '100%',
  padding: theme.spacing[3],
  fontSize: theme.typography.fontSize.base,
  borderRadius: theme.borderRadius.base,
  border: `2px solid ${hasError ? theme.colors.danger : theme.colors.gray[300]}`,
  outline: 'none',
  transition: `border-color ${theme.transitions.duration.fast} ${theme.transitions.easing.easeInOut}`,
  fontFamily: theme.typography.fontFamily,
  '&:focus': {
    borderColor: hasError ? theme.colors.danger : theme.colors.primary.main,
    boxShadow: `0 0 0 3px ${hasError ? theme.colors.danger + '20' : theme.colors.primary.main + '20'}`
  },
  '&::placeholder': {
    color: theme.colors.gray[500]
  }
});

export const getCardStyle = () => ({
  ...getGlassmorphismStyle(),
  padding: theme.spacing[8],
  textAlign: 'center',
  width: '100%',
  maxWidth: '400px'
});

export default theme;
