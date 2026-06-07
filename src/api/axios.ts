import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from './endpoints';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de REQUEST — injeta JWT token automaticamente
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('@orbit_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de RESPONSE — trata erros globais
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado — limpa storage
      await AsyncStorage.multiRemove(['@orbit_token', '@orbit_user']);
    }
    return Promise.reject(error);
  }
);

export default api;
