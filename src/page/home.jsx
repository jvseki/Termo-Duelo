import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getGradientBackground, theme } from "../styles/theme";
import LoadingSpinner from "../components/LoadingSpinner";
import esqueleto from "../assets/esqueleto.png";
import robo from "../assets/robo.png";
import roqueira from "../assets/roqueira.png";
import skatista from "../assets/skatista.png";
import alien from "../assets/alien.png";
import dino from "../assets/dino.png";
import eagle from "../assets/eagle.png";
import frango from "../assets/frango.png";
import macaco from "../assets/macaco.png";
import re from "../assets/re.png";
import Seki from "../assets/Seki.png";
import urso from "../assets/urso.png";
import zombie from "../assets/zombie.png";

export default function Home() {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [showFriendsList, setShowFriendsList] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
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

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileDropdown && !event.target.closest('[data-profile-dropdown]')) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileDropdown]);

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
      <div style={styles.modalOverlay}>
        <div style={styles.logoutModal}>
          <div style={styles.logoutHeader}>
            <div style={styles.logoutIcon}>🚪</div>
            <h2 style={styles.logoutTitle}>Confirmar Saída</h2>
          </div>
          
          <div style={styles.logoutContent}>
            <p style={styles.logoutMessage}>
              Tem certeza que deseja sair da sua conta?
            </p>
            <p style={styles.logoutSubMessage}>
              Você precisará fazer login novamente para acessar o jogo.
            </p>
          </div>
          
          <div style={styles.logoutActions}>
            <button
              style={styles.logoutCancelButton}
              onClick={() => setShowLogoutConfirm(false)}
            >
              Cancelar
            </button>
            <button
              style={styles.logoutConfirmButton}
              onClick={handleLogout}
              disabled={loading}
            >
              {loading ? "Saindo..." : "Sim, Sair"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showEditProfile) {
    return (
      <div style={styles.modalOverlay}>
        <div style={styles.professionalModal}>
          <div style={styles.modalHeader}>
            <div style={styles.modalTitleContainer}>
              <h2 style={styles.modalTitle}>Editar Perfil</h2>
            </div>
            <button 
              style={styles.modalCloseButton}
              onClick={() => {
                setShowEditProfile(false);
                setEditName(user.name);
                setEditAvatar(user.avatar || null);
              }}
            >
              ✕
            </button>
          </div>
          
          <div style={styles.modalContent}>
            <form onSubmit={handleEditProfile} style={styles.professionalForm}>
              <div style={styles.profileSection}>
                <div style={styles.currentAvatarContainer}>
                  <div style={styles.currentAvatar}>
                {editAvatar ? (
                      <img src={editAvatar} alt="Avatar" style={styles.currentAvatarImage} />
                ) : (
                      <span style={styles.currentAvatarInitials}>{getInitials(editName)}</span>
                )}
            </div>
            </div>
            
                <div style={styles.formField}>
                  <label style={styles.fieldLabel}>Nome</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                    style={styles.professionalInput}
                required
                maxLength={50}
                    placeholder="Digite seu nome"
              />
                </div>
            </div>

              <div style={styles.avatarSelectionSection}>
                <label style={styles.fieldLabel}>Escolher Avatar</label>
                <div style={styles.professionalAvatarGrid}>
                  <button 
                    type="button" 
                    onClick={() => setEditAvatar(null)} 
                    style={{ 
                      ...styles.professionalAvatarOption, 
                      ...(editAvatar === null ? styles.professionalAvatarOptionActive : {}) 
                    }} 
                    title="Sem avatar"
                  >
                  <span style={styles.noAvatarIcon}>Ø</span>
                </button>
                {[esqueleto, robo, roqueira, skatista, alien, dino, eagle, frango, macaco, re, Seki, urso, zombie].map((img, idx) => (
                    <button 
                      key={idx} 
                      type="button" 
                      onClick={() => setEditAvatar(img)} 
                      style={{ 
                        ...styles.professionalAvatarOption, 
                        ...(editAvatar === img ? styles.professionalAvatarOptionActive : {}) 
                      }}
                    >
                      <img src={img} alt={`Avatar ${idx + 1}`} style={styles.professionalAvatarThumb} />
                  </button>
                ))}
              </div>
            </div>
            
              <div style={styles.formActions}>
                <button
                type="submit"
                  style={styles.primaryButton}
                  disabled={loading}
                >
                  {loading ? "Salvando..." : "Salvar Alterações"}
                </button>
                
                <button
                type="button"
                  style={styles.tertiaryButton}
                onClick={() => {
                  setShowEditProfile(false);
                  setEditName(user.name);
                  setEditAvatar(user.avatar || null);
                }}
              >
                Cancelar
                </button>
            </div>
          </form>
          </div>
        </div>
      </div>
    );
  }

  if (showAddFriend) {
    return (
      <div style={styles.modalOverlay}>
        <div style={styles.professionalModal}>
          <div style={styles.modalHeader}>
            <div style={styles.modalTitleContainer}>
              <h2 style={styles.modalTitle}>Adicionar Amigo</h2>
            </div>
            <button 
              style={styles.modalCloseButton}
              onClick={() => {
                setShowAddFriend(false);
                setFriendEmail("");
              }}
            >
              ✕
            </button>
          </div>
          
          <div style={styles.modalContent}>
            <form onSubmit={handleAddFriend} style={styles.professionalForm}>
              <div style={styles.formField}>
                <label style={styles.fieldLabel}>Email do Amigo</label>
              <input
                type="email"
                value={friendEmail}
                onChange={(e) => setFriendEmail(e.target.value)}
                  style={styles.professionalInput}
                placeholder="Digite o email do amigo"
                required
              />
            </div>
            
              <div style={styles.formActions}>
                <button
                type="submit"
                  style={styles.primaryButton}
                  disabled={loading}
                >
                  {loading ? "Adicionando..." : "Adicionar Amigo"}
                </button>
                
                <button
                type="button"
                  style={styles.tertiaryButton}
                onClick={() => {
                  setShowAddFriend(false);
                  setFriendEmail("");
                }}
              >
                Cancelar
                </button>
            </div>
          </form>
          
          {friends.length > 0 && (
              <div style={styles.existingFriendsSection}>
                <div style={styles.sectionDivider}></div>
                <h3 style={styles.sectionTitle}>Seus Amigos ({friends.length})</h3>
                <div style={styles.friendsListContainer}>
              {friends.map(friend => (
                    <div key={friend.id} style={styles.professionalFriendCard}>
                      <div style={styles.friendAvatarContainer}>
                    <div style={styles.friendAvatar}>
                      {getInitials(friend.name)}
                    </div>
                    </div>
                      <div style={styles.friendDetails}>
                        <h4 style={styles.friendName}>{friend.name}</h4>
                        <p style={styles.friendEmail}>{friend.email}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveFriend(friend.id)}
                        style={styles.removeFriendButton}
                    title="Remover amigo"
                  >
                        <span style={styles.removeIcon}>×</span>
                  </button>
                </div>
              ))}
                </div>
            </div>
          )}
          </div>
        </div>
      </div>
    );
  }

  if (showFriendsList) {
  return (
      <div style={styles.modalOverlay}>
        <div style={styles.professionalModal}>
          <div style={styles.modalHeader}>
            <div style={styles.modalTitleContainer}>
              <h2 style={styles.modalTitle}>Meus Amigos</h2>
              <span style={styles.friendCount}>({friends.length})</span>
            </div>
            <button 
              style={styles.modalCloseButton}
              onClick={() => setShowFriendsList(false)}
            >
              ✕
            </button>
          </div>
          
          <div style={styles.modalContent}>
            {friends.length > 0 ? (
              <div style={styles.friendsListContainer}>
                {friends.map(friend => (
                  <div key={friend.id} style={styles.professionalFriendCard}>
                    <div style={styles.friendAvatarContainer}>
                      <div style={styles.friendAvatar}>
                        {getInitials(friend.name)}
                      </div>
                    </div>
                    <div style={styles.friendDetails}>
                      <h4 style={styles.friendName}>{friend.name}</h4>
                      <p style={styles.friendEmail}>{friend.email}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveFriend(friend.id)}
                      style={styles.removeFriendButton}
                      title="Remover amigo"
                    >
                      <span style={styles.removeIcon}>×</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={styles.emptyState}>
                <div style={styles.emptyStateIcon}>👥</div>
                <h3 style={styles.emptyStateTitle}>Nenhum amigo adicionado</h3>
                <p style={styles.emptyStateDescription}>
                  Comece adicionando amigos para jogar juntos!
                </p>
                <button 
                  style={styles.primaryButton}
                  onClick={() => {
                    setShowFriendsList(false);
                    setShowAddFriend(true);
                  }}
                >
                  Adicionar Primeiro Amigo
                </button>
              </div>
            )}
          </div>
          
          <div style={styles.modalFooter}>
            <button 
              style={styles.secondaryButton}
              onClick={() => {
                setShowFriendsList(false);
                setShowAddFriend(true);
              }}
            >
              + Adicionar Amigo
            </button>
            <button 
              style={styles.tertiaryButton}
              onClick={() => setShowFriendsList(false)}
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.background}>
      {/* Header com navegação */}
      <div style={styles.topHeader}>
        <div style={styles.headerContent}>
          <div style={styles.logo}>
            <div style={{...styles.logoLetter, backgroundColor: '#10b981'}}>T</div>
            <div style={{...styles.logoLetter, backgroundColor: '#3b82f6'}}>E</div>
            <div style={{...styles.logoLetter, backgroundColor: '#10b981'}}>R</div>
            <div style={{...styles.logoLetter, backgroundColor: '#3b82f6'}}>M</div>
            <div style={{...styles.logoLetter, backgroundColor: '#f59e0b'}}>O</div>
          </div>
          
          <nav style={styles.navigation}>
            <button 
              style={styles.navButton}
              onClick={() => alert("Você já está na página inicial!")}
            >
              Inicio
            </button>
            <button 
              style={styles.navButton}
              onClick={() => navigate("/ranking")}
            >
              Ranking
            </button>
            <button 
              style={styles.navButton}
              onClick={() => setShowFriendsList(true)}
            >
              Amigos
            </button>
          </nav>
          
          <div style={styles.userSection}>
            <div style={styles.userProfileContainer} data-profile-dropdown>
              <div 
                style={styles.userProfile}
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              >
                <div style={styles.userAvatar}>
                {user.avatar ? (
                  <img src={user.avatar} alt="Avatar" style={styles.avatarImage} />
                ) : (
                  <span style={styles.avatarInitials}>{getInitials(user.name)}</span>
                )}
              </div>
                <span style={styles.userName}>{user.name.split(' ')[0]}</span>
                <button style={styles.dropdownButton}>▼</button>
            </div>
              
              {showProfileDropdown && (
                <div style={styles.profileDropdown}>
            <button
                    style={styles.dropdownItem}
                    onClick={() => {
                      setShowEditProfile(true);
                      setShowProfileDropdown(false);
                    }}
                  >
                    ✏️ Alterar Dados
                  </button>
                  <button 
                    style={styles.dropdownItem}
                    onClick={() => {
                      setShowLogoutConfirm(true);
                      setShowProfileDropdown(false);
                    }}
                  >
                    🚪 Sair da Conta
            </button>
                </div>
              )}
            </div>
          </div>
        </div>
          </div>
          
      {/* Conteúdo principal */}
      <div style={styles.mainContent}>
        <div style={styles.leftPanel}>
          {/* Card do perfil do usuário */}
          <div style={styles.profileCard}>
            <div style={styles.profileHeader}>
              <div style={styles.profileAvatar}>
                {user.avatar ? (
                  <img src={user.avatar} alt="Avatar" style={styles.avatarImage} />
                ) : (
                  <span style={styles.avatarInitials}>{getInitials(user.name)}</span>
                )}
              </div>
              <div style={styles.profileInfo}>
                <h2 style={styles.profileName}>{user.name}</h2>
                <p style={styles.profileLevel}>Nível 12</p>
                <p style={styles.profileSequence}>Sequência?</p>
              </div>
            </div>
            
            <div style={styles.xpBar}>
              <div style={styles.xpBarFill}></div>
              <span style={styles.xpText}>500 XP</span>
            </div>
            
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
              <span style={styles.statNumber}>156</span>
              <span style={styles.statLabel}>Jogos Jogados</span>
              </div>
              <div style={styles.statCard}>
              <span style={styles.statNumber}>87%</span>
              <span style={styles.statLabel}>% de Vitória</span>
            </div>
              <div style={styles.statCard}>
              <span style={styles.statNumber}>1200</span>
              <span style={styles.statLabel}>Pontuação</span>
            </div>
          </div>
        </div>

          {/* Modos de jogo */}
          <div style={styles.gameModesSection}>
            <h3 style={styles.sectionTitle}>Modos de Jogo</h3>
            
            <button style={styles.gameModeButton} onClick={() => navigate('/termo')}>
              <div style={styles.gameModeContent}>
                <div style={styles.gameModeText}>
                  <h4 style={styles.gameModeTitle}>Jogo Solo</h4>
                  <p style={styles.gameModeDescription}>Pratique suas habilidades no modo clássico</p>
                </div>
                <div style={styles.gameModeIcon}>▶️</div>
              </div>
            </button>
            
            <button style={{...styles.gameModeButton, backgroundColor: '#f59e0b'}} onClick={() => navigate("/termoduelo")}>
              <div style={styles.gameModeContent}>
                <div style={styles.gameModeText}>
                  <h4 style={styles.gameModeTitle}>Modo Multiplayer</h4>
                  <p style={styles.gameModeDescription}>Desafie seus amigos</p>
                </div>
                <div style={styles.gameModeIcon}>👥</div>
              </div>
            </button>
          </div>
        </div>

        <div style={styles.rightPanel}>
          {/* Ranking */}
          <div style={styles.rankingCard}>
            <h3 style={styles.cardTitle}>Ranking</h3>
            <button 
              style={styles.rankingButton}
              onClick={() => navigate("/ranking")}
            >
              Ver Ranking Completo
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
    backgroundColor: theme.colors.surface.secondary,
    display: "flex",
    flexDirection: "column"
  },
  topHeader: {
    backgroundColor: theme.colors.gray[800],
    padding: `${theme.spacing[4]} 0`,
    boxShadow: theme.shadows.md
  },
  headerContent: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: `0 ${theme.spacing[6]}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
  },
  logo: {
    display: "flex",
    gap: theme.spacing[2]
  },
  logoLetter: {
    width: "32px",
    height: "32px",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold
  },
  navigation: {
    display: "flex",
    gap: theme.spacing[6]
  },
  navButton: {
    background: "none",
    border: "none",
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    cursor: "pointer",
    padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
    borderRadius: theme.borderRadius.base,
    transition: "background-color 0.3s ease",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.1)"
    }
  },
  userSection: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing[4]
  },
  userProfileContainer: {
    position: "relative"
  },
  profileDropdown: {
    position: "absolute",
    top: "100%",
    right: 0,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.base,
    boxShadow: theme.shadows.lg,
    border: `1px solid ${theme.colors.gray[200]}`,
    minWidth: "200px",
    zIndex: 1000,
    marginTop: theme.spacing[2]
  },
  dropdownItem: {
    width: "100%",
    padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
    border: "none",
    backgroundColor: "transparent",
    color: theme.colors.gray[700],
    fontSize: theme.typography.fontSize.sm,
    textAlign: "left",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: theme.spacing[2],
    "&:hover": {
      backgroundColor: theme.colors.gray[50]
    },
    "&:first-child": {
      borderTopLeftRadius: theme.borderRadius.base,
      borderTopRightRadius: theme.borderRadius.base
    },
    "&:last-child": {
      borderBottomLeftRadius: theme.borderRadius.base,
      borderBottomRightRadius: theme.borderRadius.base
    }
  },
  // Estilos profissionais para modais
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2000,
    padding: theme.spacing[4]
  },
  professionalModal: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    boxShadow: theme.shadows.xl,
    width: "100%",
    maxWidth: "600px",
    maxHeight: "90vh",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden"
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: `${theme.spacing[6]} ${theme.spacing[6]} ${theme.spacing[4]}`,
    borderBottom: `1px solid ${theme.colors.gray[200]}`,
    backgroundColor: theme.colors.surface.secondary
  },
  modalTitleContainer: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing[2]
  },
  modalTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.gray[900],
    margin: 0
  },
  friendCount: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.gray[500],
    backgroundColor: theme.colors.gray[100],
    padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
    borderRadius: theme.borderRadius.full
  },
  modalCloseButton: {
    background: "none",
    border: "none",
    fontSize: "20px",
    color: theme.colors.gray[500],
    cursor: "pointer",
    padding: theme.spacing[2],
    borderRadius: theme.borderRadius.base,
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: theme.colors.gray[100],
      color: theme.colors.gray[700]
    }
  },
  modalContent: {
    padding: theme.spacing[6],
    flex: 1,
    overflowY: "auto"
  },
  modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    padding: `${theme.spacing[4]} ${theme.spacing[6]}`,
    borderTop: `1px solid ${theme.colors.gray[200]}`,
    gap: theme.spacing[3],
    backgroundColor: theme.colors.surface.secondary
  },
  
  // Formulários profissionais
  professionalForm: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing[6]
  },
  formField: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing[2]
  },
  fieldLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.gray[700],
    margin: 0
  },
  professionalInput: {
    width: "100%",
    padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
    fontSize: theme.typography.fontSize.base,
    borderRadius: theme.borderRadius.base,
    border: `2px solid ${theme.colors.gray[200]}`,
    outline: "none",
    transition: "all 0.3s ease",
    fontFamily: theme.typography.fontFamily,
    backgroundColor: theme.colors.white,
    "&:focus": {
      borderColor: theme.colors.primary.main,
      boxShadow: `0 0 0 3px ${theme.colors.primary.main}20`
    },
    "&::placeholder": {
      color: theme.colors.gray[400]
    }
  },
  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: theme.spacing[3],
    marginTop: theme.spacing[4]
  },
  
  // Botões profissionais
  primaryButton: {
    backgroundColor: theme.colors.primary.main,
    color: theme.colors.white,
    border: "none",
    borderRadius: theme.borderRadius.base,
    padding: `${theme.spacing[3]} ${theme.spacing[6]}`,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    cursor: "pointer",
    transition: "all 0.3s ease",
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
  secondaryButton: {
    backgroundColor: theme.colors.secondary.main,
    color: theme.colors.white,
    border: "none",
    borderRadius: theme.borderRadius.base,
    padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    cursor: "pointer",
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: theme.colors.secondary.dark,
      transform: "translateY(-1px)",
      boxShadow: theme.shadows.md
    }
  },
  tertiaryButton: {
    backgroundColor: theme.colors.gray[200],
    color: theme.colors.gray[700],
    border: "none",
    borderRadius: theme.borderRadius.base,
    padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    cursor: "pointer",
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: theme.colors.gray[300],
      transform: "translateY(-1px)",
      boxShadow: theme.shadows.sm
    }
  },
  
  // Lista de amigos profissional
  friendsListContainer: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing[3]
  },
  professionalFriendCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.base,
    padding: theme.spacing[4],
    display: "flex",
    alignItems: "center",
    gap: theme.spacing[4],
    border: `1px solid ${theme.colors.gray[200]}`,
    transition: "all 0.3s ease",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: theme.shadows.md,
      borderColor: theme.colors.primary.main
    }
  },
  friendAvatarContainer: {
    flexShrink: 0
  },
  friendAvatar: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    backgroundColor: theme.colors.primary.main,
    color: theme.colors.white,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    boxShadow: theme.shadows.sm
  },
  friendDetails: {
    flex: 1,
    minWidth: 0
  },
  friendName: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.gray[900],
    margin: 0,
    marginBottom: theme.spacing[1],
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap"
  },
  friendEmail: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.gray[600],
    margin: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap"
  },
  removeFriendButton: {
    background: "none",
    border: "none",
    color: theme.colors.gray[400],
    cursor: "pointer",
    fontSize: "20px",
    padding: theme.spacing[2],
    borderRadius: theme.borderRadius.base,
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    "&:hover": {
      color: theme.colors.danger,
      backgroundColor: "rgba(239, 68, 68, 0.1)"
    }
  },
  removeIcon: {
    fontSize: "16px",
    fontWeight: "bold"
  },
  
  // Estado vazio
  emptyState: {
    textAlign: "center",
    padding: `${theme.spacing[8]} ${theme.spacing[4]}`,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: theme.spacing[4]
  },
  emptyStateIcon: {
    fontSize: "48px",
    opacity: 0.6
  },
  emptyStateTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.gray[700],
    margin: 0
  },
  emptyStateDescription: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.gray[500],
    margin: 0,
    maxWidth: "300px"
  },
  
  // Seção de amigos existentes
  existingFriendsSection: {
    marginTop: theme.spacing[6]
  },
  sectionDivider: {
    height: "1px",
    backgroundColor: theme.colors.gray[200],
    marginBottom: theme.spacing[4]
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.gray[700],
    margin: 0,
    marginBottom: theme.spacing[4]
  },
  
  // Edição de perfil
  profileSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: theme.spacing[4],
    padding: `${theme.spacing[6]} ${theme.spacing[4]}`,
    backgroundColor: theme.colors.surface.tertiary,
    borderRadius: theme.borderRadius.base,
    marginBottom: theme.spacing[4]
  },
  currentAvatarContainer: {
    display: "flex",
    justifyContent: "center"
  },
  currentAvatar: {
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
    border: `4px solid ${theme.colors.white}`,
    position: "relative"
  },
  currentAvatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    objectFit: "cover"
  },
  currentAvatarInitials: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold
  },
  avatarSelectionSection: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing[4]
  },
  professionalAvatarGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: theme.spacing[3],
    maxWidth: "400px",
    margin: "0 auto"
  },
  professionalAvatarOption: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    border: `3px solid ${theme.colors.gray[200]}`,
    background: "transparent",
    cursor: "pointer",
    padding: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.3s ease",
    position: "relative",
    overflow: "hidden",
    "&:hover": {
      transform: "scale(1.1)",
      boxShadow: theme.shadows.md
    }
  },
  professionalAvatarOptionActive: {
    borderColor: theme.colors.primary.main,
    boxShadow: `0 0 0 3px ${theme.colors.primary.main}20`,
    transform: "scale(1.05)"
  },
  professionalAvatarThumb: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: "50%"
  },
  
  // Modal de logout profissional
  logoutModal: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    boxShadow: theme.shadows.xl,
    width: "100%",
    maxWidth: "400px",
    overflow: "hidden",
    textAlign: "center"
  },
  logoutHeader: {
    padding: `${theme.spacing[6]} ${theme.spacing[6]} ${theme.spacing[4]}`,
    backgroundColor: theme.colors.surface.secondary,
    borderBottom: `1px solid ${theme.colors.gray[200]}`
  },
  logoutIcon: {
    fontSize: "48px",
    marginBottom: theme.spacing[3]
  },
  logoutTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.gray[900],
    margin: 0
  },
  logoutContent: {
    padding: `${theme.spacing[6]} ${theme.spacing[6]} ${theme.spacing[4]}`
  },
  logoutMessage: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.gray[700],
    margin: 0,
    marginBottom: theme.spacing[2]
  },
  logoutSubMessage: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.gray[500],
    margin: 0
  },
  logoutActions: {
    display: "flex",
    gap: theme.spacing[3],
    padding: `${theme.spacing[4]} ${theme.spacing[6]} ${theme.spacing[6]}`,
    justifyContent: "center"
  },
  logoutCancelButton: {
    backgroundColor: theme.colors.gray[200],
    color: theme.colors.gray[700],
    border: "none",
    borderRadius: theme.borderRadius.base,
    padding: `${theme.spacing[3]} ${theme.spacing[6]}`,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    cursor: "pointer",
    transition: "all 0.3s ease",
    minWidth: "120px",
    "&:hover": {
      backgroundColor: theme.colors.gray[300],
      transform: "translateY(-1px)",
      boxShadow: theme.shadows.sm
    }
  },
  logoutConfirmButton: {
    backgroundColor: theme.colors.danger,
    color: theme.colors.white,
    border: "none",
    borderRadius: theme.borderRadius.base,
    padding: `${theme.spacing[3]} ${theme.spacing[6]}`,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    cursor: "pointer",
    transition: "all 0.3s ease",
    minWidth: "120px",
    "&:hover": {
      backgroundColor: "#d32f2f",
      transform: "translateY(-1px)",
      boxShadow: theme.shadows.md
    },
    "&:disabled": {
      opacity: 0.6,
      cursor: "not-allowed",
      transform: "none"
    }
  },
  userProfile: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing[3],
    cursor: "pointer",
    padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
    borderRadius: theme.borderRadius.base,
    transition: "background-color 0.3s ease",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.1)"
    }
  },
  userAvatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    backgroundColor: theme.colors.primary.main,
    color: theme.colors.white,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold
  },
  userName: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium
  },
  dropdownButton: {
    background: "none",
    border: "none",
    color: theme.colors.white,
    fontSize: "12px",
    cursor: "pointer"
  },
  mainContent: {
    flex: 1,
    maxWidth: "1200px",
    margin: "0 auto",
    padding: theme.spacing[8],
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: theme.spacing[8]
  },
  leftPanel: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing[6]
  },
  rightPanel: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing[6]
  },
  profileCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing[6],
    boxShadow: theme.shadows.lg
  },
  profileHeader: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing[4],
    marginBottom: theme.spacing[4]
  },
  profileAvatar: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    backgroundColor: theme.colors.primary.main,
    color: theme.colors.white,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold
  },
  profileInfo: {
    flex: 1
  },
  profileName: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.gray[900],
    margin: 0,
    marginBottom: theme.spacing[1]
  },
  profileLevel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.gray[600],
    margin: 0,
    marginBottom: theme.spacing[1]
  },
  profileSequence: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.gray[600],
    margin: 0
  },
  xpBar: {
    position: "relative",
    height: "8px",
    backgroundColor: theme.colors.gray[200],
    borderRadius: theme.borderRadius.full,
    marginBottom: theme.spacing[4],
    overflow: "hidden"
  },
  xpBarFill: {
    height: "100%",
    width: "85%",
    backgroundColor: theme.colors.primary.main,
    borderRadius: theme.borderRadius.full,
    transition: "width 0.3s ease"
  },
  xpText: {
    position: "absolute",
    right: 0,
    top: "-20px",
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.gray[600],
    fontWeight: theme.typography.fontWeight.medium
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: theme.spacing[4]
  },
  statCard: {
    textAlign: "center",
    padding: theme.spacing[3],
    backgroundColor: theme.colors.surface.tertiary,
    borderRadius: theme.borderRadius.base
  },
  statNumber: {
    display: "block",
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.gray[900],
    marginBottom: theme.spacing[1]
  },
  statLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.gray[600]
  },
  gameModesSection: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing[4]
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.gray[900],
    margin: 0
  },
  gameModeButton: {
    width: "100%",
    backgroundColor: theme.colors.primary.main,
    color: theme.colors.white,
    border: "none",
    borderRadius: theme.borderRadius.base,
    padding: theme.spacing[4],
    cursor: "pointer",
    transition: "all 0.3s ease",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: theme.shadows.lg
    }
  },
  gameModeContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
  },
  gameModeText: {
    textAlign: "left"
  },
  gameModeTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    margin: 0,
    marginBottom: theme.spacing[1]
  },
  gameModeDescription: {
    fontSize: theme.typography.fontSize.sm,
    margin: 0,
    opacity: 0.9
  },
  gameModeIcon: {
    fontSize: "20px"
  },
  rankingCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing[6],
    boxShadow: theme.shadows.lg,
    textAlign: "center"
  },
  cardTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.gray[900],
    margin: 0,
    marginBottom: theme.spacing[4]
  },
  rankingButton: {
    width: "100%",
    backgroundColor: theme.colors.primary.main,
    color: theme.colors.white,
    border: "none",
    borderRadius: theme.borderRadius.base,
    padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
    cursor: "pointer",
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: theme.colors.primary.dark,
      transform: "translateY(-1px)",
      boxShadow: theme.shadows.md
    }
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
    justifyContent: "center",
    maxWidth: "320px",
    margin: "0 auto"
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

