import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { validateRegistrationForm } from "../utils/validators";
import { getGradientBackground, theme } from "../styles/theme";
import Card from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";
import ErrorMessage from "../components/ErrorMessage";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState('weak');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { register, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  // Limpar erros quando o usuário digita
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      setErrors({});
    }
    if (error) {
      clearError();
    }
  }, [formData.name, formData.email, formData.password, formData.confirmPassword]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar formulário
    const validation = validateRegistrationForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setPasswordStrength(validation.passwordStrength);
      return;
    }

    // Tentar fazer registro
    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password
    });

    if (result.success) {
      navigate("/home");
    }
  };

  const getPasswordStrengthColor = (strength) => {
    switch (strength) {
      case 'weak': return theme.colors.danger;
      case 'medium': return theme.colors.warning;
      case 'strong': return theme.colors.success;
      default: return theme.colors.gray[500];
    }
  };

  const getPasswordStrengthText = (strength) => {
    switch (strength) {
      case 'weak': return 'Fraca';
      case 'medium': return 'Média';
      case 'strong': return 'Forte';
      default: return '';
    }
  };

  return (
    <div style={styles.background}>
      <div style={styles.container}>
        {/* Header com Logo */}
        <div style={styles.header}>
          <div style={styles.logo}>
            <div style={{...styles.logoLetter, backgroundColor: '#10b981'}}>T</div>
            <div style={{...styles.logoLetter, backgroundColor: '#f59e0b'}}>E</div>
            <div style={{...styles.logoLetter, backgroundColor: '#f59e0b'}}>R</div>
            <div style={{...styles.logoLetter, backgroundColor: '#10b981'}}>M</div>
            <div style={{...styles.logoLetter, backgroundColor: '#f59e0b'}}>O</div>
          </div>
          <h1 style={styles.title}>Criar Conta</h1>
          <p style={styles.subtitle}>Junte-se à comunidade Termo</p>
        </div>

        {/* Card de Registro */}
        <div style={styles.registerCard}>
          {error && (
            <ErrorMessage
              message={error}
              type="error"
              onClose={clearError}
            />
          )}
          
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Nome completo</label>
              <input
                type="text"
                name="name"
                placeholder="Seu nome completo"
                value={formData.name}
                onChange={handleInputChange}
                style={styles.input}
                required
              />
            </div>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                name="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={handleInputChange}
                style={styles.input}
                required
              />
            </div>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>Senha</label>
              <div style={styles.passwordContainer}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Crie uma senha forte"
                  value={formData.password}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                />
                <button 
                  type="button" 
                  style={styles.eyeButton}
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
              
              {formData.password && (
                <div style={styles.passwordStrength}>
                  <div style={styles.strengthBar}>
                    <div 
                      style={{
                        ...styles.strengthFill,
                        width: passwordStrength === 'weak' ? '33%' : passwordStrength === 'medium' ? '66%' : '100%',
                        backgroundColor: getPasswordStrengthColor(passwordStrength)
                      }}
                    />
                  </div>
                  <span 
                    style={{
                      ...styles.strengthText,
                      color: getPasswordStrengthColor(passwordStrength)
                    }}
                  >
                    Senha {getPasswordStrengthText(passwordStrength)}
                  </span>
                </div>
              )}
            </div>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>Confirmar senha</label>
              <div style={styles.passwordContainer}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirme sua senha"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                />
                <button 
                  type="button" 
                  style={styles.eyeButton}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  title={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showConfirmPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>
            
            <div style={styles.termsContainer}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  required
                  style={styles.checkbox}
                />
                <span style={styles.termsText}>
                  Eu concordo com os <a href="#" style={styles.termsLink}>Termos de Uso</a> e 
                  <a href="#" style={styles.termsLink}> Política de Privacidade</a>
                </span>
              </label>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              style={styles.registerButton}
            >
              {loading ? "Criando conta..." : "Criar Conta"}
            </button>
          </form>
          
          <div style={styles.divider}>
            <span style={styles.dividerText}>ou</span>
          </div>
          
          <div style={styles.socialButtons}>
            <button type="button" style={styles.socialButton}>
              <span style={styles.googleIcon}>G</span>
              Google
            </button>
            <button type="button" style={styles.socialButton}>
              <span style={styles.facebookIcon}>f</span>
              Facebook
            </button>
          </div>

          <div style={styles.loginLink}>
            <span style={styles.loginText}>Já tem uma conta? </span>
            <button
              type="button"
              onClick={() => navigate("/")}
              style={styles.loginButton}
            >
              Fazer login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  background: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: theme.spacing[4]
  },
  container: {
    width: "100%",
    maxWidth: "400px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  header: {
    textAlign: "center",
    marginBottom: theme.spacing[8]
  },
  logo: {
    display: "flex",
    gap: theme.spacing[2],
    marginBottom: theme.spacing[6],
    justifyContent: "center"
  },
  logoLetter: {
    width: "40px",
    height: "40px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    boxShadow: theme.shadows.md
  },
  title: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing[2],
    letterSpacing: "0.5px"
  },
  subtitle: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.base,
    opacity: 0.9,
    margin: 0
  },
  registerCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing[8],
    width: "100%",
    boxShadow: theme.shadows.xl
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing[4]
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing[2]
  },
  label: {
    color: theme.colors.gray[700],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium
  },
  input: {
    width: "100%",
    padding: theme.spacing[3],
    fontSize: theme.typography.fontSize.base,
    borderRadius: theme.borderRadius.base,
    border: `2px solid ${theme.colors.gray[200]}`,
    outline: "none",
    transition: "all 0.3s ease",
    fontFamily: theme.typography.fontFamily,
    "&:focus": {
      borderColor: theme.colors.primary.main,
      boxShadow: `0 0 0 3px ${theme.colors.primary.main}20`
    }
  },
  passwordContainer: {
    position: "relative",
    display: "flex",
    alignItems: "center"
  },
  eyeButton: {
    position: "absolute",
    right: theme.spacing[3],
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
    color: theme.colors.gray[500]
  },
  passwordStrength: {
    marginTop: theme.spacing[2],
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing[1]
  },
  strengthBar: {
    width: "100%",
    height: "4px",
    backgroundColor: theme.colors.gray[200],
    borderRadius: theme.borderRadius.sm,
    overflow: "hidden"
  },
  strengthFill: {
    height: "100%",
    transition: "width 0.3s ease, background-color 0.3s ease"
  },
  strengthText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium
  },
  termsContainer: {
    marginBottom: theme.spacing[4]
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "flex-start",
    gap: theme.spacing[2],
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.gray[700],
    cursor: "pointer",
    lineHeight: theme.typography.lineHeight.normal
  },
  checkbox: {
    width: "16px",
    height: "16px",
    accentColor: theme.colors.primary.main,
    marginTop: "2px",
    flexShrink: 0
  },
  termsText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.gray[700],
    opacity: 0.9
  },
  termsLink: {
    color: theme.colors.primary.main,
    textDecoration: "underline",
    transition: "color 0.3s ease",
    "&:hover": {
      color: theme.colors.primary.dark
    }
  },
  registerButton: {
    backgroundColor: theme.colors.gray[800],
    color: theme.colors.white,
    padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
    border: "none",
    borderRadius: theme.borderRadius.base,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    cursor: "pointer",
    transition: "all 0.3s ease",
    width: "100%",
    marginBottom: theme.spacing[4],
    "&:hover": {
      backgroundColor: theme.colors.gray[900],
      transform: "translateY(-1px)",
      boxShadow: theme.shadows.md
    },
    "&:disabled": {
      opacity: 0.6,
      cursor: "not-allowed",
      transform: "none"
    }
  },
  divider: {
    position: "relative",
    textAlign: "center",
    margin: `${theme.spacing[6]} 0`
  },
  dividerText: {
    background: theme.colors.white,
    padding: `0 ${theme.spacing[4]}`,
    color: theme.colors.gray[500],
    fontSize: theme.typography.fontSize.sm
  },
  socialButtons: {
    display: "flex",
    gap: theme.spacing[3],
    marginBottom: theme.spacing[6]
  },
  socialButton: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing[2],
    padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
    border: `2px solid ${theme.colors.gray[200]}`,
    borderRadius: theme.borderRadius.base,
    backgroundColor: theme.colors.white,
    color: theme.colors.gray[700],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    cursor: "pointer",
    transition: "all 0.3s ease",
    "&:hover": {
      borderColor: theme.colors.gray[300],
      transform: "translateY(-1px)",
      boxShadow: theme.shadows.sm
    }
  },
  googleIcon: {
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    backgroundColor: "#4285f4",
    color: theme.colors.white,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "bold"
  },
  facebookIcon: {
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    backgroundColor: "#1877f2",
    color: theme.colors.white,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "bold"
  },
  loginLink: {
    textAlign: "center"
  },
  loginText: {
    color: theme.colors.gray[600],
    fontSize: theme.typography.fontSize.sm
  },
  loginButton: {
    background: "none",
    border: "none",
    color: theme.colors.primary.main,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    cursor: "pointer",
    textDecoration: "underline",
    transition: "color 0.3s ease",
    "&:hover": {
      color: theme.colors.primary.dark
    }
  }
};
