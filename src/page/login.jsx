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
    <div style={{ ...styles.background, ...getGradientBackground() }}>
      <Card title="🔥 Termo Duelo 🔥" className="animate-scaleIn">
        {error && (
          <ErrorMessage
            message={error}
            type="error"
            onClose={clearError}
          />
        )}
        
        <form onSubmit={handleSubmit} style={styles.form}>
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

          <Input
            type="password"
            name="password"
            label="Senha"
            placeholder="Digite sua senha"
            value={formData.password}
            onChange={handleInputChange}
            error={errors.password}
            required
          />

          <div style={styles.optionsContainer}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={styles.checkbox}
              />
              Lembrar-me
            </label>

            <button
              type="button"
              onClick={handleForgotPassword}
              style={styles.forgotPasswordLink}
            >
              Esqueci minha senha
            </button>
          </div>

          {/* BOTÃO VERMELHO */}
          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.redButton,
              opacity: loading ? 0.8 : 1,
              cursor: loading ? "not-allowed" : "pointer"
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#b71c1c"}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#d32f2f"}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div style={styles.divider}>
          <span style={styles.dividerText}>ou</span>
        </div>

        <Button
          type="button"
          variant="success"
          size="md"
          onClick={() => navigate("/register")}
        >
          Criar Nova Conta
        </Button>
      </Card>
    </div>
  );
}

const styles = {
  background: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing[4]
  },
  form: {
    display: "flex",
    flexDirection: "column",
    width: "100%"
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
    color: theme.colors.white,
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
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.sm,
    textDecoration: "underline",
    cursor: "pointer",
    opacity: 0.8,
    transition: "opacity 0.3s ease"
  },
  divider: {
    position: "relative",
    textAlign: "center",
    margin: `${theme.spacing[6]} 0`
  },
  dividerText: {
    background: "rgba(255, 255, 255, 0.15)",
    padding: `0 ${theme.spacing[4]}`,
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.sm,
    opacity: 0.8
  },
  buttonGroup: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing[2]
  },
  redButton: {
    backgroundColor: "#d32f2f",   
    color: "white",
    padding: "12px",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "bold",
    transition: "background-color 0.3s ease",
    marginBottom: theme.spacing[4]
  }
};
