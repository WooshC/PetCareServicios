import axios from 'axios';
import { LoginRequest, RegisterRequest, AuthResponse } from '../types/auth';
import { CuidadorRequest, CuidadorResponse, RegisterRequestWithRole, LoginRequestWithRole } from '../types/cuidador';

// URL base de la API - Configurar según el entorno
const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Instancia de axios configurada para la API de PetCare
 * Incluye configuración base y interceptores para manejo de tokens
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interceptor de solicitudes HTTP
 * Agrega automáticamente el token JWT a todas las peticiones autenticadas
 * FLUJO:
 * 1. Se ejecuta antes de cada petición HTTP
 * 2. Verifica si existe un token en localStorage
 * 3. Si existe, lo agrega al header Authorization
 * 4. Permite que la petición continúe
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Servicio de autenticación
 * Maneja login, registro y gestión de tokens JWT
 */
export const authService = {
  /**
   * Inicia sesión con rol específico
   * FLUJO:
   * 1. Envía credenciales y rol a la API
   * 2. API valida credenciales y verifica rol
   * 3. Retorna token JWT si es exitoso
   * 4. Lanza error si las credenciales son inválidas o el rol no coincide
   * 
   * @param credentials - Credenciales de login con rol
   * @returns Promise con respuesta de autenticación
   */
  async loginWithRole(credentials: LoginRequestWithRole): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    if (response.data.success) {
      this.setToken(response.data.token);
    }
    return response.data;
  },

  /**
   * Registra un nuevo usuario con rol específico
   * FLUJO:
   * 1. Envía datos del usuario y rol a la API
   * 2. API crea el usuario y asigna el rol
   * 3. Retorna token JWT si es exitoso
   * 4. Lanza error si el email ya existe o hay problemas de validación
   * 
   * @param userData - Datos del usuario con rol
   * @returns Promise con respuesta de autenticación
   */
  async registerWithRole(userData: RegisterRequestWithRole): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', userData);
    if (response.data.success) {
      this.setToken(response.data.token);
    }
    return response.data;
  },

  /**
   * Inicia sesión (método legacy sin rol)
   * @deprecated Usar loginWithRole en su lugar
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    if (response.data.success) {
      this.setToken(response.data.token);
    }
    return response.data;
  },

  /**
   * Registra un nuevo usuario (método legacy sin rol)
   * @deprecated Usar registerWithRole en su lugar
   */
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', userData);
    if (response.data.success) {
      this.setToken(response.data.token);
    }
    return response.data;
  },

  /**
   * Verifica el estado de salud de la API
   * Útil para testing y monitoreo
   * 
   * @returns Promise con mensaje de estado
   */
  async healthCheck(): Promise<string> {
    const response = await api.get<string>('/auth/health');
    return response.data;
  },

  /**
   * Obtiene el rol del usuario autenticado
   * FLUJO:
   * 1. Usa el token JWT para identificar al usuario
   * 2. Retorna información del usuario y sus roles
   * 3. Útil para verificar permisos y redirigir correctamente
   * 
   * @returns Promise con información del usuario y sus roles
   */
  async getMiRol(): Promise<{ userId: number; email: string; name: string; roles: string[] }> {
    const response = await api.get<{ userId: number; email: string; name: string; roles: string[] }>('/auth/mi-rol');
    return response.data;
  },

  // ===== GESTIÓN DE TOKENS =====

  /**
   * Almacena el token JWT en localStorage
   * El token se usa automáticamente en todas las peticiones posteriores
   * 
   * @param token - Token JWT recibido del servidor
   */
  setToken(token: string): void {
    localStorage.setItem('token', token);
  },

  /**
   * Obtiene el token JWT del localStorage
   * 
   * @returns Token JWT o null si no existe
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  },

  /**
   * Elimina el token JWT del localStorage
   * Útil para logout y limpieza de sesión
   */
  removeToken(): void {
    localStorage.removeItem('token');
  },

  /**
   * Verifica si el usuario está autenticado
   * 
   * @returns true si existe un token, false en caso contrario
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  /**
   * Cambia la contraseña directamente (SOLO PARA TESTING)
   * FLUJO:
   * 1. Envía email y nueva contraseña a la API
   * 2. API busca el usuario por email
   * 3. Genera token temporal y cambia la contraseña
   * 4. Retorna confirmación
   * 
   * ⚠️ ADVERTENCIA: Este método es solo para testing.
   * En producción, usar el flujo normal con tokens de recuperación.
   * 
   * @param request - Email y nueva contraseña
   * @returns Promise con respuesta de cambio de contraseña
   */
  async changePasswordDirect(request: { email: string; newPassword: string; confirmPassword: string }): Promise<{ success: boolean; message: string }> {
    const response = await api.post<{ success: boolean; message: string }>('/auth/change-password-direct', request);
    return response.data;
  }
};

