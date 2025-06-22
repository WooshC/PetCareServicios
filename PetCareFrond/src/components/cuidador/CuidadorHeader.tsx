import React from 'react';

interface CuidadorHeaderProps {
  currentSection: 'dashboard' | 'solicitudes' | 'historial';
  onSectionChange: (section: 'dashboard' | 'solicitudes' | 'historial') => void;
  onLogout: () => void;
  cuidadorName?: string;
}

const CuidadorHeader: React.FC<CuidadorHeaderProps> = ({
  currentSection,
  onSectionChange,
  onLogout,
  cuidadorName = 'Cuidador'
}) => {
  return (
    <header className="cuidador-header">
      <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom shadow-sm">
        <div className="container-fluid">
          {/* Logo y nombre */}
          <div className="navbar-brand d-flex align-items-center">
            <i className="bi bi-heart-fill text-primary me-2" style={{ fontSize: '1.5rem' }}></i>
            <span className="fw-bold text-dark">PetCare</span>
          </div>

          {/* Botón hamburguesa para móvil */}
          <button 
            className="navbar-toggler" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#cuidadorNavbar"
            aria-controls="cuidadorNavbar"
            aria-expanded="false" 
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Navegación principal */}
          <div className="collapse navbar-collapse" id="cuidadorNavbar">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <button
                  className={`nav-link btn btn-link ${currentSection === 'dashboard' ? 'active fw-bold' : ''}`}
                  onClick={() => onSectionChange('dashboard')}
                >
                  <i className="bi bi-speedometer2 me-1"></i>
                  Dashboard
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link btn btn-link ${currentSection === 'solicitudes' ? 'active fw-bold' : ''}`}
                  onClick={() => onSectionChange('solicitudes')}
                >
                  <i className="bi bi-bell me-1"></i>
                  Solicitudes
                  <span className="badge bg-danger ms-1">0</span>
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link btn btn-link ${currentSection === 'historial' ? 'active fw-bold' : ''}`}
                  onClick={() => onSectionChange('historial')}
                >
                  <i className="bi bi-clock-history me-1"></i>
                  Historial
                </button>
              </li>
            </ul>

            {/* Información del usuario y logout */}
            <div className="navbar-nav ms-auto">
              <div className="nav-item dropdown">
                <button
                  className="nav-link dropdown-toggle d-flex align-items-center"
                  id="userDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <img 
                    src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
                    className="rounded-circle me-2" 
                    width="32" 
                    height="32"
                    alt="Perfil"
                    style={{ objectFit: 'cover' }}
                  />
                  <span className="text-dark">{cuidadorName}</span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                  <li>
                    <button
                      className="dropdown-item"
                      onClick={() => onSectionChange('dashboard')}
                    >
                      <i className="bi bi-person-circle me-2"></i>
                      Mi Perfil
                    </button>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button
                      className="dropdown-item text-danger"
                      onClick={onLogout}
                    >
                      <i className="bi bi-box-arrow-right me-2"></i>
                      Cerrar Sesión
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default CuidadorHeader; 