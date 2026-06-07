// Endpoints da API Spring Boot
const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://java-advanced-2-7tix.onrender.com';

export const API_BASE_URL = BASE_URL;

export const ENDPOINTS = {
  // Auth
  LOGIN: `${BASE_URL}/auth/login`,
  REGISTER: `${BASE_URL}/auth/register`,

  // Alertas
  ALERTAS: `${BASE_URL}/alertas`,
  ALERTA_BY_ID: (id: number) => `${BASE_URL}/alertas/${id}`,
  ALERTAS_ATIVOS: `${BASE_URL}/alertas/ativos`,

  // Usuários
  USUARIOS: `${BASE_URL}/usuarios`,
  USUARIO_BY_ID: (id: number) => `${BASE_URL}/usuarios/${id}`,
  USUARIO_PERFIL: `${BASE_URL}/usuarios/perfil`,
};
