// Serviço de autenticação com localStorage
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
    const { name, email, password } = userData;
    
    // Sanitizar dados
    const sanitizedName = sanitizeString(name);
    const sanitizedEmail = sanitizeString(email).toLowerCase();
    
    // Validar dados básicos
    if (!sanitizedName || !sanitizedEmail || !password) {
      return {
        success: false,
        message: 'Todos os campos são obrigatórios'
      };
    }
    
    // Obter usuários existentes
    const users = getUsers();
    
    // Verificar se email já existe
    const emailValidation = validateEmailUniqueness(sanitizedEmail, users);
    if (!emailValidation.isValid) {
      return {
        success: false,
        message: emailValidation.message
      };
    }
    
    // Criar novo usuário
    const newUser = {
      id: Date.now().toString(),
      name: sanitizedName,
      email: sanitizedEmail,
      password: hashPassword(password),
      pontuacao: 0,
      avatar: null, // caminho do avatar selecionado (opcional)
      createdAt: new Date().toISOString(),
      lastLogin: null,
      isActive: true
    };
    
    // Adicionar usuário à lista
    users.push(newUser);
    
    // Salvar no localStorage
    if (!saveUsers(users)) {
      return {
        success: false,
        message: 'Erro ao salvar dados do usuário'
      };
    }
    
    return {
      success: true,
      message: 'Usuário registrado com sucesso!',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        pontuacao: newUser.pontuacao
      }
    };
    
  } catch (error) {
    console.error('Erro no registro:', error);
    return {
      success: false,
      message: 'Erro interno do servidor'
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
    const { email, password, rememberMe = false } = credentials;
    
    // Sanitizar email
    const sanitizedEmail = sanitizeString(email).toLowerCase();
    
    // Validar dados básicos
    if (!sanitizedEmail || !password) {
      return {
        success: false,
        message: 'Email e senha são obrigatórios'
      };
    }
    
    // Obter usuários
    const users = getUsers();
    
    // Buscar usuário por email
    const user = users.find(u => u.email === sanitizedEmail && u.isActive);
    
    if (!user) {
      return {
        success: false,
        message: 'Email ou senha incorretos'
      };
    }
    
    // Verificar senha
    if (!verifyPassword(password, user.password)) {
      return {
        success: false,
        message: 'Email ou senha incorretos'
      };
    }
    
    // Gerar token de sessão
    const sessionToken = generateSessionToken();
    
    // Preparar dados do usuário para retorno
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      pontuacao: user.pontuacao,
      avatar: user.avatar || null
    };
    
    // Salvar sessão
    if (!saveCurrentUser(userData, sessionToken)) {
      return {
        success: false,
        message: 'Erro ao criar sessão'
      };
    }
    
    // Atualizar último login
    user.lastLogin = new Date().toISOString();
    saveUsers(users);
    
    return {
      success: true,
      message: 'Login realizado com sucesso!',
      user: userData
    };
    
  } catch (error) {
    console.error('Erro no login:', error);
    return {
      success: false,
      message: 'Erro interno do servidor'
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
    
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex === -1) {
      return {
        success: false,
        message: 'Usuário não encontrado'
      };
    }
    
    // Atualizar dados permitidos
    const allowedUpdates = ['name', 'pontuacao', 'avatar'];
    const updatedUser = { ...users[userIndex] };
    
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updatedUser[key] = sanitizeString(updates[key]) || updates[key];
      }
    });
    
    updatedUser.updatedAt = new Date().toISOString();
    users[userIndex] = updatedUser;
    
    if (!saveUsers(users)) {
      return {
        success: false,
        message: 'Erro ao salvar alterações'
      };
    }
    
    // Atualizar sessão atual
    const newUserData = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      pontuacao: updatedUser.pontuacao,
      avatar: updatedUser.avatar || null
    };
    
    const token = localStorage.getItem(STORAGE_KEYS.SESSION_TOKEN);
    saveCurrentUser(newUserData, token);
    
    return {
      success: true,
      message: 'Dados atualizados com sucesso!',
      user: newUserData
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
  isAuthenticated
};