import React from 'react';
import { CuidadorResponse } from '../../types/cuidador';
import './CuidadorDashboard.css';

interface CuidadorDashboardProps {
  onLogout: () => void;
  onEditProfile: () => void;
  cuidador: CuidadorResponse | null;
}

/**
 * Dashboard principal para cuidadores
 * Muestra información completa del perfil, estadísticas y opciones de gestión
 */
const CuidadorDashboard: React.FC<CuidadorDashboardProps> = ({ 
  onLogout, 
  onEditProfile, 
  cuidador 
}) => {
  // ===== FUNCIONES DE UTILIDAD =====

  /**
   * Renderiza las estrellas de calificación
   * @param rating - Calificación promedio (0-5)
   * @returns JSX con estrellas llenas y vacías
   */
  const renderStarRating = (rating: number) => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <i 
            key={star}
            className={`bi ${star <= rating ? 'bi-star-fill' : 'bi-star'} text-warning`}
          ></i>
        ))}
        <span className="ms-2">({rating.toFixed(1)}/5.0)</span>
      </div>
    );
  };

  /**
   * Formatea valores monetarios en pesos colombianos
   * @param amount - Cantidad a formatear
   * @returns String formateado o "No especificada" si no hay valor
   */
  const formatCurrency = (amount?: number) => {
    if (!amount) return 'No especificada';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // ===== RENDERIZADO PRINCIPAL =====

  if (!cuidador) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          No se encontró el perfil de cuidador
        </div>
      </div>
    );
  }

  return (
    <div className="cuidador-dashboard"> 
      <div className="container mt-4">
        <div className="row">
          {/* ===== COLUMNA IZQUIERDA - INFORMACIÓN DEL PERFIL ===== */}
          <div className="col-md-4">
            <div className="card shadow-sm mb-4">
              <div className="card-body text-center">
                {/* Foto de perfil */}
                <img 
                  src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
                  className="rounded-circle mb-3" 
                  width="150" 
                  height="150"
                  alt="Foto perfil"
                  style={{ objectFit: 'cover' }}
                />
                
                {/* Nombre del usuario */}
                <h4>{cuidador.nombreUsuario}</h4>
                <p className="text-muted">Cuidador profesional</p>

                {/* ===== CALIFICACIÓN PROMEDIO ===== */}
                <div className="mb-3">
                  {renderStarRating(cuidador.calificacionPromedio)}
                  <small className="text-muted d-block mt-1">
                    {cuidador.calificacionPromedio > 0 ? 'Calificaciones recibidas' : 'Sin calificaciones aún'}
                  </small>
                </div>

                {/* ===== ESTADO DE VERIFICACIÓN ===== */}
                <div className="mb-3">
                  {cuidador.documentoVerificado ? (
                    <span className="badge bg-success">
                      <i className="bi bi-check-circle-fill me-1"></i>
                      Documento verificado
                    </span>
                  ) : (
                    <span className="badge bg-warning text-dark">
                      <i className="bi bi-clock-fill me-1"></i>
                      Pendiente de verificación
                    </span>
                  )}
                </div>

                {/* ===== BOTÓN DE EDICIÓN ===== */}
                <div className="d-grid gap-2">
                  <button 
                    className="btn btn-outline-primary"
                    onClick={onEditProfile}
                  >
                    <i className="bi bi-pencil-square me-1"></i>
                    Editar perfil
                  </button>
                </div>

                <hr />

                {/* ===== INFORMACIÓN DE CONTACTO ===== */}
                <div className="text-start">
                  <h6 className="fw-bold mb-3">Información de Contacto</h6>
                  
                  {/* Documento de identidad */}
                  <div className="mb-2">
                    <small className="text-muted">Documento:</small>
                    <p className="mb-1 fw-semibold">{cuidador.documentoIdentidad}</p>
                  </div>

                  {/* Teléfono de emergencia */}
                  <div className="mb-2">
                    <small className="text-muted">Teléfono de emergencia:</small>
                    <p className="mb-1 fw-semibold">{cuidador.telefonoEmergencia}</p>
                  </div>

                  {/* Email */}
                  <div className="mb-2">
                    <small className="text-muted">Email:</small>
                    <p className="mb-1 fw-semibold">{cuidador.emailUsuario}</p>
                  </div>

                  {/* Fecha de creación */}
                  <div className="mb-2">
                    <small className="text-muted">Miembro desde:</small>
                    <p className="mb-1 fw-semibold">
                      {new Date(cuidador.fechaCreacion).toLocaleDateString('es-CO')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ===== COLUMNA DERECHA - SERVICIOS Y DETALLES ===== */}
          <div className="col-md-8">
            <div className="row">
              {/* ===== TARJETA DE SERVICIOS OFRECIDOS ===== */}
              <div className="col-md-6 mb-4">
                <div className="card shadow-sm h-100">
                  <div className="card-header bg-primary text-white">
                    <h5 className="mb-0">
                      <i className="bi bi-gear-fill me-2"></i>
                      Servicios Ofrecidos
                    </h5>
                  </div>
                  <div className="card-body">
                    <ul className="list-unstyled">
                      <li className="mb-2">
                        <i className="bi bi-walking text-success me-2"></i>
                        Paseos
                      </li>
                      <li className="mb-2">
                        <i className="bi bi-house-heart text-info me-2"></i>
                        Guardería
                      </li>
                      <li className="mb-2">
                        <i className="bi bi-house-door text-warning me-2"></i>
                        Visitas a domicilio
                      </li>
                      <li className="mb-2">
                        <i className="bi bi-heart-pulse text-danger me-2"></i>
                        Cuidado especial
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* ===== TARJETA DE TARIFAS Y HORARIOS ===== */}
              <div className="col-md-6 mb-4">
                <div className="card shadow-sm h-100">
                  <div className="card-header bg-success text-white">
                    <h5 className="mb-0">
                      <i className="bi bi-currency-dollar me-2"></i>
                      Tarifas y Horarios
                    </h5>
                  </div>
                  <div className="card-body">
                    {/* Tarifa por hora */}
                    <div className="mb-3">
                      <strong>Tarifa por hora:</strong>
                      <p className="text-primary fw-bold fs-5 mb-0">
                        {formatCurrency(cuidador.tarifaPorHora)}
                      </p>
                    </div>
                    
                    {/* Horario de atención */}
                    <div className="mb-3">
                      <strong>Horario de atención:</strong>
                      <p className="mb-0">
                        {cuidador.horarioAtencion || 'No especificado'}
                      </p>
                    </div>

                    {/* Estado de disponibilidad */}
                    <div className="mb-3">
                      <strong>Estado:</strong>
                      <p className="mb-0">
                        <span className="badge bg-success">Disponible</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ===== TARJETA DE BIOGRAFÍA ===== */}
              <div className="col-12 mb-4">
                <div className="card shadow-sm">
                  <div className="card-header bg-info text-white">
                    <h5 className="mb-0">
                      <i className="bi bi-person-lines-fill me-2"></i>
                      Biografía
                    </h5>
                  </div>
                  <div className="card-body">
                    {cuidador.biografia ? (
                      <p className="mb-0">{cuidador.biografia}</p>
                    ) : (
                      <p className="text-muted mb-0">
                        <i className="bi bi-info-circle me-1"></i>
                        No has agregado una biografía aún. 
                        <button 
                          className="btn btn-link p-0 ms-1"
                          onClick={onEditProfile}
                        >
                          Agregar biografía
                        </button>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* ===== TARJETA DE EXPERIENCIA ===== */}
              <div className="col-12 mb-4">
                <div className="card shadow-sm">
                  <div className="card-header bg-warning text-dark">
                    <h5 className="mb-0">
                      <i className="bi bi-award-fill me-2"></i>
                      Experiencia
                    </h5>
                  </div>
                  <div className="card-body">
                    {cuidador.experiencia ? (
                      <p className="mb-0">{cuidador.experiencia}</p>
                    ) : (
                      <p className="text-muted mb-0">
                        <i className="bi bi-info-circle me-1"></i>
                        No has agregado información sobre tu experiencia. 
                        <button 
                          className="btn btn-link p-0 ms-1"
                          onClick={onEditProfile}
                        >
                          Agregar experiencia
                        </button>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* ===== TARJETA DE ESTADÍSTICAS ===== */}
              <div className="col-12">
                <div className="card shadow-sm">
                  <div className="card-header bg-secondary text-white">
                    <h5 className="mb-0">
                      <i className="bi bi-graph-up me-2"></i>
                      Estadísticas
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="row text-center">
                      {/* Servicios completados */}
                      <div className="col-md-3">
                        <div className="border-end">
                          <h3 className="text-primary mb-1">0</h3>
                          <small className="text-muted">Servicios completados</small>
                        </div>
                      </div>
                      
                      {/* Clientes satisfechos */}
                      <div className="col-md-3">
                        <div className="border-end">
                          <h3 className="text-success mb-1">0</h3>
                          <small className="text-muted">Clientes satisfechos</small>
                        </div>
                      </div>
                      
                      {/* Horas trabajadas */}
                      <div className="col-md-3">
                        <div className="border-end">
                          <h3 className="text-info mb-1">0</h3>
                          <small className="text-muted">Horas trabajadas</small>
                        </div>
                      </div>
                      
                      {/* Reseñas recibidas */}
                      <div className="col-md-3">
                        <div>
                          <h3 className="text-warning mb-1">0</h3>
                          <small className="text-muted">Reseñas recibidas</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CuidadorDashboard; 