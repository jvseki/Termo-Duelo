import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { getCurrentUserData } from '../services/authService';

const SOCKET_URL = 'http://localhost:3000';

export const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('termo_duelo_session_token');
    const currentUser = getCurrentUserData();

    if (!token || !currentUser) {
      console.error('Socket: Token ou usuário não encontrado', { token: !!token, user: !!currentUser });
      setError('Usuário não autenticado');
      return;
    }

    console.log('Socket: Conectando...', { tokenLength: token.length, userId: currentUser.id });

    const newSocket = io(SOCKET_URL, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Socket conectado:', newSocket.id);
      setIsConnected(true);
      setError(null);
      newSocket.emit('user:setOnline');
    });

    newSocket.on('disconnect', () => {
      console.log('Socket desconectado');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      console.error('Erro de conexão Socket:', err);
      console.error('Detalhes do erro:', {
        message: err.message,
        type: err.type,
        description: err.description
      });
      setError(err.message || 'Erro ao conectar com o servidor');
      setIsConnected(false);
    });

    newSocket.on('error', (err) => {
      console.error('Erro Socket.IO:', err);
      setError(err.message || 'Erro no Socket.IO');
    });

    return () => {
      if (socketRef.current) {
        console.log('Socket: Limpando conexão...');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    error
  };
};

export default useSocket;