/**
 * Servicio de gestión de cuidadores
 * Maneja CRUD de perfiles de cuidadores y operaciones específicas
 */
export const cuidadorService = {
  /**
   * Obtiene todos los cuidadores registrados
   * Requiere autenticación
   * 
   * @returns Promise con lista de cuidadores
   */
  async getAllCuidadores(): Promise<CuidadorResponse[]> {
    const response = await api.get<CuidadorResponse[]>('/cuidador');
    return response.data;
  },

  /**
   * Obtiene un cuidador específico por ID
   * Requiere autenticación
   * 
   * @param id - ID del cuidador
   * @returns Promise con datos del cuidador
   */
  async getCuidadorById(id: number): Promise<CuidadorResponse> {
    const response = await api.get<CuidadorResponse>(`/cuidador/${id}`);
    return response.data;
  },

  /**
   * Obtiene el perfil del cuidador autenticado
   * FLUJO:
   * 1. Usa el token JWT para identificar al usuario
   * 2. Busca el perfil de cuidador asociado
   * 3. Retorna los datos del perfil
   * 4. Lanza error si no existe perfil o no está autenticado
   * 
   * @returns Promise con perfil del cuidador
   */
  async getMiPerfil(): Promise<CuidadorResponse> {
    const response = await api.get<CuidadorResponse>('/cuidador/mi-perfil');
    return response.data;
  },

  /**
   * Crea un nuevo perfil de cuidador
   * FLUJO:
   * 1. Usa el token JWT para identificar al usuario
   * 2. Valida que no exista ya un perfil para ese usuario
   * 3. Crea el perfil con los datos proporcionados
   * 4. Retorna el perfil creado
   * 5. Lanza error si ya existe perfil o datos inválidos
   * 
   * @param request - Datos del perfil de cuidador
   * @returns Promise con perfil creado
   */
  async createCuidador(request: CuidadorRequest): Promise<CuidadorResponse> {
    const response = await api.post<CuidadorResponse>('/cuidador', request);
    return response.data;
  },

  /**
   * Actualiza un perfil de cuidador específico
   * Requiere permisos de administrador
   * 
   * @param id - ID del cuidador
   * @param request - Datos actualizados
   * @returns Promise con perfil actualizado
   */
  async updateCuidador(id: number, request: CuidadorRequest): Promise<CuidadorResponse> {
    const response = await api.put<CuidadorResponse>(`/cuidador/${id}`, request);
    return response.data;
  },

  /**
   * Actualiza el perfil del cuidador autenticado
   * FLUJO:
   * 1. Usa el token JWT para identificar al usuario
   * 2. Busca el perfil asociado
   * 3. Actualiza con los nuevos datos
   * 4. Retorna el perfil actualizado
   * 
   * @param request - Datos actualizados del perfil
   * @returns Promise con perfil actualizado
   */
  async updateMiPerfil(request: CuidadorRequest): Promise<CuidadorResponse> {
    const response = await api.put<CuidadorResponse>('/cuidador/mi-perfil', request);
    return response.data;
  },

  /**
   * Elimina un perfil de cuidador
   * Requiere permisos de administrador
   * 
   * @param id - ID del cuidador a eliminar
   * @returns Promise que se resuelve cuando se completa la eliminación
   */
  async deleteCuidador(id: number): Promise<void> {
    await api.delete(`/cuidador/${id}`);
  },

  /**
   * Marca el documento de un cuidador como verificado
   * Requiere permisos de administrador
   * 
   * @param id - ID del cuidador
   * @returns Promise con mensaje de confirmación
   */
  async verificarDocumento(id: number): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(`/cuidador/${id}/verificar`);
    return response.data;
  }
};

/**
 * Servicio de gestión de clientes
 * Maneja CRUD de perfiles de clientes y operaciones específicas
 */
