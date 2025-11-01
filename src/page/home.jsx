import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getGradientBackground, theme } from "../styles/theme";
import LoadingSpinner from "../components/LoadingSpinner";
import { getUserData } from "../services/authService";
import { getRanking } from "../services/gameService";
import { getFriends, addFriend, acceptFriend, removeFriend, getPendingRequests, getSentRequests } from "../services/friendService";
import api from "../services/api";
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
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [userData, setUserData] = useState(null);
  const [loadingUserData, setLoadingUserData] = useState(true);
  const [rankingData, setRankingData] = useState([]);
  const [loadingRanking, setLoadingRanking] = useState(true);
  
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
      loadFriendsData();
      loadUserData();
      loadRanking();
    }
  }, [user]);

  const loadUserData = async () => {
    setLoadingUserData(true);
    try {
      const result = await getUserData();
      if (result.success && result.user) {
        setUserData(result.user);
      } else if (result.message?.includes('Sessão expirada') || result.message?.includes('Token')) {
        console.error('Erro de autenticação:', result.message);
        const logoutResult = await logout();
        if (logoutResult.success) {
          navigate("/");
        }
      } else {
        console.error('Erro ao carregar dados do usuário:', result.message);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      if (error?.response?.status === 401) {
        const logoutResult = await logout();
        if (logoutResult.success) {
          navigate("/");
        }
      }
    } finally {
      setLoadingUserData(false);
    }
  };

  const loadRanking = async () => {
    setLoadingRanking(true);
    try {
      const result = await getRanking();
      if (result.success && result.ranking) {
        setRankingData(result.ranking);
      } else {
        console.error('Erro ao carregar ranking:', result.message);
        setRankingData([]);
      }
    } catch (error) {
      console.error('Erro ao carregar ranking:', error);
      setRankingData([]);
    } finally {
      setLoadingRanking(false);
    }
  };

  const getMedalIcon = (position) => {
    switch (position) {
      case 1: return "🥇";
      case 2: return "🥈";
      case 3: return "🥉";
      default: return `#${position}`;
    }
  };

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

  const loadFriendsData = async () => {
    setLoadingFriends(true);
    try {
      const [friendsResult, pendingResult, sentResult] = await Promise.all([
        getFriends(),
        getPendingRequests(),
        getSentRequests()
      ]);

      if (friendsResult.success) {
        setFriends(friendsResult.friends || []);
      } else {
        console.error('Erro ao carregar amigos:', friendsResult.message);
        setFriends([]);
      }

      if (pendingResult.success) {
        const requests = pendingResult.requests || [];
        console.log('Solicitações pendentes recebidas:', requests);
        console.log('Quantidade de solicitações:', requests.length);
        setPendingRequests(requests);
      } else {
        console.error('Erro ao carregar solicitações pendentes:', pendingResult);
        console.error('Detalhes do erro:', pendingResult.message);
        setPendingRequests([]);
      }

      if (sentResult.success) {
        setSentRequests(sentResult.requests || []);
      } else {
        console.error('Erro ao carregar solicitações enviadas:', sentResult.message);
        setSentRequests([]);
      }
    } catch (error) {
      console.error('Erro ao carregar dados de amigos:', error);
      setFriends([]);
      setPendingRequests([]);
      setSentRequests([]);
    } finally {
      setLoadingFriends(false);
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

    if (friendEmail.toLowerCase() === user.email) {
      alert("Você não pode adicionar a si mesmo como amigo!");
      return;
    }

    try {
      const response = await api.get(`/api/auth/search?email=${encodeURIComponent(friendEmail)}`);
      const friendUser = response.data.user;
      
      if (!friendUser) {
        alert("Usuário não encontrado! Verifique o email digitado.");
        return;
      }

      const friendId = friendUser.id;
      const result = await addFriend(friendId);
      
      if (result.success) {
        setFriendEmail("");
        setShowAddFriend(false);
        alert(result.message || 'Solicitação de amizade enviada com sucesso!');
        loadFriendsData();
      } else {
        alert(result.message || 'Erro ao enviar solicitação de amizade');
      }
    } catch (error) {
      console.error('Erro ao adicionar amigo:', error);
      const errorMessage = error?.response?.data?.message || 'Usuário não encontrado! Verifique o email digitado.';
      alert(errorMessage);
    }
  };

  const handleAcceptFriend = async (friendId) => {
    try {
      const result = await acceptFriend(friendId);
      if (result.success) {
        alert(result.message || 'Solicitação de amizade aceita com sucesso!');
        loadFriendsData();
      } else {
        alert(result.message || 'Erro ao aceitar solicitação de amizade');
      }
    } catch (error) {
      console.error('Erro ao aceitar amigo:', error);
      alert('Erro ao aceitar solicitação de amizade');
    }
  };

  const handleRemoveFriend = async (friendId) => {
    if (window.confirm("Tem certeza que deseja remover este amigo?")) {
      try {
        const result = await removeFriend(friendId);
        if (result.success) {
          alert(result.message || 'Amigo removido com sucesso!');
          loadFriendsData();
        } else {
          alert(result.message || 'Erro ao remover amigo');
        }
      } catch (error) {
        console.error('Erro ao remover amigo:', error);
        alert('Erro ao remover amigo');
      }
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
          
          {pendingRequests.length > 0 && (
            <div style={styles.existingFriendsSection}>
              <div style={styles.sectionDivider}></div>
              <h3 style={styles.sectionTitle}>Solicitações Pendentes ({pendingRequests.length})</h3>
              <div style={styles.friendsListContainer}>
                {pendingRequests.map(request => (
                  <div key={request.id} style={styles.professionalFriendCard}>
                    <div style={styles.friendAvatarContainer}>
                      <div style={styles.friendAvatar}>
                        {request.avatar ? (
                          <img src={request.avatar} alt="Avatar" style={styles.avatarImage} />
                        ) : (
                          <span>{getInitials(request.nickname)}</span>
                        )}
                      </div>
                    </div>
                    <div style={styles.friendDetails}>
                      <h4 style={styles.friendName}>{request.nickname}</h4>
                      <p style={styles.friendEmail}>{request.email}</p>
                    </div>
                    <div style={styles.friendActions}>
                            <button
                              onClick={() => handleAcceptFriend(request.id)}
                              style={styles.acceptFriendButton}
                              title="Aceitar solicitação"
                            >
                              ✓ Aceitar
                            </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {friends.length > 0 && (
            <div style={styles.existingFriendsSection}>
              <div style={styles.sectionDivider}></div>
              <h3 style={styles.sectionTitle}>Seus Amigos ({friends.length})</h3>
              <div style={styles.friendsListContainer}>
                {friends.map(friend => (
                  <div key={friend.id} style={styles.professionalFriendCard}>
                    <div style={styles.friendAvatarContainer}>
                      <div style={styles.friendAvatar}>
                        {friend.avatar ? (
                          <img src={friend.avatar} alt="Avatar" style={styles.avatarImage} />
                        ) : (
                          <span>{getInitials(friend.nickname)}</span>
                        )}
                      </div>
                    </div>
                    <div style={styles.friendDetails}>
                      <h4 style={styles.friendName}>{friend.nickname}</h4>
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
            {loadingFriends ? (
              <div style={styles.loadingContainer}>
                <LoadingSpinner size="sm" text="Carregando..." />
              </div>
            ) : (
              <>
                {pendingRequests.length > 0 && (
                  <div style={styles.requestsSection}>
                    <h3 style={styles.sectionTitle}>Solicitações Pendentes ({pendingRequests.length})</h3>
                    <div style={styles.friendsListContainer}>
                      {pendingRequests.map(request => (
                        <div key={request.id} style={styles.professionalFriendCard}>
                          <div style={styles.friendAvatarContainer}>
                            <div style={styles.friendAvatar}>
                              {request.avatar ? (
                                <img src={request.avatar} alt="Avatar" style={styles.avatarImage} />
                              ) : (
                                <span>{getInitials(request.nickname)}</span>
                              )}
                            </div>
                          </div>
                          <div style={styles.friendDetails}>
                            <h4 style={styles.friendName}>{request.nickname}</h4>
                            <p style={styles.friendEmail}>{request.email}</p>
                          </div>
                          <div style={styles.friendActions}>
                            <button
                              onClick={() => handleAcceptFriend(request.id)}
                              style={styles.acceptFriendButton}
                              title="Aceitar solicitação"
                            >
                              ✓ Aceitar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {friends.length > 0 ? (
                  <div style={styles.friendsSection}>
                    <h3 style={styles.sectionTitle}>Meus Amigos ({friends.length})</h3>
                    <div style={styles.friendsListContainer}>
                      {friends.map(friend => (
                        <div key={friend.id} style={styles.professionalFriendCard}>
                          <div style={styles.friendAvatarContainer}>
                            <div style={styles.friendAvatar}>
                              {friend.avatar ? (
                                <img src={friend.avatar} alt="Avatar" style={styles.avatarImage} />
                              ) : (
                                <span>{getInitials(friend.nickname)}</span>
                              )}
                            </div>
                          </div>
                          <div style={styles.friendDetails}>
                            <h4 style={styles.friendName}>{friend.nickname}</h4>
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
                ) : pendingRequests.length === 0 && (
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
              </>
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
                <p style={styles.profileLevel}>
                  {userData?.status ? `Nível ${Math.floor(userData.status.xp / 100) + 1}` : 'Nível 1'}
                </p>
                <p style={styles.profileSequence}>
                  {userData?.status ? `${userData.status.wins} vitórias` : 'Sem vitórias'}
                </p>
              </div>
            </div>
            
            <div style={styles.xpBar}>
              <div style={{
                ...styles.xpBarFill,
                width: userData?.status ? `${Math.min((userData.status.xp % 100) / 100 * 100, 100)}%` : '0%'
              }}></div>
              <span style={styles.xpText}>
                {userData?.status ? `${userData.status.xp} XP` : '0 XP'}
              </span>
            </div>
            
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
              <span style={styles.statNumber}>
                {loadingUserData ? '...' : (userData?.status?.games || 0)}
              </span>
              <span style={styles.statLabel}>Jogos Jogados</span>
              </div>
              <div style={styles.statCard}>
              <span style={styles.statNumber}>
                {loadingUserData ? '...' : (
                  userData?.status?.games 
                    ? `${Math.round((userData.status.wins / userData.status.games) * 100)}%` 
                    : '0%'
                )}
              </span>
              <span style={styles.statLabel}>% de Vitória</span>
            </div>
              <div style={styles.statCard}>
              <span style={styles.statNumber}>
                {loadingUserData ? '...' : (userData?.status?.points || 0)}
              </span>
              <span style={styles.statLabel}>Pontuação</span>
            </div>
          </div>
        </div>

          {/* Modos de jogo */}
          <div style={styles.gameModesSection}>
            <h3 style={styles.gameSectionTitle}>Modos de Jogo</h3>
            
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
            <div style={styles.rankingCardHeader}>
              <h3 style={styles.cardTitle}>🏆 Ranking</h3>
              <button 
                style={styles.rankingButton}
                onClick={() => navigate("/ranking")}
              >
                Ver Completo
              </button>
            </div>
            
            {loadingRanking ? (
              <div style={styles.rankingLoadingContainer}>
                <LoadingSpinner size="sm" text="Carregando..." />
              </div>
            ) : rankingData.length === 0 ? (
              <div style={styles.rankingEmptyContainer}>
                <p style={styles.rankingEmptyText}>Nenhum jogador no ranking ainda.</p>
              </div>
            ) : (
              <div style={styles.rankingList}>
                {rankingData.slice(0, 5).map((player) => (
                  <div 
                    key={player.id} 
                    style={{
                      ...styles.rankingListItem,
                      ...(player.id === user?.id ? styles.rankingListItemCurrent : {})
                    }}
                  >
                    <div style={styles.rankingListPosition}>
                      {getMedalIcon(player.position)}
                    </div>
                    <div style={styles.rankingListAvatar}>
                      {player.avatar ? (
                        <img src={player.avatar} alt="Avatar" style={styles.avatarImage} />
                      ) : (
                        <span style={styles.avatarInitials}>{getInitials(player.name)}</span>
                      )}
                    </div>
                    <div style={styles.rankingListInfo}>
                      <div style={styles.rankingListName}>{player.name}</div>
                      <div style={styles.rankingListStats}>
                        {player.points} pts
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Lista de Amigos */}
          <div style={styles.friendsCard}>
            <div style={styles.friendsCardHeader}>
              <h3 style={styles.cardTitle}>👥 Amigos</h3>
              <button 
                style={styles.friendsButton}
                onClick={() => setShowFriendsList(true)}
              >
                Ver Todos
              </button>
            </div>
            
            {loadingFriends ? (
              <div style={styles.friendsLoadingContainer}>
                <LoadingSpinner size="sm" text="Carregando..." />
              </div>
            ) : (
              <>
                {pendingRequests.length > 0 && (
                  <div 
                    style={styles.friendsPendingSection}
                    onClick={() => setShowFriendsList(true)}
                  >
                    <p style={styles.friendsPendingText}>
                      🔔 {pendingRequests.length} solicitação{pendingRequests.length > 1 ? 'ões' : ''} pendente{pendingRequests.length > 1 ? 's' : ''}
                    </p>
                    <button 
                      style={styles.friendsPendingButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowFriendsList(true);
                      }}
                    >
                      Ver
                    </button>
                  </div>
                )}
                
                {friends.length > 0 ? (
                  <div style={styles.friendsList}>
                    {friends.slice(0, 5).map((friend) => (
                      <div 
                        key={friend.id} 
                        style={styles.friendsListItem}
                      >
                        <div style={styles.friendsListAvatar}>
                          {friend.avatar ? (
                            <img src={friend.avatar} alt="Avatar" style={styles.avatarImage} />
                          ) : (
                            <span style={styles.avatarInitials}>{getInitials(friend.nickname)}</span>
                          )}
                        </div>
                        <div style={styles.friendsListInfo}>
                          <div style={styles.friendsListName}>{friend.nickname}</div>
                        </div>
                      </div>
                    ))}
                    {friends.length > 5 && (
                      <button 
                        style={styles.friendsViewMoreButton}
                        onClick={() => setShowFriendsList(true)}
                      >
                        Ver mais ({friends.length - 5})
                      </button>
                    )}
                  </div>
                ) : pendingRequests.length === 0 && (
                  <div style={styles.friendsEmptyContainer}>
                    <p style={styles.friendsEmptyText}>Nenhum amigo ainda.</p>
                    <button 
                      style={styles.friendsAddButton}
                      onClick={() => setShowAddFriend(true)}
                    >
                      + Adicionar Amigo
                    </button>
                  </div>
                )}
              </>
            )}
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
  gameSectionTitle: {
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
    boxShadow: theme.shadows.lg
  },
  rankingCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing[4]
  },
  cardTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.gray[900],
    margin: 0
  },
  rankingButton: {
    backgroundColor: theme.colors.primary.main,
    color: theme.colors.white,
    border: "none",
    borderRadius: theme.borderRadius.base,
    padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
    cursor: "pointer",
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: theme.colors.primary.dark,
      transform: "translateY(-1px)",
      boxShadow: theme.shadows.md
    }
  },
  rankingLoadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: theme.spacing[4]
  },
  rankingEmptyContainer: {
    padding: theme.spacing[4],
    textAlign: "center"
  },
  rankingEmptyText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.gray[500],
    margin: 0
  },
  rankingList: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing[2]
  },
  rankingListItem: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing[2],
    padding: theme.spacing[2],
    backgroundColor: theme.colors.surface.tertiary,
    borderRadius: theme.borderRadius.base,
    transition: "all 0.2s ease"
  },
  rankingListItemCurrent: {
    backgroundColor: theme.colors.primary.main + "15",
    border: `1px solid ${theme.colors.primary.main}`
  },
  rankingListPosition: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.gray[700],
    minWidth: "28px",
    textAlign: "center"
  },
  rankingListAvatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    backgroundColor: theme.colors.primary.main,
    color: theme.colors.white,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    flexShrink: 0,
    overflow: "hidden"
  },
  rankingListInfo: {
    flex: 1,
    minWidth: 0
  },
  rankingListName: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.gray[900],
    margin: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap"
  },
  rankingListStats: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.gray[600],
    margin: 0
  },
  friendsCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing[6],
    boxShadow: theme.shadows.lg,
    marginTop: theme.spacing[6]
  },
  friendsCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing[4]
  },
  friendsButton: {
    backgroundColor: theme.colors.primary.main,
    color: theme.colors.white,
    border: "none",
    borderRadius: theme.borderRadius.base,
    padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
    cursor: "pointer",
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: theme.colors.primary.dark,
      transform: "translateY(-1px)",
      boxShadow: theme.shadows.md
    }
  },
  friendsLoadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: theme.spacing[4]
  },
  friendsPendingSection: {
    backgroundColor: theme.colors.warning + "20",
    padding: theme.spacing[2],
    borderRadius: theme.borderRadius.base,
    marginBottom: theme.spacing[3],
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: theme.colors.warning + "30"
    }
  },
  friendsPendingText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.warning,
    margin: 0,
    fontWeight: theme.typography.fontWeight.medium
  },
  friendsPendingButton: {
    backgroundColor: theme.colors.warning,
    color: theme.colors.white,
    border: "none",
    borderRadius: theme.borderRadius.base,
    padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
    cursor: "pointer",
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: "#d97706"
    }
  },
  friendsList: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing[2]
  },
  friendsListItem: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing[2],
    padding: theme.spacing[2],
    backgroundColor: theme.colors.surface.tertiary,
    borderRadius: theme.borderRadius.base,
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: theme.colors.surface.secondary
    }
  },
  friendsListAvatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    backgroundColor: theme.colors.primary.main,
    color: theme.colors.white,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    flexShrink: 0,
    overflow: "hidden"
  },
  friendsListInfo: {
    flex: 1,
    minWidth: 0
  },
  friendsListName: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.gray[900],
    margin: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap"
  },
  friendsViewMoreButton: {
    width: "100%",
    backgroundColor: theme.colors.gray[100],
    color: theme.colors.gray[700],
    border: "none",
    borderRadius: theme.borderRadius.base,
    padding: theme.spacing[2],
    cursor: "pointer",
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
    transition: "all 0.3s ease",
    marginTop: theme.spacing[2],
    "&:hover": {
      backgroundColor: theme.colors.gray[200]
    }
  },
  friendsEmptyContainer: {
    padding: theme.spacing[4],
    textAlign: "center"
  },
  friendsEmptyText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.gray[500],
    margin: 0,
    marginBottom: theme.spacing[3]
  },
  friendsAddButton: {
    backgroundColor: theme.colors.primary.main,
    color: theme.colors.white,
    border: "none",
    borderRadius: theme.borderRadius.base,
    padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
    cursor: "pointer",
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: theme.colors.primary.dark
    }
  },
  requestsSection: {
    marginBottom: theme.spacing[4]
  },
  friendsSection: {
    marginTop: theme.spacing[4]
  },
  friendActions: {
    display: "flex",
    gap: theme.spacing[2]
  },
  acceptFriendButton: {
    backgroundColor: "#10b981",
    color: theme.colors.white,
    border: "none",
    borderRadius: theme.borderRadius.base,
    padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
    cursor: "pointer",
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: "#059669",
      transform: "scale(1.05)"
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
  
};

