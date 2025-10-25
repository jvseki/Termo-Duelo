// Serviço de autenticação com backend + localStorage
import api from './api';
import { validateEmailUniqueness, sanitizeString } from '../utils/validators';

// Chaves do localStorage
const STORAGE_KEYS = {
  USERS: 'termo_duelo_users',
  CURRENT_USER: 'termo_duelo_current_user',
  SESSION_TOKEN: 'termo_duelo_session_token'
};

// Configurações de sessão
const SESSION_CONFIG = {
  EXPIRY_HOURS: 24,
  TOKEN_LENGTH: 32
};

/**
 * Gera um token de sessão simples
 * @returns {string} - Token de sessão
 */
const generateSessionToken = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < SESSION_CONFIG.TOKEN_LENGTH; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
};

/**
 * Obtém timestamp de expiração da sessão
 * @returns {number} - Timestamp de expiração
 */
const getSessionExpiry = () => {
  return Date.now() + (SESSION_CONFIG.EXPIRY_HOURS * 60 * 60 * 1000);
};

/**
 * Verifica se a sessão ainda é válida
 * @param {number} expiry - Timestamp de expiração
 * @returns {boolean} - Se a sessão é válida
 */
const isSessionValid = (expiry) => {
  return Date.now() < expiry;
};

/**
 * Hash simples de senha (obfuscação básica)
 * @param {string} password - Senha em texto plano
 * @returns {string} - Senha "hasheada"
 */
const hashPassword = (password) => {
  return btoa(password + 'termo_duelo_salt');
};

/**
 * Verifica senha "hasheada"
 * @param {string} password - Senha em texto plano
 * @param {string} hashedPassword - Senha "hasheada"
 * @returns {boolean} - Se a senha confere
 */
const verifyPassword = (password, hashedPassword) => {
  return hashPassword(password) === hashedPassword;
};

/**
 * Obtém todos os usuários do localStorage
 * @returns {Array} - Array de usuários
 */
const getUsers = () => {
  try {
    const users = localStorage.getItem(STORAGE_KEYS.USERS);
    return users ? JSON.parse(users) : [];
  } catch (error) {
    console.error('Erro ao obter usuários:', error);
    return [];
  }
};

/**
 * Salva usuários no localStorage
 * @param {Array} users - Array de usuários
 * @returns {boolean} - Se foi salvo com sucesso
 */
const saveUsers = (users) => {
  try {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return true;
  } catch (error) {
    console.error('Erro ao salvar usuários:', error);
    return false;
  }
};

/**
 * Obtém usuário atual do localStorage
 * @returns {object|null} - Usuário atual ou null
 */
const getCurrentUser = () => {
  try {
    const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    const token = localStorage.getItem(STORAGE_KEYS.SESSION_TOKEN);
    
    if (!user || !token) return null;
    
    const userData = JSON.parse(user);
    
    // Verificar se a sessão ainda é válida
    if (!isSessionValid(userData.sessionExpiry)) {
      logout();
      return null;
    }
    
    return userData;
  } catch (error) {
    console.error('Erro ao obter usuário atual:', error);
    return null;
  }
};

/**
 * Salva usuário atual no localStorage
 * @param {object} user - Dados do usuário
 * @param {string} token - Token de sessão
 * @returns {boolean} - Se foi salvo com sucesso
 */
const saveCurrentUser = (user, token) => {
  try {
    const userData = {
      ...user,
      sessionExpiry: getSessionExpiry(),
      lastLogin: new Date().toISOString()
    };
    
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userData));
    localStorage.setItem(STORAGE_KEYS.SESSION_TOKEN, token);
    return true;
  } catch (error) {
    console.error('Erro ao salvar usuário atual:', error);
    return false;
  }
};

/**
 * Remove dados de sessão do localStorage
 */
const clearSession = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.SESSION_TOKEN);
  } catch (error) {
    console.error('Erro ao limpar sessão:', error);
  }
};

/**
 * Registra um novo usuário
 * @param {object} userData - Dados do usuário { name, email, password }
 * @returns {object} - { success: boolean, message: string, user?: object }
 */
export const register = async (userData) => {
  try {
    console.log('🚀 Iniciando registro:', userData);
    const { name, email, password } = userData;

    console.log('📤 Enviando requisição para:', 'http://localhost:3000/api/auth/register');
    const response = await api.post('/api/auth/register', {
      name,
      email,
      password
    });

    console.log('✅ Resposta do backend:', response.data);
    const { token, user, message } = response.data;
    const mappedUser = {
      id: user.id,
      name: user.nickname,
      email: user.email,
      avatar: null
    };

    console.log('👤 Usuário mapeado:', mappedUser);
    saveCurrentUser(mappedUser, token);

    return {
      success: true,
      message: message || 'Usuário registrado com sucesso!',
      user: mappedUser
    };
  } catch (error) {
    console.error('❌ Erro no registro:', error);
    console.error('📋 Detalhes do erro:', {
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data,
      message: error?.message
    });
    
    const apiMessage = error?.response?.data?.message;
    const apiError = error?.response?.data?.error;
    
    return {
      success: false,
      message: apiMessage || apiError || 'Erro ao registrar usuário'
    };
  }
};

