import React, { useState, useEffect } from 'react';
import { CuidadorResponse } from '../../types/cuidador';
import { cuidadorService } from '../../services/api';

interface CuidadorDashboardProps {
  onLogout: () => void;
}

const CuidadorDashboard: React.FC<CuidadorDashboardProps> = ({ onLogout }) => {
  const [cuidador, setCuidador] = useState<CuidadorResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCuidadorProfile();
  }, []);

  const loadCuidadorProfile = async () => {
    try {
      setLoading(true);
      const profile = await cuidadorService.getMiPerfil();
      setCuidador(profile);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

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

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'No especificada';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      </div>
    );
  }

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
    <div className="container mt-4">
      {/* Header con botón de logout */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">
          <i className="bi bi-heart text-primary"></i> Dashboard de Cuidador
        </h1>
        <button 
          onClick={onLogout}
          className="btn btn-outline-danger btn-sm"
        >
          <i className="bi bi-box-arrow-right"></i> Cerrar sesión
        </button>
      </div>

      <div className="row">
        {/* Columna izquierda (info perfil) */}
        <div className="col-md-4">
          <div className="card shadow-sm mb-4">
            <div className="card-body text-center">
              <img 
                src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
                className="rounded-circle mb-3" 
                width="150" 
                height="150"
                alt="Foto perfil"
                style={{ objectFit: 'cover' }}
              />
              <h4>{cuidador.nombreUsuario}</h4>
              <p className="text-muted">Cuidador profesional</p>

              {/* Calificación */}
              <div className="mb-3">
                {renderStarRating(cuidador.calificacionPromedio)}
                <small className="text-muted d-block mt-1">
                  {cuidador.calificacionPromedio > 0 ? 'Calificaciones recibidas' : 'Sin calificaciones aún'}
                </small>
              </div>

              {/* Estado de verificación */}
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

              <div className="d-grid gap-2">
                <button className="btn btn-outline-primary">
                  <i className="bi bi-pencil-square me-1"></i>
                  Editar perfil
                </button>
              </div>

              <hr />

              {/* Información de contacto */}
              <div className="text-start">
                <h6 className="fw-bold mb-3">Información de Contacto</h6>
                
                <div className="mb-2">
                  <small className="text-muted">Documento:</small>
                  <p className="mb-1 fw-semibold">{cuidador.documentoIdentidad}</p>
                </div>

                <div className="mb-2">
                  <small className="text-muted">Teléfono de emergencia:</small>
                  <p className="mb-1 fw-semibold">{cuidador.telefonoEmergencia}</p>
                </div>

                <div className="mb-2">
                  <small className="text-muted">Email:</small>
                  <p className="mb-1 fw-semibold">{cuidador.emailUsuario}</p>
                </div>

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

        {/* Columna derecha (servicios y detalles) */}
        <div className="col-md-8">
          <div className="row">
            {/* Tarjeta de servicios */}
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

            {/* Tarjeta de tarifas y horarios */}
            <div className="col-md-6 mb-4">
              <div className="card shadow-sm h-100">
                <div className="card-header bg-success text-white">
                  <h5 className="mb-0">
                    <i className="bi bi-currency-dollar me-2"></i>
                    Tarifas y Horarios
                  </h5>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <strong>Tarifa por hora:</strong>
                    <p className="text-primary fw-bold fs-5 mb-0">
                      {formatCurrency(cuidador.tarifaPorHora)}
                    </p>
                  </div>
                  
                  <div className="mb-3">
                    <strong>Horario de atención:</strong>
                    <p className="mb-0">
                      {cuidador.horarioAtencion || 'No especificado'}
                    </p>
                  </div>

                  <div className="mb-3">
                    <strong>Estado:</strong>
                    <p className="mb-0">
                      <span className="badge bg-success">Disponible</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Biografía */}
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
                      <button className="btn btn-link p-0 ms-1">Agregar biografía</button>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Experiencia */}
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
                      <button className="btn btn-link p-0 ms-1">Agregar experiencia</button>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Estadísticas rápidas */}
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
                    <div className="col-md-3">
                      <div className="border-end">
                        <h3 className="text-primary mb-1">0</h3>
                        <small className="text-muted">Servicios completados</small>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="border-end">
                        <h3 className="text-success mb-1">0</h3>
                        <small className="text-muted">Clientes satisfechos</small>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="border-end">
                        <h3 className="text-info mb-1">0</h3>
                        <small className="text-muted">Horas trabajadas</small>
                      </div>
                    </div>
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
  );
};

export default CuidadorDashboard; 