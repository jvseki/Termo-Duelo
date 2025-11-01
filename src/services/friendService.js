import api from './api';
import { getCurrentUserData } from './authService';

const STORAGE_KEYS = {
  SESSION_TOKEN: 'termo_duelo_session_token'
};

/**
 * Busca lista de amigos do backend
 * @returns {object} - { success: boolean, message: string, friends?: Array }
 */
export const getFriends = async () => {
  try {
    const currentUser = getCurrentUserData();
    if (!currentUser || !currentUser.id) {
      return {
        success: false,
        message: 'Usuário não está autenticado'
      };
    }

    const response = await api.get('/api/friend/list');

    return {
      success: true,
      message: response.data.message || 'Amigos obtidos com sucesso',
      friends: response.data.friends || [],
      count: response.data.count || 0
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
      message: apiMessage || 'Erro ao obter amigos'
    };
  }
};

/**
 * Busca solicitações pendentes recebidas
 * @returns {object} - { success: boolean, message: string, requests?: Array }
 */
export const getPendingRequests = async () => {
  try {
    const currentUser = getCurrentUserData();
    if (!currentUser || !currentUser.id) {
      return {
        success: false,
        message: 'Usuário não está autenticado'
      };
    }

    const response = await api.get('/api/friend/requests/pending');

    return {
      success: true,
      message: response.data.message || 'Solicitações obtidas com sucesso',
      requests: response.data.requests || [],
      count: response.data.count || 0
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
      message: apiMessage || 'Erro ao obter solicitações pendentes'
    };
  }
};

/**
 * Busca solicitações enviadas
 * @returns {object} - { success: boolean, message: string, requests?: Array }
 */
export const getSentRequests = async () => {
  try {
    const currentUser = getCurrentUserData();
    if (!currentUser || !currentUser.id) {
      return {
        success: false,
        message: 'Usuário não está autenticado'
      };
    }

    const response = await api.get('/api/friend/requests/sent');

    return {
      success: true,
      message: response.data.message || 'Solicitações enviadas obtidas com sucesso',
      requests: response.data.requests || [],
      count: response.data.count || 0
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
      message: apiMessage || 'Erro ao obter solicitações enviadas'
    };
  }
};

/**
 * Adiciona um amigo (envia solicitação)
 * @param {number} friendId - ID do amigo
 * @returns {object} - { success: boolean, message: string }
 */
export const addFriend = async (friendId) => {
  try {
    const currentUser = getCurrentUserData();
    if (!currentUser || !currentUser.id) {
      return {
        success: false,
        message: 'Usuário não está autenticado'
      };
    }

    const response = await api.post('/api/friend/add', {
      friendId: parseInt(friendId)
    });

    return {
      success: true,
      message: response.data.message || 'Solicitação de amizade enviada com sucesso'
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
      message: apiMessage || 'Erro ao enviar solicitação de amizade'
    };
  }
};

/**
 * Aceita uma solicitação de amizade
 * @param {number} friendId - ID do amigo
 * @returns {object} - { success: boolean, message: string, friend?: object }
 */
export const acceptFriend = async (friendId) => {
  try {
    const currentUser = getCurrentUserData();
    if (!currentUser || !currentUser.id) {
      return {
        success: false,
        message: 'Usuário não está autenticado'
      };
    }

    const response = await api.post(`/api/friend/accept/${friendId}`);

    return {
      success: true,
      message: response.data.message || 'Solicitação de amizade aceita com sucesso',
      friend: response.data.friend
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
      message: apiMessage || 'Erro ao aceitar solicitação de amizade'
    };
  }
};

/**
 * Remove um amigo
 * @param {number} friendId - ID do amigo
 * @returns {object} - { success: boolean, message: string }
 */
export const removeFriend = async (friendId) => {
  try {
    const currentUser = getCurrentUserData();
    if (!currentUser || !currentUser.id) {
      return {
        success: false,
        message: 'Usuário não está autenticado'
      };
    }

    const response = await api.delete(`/api/friend/remove/${friendId}`);

    return {
      success: true,
      message: response.data.message || 'Amizade removida com sucesso'
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
      message: apiMessage || 'Erro ao remover amizade'
    };
  }
};

export default {
  getFriends,
  getPendingRequests,
  getSentRequests,
  addFriend,
  acceptFriend,
  removeFriend
};

