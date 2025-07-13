using Microsoft.EntityFrameworkCore;
using PetCareServicios.Data;
using PetCareServicios.Models.Mensajes;
using PetCareServicios.Services.Interfaces;

namespace PetCareServicios.Services
{
    public class MensajeService : IMensajeService
    {
        private readonly MensajesDbContext _context;
        private readonly ILogger<MensajeService> _logger;

        public MensajeService(MensajesDbContext context, ILogger<MensajeService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<Mensaje> CrearMensajeAsync(int solicitudId, int remitenteId, string contenido, string tipoMensaje = "Texto")
        {
            try
            {
                var mensaje = new Mensaje
                {
                    SolicitudID = solicitudId,
                    RemitenteID = remitenteId,
                    Contenido = contenido,
                    TipoMensaje = tipoMensaje,
                    Timestamp = DateTime.UtcNow,
                    EsLeido = false,
                    FechaCreacion = DateTime.UtcNow
                };

                _context.Mensajes.Add(mensaje);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Mensaje creado: ID={mensaje.MensajeID}, SolicitudID={solicitudId}, RemitenteID={remitenteId}");

                return mensaje;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al crear mensaje para solicitud {solicitudId}");
                throw;
            }
        }

        public async Task<List<Mensaje>> ObtenerMensajesPorSolicitudAsync(int solicitudId)
        {
            try
            {
                var mensajes = await _context.Mensajes
                    .Where(m => m.SolicitudID == solicitudId)
                    .OrderBy(m => m.Timestamp)
                    .ToListAsync();

                _logger.LogInformation($"Obtenidos {mensajes.Count} mensajes para solicitud {solicitudId}");

                return mensajes;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al obtener mensajes para solicitud {solicitudId}");
                throw;
            }
        }

        public async Task<List<Mensaje>> ObtenerMensajesNoLeidosAsync(int solicitudId, int usuarioId)
        {
            try
            {
                var mensajes = await _context.Mensajes
                    .Where(m => m.SolicitudID == solicitudId && 
                               m.RemitenteID != usuarioId && 
                               !m.EsLeido)
                    .OrderBy(m => m.Timestamp)
                    .ToListAsync();

                return mensajes;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al obtener mensajes no leídos para solicitud {solicitudId}");
                throw;
            }
        }

        public async Task MarcarMensajesComoLeidosAsync(int solicitudId, int usuarioId)
        {
            try
            {
                var mensajesNoLeidos = await _context.Mensajes
                    .Where(m => m.SolicitudID == solicitudId && 
                               m.RemitenteID != usuarioId && 
                               !m.EsLeido)
                    .ToListAsync();

                foreach (var mensaje in mensajesNoLeidos)
                {
                    mensaje.EsLeido = true;
                    mensaje.FechaLectura = DateTime.UtcNow;
                    mensaje.FechaActualizacion = DateTime.UtcNow;
                }

                await _context.SaveChangesAsync();

                _logger.LogInformation($"Marcados {mensajesNoLeidos.Count} mensajes como leídos para solicitud {solicitudId}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al marcar mensajes como leídos para solicitud {solicitudId}");
                throw;
            }
        }

        public async Task<int> ObtenerCantidadMensajesNoLeidosAsync(int solicitudId, int usuarioId)
        {
            try
            {
                var cantidad = await _context.Mensajes
                    .CountAsync(m => m.SolicitudID == solicitudId && 
                                    m.RemitenteID != usuarioId && 
                                    !m.EsLeido);

                return cantidad;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al obtener cantidad de mensajes no leídos para solicitud {solicitudId}");
                throw;
            }
        }

        public async Task<bool> EliminarMensajeAsync(int mensajeId, int usuarioId)
        {
            try
            {
                var mensaje = await _context.Mensajes.FindAsync(mensajeId);
                
                if (mensaje == null)
                {
                    _logger.LogWarning($"Mensaje {mensajeId} no encontrado");
                    return false;
                }

                // Solo el remitente puede eliminar su mensaje
                if (mensaje.RemitenteID != usuarioId)
                {
                    _logger.LogWarning($"Usuario {usuarioId} intentó eliminar mensaje {mensajeId} que no le pertenece");
                    return false;
                }

                _context.Mensajes.Remove(mensaje);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Mensaje {mensajeId} eliminado por usuario {usuarioId}");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al eliminar mensaje {mensajeId}");
                throw;
            }
        }
    }
} 