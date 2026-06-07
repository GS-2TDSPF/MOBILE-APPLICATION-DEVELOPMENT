import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
    const response = await authService.login({ email, senha });
    setUser(response.user);
    setToken(response.token);
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
