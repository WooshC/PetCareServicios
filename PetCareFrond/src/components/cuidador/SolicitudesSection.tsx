import React from 'react';

const SolicitudesSection: React.FC = () => {
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
            <div className="row">
              {/* Solicitudes Pendientes */}
              <div className="col-12 mb-4">
                <div className="card shadow-sm">
                  <div className="card-header bg-warning text-dark">
                    <h5 className="mb-0">
                      <i className="bi bi-clock-fill me-2"></i>
                      Solicitudes Pendientes
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="text-center py-4">
                      <i className="bi bi-inbox text-muted" style={{ fontSize: '3rem' }}></i>
                      <p className="text-muted mt-3">No hay solicitudes pendientes</p>
                      <small className="text-muted">
                        Las nuevas solicitudes aparecerán aquí automáticamente
                      </small>
                    </div>
                  </div>
                </div>
              </div>

              {/* Solicitudes Activas */}
              <div className="col-12 mb-4">
                <div className="card shadow-sm">
                  <div className="card-header bg-success text-white">
                    <h5 className="mb-0">
                      <i className="bi bi-check-circle-fill me-2"></i>
                      Solicitudes Activas
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="text-center py-4">
                      <i className="bi bi-calendar-check text-muted" style={{ fontSize: '3rem' }}></i>
                      <p className="text-muted mt-3">No hay servicios activos</p>
                      <small className="text-muted">
                        Los servicios en curso se mostrarán aquí
                      </small>
                    </div>
                  </div>
                </div>
              </div>

              {/* Próximos Servicios */}
              <div className="col-12">
                <div className="card shadow-sm">
                  <div className="card-header bg-info text-white">
                    <h5 className="mb-0">
                      <i className="bi bi-calendar-event me-2"></i>
                      Próximos Servicios
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="text-center py-4">
                      <i className="bi bi-calendar-x text-muted" style={{ fontSize: '3rem' }}></i>
                      <p className="text-muted mt-3">No hay servicios programados</p>
                      <small className="text-muted">
                        Los servicios futuros se mostrarán aquí
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

export default SolicitudesSection; 