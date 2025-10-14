import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { validateLoginForm } from "../utils/validators";
import { getGradientBackground, theme } from "../styles/theme";
import Card from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";
import ErrorMessage from "../components/ErrorMessage";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [errors, setErrors] = useState({});
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      setErrors({});
    }
    if (error) {
      clearError();
    }
  }, [formData.email, formData.password]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = validateLoginForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    const result = await login({
      ...formData,
      rememberMe
    });

    if (result.success) {
      navigate("/home");
    }
  };

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
  };

  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault();
    alert("Funcionalidade de recuperação de senha será implementada em breve!");
    setShowForgotPassword(false);
  };

  if (showForgotPassword) {
    return (
      <div style={{ ...styles.background, ...getGradientBackground() }}>
        <Card title="Recuperar Senha" className="animate-scaleIn">
          <form onSubmit={handleForgotPasswordSubmit} style={styles.form}>
            <Input
              type="email"
              name="email"
              label="E-mail"
              placeholder="Digite seu e-mail"
              value={formData.email}
              onChange={handleInputChange}
              error={errors.email}
              required
            />
            <div style={styles.buttonGroup}>
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={loading}
                style={{ marginBottom: theme.spacing[3] }}
              >
                Enviar Link de Recuperação
              </Button>

              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => setShowForgotPassword(false)}
              >
                Voltar ao Login
              </Button>
            </div>
          </form>
        </Card>
      </div>
    );
  }

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
          <h1 style={styles.title}>Bem-vindo ao Termo</h1>
          <p style={styles.subtitle}>Faça login para continuar jogando</p>
        </div>

        {/* Card de Login */}
        <div style={styles.loginCard}>
          {error && (
            <ErrorMessage
              message={error}
              type="error"
              onClose={clearError}
            />
          )}
          
          <form onSubmit={handleSubmit} style={styles.form}>
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
                  placeholder="********"
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
            </div>

            <div style={styles.optionsContainer}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={styles.checkbox}
                />
                Lembrar de mim
              </label>

              <button
                type="button"
                onClick={handleForgotPassword}
                style={styles.forgotPasswordLink}
              >
                Esqueceu a senha?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={styles.loginButton}
            >
              {loading ? "Entrando..." : "Entrar"}
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

          <div style={styles.registerLink}>
            <span style={styles.registerText}>Não tem uma conta? </span>
            <button
              type="button"
              onClick={() => navigate("/register")}
              style={styles.registerButton}
            >
              Cadastre-se
            </button>
          </div>
        </div>

        <div style={styles.footer}>
          <span style={styles.footerText}>
            Ao continuar, você concorda com a{" "}
            <a href="#" style={styles.footerLink}>Política de Privacidade</a>
          </span>
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
  loginCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing[8],
    width: "100%",
    boxShadow: theme.shadows.xl,
    marginBottom: theme.spacing[6]
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
  optionsContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing[4]
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing[2],
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.gray[700],
    cursor: "pointer"
  },
  checkbox: {
    width: "16px",
    height: "16px",
    accentColor: theme.colors.primary.main
  },
  forgotPasswordLink: {
    background: "none",
    border: "none",
    color: theme.colors.gray[500],
    fontSize: theme.typography.fontSize.sm,
    textDecoration: "underline",
    cursor: "pointer",
    transition: "color 0.3s ease",
    "&:hover": {
      color: theme.colors.primary.main
    }
  },
  loginButton: {
    backgroundColor: theme.colors.primary.main,
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
      backgroundColor: theme.colors.primary.dark,
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
  registerLink: {
    textAlign: "center"
  },
  registerText: {
    color: theme.colors.gray[600],
    fontSize: theme.typography.fontSize.sm
  },
  registerButton: {
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
  },
  footer: {
    textAlign: "center"
  },
  footerText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.xs,
    opacity: 0.8
  },
  footerLink: {
    color: theme.colors.white,
    textDecoration: "underline",
    opacity: 0.8,
    transition: "opacity 0.3s ease",
    "&:hover": {
      opacity: 1
    }
  },
  buttonGroup: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing[2]
  }
};
