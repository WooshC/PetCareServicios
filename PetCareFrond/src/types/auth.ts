export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  message: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  createdAt: string;
} 