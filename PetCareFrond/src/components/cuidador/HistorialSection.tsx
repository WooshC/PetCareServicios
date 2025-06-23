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
  fechaFinalizacion?: string;
  nombreCliente: string;
  emailCliente: string;
}

const HistorialSection: React.FC = () => {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHistorial = async () => {
    try {
      setLoading(true);
      const data = await solicitudService.getMiHistorial();
      setSolicitudes(data);
      setError(null);
    } catch (err: any) {
      setError('Error al cargar el historial de servicios');
      console.error('Error loading history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistorial();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTipoServicioIcon = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'paseo':
        return 'bi-walking';
      case 'guardería':
        return 'bi-house';
      case 'visita a domicilio':
        return 'bi-geo-alt';
      default:
        return 'bi-heart';
    }
  };

  if (loading) {
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
                  <h5 className="fw-bold mb-2">Historial de Servicios</h5>
                  <p className="text-muted mb-3">Servicios finalizados</p>
                  <div className="d-grid">
                    <button className="btn btn-outline-primary btn-sm" disabled>
                      <i className="bi bi-clock-history me-2"></i>
                      Cargando...
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Columna derecha - Lista de solicitudes */}
            <div className="col-md-9">
              <div className="card shadow-sm">
                <div className="card-header bg-success text-white">
                  <h4 className="mb-0">
                    <i className="bi bi-clock-history me-2"></i>
                    Historial de Servicios Finalizados
                  </h4>
                </div>
                <div className="card-body">
                  <div className="d-flex justify-content-center">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Cargando...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
                <h5 className="fw-bold mb-2">Historial de Servicios</h5>
                <p className="text-muted mb-3">Servicios finalizados</p>
                <div className="d-grid">
                  <button className="btn btn-outline-success btn-sm">
                    <i className="bi bi-check-circle me-2"></i>
                    {solicitudes.length} Servicios
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Columna derecha - Lista de solicitudes */}
          <div className="col-md-9">
            <div className="card shadow-sm">
              <div className="card-header bg-success text-white">
                <h4 className="mb-0">
                  <i className="bi bi-clock-history me-2"></i>
                  Historial de Servicios Finalizados
                </h4>
              </div>
              <div className="card-body">
                {error && (
                  <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setError(null)}
                    ></button>
                  </div>
                )}

                {solicitudes.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="bi bi-inbox display-1 text-muted"></i>
                    <h5 className="mt-3 text-muted">No hay servicios finalizados</h5>
                    <p className="text-muted">Aún no has completado ningún servicio</p>
                  </div>
                ) : (
                  <div className="row">
                    {solicitudes.map((solicitud) => (
                      <div key={solicitud.solicitudID} className="col-12 mb-3">
                        <div className="card border-success">
                          <div className="card-body">
                            <div className="row align-items-center">
                              <div className="col-md-2 text-center">
                                <i className={`bi ${getTipoServicioIcon(solicitud.tipoServicio)} display-4 text-success`}></i>
                                <div className="mt-2">
                                  <span className="badge bg-success">{solicitud.tipoServicio}</span>
                                </div>
                              </div>
                              <div className="col-md-7">
                                <h6 className="card-title mb-2">
                                  <i className="bi bi-person me-2"></i>
                                  {solicitud.nombreCliente}
                                </h6>
                                <p className="card-text text-muted mb-2">
                                  <i className="bi bi-chat me-2"></i>
                                  {solicitud.descripcion}
                                </p>
                                <div className="row text-muted small">
                                  <div className="col-md-6">
                                    <i className="bi bi-geo-alt me-1"></i>
                                    {solicitud.ubicacion}
                                  </div>
                                  <div className="col-md-6">
                                    <i className="bi bi-clock me-1"></i>
                                    {solicitud.duracionHoras} horas
                                  </div>
                                </div>
                              </div>
                              <div className="col-md-3 text-end">
                                <div className="text-success">
                                  <i className="bi bi-check-circle me-1"></i>
                                  Finalizado
                                </div>
                                <div className="text-muted small mt-1">
                                  <div>Inicio: {formatDate(solicitud.fechaHoraInicio)}</div>
                                  {solicitud.fechaFinalizacion && (
                                    <div>Fin: {formatDate(solicitud.fechaFinalizacion)}</div>
                                  )}
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
  );
};

export default HistorialSection; 