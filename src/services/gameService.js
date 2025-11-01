import api from './api';
import { getCurrentUserData } from './authService';

const STORAGE_KEYS = {
  SESSION_TOKEN: 'termo_duelo_session_token'
};

/**
 * Busca uma palavra aleatória do backend
 * @returns {object} - { success: boolean, message: string, keyword?: string, keywordId?: number }
 */
export const getRandomKeyword = async () => {
  try {
    const currentUser = getCurrentUserData();
    if (!currentUser || !currentUser.id) {
      return {
        success: false,
        message: 'Usuário não está autenticado'
      };
    }

    const response = await api.get('/api/game/random-keyword');

    return {
      success: true,
      message: 'Palavra obtida com sucesso',
      keyword: response.data.keyword.toUpperCase(),
      keywordId: response.data.keywordId
    };
  } catch (error) {
    const apiMessage = error?.response?.data?.message;
    const status = error?.response?.status;
    
    if (status === 401) {
      return {
        success: false,
        message: 'Sessão expirada. Por favor, faça login novamente.'
      };
    }
    
    return {
      success: false,
      message: apiMessage || 'Erro ao obter palavra aleatória'
    };
  }
};

/**
 * Calcula a pontuação baseada nas tentativas
 * @param {number} tries - Número de tentativas usadas
 * @param {number} maxTries - Número máximo de tentativas
 * @param {boolean} isWin - Se o jogador ganhou
 * @returns {number} - Pontuação calculada
 */
export const calculateScore = (tries, maxTries, isWin) => {
  const baseScore = 1000;
  
  if (isWin) {
    const tryMultiplier = (maxTries - tries + 1) / maxTries;
    return Math.round(baseScore * tryMultiplier);
  } else {
    const tryMultiplier = tries / maxTries;
    return Math.round(baseScore * 0.3 * (1 - tryMultiplier));
  }
};

/**
 * Finaliza um jogo no backend
 * @param {object} gameData - Dados do jogo { keyword, keywordId, tries, maxTries, isWin }
 * @returns {object} - { success: boolean, message: string, game?: object }
 */
export const finishGame = async (gameData) => {
  try {
    const currentUser = getCurrentUserData();
    if (!currentUser || !currentUser.id) {
      return {
        success: false,
        message: 'Usuário não está autenticado'
      };
    }

    const token = localStorage.getItem(STORAGE_KEYS.SESSION_TOKEN);
    if (!token) {
      return {
        success: false,
        message: 'Token de autenticação não encontrado'
      };
    }

    const { keyword, keywordId, tries, maxTries, isWin } = gameData;
    const score = calculateScore(tries, maxTries, isWin);
    const win = isWin;
    const lose = !isWin;

    const response = await api.put('/api/game/finish', {
      score,
      win,
      lose,
      tries,
      keyword
    }, {
      headers: {
        'x-caller-id': currentUser.id.toString(),
        'x-tiger-token': token
      }
    });

    return {
      success: true,
      message: response.data.message || 'Jogo finalizado com sucesso',
      game: response.data.game
    };
  } catch (error) {
    const apiMessage = error?.response?.data?.message;
    const status = error?.response?.status;
    
    if (status === 401) {
      return {
        success: false,
        message: 'Sessão expirada. Por favor, faça login novamente.'
      };
    }
    
    return {
      success: false,
      message: apiMessage || 'Erro ao finalizar jogo'
    };
  }
};

/**
 * Busca o ranking de jogadores do backend
 * @returns {object} - { success: boolean, message: string, ranking?: Array }
 */
export const getRanking = async () => {
  try {
    const currentUser = getCurrentUserData();
    if (!currentUser || !currentUser.id) {
      return {
        success: false,
        message: 'Usuário não está autenticado'
      };
    }

    const response = await api.get('/api/game/ranking');

    return {
      success: true,
      message: response.data.message || 'Ranking obtido com sucesso',
      ranking: response.data.ranking || [],
      totalPlayers: response.data.totalPlayers || 0
    };
  } catch (error) {
    const apiMessage = error?.response?.data?.message;
    const status = error?.response?.status;
    
    if (status === 401) {
      return {
        success: false,
        message: 'Sessão expirada. Por favor, faça login novamente.'
      };
    }
    
    return {
      success: false,
      message: apiMessage || 'Erro ao obter ranking'
    };
  }
};

export default {
  getRandomKeyword,
  finishGame,
  calculateScore,
  getRanking
};

