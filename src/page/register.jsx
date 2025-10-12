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
    <div style={{ ...styles.background, ...getGradientBackground() }}>
      <Card title="Criar Conta" className="animate-scaleIn">
        {error && (
          <ErrorMessage
            message={error}
            type="error"
            onClose={clearError}
          />
        )}
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <Input
            type="text"
            name="name"
            label="Nome Completo"
            placeholder="Digite seu nome completo"
            value={formData.name}
            onChange={handleInputChange}
            error={errors.name}
            required
          />
          
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
          
          <div>
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
          
          <Input
            type="password"
            name="confirmPassword"
            label="Confirmar Senha"
            placeholder="Confirme sua senha"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            error={errors.confirmPassword}
            required
          />
          
          <div style={styles.termsContainer}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                required
                style={styles.checkbox}
              />
              <span style={styles.termsText}>
                Eu aceito os <a href="#" style={styles.termsLink}>Termos de Uso</a> e 
                <a href="#" style={styles.termsLink}> Política de Privacidade</a>
              </span>
            </label>
          </div>
          
          <Button
            type="submit"
            variant="success"
            size="lg"
            loading={loading}
            style={{ marginBottom: theme.spacing[4] }}
          >
            {loading ? "Criando conta..." : "Criar Conta"}
          </Button>
        </form>
        
        <div style={styles.divider}>
          <span style={styles.dividerText}>ou</span>
        </div>
        
        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={() => navigate("/")}
        >
          Já tenho uma conta
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
  passwordStrength: {
    marginTop: theme.spacing[2],
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing[1]
  },
  strengthBar: {
    width: "100%",
    height: "4px",
    backgroundColor: theme.colors.gray[300],
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
    color: theme.colors.white,
    cursor: "pointer",
    lineHeight: theme.typography.lineHeight.normal
  },
  checkbox: {
    width: "16px",
    height: "16px",
    accentColor: theme.colors.success,
    marginTop: "2px",
    flexShrink: 0
  },
  termsText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.white,
    opacity: 0.9
  },
  termsLink: {
    color: theme.colors.white,
    textDecoration: "underline",
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
  }
};
