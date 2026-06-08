import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/User';
import { authService } from '../services/authService';

interface AuthContextData {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verifica sessão salva ao abrir o app
  useEffect(() => {
    async function loadStoredSession() {
      try {
        const storedUser = await authService.getStoredUser();
        const storedToken = await authService.getToken();
        if (storedUser && storedToken) {
          setUser(storedUser);
          setToken(storedToken);
        }
      } catch (error) {
        console.error('Erro ao carregar sessão:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadStoredSession();
  }, []);

  async function login(email: string, senha: string) {
    try {
      const response = await authService.login({ email, senha });
      setUser(response.user);
      setToken(response.token);
    } catch (error) {
      // Fallback para usuários cadastrados localmente (offline/sem API)
      const raw = await AsyncStorage.getItem('@orbit_users');
      if (raw) {
        const users: any[] = JSON.parse(raw);
        const localUser = users.find(
          (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.senha === senha
        );
        if (localUser) {
          const fakeToken = 'local_token_' + localUser.email;
          const fakeUserData = { id: Date.now(), nome: localUser.nome, email: localUser.email, municipio: localUser.municipio, cargo: localUser.cargo };
          
          await AsyncStorage.setItem('@orbit_token', fakeToken);
          await AsyncStorage.setItem('@orbit_user', JSON.stringify(fakeUserData));
          
          setUser(fakeUserData);
          setToken(fakeToken);
          return;
        }
      }
      // Se não encontrar o usuário localmente, lança o erro da API novamente
      throw error;
    }
  }

  async function logout() {
    await authService.logout();
    setUser(null);
    setToken(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}
