import React, { useState, useEffect } from 'react';
import { solicitudService } from '../../services/api';
import { authService } from '../../services/api';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSolicitudes = async () => {
    try {
      setLoading(true);
      const data = await solicitudService.getMisSolicitudesPendientes();
      setSolicitudes(data);
      onSolicitudesCountChange(data.length);
      setError(null);
    } catch (err: any) {
      setError('Error al cargar las solicitudes pendientes');
      console.error('Error loading solicitudes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSolicitudes();
  }, []);

  const handleAceptarSolicitud = async (solicitudId: number) => {
    try {
      await solicitudService.aceptarSolicitud(solicitudId);
      // Recargar las solicitudes después de aceptar
      await loadSolicitudes();
    } catch (err: any) {
      setError('Error al aceptar la solicitud');
      console.error('Error accepting solicitud:', err);
    }
  };

  const handleRechazarSolicitud = async (solicitudId: number) => {
    try {
      await solicitudService.rechazarSolicitud(solicitudId);
      // Como ahora se elimina de la base de datos, removemos de la lista local
      setSolicitudes(prev => prev.filter(s => s.solicitudID !== solicitudId));
      onSolicitudesCountChange(solicitudes.length - 1);
    } catch (error) {
      console.error('Error rejecting solicitud:', error);
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
      case 'Pendiente':
        return <span className="badge bg-warning">Pendiente</span>;
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

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-3">Cargando solicitudes pendientes...</p>
      </div>
    );
  }

  return (
    <div className="solicitudes-section">
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
            {error && (
              <div className="alert alert-danger alert-dismissible fade show" role="alert">
                <i className="bi bi-exclamation-triangle"></i> {error}
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setError(null)}
                ></button>
              </div>
            )}

            {/* Solicitudes Pendientes */}
            <div className="col-12 mb-4">
              <div className="card shadow-sm">
                <div className="card-header bg-warning text-dark">
                  <h5 className="mb-0">
                    <i className="bi bi-clock-fill me-2"></i>
                    Solicitudes Pendientes
                    {solicitudes.length > 0 && (
                      <span className="badge bg-danger ms-2">{solicitudes.length}</span>
                    )}
                  </h5>
                </div>
                <div className="card-body">
                  {solicitudes.length === 0 ? (
                    <div className="text-center py-4">
                      <i className="bi bi-inbox text-muted" style={{ fontSize: '3rem' }}></i>
                      <p className="text-muted mt-3">No hay solicitudes pendientes</p>
                      <small className="text-muted">
                        Las nuevas solicitudes aparecerán aquí automáticamente
                      </small>
                    </div>
                  ) : (
                    <div className="row">
                      {solicitudes.map((solicitud) => (
                        <div key={solicitud.solicitudID} className="col-md-6 col-lg-4 mb-4">
                          <div className="card h-100 border-warning">
                            <div className="card-header bg-warning text-dark">
                              <div className="d-flex justify-content-between align-items-center">
                                <h6 className="mb-0">
                                  <i className="bi bi-calendar-event"></i> {solicitud.tipoServicio}
                                </h6>
                                {getEstadoBadge(solicitud.estado)}
                              </div>
                            </div>
                            <div className="card-body">
                              <div className="row">
                                <div className="col-md-8">
                                  <h6 className="card-title fw-bold">
                                    <i className="bi bi-person-circle me-2"></i>
                                    {solicitud.nombreCliente}
                                  </h6>
                                  <p className="card-text text-muted mb-2">
                                    <i className="bi bi-envelope me-1"></i>
                                    {solicitud.emailCliente}
                                  </p>
                                  <p className="card-text text-muted mb-2">
                                    <i className="bi bi-telephone me-1"></i>
                                    {solicitud.telefonoCliente}
                                  </p>
                                  <p className="card-text">
                                    <strong>Servicio:</strong> {solicitud.tipoServicio}
                                  </p>
                                  <p className="card-text">
                                    <strong>Descripción:</strong> {solicitud.descripcion}
                                  </p>
                                  <p className="card-text">
                                    <strong>Ubicación:</strong> {solicitud.ubicacion}
                                  </p>
                                  <p className="card-text">
                                    <strong>Fecha y Hora:</strong> {formatDate(solicitud.fechaHoraInicio)}
                                  </p>
                                  <p className="card-text">
                                    <strong>Duración:</strong> {solicitud.duracionHoras} horas
                                  </p>
                                </div>
                                <div className="col-md-4 text-end">
                                  {getEstadoBadge(solicitud.estado)}
                                  <div className="mt-3">
                                    <button
                                      className="btn btn-success btn-sm me-2"
                                      onClick={() => handleAceptarSolicitud(solicitud.solicitudID)}
                                      disabled={loading}
                                    >
                                      <i className="bi bi-check-circle"></i> Aceptar
                                    </button>
                                    <button
                                      className="btn btn-danger btn-sm"
                                      onClick={() => handleRechazarSolicitud(solicitud.solicitudID)}
                                      disabled={loading}
                                    >
                                      <i className="bi bi-x-circle"></i> Rechazar
                                    </button>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolicitudesSection; 