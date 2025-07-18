import React, { useState, useEffect, useRef } from 'react';
import { cuidadorService, solicitudService, authService } from '../../services/api';
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

  // Estados del modal de chat
  const [showChatModal, setShowChatModal] = useState(false);
  const [currentChatCliente, setCurrentChatCliente] = useState<{ clienteId: number; nombreCliente: string } | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [solicitudesActivas, setSolicitudesActivas] = useState<any[]>([]);

  // Obtener el userId del cuidador al montar
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const res = await authService.getMiRol();
        setUserId(res.userId);
      } catch {}
    };
    fetchUserId();
  }, []);

  // Cargar solicitudes activas para detectar si hay un cliente asignado
  useEffect(() => {
    const loadActivas = async () => {
      try {
        const data = await solicitudService.getMisSolicitudesActivas();
        setSolicitudesActivas(data);
      } catch {}
    };
    loadActivas();
    const interval = setInterval(loadActivas, 15000);
    return () => clearInterval(interval);
  }, []);

  // Abrir chat automáticamente cuando hay una solicitud activa
  useEffect(() => {
    const activa = solicitudesActivas.find(s => (s.estado === 'Asignada' || s.estado === 'En Progreso') && s.clienteID && s.nombreCliente);
    if (activa && activa.clienteID && activa.nombreCliente) {
      setCurrentChatCliente({ clienteId: activa.clienteID, nombreCliente: activa.nombreCliente });
      setShowChatModal(true);
    } else {
      setShowChatModal(false);
    }
  }, [solicitudesActivas]);

  // WebSocket para chat
  useEffect(() => {
    if (!showChatModal || !currentChatCliente || !userId) return;
    let ws: WebSocket | null = null;
    const token = localStorage.getItem('token');
    const wsUrl = `ws://localhost:5000/api/ws/chat/connect?access_token=${token}`;
    ws = new WebSocket(wsUrl);
    ws.onopen = () => setSocket(ws);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'history') setMessages(data.messages);
      else if (data.type === 'new_message') setMessages(prev => [...prev, data.message]);
    };
    ws.onclose = () => setSocket(null);
    return () => { ws && ws.close(); };
  }, [showChatModal, currentChatCliente, userId]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !socket || !currentChatCliente || !userId) return;
    const message = { ReceiverId: currentChatCliente.clienteId, Content: newMessage };
    socket.send(JSON.stringify(message));
    setNewMessage('');
  };

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

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

  // Polling para actualizar contadores automáticamente cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      // Actualizar contador de solicitudes pendientes
      loadSolicitudesCount();
      // Actualizar contador de solicitudes activas
      loadSolicitudesActivasCount();
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, []);

  // Cargar contadores iniciales al montar el componente
  useEffect(() => {
    loadSolicitudesCount();
    loadSolicitudesActivasCount();
  }, []);

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

      {/* Modal de Chat */}
      {showChatModal && currentChatCliente && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="bi bi-chat-left-text me-2"></i>
                  Chat con {currentChatCliente.nombreCliente}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowChatModal(false)}></button>
              </div>
              <div className="modal-body p-0" style={{ height: '60vh' }}>
                <div className="d-flex flex-column h-100">
                  <div className="p-3 border-bottom bg-light">
                    <div className="d-flex align-items-center">
                      <div className="avatar me-2"><i className="bi bi-person-circle fs-3"></i></div>
                      <div>
                        <h6 className="mb-0">{currentChatCliente.nombreCliente}</h6>
                        <small className="text-muted">{socket?.readyState === WebSocket.OPEN ? 'En línea' : 'Desconectado'}</small>
                      </div>
                    </div>
                  </div>
                  <div className="flex-grow-1 overflow-auto p-3">
                    {messages.length === 0 ? (
                      <div className="text-center text-muted py-5">
                        <i className="bi bi-chat-square-text display-4"></i>
                        <p className="mt-3">Envía tu primer mensaje</p>
                      </div>
                    ) : (
                      messages.map((message, idx) => (
                        <div key={message.messageId || idx} className={`mb-3 d-flex ${message.senderId === userId ? 'justify-content-end' : 'justify-content-start'}`}>
                          <div className={`p-3 rounded-3 ${message.senderId === userId ? 'bg-primary text-white' : 'bg-light'}`} style={{ maxWidth: '70%' }}>
                            {!message.isOwn && <small className="d-block fw-bold">{message.senderName || ''}</small>}
                            <div>{message.content}</div>
                            <small className={`d-block text-end ${message.senderId === userId ? 'text-white-50' : 'text-muted'}`}>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                  <div className="p-3 border-top">
                    <div className="input-group">
                      <input type="text" className="form-control" placeholder="Escribe un mensaje..." value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSendMessage()} disabled={socket?.readyState !== WebSocket.OPEN} />
                      <button className="btn btn-primary" type="button" onClick={handleSendMessage} disabled={!newMessage.trim() || socket?.readyState !== WebSocket.OPEN}><i className="bi bi-send"></i></button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CuidadorMain; 