import React, { useState, useEffect } from 'react';
import { solicitudService, cuidadorService, authService } from '../../services/api';
import { CuidadorResponse } from '../../types/cuidador';
import ChatComponent from '../ChatComponent';

interface Solicitud {
  solicitudID: number;
  tipoServicio: string;
  descripcion: string;
  fechaHoraInicio: string;
  duracionHoras: number;
  ubicacion: string;
  estado: string;
  fechaCreacion: string;
  nombreCliente: string;
  emailCliente: string;
  telefonoCliente: string;
}

interface SolicitudesSectionProps {
  onSolicitudesCountChange: (count: number) => void;
}

const SolicitudesSection: React.FC<SolicitudesSectionProps> = ({ onSolicitudesCountChange }) => {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [cuidador, setCuidador] = useState<CuidadorResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [selectedSolicitudId, setSelectedSolicitudId] = useState<number | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const loadSolicitudes = async () => {
    try {
      setLoading(true);
      const data = await solicitudService.getMisSolicitudesPendientes();
      setSolicitudes(data);
      onSolicitudesCountChange(data.length);
    } catch (error) {
      console.error('Error loading solicitudes:', error);
      setError('Error al cargar las solicitudes');
    } finally {
      setLoading(false);
    }
  };

  const loadCuidadorProfile = async () => {
    try {
      const profile = await cuidadorService.getMiPerfil();
      setCuidador(profile);
    } catch (error) {
      console.error('Error loading cuidador profile:', error);
    }
  };

  const loadCurrentUser = async () => {
    try {
      const userInfo = await authService.getMiRol();
      setCurrentUserId(userInfo.userId);
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  const handleOpenChat = (solicitudId: number) => {
    setSelectedSolicitudId(solicitudId);
    setShowChat(true);
  };

  const handleCloseChat = () => {
    setShowChat(false);
    setSelectedSolicitudId(null);
  };

  useEffect(() => {
    loadSolicitudes();
    loadCuidadorProfile();
    loadCurrentUser();
  }, []);

  const handleAceptarSolicitud = async (solicitudId: number) => {
    try {
      await solicitudService.aceptarSolicitud(solicitudId);
      await loadSolicitudes(); // Recargar la lista
    } catch (error) {
      console.error('Error accepting solicitud:', error);
      setError('Error al aceptar la solicitud');
    }
  };

  const handleRechazarSolicitud = async (solicitudId: number) => {
    try {
      await solicitudService.rechazarSolicitud(solicitudId);
      await loadSolicitudes(); // Recargar la lista
    } catch (error) {
      console.error('Error rejecting solicitud:', error);
      setError('Error al rechazar la solicitud');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'Pendiente':
        return <span className="badge bg-warning text-dark">Pendiente</span>;
      case 'Aceptada':
        return <span className="badge bg-success">Aceptada</span>;
      case 'En Progreso':
        return <span className="badge bg-info">En Progreso</span>;
      case 'Finalizada':
        return <span className="badge bg-secondary">Finalizada</span>;
      case 'Rechazada':
        return <span className="badge bg-danger">Rechazada</span>;
      default:
        return <span className="badge bg-secondary">{estado}</span>;
    }
  };

  const getCardHeaderClass = (estado: string) => {
    switch (estado) {
      case 'Pendiente':
        return 'bg-warning text-dark';
      case 'Aceptada':
        return 'bg-success text-white';
      case 'En Progreso':
        return 'bg-info text-white';
      case 'Fuera de Tiempo':
        return 'bg-secondary text-white';
      default:
        return 'bg-secondary text-white';
    }
  };

  const getCardBorderClass = (estado: string) => {
    switch (estado) {
      case 'Pendiente':
        return 'border-warning border-3';
      case 'Aceptada':
        return 'border-success border-3';
      case 'En Progreso':
        return 'border-info border-3';
      case 'Fuera de Tiempo':
        return 'border-secondary border-3';
      default:
        return 'border-secondary border-2';
    }
  };

  const toggleExpanded = (solicitudId: number) => {
    setExpandedCard(expandedCard === solicitudId ? null : solicitudId);
  };

  const renderStarRating = (rating: number) => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <i
            key={star}
            className={`bi ${star <= rating ? 'bi-star-fill text-warning' : 'bi-star text-muted'}`}
          ></i>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        {error}
      </div>
    );
  }

  return (
    <div className="solicitudes-section">
      <div className="row">
        {/* Columna izquierda - Perfil del cuidador */}
        <div className="col-md-3">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body text-center">
              <div className="profile-img mb-3">
                <i className="bi bi-person-circle display-1 text-primary"></i>
              </div>
              <h5 className="card-title">{cuidador?.nombreUsuario || 'Cuidador'}</h5>
              <p className="text-muted small">{cuidador?.emailUsuario}</p>
              
              {cuidador?.calificacionPromedio && cuidador.calificacionPromedio > 0 && (
                <div className="mb-3">
                  {renderStarRating(cuidador.calificacionPromedio)}
                  <small className="text-muted d-block mt-1">
                    {cuidador.calificacionPromedio.toFixed(1)} / 5.0
                  </small>
                </div>
              )}

              {cuidador?.tarifaPorHora && (
                <div className="mb-3">
                  <strong className="text-success">
                    ${cuidador.tarifaPorHora}/hora
                  </strong>
                </div>
              )}

              <div className="verification-badge">
                {cuidador?.documentoVerificado ? (
                  <span className="badge bg-success">
                    <i className="bi bi-check-circle me-1"></i>
                    Verificado
                  </span>
                ) : (
                  <span className="badge bg-warning text-dark">
                    <i className="bi bi-clock me-1"></i>
                    Pendiente
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="row g-3">
            <div className="col-6">
              <div className="card stats-card border-0 shadow-sm text-center">
                <div className="card-body p-3">
                  <h3 className="text-warning mb-0">{solicitudes.length}</h3>
                  <small className="text-muted">Pendientes</small>
                </div>
              </div>
            </div>
            <div className="col-6">
              <div className="card stats-card border-0 shadow-sm text-center">
                <div className="card-body p-3">
                  <h3 className="text-success mb-0">0</h3>
                  <small className="text-muted">Activas</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Columna derecha - Lista de solicitudes */}
        <div className="col-md-9">
          <h3 className="mb-4">
            <i className="bi bi-clock-history text-warning"></i>
            Solicitudes Pendientes ({solicitudes.length})
          </h3>

          {solicitudes.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-inbox display-1 text-muted"></i>
              <h4 className="mt-3 text-muted">No hay solicitudes pendientes</h4>
              <p className="text-muted">Cuando recibas nuevas solicitudes, aparecerán aquí.</p>
            </div>
          ) : (
            <div className="row g-4">
              {solicitudes.map((solicitud) => (
                <div key={solicitud.solicitudID} className="col-12">
                  <div className={`card h-100 shadow-sm ${getCardBorderClass(solicitud.estado)}`}>
                    {/* Header de la tarjeta */}
                    <div className={`card-header ${getCardHeaderClass(solicitud.estado)}`}>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-0">
                            <i className="bi bi-person-circle me-2"></i>
                            {solicitud.nombreCliente}
                          </h6>
                          <small>
                            <i className="bi bi-calendar-event me-1"></i>
                            {formatDate(solicitud.fechaHoraInicio)}
                          </small>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <span className="badge bg-light text-dark">
                            {solicitud.tipoServicio}
                          </span>
                          {getEstadoBadge(solicitud.estado)}
                        </div>
                      </div>
                    </div>

                    <div className="card-body p-0">
                      <div className="row g-0">
                        {/* Información principal - lado izquierdo */}
                        <div className="col-md-8">
                          <div className="p-4">
                            <div className="row mb-3">
                              <div className="col-sm-6">
                                <div className="d-flex align-items-center mb-2">
                                  <i className="bi bi-geo-alt text-danger me-2"></i>
                                  <span className="fw-medium">Ubicación:</span>
                                </div>
                                <p className="text-muted mb-0 small">{solicitud.ubicacion}</p>
                              </div>
                              <div className="col-sm-6">
                                <div className="d-flex align-items-center mb-2">
                                  <i className="bi bi-clock text-info me-2"></i>
                                  <span className="fw-medium">Duración:</span>
                                </div>
                                <p className="text-muted mb-0 small">{solicitud.duracionHoras} horas</p>
                              </div>
                            </div>

                            <div className="mb-3">
                              <div className="d-flex align-items-center mb-2">
                                <i className="bi bi-tag text-success me-2"></i>
                                <span className="fw-medium">Servicio:</span>
                              </div>
                              <p className="text-muted mb-0 small">{solicitud.tipoServicio}</p>
                            </div>

                            <div>
                              <div className="d-flex align-items-center mb-2">
                                <i className="bi bi-chat-text text-warning me-2"></i>
                                <span className="fw-medium">Descripción:</span>
                              </div>
                              <p className="text-muted mb-0 small">{solicitud.descripcion}</p>
                            </div>
                          </div>
                        </div>

                        {/* Botones y información adicional - lado derecho */}
                        <div className="col-md-4">
                          <div className="p-4 h-100 d-flex flex-column justify-content-between">
                            <div>
                              <button
                                className="btn btn-outline-primary btn-sm w-100 mb-2"
                                onClick={() => toggleExpanded(solicitud.solicitudID)}
                              >
                                <i className="bi bi-eye me-1"></i>
                                {expandedCard === solicitud.solicitudID ? 'Ocultar' : 'Ver más'}
                              </button>

                              {expandedCard === solicitud.solicitudID && (
                                <div className="border-top pt-3 mb-3">
                                  <div className="mb-2">
                                    <small className="text-muted d-block">
                                      <i className="bi bi-envelope me-1"></i>
                                      {solicitud.emailCliente}
                                    </small>
                                  </div>
                                  <div className="mb-3">
                                    <small className="text-muted d-block">
                                      <i className="bi bi-telephone me-1"></i>
                                      {solicitud.telefonoCliente}
                                    </small>
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="d-grid gap-2">
                              <button
                                className="btn btn-outline-info btn-sm"
                                onClick={() => handleOpenChat(solicitud.solicitudID)}
                              >
                                <i className="bi bi-chat-dots me-1"></i>
                                Chat
                              </button>
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => handleAceptarSolicitud(solicitud.solicitudID)}
                              >
                                <i className="bi bi-check-circle me-1"></i>
                                Aceptar
                              </button>
                              <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => handleRechazarSolicitud(solicitud.solicitudID)}
                              >
                                <i className="bi bi-x-circle me-1"></i>
                                Rechazar
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Componente de Chat */}
      {showChat && selectedSolicitudId && currentUserId && (
        <ChatComponent
          solicitudId={selectedSolicitudId}
          currentUserId={currentUserId}
          onClose={handleCloseChat}
        />
      )}
    </div>
  );
};

export default SolicitudesSection; 