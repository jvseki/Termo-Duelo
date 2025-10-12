// Hook customizado para usar o contexto de autenticação
import { useContext } from 'react';
import AuthContext from '../contexts/AuthContext';

/**
 * Hook para acessar o contexto de autenticação
 * @returns {object} - Contexto de autenticação
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
};

export default useAuth;
