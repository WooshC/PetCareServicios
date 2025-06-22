import React, { useState, useEffect } from 'react';
import { solicitudService } from '../../services/api';
import SolicitudForm from '../SolicitudForm';

interface Solicitud {
  solicitudID: number;
  tipoServicio: string;
  descripcion: string;
  fechaHoraInicio: string;
  duracionHoras: number;
  ubicacion: string;
  estado: string;
  fechaCreacion: string;
  nombreCuidador?: string;
  emailCuidador?: string;
}

interface ClienteDashboardProps {
  onLogout: () => void;
}

const ClienteDashboard: React.FC<ClienteDashboardProps> = ({ onLogout }) => {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSolicitudForm, setShowSolicitudForm] = useState(false);

  useEffect(() => {
    loadSolicitudes();
  }, []);

  const loadSolicitudes = async () => {
    try {
      setLoading(true);
      const data = await solicitudService.getMisSolicitudes();
      setSolicitudes(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar solicitudes');
    } finally {
      setLoading(false);
    }
  };

  const handleSolicitudSuccess = () => {
    setShowSolicitudForm(false);
    loadSolicitudes();
  };

  const getEstadoBadge = (estado: string) => {
    const badges = {
      'Pendiente': 'badge bg-warning',
      'Aceptada': 'badge bg-info',
      'En Progreso': 'badge bg-primary',
      'Finalizada': 'badge bg-success',
      'Cancelada': 'badge bg-secondary',
      'Rechazada': 'badge bg-danger'
    };
    return badges[estado as keyof typeof badges] || 'badge bg-secondary';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES');
  };

  if (showSolicitudForm) {
    return (
      <SolicitudForm
        onSuccess={handleSolicitudSuccess}
        onBack={() => setShowSolicitudForm(false)}
      />
    );
  }

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row mb-4">
        <div className="col">
          <div className="d-flex justify-content-between align-items-center">
            <h1 className="mb-0">
              <i className="bi bi-person-circle"></i> Dashboard de Cliente
            </h1>
            <div>
              <button
                className="btn btn-primary me-2"
                onClick={() => setShowSolicitudForm(true)}
              >
                <i className="bi bi-plus-circle"></i> Nueva Solicitud
              </button>
              <button
                className="btn btn-outline-danger"
                onClick={onLogout}
              >
                <i className="bi bi-box-arrow-right"></i> Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="row">
        <div className="col">
          <div className="card">
            <div className="card-header">
              <h3 className="mb-0">
                <i className="bi bi-list-ul"></i> Mis Solicitudes
              </h3>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                  <p className="mt-2">Cargando solicitudes...</p>
                </div>
              ) : error ? (
                <div className="alert alert-danger">
                  <i className="bi bi-exclamation-triangle"></i> {error}
                </div>
              ) : solicitudes.length === 0 ? (
                <div className="text-center py-4">
                  <i className="bi bi-inbox display-1 text-muted"></i>
                  <h4 className="mt-3">No tienes solicitudes</h4>
                  <p className="text-muted">Crea tu primera solicitud para comenzar a usar nuestros servicios.</p>
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowSolicitudForm(true)}
                  >
                    <i className="bi bi-plus-circle"></i> Crear Primera Solicitud
                  </button>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Tipo de Servicio</th>
                        <th>Descripción</th>
                        <th>Fecha de Inicio</th>
                        <th>Duración</th>
                        <th>Ubicación</th>
                        <th>Estado</th>
                        <th>Cuidador</th>
                        <th>Fecha Creación</th>
                      </tr>
                    </thead>
                    <tbody>
                      {solicitudes.map((solicitud) => (
                        <tr key={solicitud.solicitudID}>
                          <td>{solicitud.solicitudID}</td>
                          <td>
                            <strong>{solicitud.tipoServicio}</strong>
                          </td>
                          <td>
                            <div className="text-truncate" style={{ maxWidth: '200px' }} title={solicitud.descripcion}>
                              {solicitud.descripcion}
                            </div>
                          </td>
                          <td>{formatDate(solicitud.fechaHoraInicio)}</td>
                          <td>{solicitud.duracionHoras} horas</td>
                          <td>
                            <div className="text-truncate" style={{ maxWidth: '150px' }} title={solicitud.ubicacion}>
                              {solicitud.ubicacion}
                            </div>
                          </td>
                          <td>
                            <span className={getEstadoBadge(solicitud.estado)}>
                              {solicitud.estado}
                            </span>
                          </td>
                          <td>
                            {solicitud.nombreCuidador ? (
                              <div>
                                <div>{solicitud.nombreCuidador}</div>
                                <small className="text-muted">{solicitud.emailCuidador}</small>
                              </div>
                            ) : (
                              <span className="text-muted">Sin asignar</span>
                            )}
                          </td>
                          <td>{formatDate(solicitud.fechaCreacion)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClienteDashboard; 