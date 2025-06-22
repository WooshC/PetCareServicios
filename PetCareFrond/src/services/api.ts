import axios from 'axios';
import { LoginRequest, RegisterRequest, AuthResponse } from '../types/auth';
import { CuidadorRequest, CuidadorResponse, RegisterRequestWithRole, LoginRequestWithRole } from '../types/cuidador';

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
  // Login user with role
  async loginWithRole(credentials: LoginRequestWithRole): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  // Register user with role
  async registerWithRole(userData: RegisterRequestWithRole): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', userData);
    return response.data;
  },

  // Login user (legacy method)
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  // Register user (legacy method)
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

export const cuidadorService = {
  // Get all cuidadores
  async getAllCuidadores(): Promise<CuidadorResponse[]> {
    const response = await api.get<CuidadorResponse[]>('/cuidador');
    return response.data;
  },

  // Get cuidador by ID
  async getCuidadorById(id: number): Promise<CuidadorResponse> {
    const response = await api.get<CuidadorResponse>(`/cuidador/${id}`);
    return response.data;
  },

  // Get my cuidador profile
  async getMiPerfil(): Promise<CuidadorResponse> {
    const response = await api.get<CuidadorResponse>('/cuidador/mi-perfil');
    return response.data;
  },

  // Create cuidador profile
  async createCuidador(request: CuidadorRequest): Promise<CuidadorResponse> {
    const response = await api.post<CuidadorResponse>('/cuidador', request);
    return response.data;
  },

  // Update cuidador profile
  async updateCuidador(id: number, request: CuidadorRequest): Promise<CuidadorResponse> {
    const response = await api.put<CuidadorResponse>(`/cuidador/${id}`, request);
    return response.data;
  },

  // Update my cuidador profile
  async updateMiPerfil(request: CuidadorRequest): Promise<CuidadorResponse> {
    const response = await api.put<CuidadorResponse>('/cuidador/mi-perfil', request);
    return response.data;
  },

  // Delete cuidador (admin only)
  async deleteCuidador(id: number): Promise<void> {
    await api.delete(`/cuidador/${id}`);
  },

  // Verify document (admin only)
  async verificarDocumento(id: number): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(`/cuidador/${id}/verificar`);
    return response.data;
  }
};

export default api; 