export const clienteService = {
  /**
   * Obtiene todos los clientes registrados
   * Requiere permisos de administrador
   * 
   * @returns Promise con lista de clientes
   */
  async getAllClientes(): Promise<any[]> {
    const response = await api.get<any[]>('/cliente');
    return response.data;
  },

  /**
   * Obtiene un cliente específico por ID
   * Requiere permisos de administrador
   * 
   * @param id - ID del cliente
   * @returns Promise con datos del cliente
   */
  async getClienteById(id: number): Promise<any> {
    const response = await api.get<any>(`/cliente/${id}`);
    return response.data;
  },

  /**
   * Crea un nuevo perfil de cliente
   * FLUJO:
   * 1. Usa el token JWT para identificar al usuario
   * 2. Valida que no exista ya un perfil para ese usuario
   * 3. Crea el perfil con los datos proporcionados
   * 4. Retorna el perfil creado
   * 5. Lanza error si ya existe perfil o datos inválidos
   * 
   * @param request - Datos del perfil de cliente
   * @returns Promise con perfil creado
   */
  async createCliente(request: { documentoIdentidad: string; telefonoEmergencia: string }): Promise<any> {
    const response = await api.post<any>('/cliente', request);
    return response.data;
  },

  /**
   * Actualiza un perfil de cliente específico
   * Requiere permisos de administrador
   * 
   * @param id - ID del cliente
   * @param request - Datos actualizados
   * @returns Promise con perfil actualizado
   */
  async updateCliente(id: number, request: { documentoIdentidad: string; telefonoEmergencia: string }): Promise<any> {
    const response = await api.put<any>(`/cliente/${id}`, request);
    return response.data;
  },

  /**
   * Actualiza el perfil del cliente autenticado
   * FLUJO:
   * 1. Usa el token JWT para identificar al usuario
   * 2. Busca el perfil asociado
   * 3. Actualiza con los nuevos datos
   * 4. Retorna el perfil actualizado
   * 
   * @param request - Datos actualizados del perfil
   * @returns Promise con perfil actualizado
   */
  async updateMiPerfil(request: { documentoIdentidad: string; telefonoEmergencia: string }): Promise<any> {
    const response = await api.put<any>('/cliente/mi-perfil', request);
    return response.data;
  },

  /**
   * Elimina un perfil de cliente
   * Requiere permisos de administrador
   * 
   * @param id - ID del cliente a eliminar
   * @returns Promise que se resuelve cuando se completa la eliminación
   */
  async deleteCliente(id: number): Promise<void> {
    await api.delete(`/cliente/${id}`);
  },

  /**
   * Marca el documento de un cliente como verificado
   * Requiere permisos de administrador
   * 
   * @param id - ID del cliente
   * @returns Promise con mensaje de confirmación
   */
  async verificarDocumento(id: number): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(`/cliente/${id}/verificar`);
    return response.data;
  },

  /**
   * Obtiene el perfil del cliente autenticado
   * FLUJO:
   * 1. Usa el token JWT para identificar al usuario
   * 2. Busca el perfil de cliente asociado
   * 3. Retorna los datos del perfil
   * 4. Lanza error si no existe perfil o no está autenticado
   * 
   * @returns Promise con perfil del cliente
   */
  async getMiPerfil(): Promise<any> {
    const response = await api.get<any>('/cliente/mi-perfil');
    return response.data;
  }
};

/**
 * Servicio de gestión de solicitudes
 * Maneja CRUD de solicitudes y operaciones específicas
 */
