export interface CuidadorRequest {
  documentoIdentidad: string;
  telefonoEmergencia: string;
  biografia?: string;
  experiencia?: string;
  horarioAtencion?: string;
  tarifaPorHora?: number;
}

export interface CuidadorResponse {
  cuidadorID: number;
  usuarioID: number;
  documentoIdentidad: string;
  telefonoEmergencia: string;
  biografia?: string;
  experiencia?: string;
  horarioAtencion?: string;
  tarifaPorHora?: number;
  calificacionPromedio: number;
  documentoVerificado: boolean;
  fechaVerificacion?: string;
  fechaCreacion: string;
  nombreUsuario: string;
  emailUsuario: string;
}

export interface RegisterRequestWithRole {
  email: string;
  password: string;
  name: string;
  role: 'Cliente' | 'Cuidador';
}

export interface LoginRequestWithRole {
  email: string;
  password: string;
  role: 'Cliente' | 'Cuidador';
} 