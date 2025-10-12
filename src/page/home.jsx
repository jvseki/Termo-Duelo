import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getGradientBackground, theme } from "../styles/theme";
import Card from "../components/Card";
import Button from "../components/Button";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Home() {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editName, setEditName] = useState("");
  
  const { user, logout, updateUser, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user) {
      setEditName(user.name);
    }
  }, [user]);

  if (!user) {
    return (
      <div style={{ ...styles.background, ...getGradientBackground() }}>
        <LoadingSpinner size="lg" text="Carregando..." />
      </div>
    );
  }

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      navigate("/");
    }
  };

  const handleEditProfile = async (e) => {
    e.preventDefault();
    if (editName.trim() === user.name) {
      setShowEditProfile(false);
      return;
    }

    const result = await updateUser({ name: editName.trim() });
    if (result.success) {
      setShowEditProfile(false);
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  if (showLogoutConfirm) {
    return (
      <div style={{ ...styles.background, ...getGradientBackground() }}>
        <Card title="Confirmar Saída" className="animate-scaleIn">
          <p style={styles.confirmText}>
            Tem certeza que deseja sair da sua conta?
          </p>
          
          <div style={styles.confirmButtons}>
            <Button
              variant="danger"
              size="md"
              onClick={handleLogout}
              loading={loading}
              style={{ marginRight: theme.spacing[3] }}
            >
              Sim, Sair
            </Button>
            
            <Button
              variant="secondary"
              size="md"
              onClick={() => setShowLogoutConfirm(false)}
            >
              Cancelar
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (showEditProfile) {
    return (
      <div style={{ ...styles.background, ...getGradientBackground() }}>
        <Card title="Editar Perfil" className="animate-scaleIn">
          <form onSubmit={handleEditProfile} style={styles.form}>
            <div style={styles.avatarContainer}>
              <div style={styles.avatar}>
                {getInitials(editName)}
              </div>
            </div>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>Nome</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                style={styles.input}
                required
                maxLength={50}
              />
            </div>
            
            <div style={styles.formButtons}>
              <Button
                type="submit"
                variant="success"
                size="md"
                loading={loading}
                style={{ marginRight: theme.spacing[3] }}
              >
                Salvar
              </Button>
              
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => {
                  setShowEditProfile(false);
                  setEditName(user.name);
                }}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ ...styles.background, ...getGradientBackground() }}>
      <Card className="animate-scaleIn">
        <div style={styles.header}>
          <div style={styles.avatarContainer}>
            <div style={styles.avatar}>
              {getInitials(user.name)}
            </div>
            <button
              onClick={() => setShowEditProfile(true)}
              style={styles.editButton}
              title="Editar perfil"
            >
              ✏️
            </button>
          </div>
          
          <h1 style={styles.title}>
            {getGreeting()}, {user.name.split(' ')[0]}! 🎯
          </h1>
          
          <div style={styles.statsContainer}>
            <div style={styles.statItem}>
              <span style={styles.statValue}>{user.pontuacao}</span>
              <span style={styles.statLabel}>Pontos</span>
            </div>
            
            <div style={styles.statItem}>
              <span style={styles.statValue}>0</span>
              <span style={styles.statLabel}>Vitórias</span>
            </div>
            
            <div style={styles.statItem}>
              <span style={styles.statValue}>0</span>
              <span style={styles.statLabel}>Partidas</span>
            </div>
          </div>
        </div>

        <div style={styles.gameButtons}>
          <Button
            variant="success"
            size="lg"
            onClick={() => alert("Modo Solo será implementado em breve!")}
            style={styles.gameButton}
          >
            🎮 Jogar Sozinho
          </Button>
          
          <Button
            variant="warning"
            size="lg"
            onClick={() => alert("Desafio 1x1 será implementado em breve!")}
            style={styles.gameButton}
          >
            ⚔️ Desafiar Jogador
          </Button>
          
          <Button
            variant="info"
            size="md"
            onClick={() => alert("Ranking será implementado em breve!")}
            style={styles.gameButton}
          >
            🏆 Ver Ranking
          </Button>
        </div>

        <div style={styles.footer}>
          <Button
            variant="danger"
            size="md"
            onClick={() => setShowLogoutConfirm(true)}
            style={styles.logoutButton}
          >
            Sair da Conta
          </Button>
        </div>
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
  header: {
    textAlign: "center",
    marginBottom: theme.spacing[8]
  },
  avatarContainer: {
    position: "relative",
    display: "inline-block",
    marginBottom: theme.spacing[4]
  },
  avatar: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    backgroundColor: theme.colors.primary.main,
    color: theme.colors.white,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    boxShadow: theme.shadows.lg,
    margin: "0 auto"
  },
  editButton: {
    position: "absolute",
    bottom: "-5px",
    right: "-5px",
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    backgroundColor: theme.colors.white,
    border: "2px solid",
    borderColor: theme.colors.primary.main,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    transition: "all 0.3s ease",
    boxShadow: theme.shadows.md
  },
  title: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize['3xl'],
    marginBottom: theme.spacing[6],
    fontWeight: theme.typography.fontWeight.bold,
    letterSpacing: "1px"
  },
  statsContainer: {
    display: "flex",
    justifyContent: "center",
    gap: theme.spacing[6],
    marginBottom: theme.spacing[2]
  },
  statItem: {
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing[1]
  },
  statValue: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold
  },
  statLabel: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.sm,
    opacity: 0.8
  },
  gameButtons: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing[4],
    marginBottom: theme.spacing[8]
  },
  gameButton: {
    width: "100%"
  },
  footer: {
    textAlign: "center"
  },
  logoutButton: {
    opacity: 0.8,
    transition: "opacity 0.3s ease"
  },
  confirmText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.lg,
    marginBottom: theme.spacing[6],
    textAlign: "center"
  },
  confirmButtons: {
    display: "flex",
    justifyContent: "center",
    gap: theme.spacing[3]
  },
  form: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: theme.spacing[4]
  },
  inputGroup: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing[2]
  },
  label: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium
  },
  input: {
    width: "100%",
    padding: theme.spacing[3],
    fontSize: theme.typography.fontSize.base,
    borderRadius: theme.borderRadius.base,
    border: `2px solid ${theme.colors.gray[300]}`,
    outline: "none",
    transition: `border-color ${theme.transitions.duration.fast} ${theme.transitions.easing.easeInOut}`,
    fontFamily: theme.typography.fontFamily,
    backgroundColor: theme.colors.white
  },
  formButtons: {
    display: "flex",
    gap: theme.spacing[3],
    width: "100%"
  }
};
