import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { theme } from "../styles/theme";

export default function Ranking() {
  const [rankingData, setRankingData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    loadRankingData();
  }, [user, navigate]);

  const loadRankingData = () => {
    setLoading(true);
    
    // Simular carregamento de dados
    setTimeout(() => {
      const allUsers = JSON.parse(localStorage.getItem('termo_duelo_users') || '[]');
      
      // Gerar dados de ranking baseados nos usuários existentes
      const ranking = allUsers.map((user, index) => ({
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        points: Math.floor(Math.random() * 2000) + 500, // Pontos aleatórios para demonstração
        gamesPlayed: Math.floor(Math.random() * 200) + 50,
        winRate: Math.floor(Math.random() * 40) + 60, // 60-100%
        streak: Math.floor(Math.random() * 15) + 1,
        lastPlayed: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
      }));

      // Ordenar por pontos
      ranking.sort((a, b) => b.points - a.points);
      
      // Adicionar posição
      const rankingWithPosition = ranking.map((player, index) => ({
        ...player,
        position: index + 1
      }));

      setRankingData(rankingWithPosition);
      setLoading(false);
    }, 1000);
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getMedalIcon = (position) => {
    switch (position) {
      case 1: return "🥇";
      case 2: return "🥈";
      case 3: return "🥉";
      default: return `#${position}`;
    }
  };

  const getCurrentUserRank = () => {
    return rankingData.find(player => player.id === user?.id);
  };

  const handleBackToHome = () => {
    navigate("/home");
  };

  if (!user) {
    return null;
  }

  return (
    <div style={styles.background}>
      {/* Header */}
      <div style={styles.header}>
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
              onClick={() => navigate("/home")}
            >
              Início
            </button>
            <button 
              style={{...styles.navButton, ...styles.activeNavButton}}
            >
              Ranking
            </button>
            <button 
              style={styles.navButton}
              onClick={() => navigate("/home")}
            >
              Amigos
            </button>
          </nav>
          
          <div style={styles.userSection}>
            <div style={styles.userProfile}>
              <div style={styles.userAvatar}>
                {user.avatar ? (
                  <img src={user.avatar} alt="Avatar" style={styles.avatarImage} />
                ) : (
                  <span style={styles.avatarInitials}>{getInitials(user.name)}</span>
                )}
              </div>
              <span style={styles.userName}>{user.name.split(' ')[0]}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div style={styles.mainContent}>
        <div style={styles.container}>
          <div style={styles.titleSection}>
            <h1 style={styles.title}>🏆 Ranking dos Jogadores</h1>
            <p style={styles.subtitle}>Veja como você se compara com outros jogadores</p>
          </div>

          {/* Single ranking - no tabs */}

          {/* Ranking do usuário atual */}
          {getCurrentUserRank() && (
            <div style={styles.currentUserCard}>
              <h3 style={styles.currentUserTitle}>Sua Posição</h3>
              <div style={styles.currentUserInfo}>
                <div style={styles.currentUserAvatar}>
                  {user.avatar ? (
                    <img src={user.avatar} alt="Avatar" style={styles.avatarImage} />
                  ) : (
                    <span style={styles.avatarInitials}>{getInitials(user.name)}</span>
                  )}
                </div>
                <div style={styles.currentUserDetails}>
                  <h4 style={styles.currentUserName}>{user.name}</h4>
                  <p style={styles.currentUserPosition}>
                    {getMedalIcon(getCurrentUserRank().position)} {getCurrentUserRank().position}º lugar
                  </p>
                  <p style={styles.currentUserPoints}>{getCurrentUserRank().points} pontos</p>
                </div>
              </div>
            </div>
          )}

          {/* Lista de ranking */}
          <div style={styles.rankingContainer}>
            {loading ? (
              <div style={styles.loadingContainer}>
                <div style={styles.loadingSpinner}></div>
                <p style={styles.loadingText}>Carregando ranking...</p>
              </div>
            ) : (
              <>
                <h3 style={styles.rankingTitle}>
                  Top {rankingData.length} Jogadores
                </h3>
                <div style={styles.rankingList}>
                  {rankingData.slice(0, 10).map((player) => (
                    <div 
                      key={player.id} 
                      style={{
                        ...styles.rankingItem,
                        ...(player.id === user.id ? styles.currentUserItem : {})
                      }}
                    >
                      <div style={styles.rankingPosition}>
                        {getMedalIcon(player.position)}
                      </div>
                      <div style={styles.rankingAvatar}>
                        {player.avatar ? (
                          <img src={player.avatar} alt="Avatar" style={styles.avatarImage} />
                        ) : (
                          <span style={styles.avatarInitials}>{getInitials(player.name)}</span>
                        )}
                      </div>
                      <div style={styles.rankingInfo}>
                        <h4 style={styles.rankingName}>{player.name}</h4>
                        <p style={styles.rankingStats}>
                          {player.points} pts • {player.gamesPlayed} jogos • {player.winRate}% vitórias
                        </p>
                      </div>
                      <div style={styles.rankingStreak}>
                        🔥 {player.streak}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Botão voltar */}
          <div style={styles.actionsContainer}>
            <button 
              style={styles.backButton}
              onClick={handleBackToHome}
            >
              ← Voltar ao Início
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
  header: {
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
  activeNavButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    fontWeight: theme.typography.fontWeight.bold
  },
  userSection: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing[4]
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
  mainContent: {
    flex: 1,
    padding: theme.spacing[8],
    display: "flex",
    justifyContent: "center"
  },
  container: {
    width: "100%",
    maxWidth: "800px"
  },
  titleSection: {
    textAlign: "center",
    marginBottom: theme.spacing[8]
  },
  title: {
    fontSize: theme.typography.fontSize['4xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.gray[900],
    margin: 0,
    marginBottom: theme.spacing[2]
  },
  subtitle: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.gray[600],
    margin: 0
  },
  tabsContainer: {
    display: "flex",
    gap: theme.spacing[2],
    marginBottom: theme.spacing[8],
    justifyContent: "center"
  },
  tabButton: {
    padding: `${theme.spacing[3]} ${theme.spacing[6]}`,
    border: `2px solid ${theme.colors.gray[200]}`,
    backgroundColor: theme.colors.white,
    color: theme.colors.gray[600],
    borderRadius: theme.borderRadius.base,
    cursor: "pointer",
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    transition: "all 0.3s ease",
    "&:hover": {
      borderColor: theme.colors.primary.main,
      color: theme.colors.primary.main
    }
  },
  activeTabButton: {
    borderColor: theme.colors.primary.main,
    backgroundColor: theme.colors.primary.main,
    color: theme.colors.white,
    "&:hover": {
      backgroundColor: theme.colors.primary.dark
    }
  },
  currentUserCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing[6],
    marginBottom: theme.spacing[8],
    boxShadow: theme.shadows.lg,
    border: `2px solid ${theme.colors.primary.main}`
  },
  currentUserTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.gray[900],
    margin: 0,
    marginBottom: theme.spacing[4],
    textAlign: "center"
  },
  currentUserInfo: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing[4]
  },
  currentUserAvatar: {
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
    boxShadow: theme.shadows.md
  },
  currentUserDetails: {
    flex: 1
  },
  currentUserName: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.gray[900],
    margin: 0,
    marginBottom: theme.spacing[1]
  },
  currentUserPosition: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary.main,
    margin: 0,
    marginBottom: theme.spacing[1]
  },
  currentUserPoints: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.gray[600],
    margin: 0
  },
  rankingContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing[6],
    marginBottom: theme.spacing[8],
    boxShadow: theme.shadows.lg
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: theme.spacing[8]
  },
  loadingSpinner: {
    width: "40px",
    height: "40px",
    border: `4px solid ${theme.colors.gray[200]}`,
    borderTop: `4px solid ${theme.colors.primary.main}`,
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: theme.spacing[4]
  },
  loadingText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.gray[600],
    margin: 0
  },
  rankingTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.gray[900],
    margin: 0,
    marginBottom: theme.spacing[6],
    textAlign: "center"
  },
  rankingList: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing[3]
  },
  rankingItem: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing[4],
    padding: theme.spacing[4],
    backgroundColor: theme.colors.surface.tertiary,
    borderRadius: theme.borderRadius.base,
    transition: "all 0.3s ease",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: theme.shadows.md
    }
  },
  currentUserItem: {
    backgroundColor: theme.colors.primary.main + "10",
    border: `2px solid ${theme.colors.primary.main}`
  },
  rankingPosition: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.gray[700],
    minWidth: "40px",
    textAlign: "center"
  },
  rankingAvatar: {
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
  rankingInfo: {
    flex: 1
  },
  rankingName: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.gray[900],
    margin: 0,
    marginBottom: theme.spacing[1]
  },
  rankingStats: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.gray[600],
    margin: 0
  },
  rankingStreak: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.warning,
    backgroundColor: theme.colors.warning + "20",
    padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
    borderRadius: theme.borderRadius.sm
  },
  actionsContainer: {
    display: "flex",
    justifyContent: "center"
  },
  backButton: {
    backgroundColor: theme.colors.gray[200],
    color: theme.colors.gray[700],
    border: "none",
    borderRadius: theme.borderRadius.base,
    padding: `${theme.spacing[3]} ${theme.spacing[6]}`,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    cursor: "pointer",
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: theme.colors.gray[300],
      transform: "translateY(-1px)",
      boxShadow: theme.shadows.sm
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
  }
};