/**
 * Faz login do usuário
 * @param {object} credentials - Credenciais { email, password, rememberMe? }
 * @returns {object} - { success: boolean, message: string, user?: object }
 */
export const login = async (credentials) => {
  try {
    const { email, password } = credentials;

    const response = await api.post('/api/auth/login', {
      email,
      password
    });

    const { token, user, message } = response.data;
    const mappedUser = {
      id: user.id,
      name: user.nickname,
      email: user.email,
      avatar: user.avatar || null
    };

    saveCurrentUser(mappedUser, token);

    return {
      success: true,
      message: message || 'Login realizado com sucesso!',
      user: mappedUser
    };
  } catch (error) {
    console.error('Login error:', error);
    const apiMessage = error?.response?.data?.message;
    const apiError = error?.response?.data?.error;
    
    return {
      success: false,
      message: apiMessage || apiError || 'Erro ao fazer login'
    };
  }
};

/**
 * Faz logout do usuário
 * @returns {object} - { success: boolean, message: string }
 */
export const logout = () => {
  try {
    clearSession();
    return {
      success: true,
      message: 'Logout realizado com sucesso!'
    };
  } catch (error) {
    console.error('Erro no logout:', error);
    return {
      success: false,
      message: 'Erro ao fazer logout'
    };
  }
};

/**
 * Obtém usuário atual logado
 * @returns {object|null} - Usuário atual ou null
 */
export const getCurrentUserData = () => {
  return getCurrentUser();
};

/**
 * Busca dados do usuário no backend
 * @returns {object} - { success: boolean, message: string, user?: object }
 */
export const fetchUserData = async () => {
  try {
    const response = await api.get('/api/auth/user');
    const { user } = response.data;
    
    const mappedUser = {
      id: user.id,
      name: user.nickname,
      email: user.email,
      avatar: user.avatar || null,
      status: user.status
    };

    // Atualizar dados no localStorage
    const token = localStorage.getItem(STORAGE_KEYS.SESSION_TOKEN);
    saveCurrentUser(mappedUser, token);

    return {
      success: true,
      message: 'Dados do usuário carregados com sucesso!',
      user: mappedUser
    };
  } catch (error) {
    console.error('Fetch user data error:', error);
    const apiMessage = error?.response?.data?.message;
    const apiError = error?.response?.data?.error;
    
    return {
      success: false,
      message: apiMessage || apiError || 'Erro ao carregar dados do usuário'
    };
  }
};

/**
 * Atualiza dados do usuário
 * @param {object} updates - Dados para atualizar
 * @returns {object} - { success: boolean, message: string, user?: object }
 */
export const updateUser = async (updates) => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      return {
        success: false,
        message: 'Usuário não está logado'
      };
    }
    
    // Por enquanto, vamos atualizar apenas no localStorage
    // Futuramente pode ser implementado endpoint no backend
    const updatedUser = {
      ...currentUser,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    const token = localStorage.getItem(STORAGE_KEYS.SESSION_TOKEN);
    saveCurrentUser(updatedUser, token);
    
    return {
      success: true,
      message: 'Dados atualizados com sucesso!',
      user: updatedUser
    };
    
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    return {
      success: false,
      message: 'Erro interno do servidor'
    };
  }
};

/**
 * Verifica se o usuário está autenticado
 * @returns {boolean} - Se está autenticado
 */
export const isAuthenticated = () => {
  const user = getCurrentUser();
  return user !== null;
};

/**
 * Inicializa dados padrão se necessário
 */
export const initializeDefaultData = () => {
  const users = getUsers();
  
  // Se não há usuários, criar usuário padrão para teste
  if (users.length === 0) {
    const defaultUser = {
      id: '1',
      name: 'João Victor',
      email: 'jv.s.m2006@hotmail.com',
      password: hashPassword('1234'),
      pontuacao: 0,
      createdAt: new Date().toISOString(),
      lastLogin: null,
      isActive: true
    };
    
    saveUsers([defaultUser]);
  }
};

// Inicializar dados padrão
initializeDefaultData();

export default {
  register,
  login,
  logout,
  getCurrentUserData,
  updateUser,
  fetchUserData,
  isAuthenticated
};