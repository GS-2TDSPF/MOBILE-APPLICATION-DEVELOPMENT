// Tipos para Usuário/Auth
export interface User {
  id: number;
  nome: string;
  email: string;
  municipio?: string;
  role?: string;
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}
