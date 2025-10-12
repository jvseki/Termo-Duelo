// Contexto de autenticação global
import { createContext, useContext, useReducer, useEffect } from 'react';
import authService from '../services/authService';

// Estados do contexto
const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null
};

// Tipos de ações
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT_SUCCESS: 'LOGOUT_SUCCESS',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  UPDATE_USER_SUCCESS: 'UPDATE_USER_SUCCESS',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer para gerenciar estado
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
      
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
        error: null
      };
      
    case AUTH_ACTIONS.REGISTER_SUCCESS:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
        error: null
      };
      
    case AUTH_ACTIONS.LOGOUT_SUCCESS:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };
      
    case AUTH_ACTIONS.UPDATE_USER_SUCCESS:
      return {
        ...state,
        user: action.payload,
        loading: false,
        error: null
      };
      
    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };
      
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
      
    default:
      return state;
  }
};

// Criar contexto
const AuthContext = createContext();

// Provider do contexto
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Verificar autenticação ao inicializar
  useEffect(() => {
    const checkAuth = async () => {
      try {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
        
        const user = authService.getCurrentUserData();
        
        if (user) {
          dispatch({ 
            type: AUTH_ACTIONS.LOGIN_SUCCESS, 
            payload: user 
          });
        } else {
          dispatch({ 
            type: AUTH_ACTIONS.SET_LOADING, 
            payload: false 
          });
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        dispatch({ 
          type: AUTH_ACTIONS.SET_ERROR, 
          payload: 'Erro ao verificar autenticação' 
        });
      }
    };

    checkAuth();
  }, []);

  // Função de login
  const login = async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
      
      const result = await authService.login(credentials);
      
      if (result.success) {
        dispatch({ 
          type: AUTH_ACTIONS.LOGIN_SUCCESS, 
          payload: result.user 
        });
        return { success: true, message: result.message };
      } else {
        dispatch({ 
          type: AUTH_ACTIONS.SET_ERROR, 
          payload: result.message 
        });
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error('Erro no login:', error);
      const errorMessage = 'Erro interno do servidor';
      dispatch({ 
        type: AUTH_ACTIONS.SET_ERROR, 
        payload: errorMessage 
      });
      return { success: false, message: errorMessage };
    }
  };

  // Função de registro
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
      
      const result = await authService.register(userData);
      
      if (result.success) {
        // Após registro bem-sucedido, fazer login automático
        const loginResult = await authService.login({
          email: userData.email,
          password: userData.password
        });
        
        if (loginResult.success) {
          dispatch({ 
            type: AUTH_ACTIONS.REGISTER_SUCCESS, 
            payload: loginResult.user 
          });
          return { success: true, message: result.message };
        } else {
          dispatch({ 
            type: AUTH_ACTIONS.SET_ERROR, 
            payload: 'Registro realizado, mas erro no login automático' 
          });
          return { success: false, message: 'Registro realizado, mas erro no login automático' };
        }
      } else {
        dispatch({ 
          type: AUTH_ACTIONS.SET_ERROR, 
          payload: result.message 
        });
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error('Erro no registro:', error);
      const errorMessage = 'Erro interno do servidor';
      dispatch({ 
        type: AUTH_ACTIONS.SET_ERROR, 
        payload: errorMessage 
      });
      return { success: false, message: errorMessage };
    }
  };

  // Função de logout
  const logout = async () => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      
      const result = authService.logout();
      
      dispatch({ 
        type: AUTH_ACTIONS.LOGOUT_SUCCESS 
      });
      
      return { success: true, message: result.message };
    } catch (error) {
      console.error('Erro no logout:', error);
      dispatch({ 
        type: AUTH_ACTIONS.SET_ERROR, 
        payload: 'Erro ao fazer logout' 
      });
      return { success: false, message: 'Erro ao fazer logout' };
    }
  };

  // Função para atualizar dados do usuário
  const updateUser = async (updates) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
      
      const result = await authService.updateUser(updates);
      
      if (result.success) {
        dispatch({ 
          type: AUTH_ACTIONS.UPDATE_USER_SUCCESS, 
          payload: result.user 
        });
        return { success: true, message: result.message };
      } else {
        dispatch({ 
          type: AUTH_ACTIONS.SET_ERROR, 
          payload: result.message 
        });
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      const errorMessage = 'Erro interno do servidor';
      dispatch({ 
        type: AUTH_ACTIONS.SET_ERROR, 
        payload: errorMessage 
      });
      return { success: false, message: errorMessage };
    }
  };

  // Função para limpar erros
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Função para verificar se está autenticado
  const checkAuth = () => {
    return authService.isAuthenticated();
  };

  // Valores do contexto
  const contextValue = {
    // Estado
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    loading: state.loading,
    error: state.error,
    
    // Ações
    login,
    register,
    logout,
    updateUser,
    clearError,
    checkAuth
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar o contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
};

// Hook para verificar se o usuário está autenticado
export const useRequireAuth = () => {
  const { isAuthenticated, loading } = useAuth();
  
  return {
    isAuthenticated,
    loading,
    shouldRedirect: !loading && !isAuthenticated
  };
};

// Hook para obter dados do usuário atual
export const useCurrentUser = () => {
  const { user, isAuthenticated } = useAuth();
  
  return {
    user,
    isAuthenticated,
    isLoggedIn: isAuthenticated && user !== null
  };
};

export default AuthContext;
