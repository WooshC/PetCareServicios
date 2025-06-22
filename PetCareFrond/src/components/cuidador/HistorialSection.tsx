import React from 'react';

const HistorialSection: React.FC = () => {
  return (
    <div className="historial-section">
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

          {/* Columna central - Historial */}
          <div className="col-md-9">
            <div className="row">
              {/* Estadísticas Generales */}
              <div className="col-12 mb-4">
                <div className="card shadow-sm">
                  <div className="card-header bg-primary text-white">
                    <h5 className="mb-0">
                      <i className="bi bi-graph-up me-2"></i>
                      Estadísticas Generales
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="row text-center">
                      <div className="col-md-3">
                        <div className="border-end">
                          <h3 className="text-primary mb-1">0</h3>
                          <small className="text-muted">Servicios Completados</small>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="border-end">
                          <h3 className="text-success mb-1">0</h3>
                          <small className="text-muted">Clientes Satisfechos</small>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="border-end">
                          <h3 className="text-info mb-1">0h</h3>
                          <small className="text-muted">Horas Trabajadas</small>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div>
                          <h3 className="text-warning mb-1">0.0</h3>
                          <small className="text-muted">Calificación Promedio</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Historial de Servicios */}
              <div className="col-12 mb-4">
                <div className="card shadow-sm">
                  <div className="card-header bg-secondary text-white">
                    <h5 className="mb-0">
                      <i className="bi bi-clock-history me-2"></i>
                      Historial de Servicios
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="text-center py-4">
                      <i className="bi bi-journal-x text-muted" style={{ fontSize: '3rem' }}></i>
                      <p className="text-muted mt-3">No hay servicios en el historial</p>
                      <small className="text-muted">
                        Los servicios completados aparecerán aquí
                      </small>
                    </div>
                  </div>
                </div>
              </div>

              {/* Calificaciones y Reseñas */}
              <div className="col-12">
                <div className="card shadow-sm">
                  <div className="card-header bg-warning text-dark">
                    <h5 className="mb-0">
                      <i className="bi bi-star-fill me-2"></i>
                      Calificaciones y Reseñas
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="text-center py-4">
                      <i className="bi bi-star text-muted" style={{ fontSize: '3rem' }}></i>
                      <p className="text-muted mt-3">No hay calificaciones aún</p>
                      <small className="text-muted">
                        Las reseñas de clientes aparecerán aquí
                      </small>
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

export default HistorialSection; 