export const solicitudService = {
  /**
   * Obtiene todas las solicitudes
   * Requiere permisos de administrador
   * 
   * @returns Promise con lista de solicitudes
   */
  async getAllSolicitudes(): Promise<any[]> {
    const response = await api.get<any[]>('/solicitud');
    return response.data;
  },

  /**
   * Obtiene una solicitud específica por ID
   * 
   * @param id - ID de la solicitud
   * @returns Promise con datos de la solicitud
   */
  async getSolicitudById(id: number): Promise<any> {
    const response = await api.get<any>(`/solicitud/${id}`);
    return response.data;
  },

  /**
   * Obtiene las solicitudes del cliente autenticado
   * 
   * @returns Promise con lista de solicitudes del cliente
   */
  async getMisSolicitudes(): Promise<any[]> {
    const response = await api.get<any[]>('/solicitud/mis-solicitudes');
    return response.data;
  },

  /**
   * Crea una nueva solicitud de servicio
   * 
   * @param request - Datos de la solicitud
   * @returns Promise con solicitud creada
   */
  async createSolicitud(request: {
    tipoServicio: string;
    descripcion: string;
    fechaHoraInicio: string;
    duracionHoras: number;
    ubicacion: string;
  }): Promise<any> {
    const response = await api.post<any>('/solicitud', request);
    return response.data;
  },

  /**
   * Actualiza una solicitud del cliente autenticado
   * 
   * @param id - ID de la solicitud
   * @param request - Datos actualizados
   * @returns Promise con solicitud actualizada
   */
  async updateSolicitud(id: number, request: {
    tipoServicio: string;
    descripcion: string;
    fechaHoraInicio: string;
    duracionHoras: number;
    ubicacion: string;
  }): Promise<any> {
    const response = await api.put<any>(`/solicitud/${id}`, request);
    return response.data;
  },

  /**
   * Cancela una solicitud del cliente autenticado
   * 
   * @param id - ID de la solicitud
   * @returns Promise con solicitud cancelada
   */
  async cancelarSolicitud(id: number): Promise<any> {
    const response = await api.post<any>(`/solicitud/${id}/cancelar`);
    return response.data;
  },

  /**
   * Elimina una solicitud del cliente autenticado
   * 
   * @param id - ID de la solicitud
   * @returns Promise que se resuelve cuando se completa la eliminación
   */
  async deleteSolicitud(id: number): Promise<void> {
    await api.delete(`/solicitud/${id}`);
  },

  /**
   * Obtiene las solicitudes del cuidador autenticado
   * 
   * @returns Promise con lista de solicitudes del cuidador
   */
  async getMisServicios(): Promise<any[]> {
    const response = await api.get<any[]>('/solicitud/mis-servicios');
    return response.data;
  },

  /**
   * Obtiene las solicitudes pendientes disponibles
   * 
   * @returns Promise con lista de solicitudes pendientes
   */
  async getSolicitudesPendientes(): Promise<any[]> {
    const response = await api.get<any[]>('/solicitud/pendientes');
    return response.data;
  },

  /**
   * Obtiene las solicitudes pendientes asignadas al cuidador autenticado
   * FLUJO:
   * 1. Usa el token JWT para identificar al cuidador
   * 2. Retorna las solicitudes pendientes asignadas al cuidador
   * 3. Útil para mostrar solicitudes que esperan respuesta
   * 
   * @returns Promise con lista de solicitudes pendientes asignadas
   */
  async getMisSolicitudesPendientes(): Promise<any[]> {
    try {
      const response = await api.get('/solicitud/mis-pendientes');
      return response.data;
    } catch (error) {
      console.error('Error fetching pending solicitudes:', error);
      return [];
    }
  },

  /**
   * Acepta una solicitud pendiente
   * FLUJO:
   * 1. Usa el token JWT para identificar al cuidador
   * 2. Cambia el estado de la solicitud a "Aceptada"
   * 3. Asigna la solicitud al cuidador autenticado
   * 
   * @param id ID de la solicitud a aceptar
   * @returns Promise con la solicitud aceptada
   */
  async aceptarSolicitud(id: number): Promise<any> {
    const response = await api.post<any>(`/solicitud/${id}/aceptar`);
    return response.data;
  },

  /**
   * Rechaza una solicitud aceptada
   * 
   * @param id - ID de la solicitud
   * @returns Promise con solicitud rechazada
   */
  async rechazarSolicitud(id: number): Promise<any> {
    const response = await api.post<any>(`/solicitud/${id}/rechazar`);
    return response.data;
  },

  /**
   * Inicia un servicio aceptado
   * 
   * @param id - ID de la solicitud
   * @returns Promise con solicitud iniciada
   */
  async iniciarServicio(id: number): Promise<any> {
    const response = await api.post<any>(`/solicitud/${id}/iniciar`);
    return response.data;
  },

  /**
   * Finaliza un servicio en progreso
   * 
   * @param id - ID de la solicitud
   * @returns Promise con solicitud finalizada
   */
  async finalizarServicio(id: number): Promise<any> {
    const response = await api.post<any>(`/solicitud/${id}/finalizar`);
    return response.data;
  },

  // ===== NUEVOS MÉTODOS PARA ASIGNACIÓN DE CUIDADORES =====

  async getCuidadoresDisponibles(): Promise<CuidadorResponse[]> {
    const response = await api.get('/solicitud/cuidadores-disponibles');
    return response.data;
  },

  async asignarCuidador(solicitudId: number, cuidadorId: number): Promise<any> {
    const response = await api.post(`/solicitud/${solicitudId}/asignar-cuidador`, {
      cuidadorID: cuidadorId
    });
    return response.data;
  },

  async getMisSolicitudesActivas(): Promise<any[]> {
    try {
      const response = await api.get('/solicitud/mis-activas');
      return response.data;
    } catch (error) {
      console.error('Error fetching active solicitudes:', error);
      return [];
    }
  }
};

// Exportar la instancia de axios para uso directo si es necesario
export default api; 