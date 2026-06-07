import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/axios';
import { ENDPOINTS } from '../api/endpoints';
import { LoginRequest, LoginResponse, User } from '../types/User';

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>(ENDPOINTS.LOGIN, credentials);
    const { token, user } = response.data;

    // Persiste token e dados do usuário
    await AsyncStorage.setItem('@orbit_token', token);
    await AsyncStorage.setItem('@orbit_user', JSON.stringify(user));

    return response.data;
  },

  async logout(): Promise<void> {
    await AsyncStorage.multiRemove(['@orbit_token', '@orbit_user']);
  },

  async getStoredUser(): Promise<User | null> {
    const userStr = await AsyncStorage.getItem('@orbit_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  async getToken(): Promise<string | null> {
    return AsyncStorage.getItem('@orbit_token');
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem('@orbit_token');
    return !!token;
  },
};
