import React, { useState, useEffect } from 'react';
import { CuidadorResponse, CuidadorRequest } from '../../types/cuidador';
import { cuidadorService } from '../../services/api';
import CuidadorHeader from './CuidadorHeader';
import CuidadorDashboard from './CuidadorDashboard';
import SolicitudesSection from './SolicitudesSection';
import HistorialSection from './HistorialSection';
import Modal from '../Modal';
import CuidadorForm from '../CuidadorForm';
import './CuidadorDashboard.css';

interface CuidadorMainProps {
  onLogout: () => void;
}

type SectionType = 'dashboard' | 'solicitudes' | 'historial';

const CuidadorMain: React.FC<CuidadorMainProps> = ({ onLogout }) => {
  // ===== ESTADOS PRINCIPALES =====
  
  // Sección actual
  const [currentSection, setCurrentSection] = useState<SectionType>('dashboard');
  
  // Datos del perfil del cuidador
  const [cuidador, setCuidador] = useState<CuidadorResponse | null>(null);
  
  // Estado de carga
  const [loading, setLoading] = useState(true);
  
  // Mensaje de error
  const [error, setError] = useState<string | null>(null);

  // Estados del modal de edición
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editMessage, setEditMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Estado del modal de logout
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // ===== EFECTOS =====

  useEffect(() => {
    loadCuidadorProfile();
  }, []);

  // ===== FUNCIONES PRINCIPALES =====

  const loadCuidadorProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const profile = await cuidadorService.getMiPerfil();
      setCuidador(profile);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = async (data: CuidadorRequest) => {
    try {
      setEditLoading(true);
      setEditMessage(null);
      
      const updatedProfile = await cuidadorService.updateMiPerfil(data);
      setCuidador(updatedProfile);
      
      setEditMessage({ text: '¡Perfil actualizado exitosamente!', type: 'success' });
      
      setTimeout(() => {
        setShowEditModal(false);
        setEditMessage(null);
      }, 1500);
      
    } catch (err: any) {
      setEditMessage({ 
        text: err.response?.data?.message || 'Error al actualizar el perfil', 
        type: 'error' 
      });
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditClick = () => {
    setShowEditModal(true);
    setEditMessage(null);
  };

  const handleEditClose = () => {
    setShowEditModal(false);
    setEditMessage(null);
  };

  // ===== MANEJADORES DE LOGOUT =====

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    onLogout();
  };

  const handleLogoutClose = () => {
    setShowLogoutModal(false);
  };

  // ===== RENDERIZADO DE SECCIONES =====

  const renderSection = () => {
    switch (currentSection) {
      case 'dashboard':
        return (
          <CuidadorDashboard 
            onLogout={onLogout}
            onEditProfile={handleEditClick}
            cuidador={cuidador}
          />
        );
      case 'solicitudes':
        return <SolicitudesSection />;
      case 'historial':
        return <HistorialSection />;
      default:
        return (
          <CuidadorDashboard 
            onLogout={onLogout}
            onEditProfile={handleEditClick}
            cuidador={cuidador}
          />
        );
    }
  };

  // ===== ESTADOS DE CARGA Y ERROR =====

  if (loading) {
    return (
      <div className="cuidador-main">
        <CuidadorHeader
          currentSection={currentSection}
          onSectionChange={setCurrentSection}
          onLogout={handleLogoutClick}
          cuidadorName={cuidador?.nombreUsuario}
        />
        <div className="container mt-4">
          <div className="d-flex justify-content-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cuidador-main">
        <CuidadorHeader
          currentSection={currentSection}
          onSectionChange={setCurrentSection}
          onLogout={handleLogoutClick}
          cuidadorName={cuidador?.nombreUsuario}
        />
        <div className="container mt-4">
          <div className="alert alert-danger" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
        </div>
      </div>
    );
  }

  // ===== RENDERIZADO PRINCIPAL =====

  return (
    <div className="cuidador-main">
      <CuidadorHeader
        currentSection={currentSection}
        onSectionChange={setCurrentSection}
        onLogout={handleLogoutClick}
        cuidadorName={cuidador?.nombreUsuario}
      />
      
      {renderSection()}

      {/* Modal de edición de perfil */}
      <Modal
        isOpen={showEditModal}
        onClose={handleEditClose}
        onConfirm={() => {}}
        title="Editar Perfil de Cuidador"
        message=""
        confirmText=""
        cancelText=""
        confirmVariant="primary"
        customContent={
          <div className="edit-profile-modal">
            {editMessage && (
              <div className={`alert alert-${editMessage.type === 'error' ? 'danger' : 'success'} alert-dismissible fade show mb-3`} role="alert">
                {editMessage.text}
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setEditMessage(null)}
                  aria-label="Close"
                ></button>
              </div>
            )}

            <CuidadorForm
              onSubmit={handleEditProfile}
              loading={editLoading}
              initialData={{
                documentoIdentidad: cuidador?.documentoIdentidad || '',
                telefonoEmergencia: cuidador?.telefonoEmergencia || '',
                biografia: cuidador?.biografia || '',
                experiencia: cuidador?.experiencia || '',
                horarioAtencion: cuidador?.horarioAtencion || '',
                tarifaPorHora: cuidador?.tarifaPorHora
              }}
              isEdit={true}
            />
          </div>
        }
      />

      {/* Modal de confirmación de logout */}
      <Modal
        isOpen={showLogoutModal}
        onClose={handleLogoutClose}
        onConfirm={handleLogoutConfirm}
        title="Confirmar Cierre de Sesión"
        message="¿Estás seguro de que quieres cerrar sesión? Se perderán todos los datos no guardados."
        confirmText="Sí, Cerrar Sesión"
        cancelText="Cancelar"
        confirmVariant="danger"
        className="logout-modal"
      />
    </div>
  );
};

export default CuidadorMain; 