import React, { useState, useEffect } from 'react';
import { CuidadorResponse, CuidadorRequest } from '../../types/cuidador';
import { cuidadorService } from '../../services/api';
import Modal from '../Modal';
import CuidadorForm from '../CuidadorForm';
import './CuidadorDashboard.css';

interface CuidadorDashboardProps {
  onLogout: () => void;
}

/**
 * Dashboard principal para cuidadores
 * Muestra información completa del perfil, estadísticas y opciones de gestión
 * 
 * FLUJO DE CARGA:
 * 1. Al montar el componente, carga automáticamente el perfil del cuidador
 * 2. Muestra estados de carga mientras obtiene los datos
 * 3. Renderiza la información del perfil una vez cargada
 * 4. Maneja errores si no puede cargar el perfil
 */
const CuidadorDashboard: React.FC<CuidadorDashboardProps> = ({ onLogout }) => {
  // ===== ESTADOS PRINCIPALES =====
  
  // Datos del perfil del cuidador
  const [cuidador, setCuidador] = useState<CuidadorResponse | null>(null);
  
  // Estado de carga para operaciones asíncronas
  const [loading, setLoading] = useState(true);
  
  // Mensaje de error si falla la carga
  const [error, setError] = useState<string | null>(null);

  // Estado del modal de logout
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Estado del modal de edición
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editMessage, setEditMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // ===== EFECTOS =====

  /**
   * Efecto que se ejecuta al montar el componente
   * Carga automáticamente el perfil del cuidador
   */
  useEffect(() => {
    loadCuidadorProfile();
  }, []);

  // ===== FUNCIONES PRINCIPALES =====

  /**
   * Carga el perfil del cuidador desde la API
   * FLUJO:
   * 1. Establece estado de carga
   * 2. Llama al servicio para obtener el perfil
   * 3. Actualiza el estado con los datos
   * 4. Maneja errores si ocurren
   */
  const loadCuidadorProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Llamada al servicio para obtener el perfil
      const profile = await cuidadorService.getMiPerfil();
      setCuidador(profile);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Maneja la actualización del perfil de cuidador
   * FLUJO:
   * 1. Recibe los datos actualizados del formulario
   * 2. Envía la actualización a la API
   * 3. Actualiza el estado local con los nuevos datos
   * 4. Muestra mensaje de éxito/error
   */
  const handleEditProfile = async (data: CuidadorRequest) => {
    try {
      setEditLoading(true);
      setEditMessage(null);
      
      // Actualizar perfil en la API
      const updatedProfile = await cuidadorService.updateMiPerfil(data);
      
      // Actualizar estado local
      setCuidador(updatedProfile);
      
      // Mostrar mensaje de éxito
      setEditMessage({ text: '¡Perfil actualizado exitosamente!', type: 'success' });
      
      // Cerrar modal después de un breve delay
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

  // ===== FUNCIONES DE UTILIDAD =====

  /**
   * Renderiza las estrellas de calificación
   * @param rating - Calificación promedio (0-5)
   * @returns JSX con estrellas llenas y vacías
   */
  const renderStarRating = (rating: number) => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <i 
            key={star}
            className={`bi ${star <= rating ? 'bi-star-fill' : 'bi-star'} text-warning`}
          ></i>
        ))}
        <span className="ms-2">({rating.toFixed(1)}/5.0)</span>
      </div>
    );
  };

  /**
   * Formatea valores monetarios en pesos colombianos
   * @param amount - Cantidad a formatear
   * @returns String formateado o "No especificada" si no hay valor
   */
  const formatCurrency = (amount?: number) => {
    if (!amount) return 'No especificada';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // ===== MANEJADORES DE LOGOUT =====

  /**
   * Abre el modal de confirmación de logout
   */
  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  /**
   * Confirma el logout y ejecuta la función
   */
  const handleLogoutConfirm = () => {
    onLogout();
  };

  // ===== MANEJADORES DE EDICIÓN =====

  /**
   * Abre el modal de edición de perfil
   */
  const handleEditClick = () => {
    setShowEditModal(true);
    setEditMessage(null);
  };

  /**
   * Cierra el modal de edición
   */
  const handleEditClose = () => {
    setShowEditModal(false);
    setEditMessage(null);
  };

  // ===== ESTADOS DE CARGA Y ERROR =====

  // Mostrar spinner de carga mientras se obtienen los datos
  if (loading) {
    return (
      <div className="cuidador-dashboard"> 
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

  // Mostrar mensaje de error si falla la carga
  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      </div>
    );
  }

  // Mostrar mensaje si no se encuentra el perfil
  if (!cuidador) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          No se encontró el perfil de cuidador
        </div>
      </div>
    );
  }

  // ===== RENDERIZADO PRINCIPAL =====

  return (
    <>
    <div className="cuidador-dashboard"> 
      <div className="container mt-4">
        {/* ===== HEADER CON BOTÓN DE LOGOUT ===== */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="h3 mb-0">
            <i className="bi bi-heart text-primary"></i> Dashboard de Cuidador
          </h1>
          <button 
            onClick={handleLogoutClick}
            className="btn btn-outline-danger btn-sm btn-logout"
          >
            <i className="bi bi-box-arrow-right"></i> Cerrar sesión
          </button>
        </div>

        <div className="row">
          {/* ===== COLUMNA IZQUIERDA - INFORMACIÓN DEL PERFIL ===== */}
          <div className="col-md-4">
            <div className="card shadow-sm mb-4">
              <div className="card-body text-center">
                {/* Foto de perfil */}
                <img 
                  src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
                  className="rounded-circle mb-3" 
                  width="150" 
                  height="150"
                  alt="Foto perfil"
                  style={{ objectFit: 'cover' }}
                />
                
                {/* Nombre del usuario */}
                <h4>{cuidador.nombreUsuario}</h4>
                <p className="text-muted">Cuidador profesional</p>

                {/* ===== CALIFICACIÓN PROMEDIO ===== */}
                <div className="mb-3">
                  {renderStarRating(cuidador.calificacionPromedio)}
                  <small className="text-muted d-block mt-1">
                    {cuidador.calificacionPromedio > 0 ? 'Calificaciones recibidas' : 'Sin calificaciones aún'}
                  </small>
                </div>

                {/* ===== ESTADO DE VERIFICACIÓN ===== */}
                <div className="mb-3">
                  {cuidador.documentoVerificado ? (
                    <span className="badge bg-success">
                      <i className="bi bi-check-circle-fill me-1"></i>
                      Documento verificado
                    </span>
                  ) : (
                    <span className="badge bg-warning text-dark">
                      <i className="bi bi-clock-fill me-1"></i>
                      Pendiente de verificación
                    </span>
                  )}
                </div>

                {/* ===== BOTÓN DE EDICIÓN ===== */}
                <div className="d-grid gap-2">
                  <button 
                    className="btn btn-outline-primary"
                    onClick={handleEditClick}
                  >
                    <i className="bi bi-pencil-square me-1"></i>
                    Editar perfil
                  </button>
                </div>

                <hr />

                {/* ===== INFORMACIÓN DE CONTACTO ===== */}
                <div className="text-start">
                  <h6 className="fw-bold mb-3">Información de Contacto</h6>
                  
                  {/* Documento de identidad */}
                  <div className="mb-2">
                    <small className="text-muted">Documento:</small>
                    <p className="mb-1 fw-semibold">{cuidador.documentoIdentidad}</p>
                  </div>

                  {/* Teléfono de emergencia */}
                  <div className="mb-2">
                    <small className="text-muted">Teléfono de emergencia:</small>
                    <p className="mb-1 fw-semibold">{cuidador.telefonoEmergencia}</p>
                  </div>

                  {/* Email */}
                  <div className="mb-2">
                    <small className="text-muted">Email:</small>
                    <p className="mb-1 fw-semibold">{cuidador.emailUsuario}</p>
                  </div>

                  {/* Fecha de creación */}
                  <div className="mb-2">
                    <small className="text-muted">Miembro desde:</small>
                    <p className="mb-1 fw-semibold">
                      {new Date(cuidador.fechaCreacion).toLocaleDateString('es-CO')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ===== COLUMNA DERECHA - SERVICIOS Y DETALLES ===== */}
          <div className="col-md-8">
            <div className="row">
              {/* ===== TARJETA DE SERVICIOS OFRECIDOS ===== */}
              <div className="col-md-6 mb-4">
                <div className="card shadow-sm h-100">
                  <div className="card-header bg-primary text-white">
                    <h5 className="mb-0">
                      <i className="bi bi-gear-fill me-2"></i>
                      Servicios Ofrecidos
                    </h5>
                  </div>
                  <div className="card-body">
                    <ul className="list-unstyled">
                      <li className="mb-2">
                        <i className="bi bi-walking text-success me-2"></i>
                        Paseos
                      </li>
                      <li className="mb-2">
                        <i className="bi bi-house-heart text-info me-2"></i>
                        Guardería
                      </li>
                      <li className="mb-2">
                        <i className="bi bi-house-door text-warning me-2"></i>
                        Visitas a domicilio
                      </li>
                      <li className="mb-2">
                        <i className="bi bi-heart-pulse text-danger me-2"></i>
                        Cuidado especial
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* ===== TARJETA DE TARIFAS Y HORARIOS ===== */}
              <div className="col-md-6 mb-4">
                <div className="card shadow-sm h-100">
                  <div className="card-header bg-success text-white">
                    <h5 className="mb-0">
                      <i className="bi bi-currency-dollar me-2"></i>
                      Tarifas y Horarios
                    </h5>
                  </div>
                  <div className="card-body">
                    {/* Tarifa por hora */}
                    <div className="mb-3">
                      <strong>Tarifa por hora:</strong>
                      <p className="text-primary fw-bold fs-5 mb-0">
                        {formatCurrency(cuidador.tarifaPorHora)}
                      </p>
                    </div>
                    
                    {/* Horario de atención */}
                    <div className="mb-3">
                      <strong>Horario de atención:</strong>
                      <p className="mb-0">
                        {cuidador.horarioAtencion || 'No especificado'}
                      </p>
                    </div>

                    {/* Estado de disponibilidad */}
                    <div className="mb-3">
                      <strong>Estado:</strong>
                      <p className="mb-0">
                        <span className="badge bg-success">Disponible</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ===== TARJETA DE BIOGRAFÍA ===== */}
              <div className="col-12 mb-4">
                <div className="card shadow-sm">
                  <div className="card-header bg-info text-white">
                    <h5 className="mb-0">
                      <i className="bi bi-person-lines-fill me-2"></i>
                      Biografía
                    </h5>
                  </div>
                  <div className="card-body">
                    {cuidador.biografia ? (
                      <p className="mb-0">{cuidador.biografia}</p>
                    ) : (
                      <p className="text-muted mb-0">
                        <i className="bi bi-info-circle me-1"></i>
                        No has agregado una biografía aún. 
                        <button 
                          className="btn btn-link p-0 ms-1"
                          onClick={handleEditClick}
                        >
                          Agregar biografía
                        </button>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* ===== TARJETA DE EXPERIENCIA ===== */}
              <div className="col-12 mb-4">
                <div className="card shadow-sm">
                  <div className="card-header bg-warning text-dark">
                    <h5 className="mb-0">
                      <i className="bi bi-award-fill me-2"></i>
                      Experiencia
                    </h5>
                  </div>
                  <div className="card-body">
                    {cuidador.experiencia ? (
                      <p className="mb-0">{cuidador.experiencia}</p>
                    ) : (
                      <p className="text-muted mb-0">
                        <i className="bi bi-info-circle me-1"></i>
                        No has agregado información sobre tu experiencia. 
                        <button 
                          className="btn btn-link p-0 ms-1"
                          onClick={handleEditClick}
                        >
                          Agregar experiencia
                        </button>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* ===== TARJETA DE ESTADÍSTICAS ===== */}
              <div className="col-12">
                <div className="card shadow-sm">
                  <div className="card-header bg-secondary text-white">
                    <h5 className="mb-0">
                      <i className="bi bi-graph-up me-2"></i>
                      Estadísticas
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="row text-center">
                      {/* Servicios completados */}
                      <div className="col-md-3">
                        <div className="border-end">
                          <h3 className="text-primary mb-1">0</h3>
                          <small className="text-muted">Servicios completados</small>
                        </div>
                      </div>
                      
                      {/* Clientes satisfechos */}
                      <div className="col-md-3">
                        <div className="border-end">
                          <h3 className="text-success mb-1">0</h3>
                          <small className="text-muted">Clientes satisfechos</small>
                        </div>
                      </div>
                      
                      {/* Horas trabajadas */}
                      <div className="col-md-3">
                        <div className="border-end">
                          <h3 className="text-info mb-1">0</h3>
                          <small className="text-muted">Horas trabajadas</small>
                        </div>
                      </div>
                      
                      {/* Reseñas recibidas */}
                      <div className="col-md-3">
                        <div>
                          <h3 className="text-warning mb-1">0</h3>
                          <small className="text-muted">Reseñas recibidas</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>              
      
      {/* Modal de confirmación de logout */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
        title="Confirmar Cierre de Sesión"
        message="¿Estás seguro de que quieres cerrar sesión? Se perderán todos los datos no guardados."
        confirmText="Sí, Cerrar Sesión"
        cancelText="Cancelar"
        confirmVariant="danger"
      />

      {/* Modal de edición de perfil */}
      <Modal
        isOpen={showEditModal}
        onClose={handleEditClose}
        onConfirm={() => {}} // No se usa onConfirm para este modal
        title="Editar Perfil de Cuidador"
        message=""
        confirmText=""
        cancelText=""
        confirmVariant="primary"
        customContent={
          <div className="edit-profile-modal">
            {/* Mensajes de estado */}
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

            {/* Formulario de edición */}
            <CuidadorForm
              onSubmit={handleEditProfile}
              loading={editLoading}
              initialData={{
                documentoIdentidad: cuidador.documentoIdentidad,
                telefonoEmergencia: cuidador.telefonoEmergencia,
                biografia: cuidador.biografia || '',
                experiencia: cuidador.experiencia || '',
                horarioAtencion: cuidador.horarioAtencion || '',
                tarifaPorHora: cuidador.tarifaPorHora
              }}
              isEdit={true}
            />
          </div>
        }
      />
    </>
  );
};

export default CuidadorDashboard; 