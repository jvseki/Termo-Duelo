import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000", // endereço do back-end
});

// Interceptor para anexar o token JWT nas requisições
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('termo_duelo_session_token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (_) {}
  return config;
});

export default api;