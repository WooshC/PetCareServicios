import React, { useState, useEffect, useRef } from 'react';
import { solicitudService, authService } from '../../services/api';
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
  cuidadorID?: number; // <-- Agregado para evitar error TS
}

interface Cuidador {
  cuidadorID: number;
  nombreUsuario: string;
  emailUsuario: string;
  biografia?: string;
  experiencia?: string;
  horarioAtencion?: string;
  tarifaPorHora?: number;
  calificacionPromedio: number;
  documentoVerificado: boolean;
}

interface ClienteDashboardProps {
  onLogout: () => void;
}

const ClienteDashboard: React.FC<ClienteDashboardProps> = ({ onLogout }) => {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [cuidadoresDisponibles, setCuidadoresDisponibles] = useState<Cuidador[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSolicitudForm, setShowSolicitudForm] = useState(false);
  const [showCuidadoresModal, setShowCuidadoresModal] = useState(false);
  const [selectedSolicitudId, setSelectedSolicitudId] = useState<number | null>(null);
  const [asignandoCuidador, setAsignandoCuidador] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [currentChatCuidador, setCurrentChatCuidador] = useState<{ cuidadorId: number; nombreCuidador: string } | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [userId, setUserId] = useState<number | null>(null);

  // Obtener el userId del cliente al montar
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const res = await authService.getMiRol();
        setUserId(res.userId);
      } catch {}
    };
    fetchUserId();
  }, []);

  // Abrir chat automáticamente cuando una solicitud está asignada o en progreso
  useEffect(() => {
    const asignada = solicitudes.find(s => (s.estado === 'Asignada' || s.estado === 'En Progreso') && s.cuidadorID && s.nombreCuidador);
    if (asignada && asignada.cuidadorID && asignada.nombreCuidador) {
      setCurrentChatCuidador({ cuidadorId: asignada.cuidadorID, nombreCuidador: asignada.nombreCuidador });
      setShowChatModal(true);
    } else {
      setShowChatModal(false);
    }
  }, [solicitudes]);

  // WebSocket para chat
  useEffect(() => {
    if (!showChatModal || !currentChatCuidador || !userId) return;
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
  }, [showChatModal, currentChatCuidador, userId]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !socket || !currentChatCuidador || !userId) return;
    const message = { ReceiverId: currentChatCuidador.cuidadorId, Content: newMessage };
    socket.send(JSON.stringify(message));
    setNewMessage('');
  };

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    loadSolicitudes();
    loadCuidadoresDisponibles();
  }, []);

  // Polling para actualizar automáticamente cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      loadSolicitudes();
      loadCuidadoresDisponibles();
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, []);

  const loadSolicitudes = async () => {
    try {
      const data = await solicitudService.getMisSolicitudes();
      setSolicitudes(data);
    } catch (error) {
      console.error('Error cargando solicitudes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCuidadoresDisponibles = async () => {
    try {
      const data = await solicitudService.getCuidadoresDisponibles();
      setCuidadoresDisponibles(data);
    } catch (error) {
      console.error('Error cargando cuidadores:', error);
    }
  };

  const handleSolicitudSuccess = () => {
    setShowSolicitudForm(false);
    loadSolicitudes();
  };

  const handleAsignarCuidador = async (cuidadorId: number) => {
    if (!selectedSolicitudId) return;

    setAsignandoCuidador(true);
    try {
      await solicitudService.asignarCuidador(selectedSolicitudId, cuidadorId);
      setShowCuidadoresModal(false);
      setSelectedSolicitudId(null);
      loadSolicitudes(); // Recargar solicitudes para ver el cambio
    } catch (error) {
      console.error('Error asignando cuidador:', error);
      alert('Error al asignar el cuidador. Inténtalo de nuevo.');
    } finally {
      setAsignandoCuidador(false);
    }
  };

  const openCuidadoresModal = (solicitudId: number) => {
    setSelectedSolicitudId(solicitudId);
    setShowCuidadoresModal(true);
  };

  const getEstadoBadge = (estado: string) => {
    const badges = {
      'Pendiente': 'bg-warning',
      'Asignada': 'bg-info',
      'Aceptada': 'bg-primary',
      'En Progreso': 'bg-success',
      'Finalizada': 'bg-secondary',
      'Cancelada': 'bg-danger',
      'Rechazada': 'bg-danger'
    };
    return badges[estado as keyof typeof badges] || 'bg-secondary';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStarRating = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <i
          key={i}
          className={`bi ${i <= rating ? 'bi-star-fill text-warning' : 'bi-star text-muted'}`}
        ></i>
      );
    }
    return <span className="star-rating">{stars}</span>;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h2 className="mb-0">
                <i className="bi bi-house-heart"></i> Mi Dashboard
              </h2>
              <button className="btn btn-outline-light" onClick={onLogout}>
                <i className="bi bi-box-arrow-right"></i> Cerrar Sesión
              </button>
            </div>
            <div className="card-body">
              <div className="row mb-4">
                <div className="col-md-3">
                  <div className="text-center">
                    <h3 className="text-primary">{solicitudes.length}</h3>
                    <small className="text-muted">Solicitudes Totales</small>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="text-center">
                    <h3 className="text-warning">
                      {solicitudes.filter(s => s.estado === 'Pendiente').length}
                    </h3>
                    <small className="text-muted">Pendientes</small>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="text-center">
                    <h3 className="text-success">
                      {solicitudes.filter(s => s.estado === 'Finalizada').length}
                    </h3>
                    <small className="text-muted">Finalizadas</small>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="text-center">
                    <h3 className="text-info">
                      {solicitudes.filter(s => s.estado === 'En Progreso').length}
                    </h3>
                    <small className="text-muted">En Progreso</small>
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4>Mis Solicitudes</h4>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowSolicitudForm(true)}
                >
                  <i className="bi bi-plus-circle"></i> Nueva Solicitud
                </button>
              </div>

              {solicitudes.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-inbox display-1 text-muted"></i>
                  <h5 className="mt-3 text-muted">No tienes solicitudes aún</h5>
                  <p className="text-muted">Crea tu primera solicitud para comenzar</p>
                </div>
              ) : (
                <div className="row">
                  {solicitudes.map((solicitud) => (
                    <div key={solicitud.solicitudID} className="col-md-6 col-lg-4 mb-3">
                      <div className="card h-100">
                        <div className={`card-header ${getEstadoBadge(solicitud.estado)} text-white`}>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="badge bg-light text-dark">
                              {solicitud.tipoServicio}
                            </span>
                            <span className="badge bg-white text-dark">
                              {solicitud.estado}
                            </span>
                          </div>
                        </div>
                        <div className="card-body">
                          <h6 className="card-title">{solicitud.descripcion}</h6>
                          <p className="card-text">
                            <small className="text-muted">
                              <i className="bi bi-calendar"></i> {formatDate(solicitud.fechaHoraInicio)}
                            </small>
                          </p>
                          <p className="card-text">
                            <small className="text-muted">
                              <i className="bi bi-clock"></i> {solicitud.duracionHoras} horas
                            </small>
                          </p>
                          <p className="card-text">
                            <small className="text-muted">
                              <i className="bi bi-geo-alt"></i> {solicitud.ubicacion}
                            </small>
                          </p>
                          
                          {solicitud.nombreCuidador && (
                            <div className="mt-2">
                              <small className="text-success">
                                <i className="bi bi-person-check"></i> Asignado a: {solicitud.nombreCuidador}
                              </small>
                            </div>
                          )}

                          {solicitud.nombreCuidador && solicitud.cuidadorID && !['Finalizada', 'Cancelada', 'Rechazada'].includes(solicitud.estado) && (
                            <button
                              className="btn btn-outline-primary btn-sm mt-2"
                              onClick={() => {
                                setCurrentChatCuidador({ cuidadorId: solicitud.cuidadorID!, nombreCuidador: solicitud.nombreCuidador! });
                                setShowChatModal(true);
                              }}
                            >
                              <i className="bi bi-chat-left-text"></i> Chat
                            </button>
                          )}
                          {solicitud.estado === 'Pendiente' && (
                            <button
                              className="btn btn-sm btn-outline-primary mt-2"
                              onClick={() => openCuidadoresModal(solicitud.solicitudID)}
                            >
                              <i className="bi bi-person-plus"></i> Elegir Cuidador
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Cuidadores Disponibles */}
      {showCuidadoresModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-people"></i> Cuidadores Disponibles
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowCuidadoresModal(false);
                    setSelectedSolicitudId(null);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                {cuidadoresDisponibles.length === 0 ? (
                  <div className="text-center py-4">
                    <i className="bi bi-people display-4 text-muted"></i>
                    <h6 className="mt-3 text-muted">No hay cuidadores disponibles</h6>
                  </div>
                ) : (
                  <div className="row">
                    {cuidadoresDisponibles.map((cuidador) => (
                      <div key={cuidador.cuidadorID} className="col-md-6 mb-3">
                        <div className="card">
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <h6 className="card-title mb-0">{cuidador.nombreUsuario}</h6>
                              {cuidador.documentoVerificado && (
                                <span className="badge bg-success">
                                  <i className="bi bi-check-circle"></i> Verificado
                                </span>
                              )}
                            </div>
                            
                            <p className="card-text">
                              <small className="text-muted">
                                <i className="bi bi-envelope"></i> {cuidador.emailUsuario}
                              </small>
                            </p>

                            {cuidador.biografia && (
                              <p className="card-text">
                                <small>{cuidador.biografia}</small>
                              </p>
                            )}

                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                {renderStarRating(cuidador.calificacionPromedio)}
                                <small className="text-muted ms-1">
                                  ({cuidador.calificacionPromedio.toFixed(1)})
                                </small>
                              </div>
                              {cuidador.tarifaPorHora && (
                                <span className="badge bg-info">
                                  ${cuidador.tarifaPorHora}/hora
                                </span>
                              )}
                            </div>

                            <button
                              className="btn btn-primary btn-sm w-100 mt-2"
                              onClick={() => handleAsignarCuidador(cuidador.cuidadorID)}
                              disabled={asignandoCuidador}
                            >
                              {asignandoCuidador ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-2"></span>
                                  Asignando...
                                </>
                              ) : (
                                <>
                                  <i className="bi bi-check-circle"></i> Elegir
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowCuidadoresModal(false);
                    setSelectedSolicitudId(null);
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Chat */}
      {showChatModal && currentChatCuidador && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="bi bi-chat-left-text me-2"></i>
                  Chat con {currentChatCuidador.nombreCuidador}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowChatModal(false)}></button>
              </div>
              <div className="modal-body p-0" style={{ height: '60vh' }}>
                <div className="d-flex flex-column h-100">
                  <div className="p-3 border-bottom bg-light">
                    <div className="d-flex align-items-center">
                      <div className="avatar me-2"><i className="bi bi-person-circle fs-3"></i></div>
                      <div>
                        <h6 className="mb-0">{currentChatCuidador.nombreCuidador}</h6>
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

      {/* Formulario de Nueva Solicitud */}
      {showSolicitudForm && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-plus-circle"></i> Nueva Solicitud
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowSolicitudForm(false)}
                ></button>
              </div>
              <div className="modal-body">
                <SolicitudForm
                  onSuccess={handleSolicitudSuccess}
                  onBack={() => setShowSolicitudForm(false)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClienteDashboard; 