import React, { useState, useEffect } from 'react';
import { solicitudService } from '../../services/api';

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
}

interface SolicitudesActivasSectionProps {
  onSolicitudesCountChange: (count: number) => void;
}

const SolicitudesActivasSection: React.FC<SolicitudesActivasSectionProps> = ({ onSolicitudesCountChange }) => {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSolicitudes = async () => {
    try {
      setLoading(true);
      const data = await solicitudService.getMisSolicitudesActivas();
      setSolicitudes(data);
      onSolicitudesCountChange(data.length);
    } catch (error) {
      console.error('Error loading active solicitudes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSolicitudes();
  }, []);

  const handleIniciarServicio = async (solicitudId: number) => {
    try {
      await solicitudService.iniciarServicio(solicitudId);
      await loadSolicitudes(); // Recargar la lista
    } catch (error) {
      console.error('Error starting service:', error);
    }
  };

  const handleFinalizarServicio = async (solicitudId: number) => {
    try {
      await solicitudService.finalizarServicio(solicitudId);
      await loadSolicitudes(); // Recargar la lista
    } catch (error) {
      console.error('Error finishing service:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'Aceptada':
        return <span className="badge bg-success">Aceptada</span>;
      case 'En Progreso':
        return <span className="badge bg-primary">En Progreso</span>;
      case 'Fuera de Tiempo':
        return <span className="badge bg-warning">Fuera de Tiempo</span>;
      default:
        return <span className="badge bg-secondary">{estado}</span>;
    }
  };

  if (loading) {
    return (
      <div className="text-center p-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="solicitudes-activas-section">
      <div className="container mt-4">
        <div className="row">
          {/* Columna izquierda - Información del perfil */}
          <div className="col-md-3">
            <div className="card shadow-sm mb-4">
              <div className="card-body text-center">
                <img 
                  src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
                  className="rounded-circle mb-3" 
                  width="120" 
                  height="120"
                  alt="Foto perfil"
                  style={{ objectFit: 'cover' }}
                />
                <h5 className="fw-bold">Mi Perfil</h5>
                <p className="text-muted small">Cuidador Profesional</p>
                
                <div className="d-grid gap-2">
                  <button className="btn btn-outline-primary btn-sm">
                    <i className="bi bi-pencil-square me-1"></i>
                    Editar perfil
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Columna central - Solicitudes */}
          <div className="col-md-9">
            {/* Solicitudes Activas */}
            <div className="col-12 mb-4">
              <div className="card shadow-sm">
                <div className="card-header bg-success text-white">
                  <h5 className="mb-0">
                    <i className="bi bi-check-circle-fill me-2"></i>
                    Solicitudes Activas ({solicitudes.length})
                  </h5>
                </div>
                <div className="card-body">
                  {solicitudes.length === 0 ? (
                    <div className="text-center py-4">
                      <i className="bi bi-calendar-check text-muted" style={{ fontSize: '3rem' }}></i>
                      <p className="text-muted mt-3">No hay servicios activos</p>
                      <small className="text-muted">
                        Los servicios en curso se mostrarán aquí
                      </small>
                    </div>
                  ) : (
                    <div className="row">
                      {solicitudes.map((solicitud) => (
                        <div key={solicitud.solicitudID} className="col-md-6 col-lg-4 mb-3">
                          <div className="card h-100 border-success">
                            <div className="card-header bg-success text-white">
                              <div className="d-flex justify-content-between align-items-center">
                                <h6 className="mb-0">
                                  <i className="bi bi-pet"></i> {solicitud.tipoServicio}
                                </h6>
                                {getEstadoBadge(solicitud.estado)}
                              </div>
                            </div>
                            <div className="card-body">
                              <p className="card-text">
                                <strong>Cliente:</strong> {solicitud.nombreCliente}
                              </p>
                              <p className="card-text">
                                <strong>Descripción:</strong> {solicitud.descripcion}
                              </p>
                              <p className="card-text">
                                <strong>Ubicación:</strong> {solicitud.ubicacion}
                              </p>
                              <p className="card-text">
                                <strong>Fecha:</strong> {formatDate(solicitud.fechaHoraInicio)}
                              </p>
                              <p className="card-text">
                                <strong>Duración:</strong> {solicitud.duracionHoras} horas
                              </p>
                            </div>
                            <div className="card-footer">
                              <div className="d-grid gap-2">
                                {solicitud.estado === 'Aceptada' && (
                                  <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => handleIniciarServicio(solicitud.solicitudID)}
                                  >
                                    <i className="bi bi-play-circle"></i> Iniciar Servicio
                                  </button>
                                )}
                                {solicitud.estado === 'En Progreso' && (
                                  <button
                                    className="btn btn-success btn-sm"
                                    onClick={() => handleFinalizarServicio(solicitud.solicitudID)}
                                  >
                                    <i className="bi bi-check-circle"></i> Finalizar Servicio
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolicitudesActivasSection; 