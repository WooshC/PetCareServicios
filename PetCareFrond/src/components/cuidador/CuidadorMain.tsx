import React, { useState, useEffect } from 'react';
import { cuidadorService, solicitudService } from '../../services/api';
import { CuidadorResponse, CuidadorRequest } from '../../types/cuidador';
import CuidadorHeader from './CuidadorHeader';
import CuidadorDashboard from './CuidadorDashboard';
import SolicitudesSection from './SolicitudesSection';
import SolicitudesActivasSection from './SolicitudesActivasSection';
import HistorialSection from './HistorialSection';
import CuidadorForm from '../CuidadorForm';
import Modal from '../Modal';
import './CuidadorDashboard.css';

interface CuidadorMainProps {
  onLogout: () => void;
}

type SectionType = 'dashboard' | 'solicitudes' | 'solicitudes-activas' | 'historial';

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
  const [editError, setEditError] = useState<string | null>(null);

  // Estado del modal de logout
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Estado del contador de solicitudes
  const [solicitudesCount, setSolicitudesCount] = useState(0);
  const [solicitudesActivasCount, setSolicitudesActivasCount] = useState(0);

  // ===== EFECTOS =====

  useEffect(() => {
    loadCuidadorProfile();
  }, []);

  // Cargar contadores automáticamente cuando cambie la sección
  useEffect(() => {
    if (currentSection === 'solicitudes') {
      loadSolicitudesCount();
    } else if (currentSection === 'solicitudes-activas') {
      loadSolicitudesActivasCount();
    }
  }, [currentSection]);

  // ===== FUNCIONES PRINCIPALES =====

  const loadCuidadorProfile = async () => {
    try {
      setLoading(true);
      const profile = await cuidadorService.getMiPerfil();
      setCuidador(profile);
    } catch (error) {
      console.error('Error loading cuidador profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar contador de solicitudes pendientes
  const loadSolicitudesCount = async () => {
    try {
      const data = await solicitudService.getMisSolicitudesPendientes();
      setSolicitudesCount(data.length);
    } catch (error) {
      console.error('Error loading solicitudes count:', error);
    }
  };

  // Cargar contador de solicitudes activas
  const loadSolicitudesActivasCount = async () => {
    try {
      const data = await solicitudService.getMisSolicitudesActivas();
      setSolicitudesActivasCount(data.length);
    } catch (error) {
      console.error('Error loading active solicitudes count:', error);
    }
  };

  const handleEditProfile = async (data: CuidadorRequest) => {
    try {
      setEditLoading(true);
      setEditError(null);
      
      const updatedProfile = await cuidadorService.updateMiPerfil(data);
      setCuidador(updatedProfile);
      setShowEditModal(false);
    } catch (error: any) {
      setEditError(error.response?.data?.message || 'Error al actualizar el perfil');
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditClick = () => {
    setShowEditModal(true);
    setEditError(null);
  };

  const handleEditClose = () => {
    setShowEditModal(false);
    setEditError(null);
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

  // Manejar cambio en el contador de solicitudes
  const handleSolicitudesCountChange = (count: number) => {
    setSolicitudesCount(count);
  };

  const handleSolicitudesActivasCountChange = (count: number) => {
    setSolicitudesActivasCount(count);
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
        return (
          <SolicitudesSection
            onSolicitudesCountChange={handleSolicitudesCountChange}
          />
        );
      case 'solicitudes-activas':
        return (
          <SolicitudesActivasSection
            onSolicitudesCountChange={handleSolicitudesActivasCountChange}
          />
        );
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
          solicitudesCount={solicitudesCount}
          solicitudesActivasCount={solicitudesActivasCount}
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
          solicitudesCount={solicitudesCount}
          solicitudesActivasCount={solicitudesActivasCount}
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
        solicitudesCount={solicitudesCount}
        solicitudesActivasCount={solicitudesActivasCount}
      />
      
      <div className="container-fluid mt-4">
        {renderSection()}
      </div>

      {/* Modal de edición de perfil */}
      <Modal
        isOpen={showEditModal}
        onClose={handleEditClose}
        onConfirm={() => {}}
        title="Editar Perfil"
        message=""
        confirmText=""
        cancelText="Cerrar"
        className="edit-profile-modal"
        customContent={
          <CuidadorForm
            onSubmit={handleEditProfile}
            loading={editLoading}
            initialData={cuidador ? {
              documentoIdentidad: cuidador.documentoIdentidad,
              telefonoEmergencia: cuidador.telefonoEmergencia,
              biografia: cuidador.biografia,
              experiencia: cuidador.experiencia,
              horarioAtencion: cuidador.horarioAtencion,
              tarifaPorHora: cuidador.tarifaPorHora
            } : undefined}
            isEdit={true}
          />
        }
      />

      {/* Modal de confirmación de logout */}
      <Modal
        isOpen={showLogoutModal}
        onClose={handleLogoutClose}
        onConfirm={handleLogoutConfirm}
        title="Confirmar Cierre de Sesión"
        message="¿Estás seguro de que quieres cerrar sesión?"
        confirmText="Sí, Cerrar Sesión"
        cancelText="Cancelar"
        confirmVariant="danger"
        className="logout-modal"
      />
    </div>
  );
};

export default CuidadorMain; 