import React from 'react';

const Header: React.FC = () => {
  return (
    <header>
      <nav className="navbar navbar-expand-sm navbar-toggleable-sm navbar-light bg-white border-bottom box-shadow mb-3">
        <div className="container-fluid">
          <a className="navbar-brand" href="/">
            PetCare
          </a>
          <button 
            className="navbar-toggler" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target=".navbar-collapse" 
            aria-controls="navbarSupportedContent"
            aria-expanded="false" 
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="navbar-collapse collapse d-sm-inline-flex justify-content-between">
            <ul className="navbar-nav flex-grow-1">
              <li className="nav-item">             
              </li>
              {/* Aquí puedes agregar otros elementos de menú más adelante */}
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header; 