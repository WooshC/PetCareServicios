import React from 'react';

interface HomePageProps {
  onNavigate: (view: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  return (
    <div className="home-layout">
      <header className="home-header">
        <nav className="navbar navbar-expand-sm navbar-toggleable-sm navbar-light">
          <div className="container-fluid">
            <a className="navbar-brand" href="/">
              PetCare
            </a>
            <div className="navbar-collapse collapse d-sm-inline-flex justify-content-between">
              <ul className="navbar-nav flex-grow-1">
                <li className="nav-item">
                  <a className="nav-link" href="#">
                    <i className="bi bi-house"></i> Inicio
                  </a>
                </li>
              </ul>
              <ul className="navbar-nav">
                <li className="nav-item">
                  <button 
                    className="btn btn-outline-primary"
                    onClick={() => onNavigate('auth')}
                  >
                    <i className="bi bi-person-fill"></i> Iniciar Sesión
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section className="hero-section">
          <div className="container">
            <div className="hero-content">
              <h1 className="hero-title">
                <i className="bi bi-heart-fill"></i> Bienvenido a PetCare
              </h1>
              <p className="hero-subtitle">
                El mejor cuidado para tu mascota. Conectamos dueños responsables con cuidadores profesionales.
              </p>
              <div className="hero-buttons">
                <button 
                  className="hero-btn hero-btn-primary"
                  onClick={() => onNavigate('auth')}
                >
                  <i className="bi bi-person-plus"></i> Registrarse
                </button>
                <button 
                  className="hero-btn hero-btn-outline"
                  onClick={() => onNavigate('auth')}
                >
                  <i className="bi bi-person-fill"></i> Iniciar Sesión
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <div className="container">
            <h2 className="features-title">¿Por qué elegir PetCare?</h2>
            <div className="row">
              <div className="col-md-4 mb-4">
                <div className="feature-card">
                  <div className="feature-icon">
                    <i className="bi bi-shield-check"></i>
                  </div>
                  <h3 className="feature-title">Cuidadores Verificados</h3>
                  <p className="feature-description">
                    Todos nuestros cuidadores pasan por un proceso riguroso de verificación 
                    para garantizar la seguridad de tu mascota.
                  </p>
                </div>
              </div>
              <div className="col-md-4 mb-4">
                <div className="feature-card">
                  <div className="feature-icon">
                    <i className="bi bi-clock"></i>
                  </div>
                  <h3 className="feature-title">Disponibilidad 24/7</h3>
                  <p className="feature-description">
                    Encuentra cuidadores disponibles en cualquier momento del día, 
                    incluso en emergencias.
                  </p>
                </div>
              </div>
              <div className="col-md-4 mb-4">
                <div className="feature-card">
                  <div className="feature-icon">
                    <i className="bi bi-star"></i>
                  </div>
                  <h3 className="feature-title">Calificaciones Reales</h3>
                  <p className="feature-description">
                    Lee reseñas auténticas de otros dueños de mascotas para tomar 
                    la mejor decisión.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <div className="container">
          <p>&copy; 2024 PetCare. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage; 