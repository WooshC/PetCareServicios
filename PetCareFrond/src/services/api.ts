import axios from 'axios';
import { LoginRequest, RegisterRequest, AuthResponse } from '../types/auth';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  // Login user
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  // Register user
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', userData);
    return response.data;
  },

  // Check API health
  async healthCheck(): Promise<string> {
    const response = await api.get<string>('/auth/health');
    return response.data;
  },

  // Store token in localStorage
  setToken(token: string): void {
    localStorage.setItem('token', token);
  },

  // Get token from localStorage
  getToken(): string | null {
    return localStorage.getItem('token');
  },

  // Remove token from localStorage
  removeToken(): void {
    localStorage.removeItem('token');
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken();
  }
};

export default api; 