import React, { useState, useEffect, useRef } from 'react';
import { mensajeService } from '../services/api';

interface Mensaje {
  mensajeID: number;
  solicitudID: number;
  remitenteID: number;
  contenido: string;
  timestamp: string;
  esLeido: boolean;
  fechaLectura?: string;
  tipoMensaje: string;
}

interface ChatComponentProps {
  solicitudId: number;
  currentUserId: number;
  onClose: () => void;
}

const ChatComponent: React.FC<ChatComponentProps> = ({ solicitudId, currentUserId, onClose }) => {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Cargar mensajes al montar el componente
  useEffect(() => {
    cargarMensajes();
    // Marcar mensajes como leídos cuando se abre el chat
    marcarComoLeidos();
  }, [solicitudId]);

  // Auto-scroll al último mensaje
  useEffect(() => {
    scrollToBottom();
  }, [mensajes]);

  const cargarMensajes = async () => {
    try {
      setLoading(true);
      setError(null);
      const mensajesData = await mensajeService.getMensajesPorSolicitud(solicitudId);
      setMensajes(mensajesData);
    } catch (err) {
      setError('Error al cargar los mensajes');
      console.error('Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const marcarComoLeidos = async () => {
    try {
      await mensajeService.marcarMensajesComoLeidos(solicitudId);
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  };

  const enviarMensaje = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoMensaje.trim()) return;

    try {
      setLoading(true);
      // El mensaje se enviará a través de SignalR, pero también podemos guardarlo aquí
      // Por ahora, solo simulamos el envío
      const mensajeTemporal: Mensaje = {
        mensajeID: Date.now(), // ID temporal
        solicitudID: solicitudId,
        remitenteID: currentUserId,
        contenido: nuevoMensaje,
        timestamp: new Date().toISOString(),
        esLeido: false,
        tipoMensaje: 'Texto'
      };

      setMensajes(prev => [...prev, mensajeTemporal]);
      setNuevoMensaje('');
    } catch (err) {
      setError('Error al enviar el mensaje');
      console.error('Error sending message:', err);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatearFecha = (timestamp: string) => {
    const fecha = new Date(timestamp);
    return fecha.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const esMiMensaje = (remitenteId: number) => {
    return remitenteId === currentUserId;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-3/4 flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
          <h3 className="text-lg font-semibold">Chat - Solicitud #{solicitudId}</h3>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading && mensajes.length === 0 ? (
            <div className="text-center text-gray-500">Cargando mensajes...</div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : mensajes.length === 0 ? (
            <div className="text-center text-gray-500">No hay mensajes aún</div>
          ) : (
            mensajes.map((mensaje) => (
              <div
                key={mensaje.mensajeID}
                className={`flex ${esMiMensaje(mensaje.remitenteID) ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    esMiMensaje(mensaje.remitenteID)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  <div className="text-sm">{mensaje.contenido}</div>
                  <div
                    className={`text-xs mt-1 ${
                      esMiMensaje(mensaje.remitenteID)
                        ? 'text-blue-100'
                        : 'text-gray-500'
                    }`}
                  >
                    {formatearFecha(mensaje.timestamp)}
                    {mensaje.esLeido && (
                      <span className="ml-2">✓✓</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Formulario de envío */}
        <form onSubmit={enviarMensaje} className="p-4 border-t">
          <div className="flex space-x-2">
            <input
              type="text"
              value={nuevoMensaje}
              onChange={(e) => setNuevoMensaje(e.target.value)}
              placeholder="Escribe tu mensaje..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !nuevoMensaje.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Enviando...' : 'Enviar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatComponent; 