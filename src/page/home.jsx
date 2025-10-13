import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getGradientBackground, theme } from "../styles/theme";
import Card from "../components/Card";
import Button from "../components/Button";
import LoadingSpinner from "../components/LoadingSpinner";
import esqueleto from "../assets/esqueleto.png";
import robo from "../assets/robo.png";
import roqueira from "../assets/roqueira.png";
import skatista from "../assets/skatista.png";

export default function Home() {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [editName, setEditName] = useState("");
  const [editAvatar, setEditAvatar] = useState(null);
  const [friendEmail, setFriendEmail] = useState("");
  const [friends, setFriends] = useState([]);
  
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
      setEditAvatar(user.avatar || null);
    
      loadFriends();
    }
  }, [user]);

  const loadFriends = () => {
    try {
      const savedFriends = localStorage.getItem(`friends_${user?.id}`);
      if (savedFriends) {
        setFriends(JSON.parse(savedFriends));
      }
    } catch (error) {
      console.error('Erro ao carregar amigos:', error);
    }
  };

  const saveFriends = (friendsList) => {
    try {
      localStorage.setItem(`friends_${user.id}`, JSON.stringify(friendsList));
    } catch (error) {
      console.error('Erro ao salvar amigos:', error);
    }
  };

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
    if (editName.trim() === user.name && (editAvatar || null) === (user.avatar || null)) {
      setShowEditProfile(false);
      return;
    }

    const result = await updateUser({ name: editName.trim(), avatar: editAvatar || null });
    if (result.success) {
      setShowEditProfile(false);
    }
  };

  const handleAddFriend = async (e) => {
    e.preventDefault();
    
    if (!friendEmail.trim()) {
      alert("Por favor, digite o email do amigo!");
      return;
    }

  
    if (friends.some(friend => friend.email === friendEmail.toLowerCase())) {
      alert("Este usuário já está na sua lista de amigos!");
      return;
    }

  
    if (friendEmail.toLowerCase() === user.email) {
      alert("Você não pode adicionar a si mesmo como amigo!");
      return;
    }

  
    const allUsers = JSON.parse(localStorage.getItem('termo_duelo_users') || '[]');
    const friendUser = allUsers.find(u => u.email === friendEmail.toLowerCase());

    if (!friendUser) {
      alert("Usuário não encontrado! Verifique o email digitado.");
      return;
    }


    const newFriend = {
      id: friendUser.id,
      name: friendUser.name,
      email: friendUser.email,
      addedAt: new Date().toISOString()
    };

    const updatedFriends = [...friends, newFriend];
    setFriends(updatedFriends);
    saveFriends(updatedFriends);
    
    setFriendEmail("");
    setShowAddFriend(false);
    alert(`Amigo ${friendUser.name} adicionado com sucesso!`);
  };

  const handleRemoveFriend = (friendId) => {
    if (window.confirm("Tem certeza que deseja remover este amigo?")) {
      const updatedFriends = friends.filter(friend => friend.id !== friendId);
      setFriends(updatedFriends);
      saveFriends(updatedFriends);
      alert("Amigo removido com sucesso!");
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
              <div style={styles.avatarClip}>
                {editAvatar ? (
                  <img src={editAvatar} alt="Avatar" style={styles.avatarImage} />
                ) : (
                  <span style={styles.avatarInitials}>{getInitials(editName)}</span>
                )}
              </div>
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

            <div style={styles.inputGroup}>
              <label style={styles.label}>Avatar</label>
              <div style={styles.avatarGrid}>
                <button type="button" onClick={() => setEditAvatar(null)} style={{ ...styles.avatarOption, ...(editAvatar === null ? styles.avatarOptionActive : {}) }} title="Sem avatar">
                  <span style={styles.noAvatarIcon}>Ø</span>
                </button>
                {[esqueleto, robo, roqueira, skatista].map((img, idx) => (
                  <button key={idx} type="button" onClick={() => setEditAvatar(img)} style={{ ...styles.avatarOption, ...(editAvatar === img ? styles.avatarOptionActive : {}) }}>
                    <img src={img} alt={`Avatar ${idx + 1}`} style={styles.avatarThumb} />
                  </button>
                ))}
              </div>
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
                  setEditAvatar(user.avatar || null);
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

  if (showAddFriend) {
    return (
      <div style={{ ...styles.background, ...getGradientBackground() }}>
        <Card title="Adicionar Amigo" className="animate-scaleIn">
          <form onSubmit={handleAddFriend} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email do Amigo</label>
              <input
                type="email"
                value={friendEmail}
                onChange={(e) => setFriendEmail(e.target.value)}
                style={styles.input}
                placeholder="Digite o email do amigo"
                required
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
                Adicionar Amigo
              </Button>
              
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => {
                  setShowAddFriend(false);
                  setFriendEmail("");
                }}
              >
                Cancelar
              </Button>
            </div>
          </form>
          
          {friends.length > 0 && (
            <div style={styles.friendsList}>
              <h3 style={styles.friendsTitle}>Seus Amigos ({friends.length})</h3>
              {friends.map(friend => (
                <div key={friend.id} style={styles.friendItem}>
                  <div style={styles.friendInfo}>
                    <div style={styles.friendAvatar}>
                      {getInitials(friend.name)}
                    </div>
                    <div>
                      <div style={styles.friendName}>{friend.name}</div>
                      <div style={styles.friendEmail}>{friend.email}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveFriend(friend.id)}
                    style={styles.removeButton}
                    title="Remover amigo"
                  >
                    ❌
                  </button>
                </div>
              ))}
            </div>
          )}
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
              <div style={styles.avatarClip}>
                {user.avatar ? (
                  <img src={user.avatar} alt="Avatar" style={styles.avatarImage} />
                ) : (
                  <span style={styles.avatarInitials}>{getInitials(user.name)}</span>
                )}
              </div>
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
            onClick={() => setShowAddFriend(true)}
            style={styles.gameButton}
          >
            👥 Adicionar Amigo ({friends.length})
          </Button>
          
          <Button
            variant="secondary"
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
    margin: "0 auto",
    position: "relative",
    border: `4px solid ${theme.colors.secondary.main}` // anel externo
  },
  avatarClip: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    overflow: "hidden",
    // pequeno padding cria o anel interno visível
    padding: "3px",
    boxSizing: "border-box",
    backgroundColor: theme.colors.black || "#000"
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    objectFit: "cover",
    display: "block"
  },
  avatarInitials: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
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
  },
  avatarGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 56px)",
    gap: theme.spacing[2],
    justifyContent: "center"
  },
  avatarOption: {
    width: "56px",
    height: "56px",
    borderRadius: theme.borderRadius.full || "50%",
    overflow: "hidden",
    border: `2px solid ${theme.colors.white}40`,
    background: "transparent",
    cursor: "pointer",
    padding: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
    position: "relative"
  },
  avatarOptionActive: {
    borderColor: theme.colors.secondary.main,
    boxShadow: theme.shadows.md
  },
  avatarThumb: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block"
  },
  noAvatarIcon: {
    color: theme.colors.white,
    fontWeight: theme.typography.fontWeight.bold
  },
  friendsList: {
    marginTop: theme.spacing[6],
    paddingTop: theme.spacing[4],
    borderTop: `1px solid ${theme.colors.white}20`
  },
  friendsTitle: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing[4],
    textAlign: "center"
  },
  friendItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing[3],
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: theme.borderRadius.base,
    marginBottom: theme.spacing[2],
    transition: "background-color 0.3s ease"
  },
  friendInfo: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing[3]
  },
  friendAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: theme.colors.secondary.main,
    color: theme.colors.white,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold
  },
  friendName: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium
  },
  friendEmail: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.sm,
    opacity: 0.7
  },
  removeButton: {
    background: "none",
    border: "none",
    color: theme.colors.danger,
    cursor: "pointer",
    fontSize: "16px",
    padding: theme.spacing[1],
    borderRadius: theme.borderRadius.sm,
    transition: "background-color 0.3s ease"
  }
};
