using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PetCareServicios.Models.Mensajes;
using PetCareServicios.Services.Interfaces;
using System.Security.Claims;

namespace PetCareServicios.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class MensajeController : ControllerBase
    {
        private readonly IMensajeService _mensajeService;
        private readonly ILogger<MensajeController> _logger;

        public MensajeController(IMensajeService mensajeService, ILogger<MensajeController> logger)
        {
            _mensajeService = mensajeService;
            _logger = logger;
        }

        /// <summary>
        /// Obtener todos los mensajes de una solicitud
        /// </summary>
        [HttpGet("solicitud/{solicitudId}")]
        public async Task<ActionResult<List<Mensaje>>> ObtenerMensajesPorSolicitud(int solicitudId)
        {
            try
            {
                var mensajes = await _mensajeService.ObtenerMensajesPorSolicitudAsync(solicitudId);
                return Ok(mensajes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al obtener mensajes para solicitud {solicitudId}");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Obtener mensajes no leídos de una solicitud
        /// </summary>
        [HttpGet("solicitud/{solicitudId}/no-leidos")]
        public async Task<ActionResult<List<Mensaje>>> ObtenerMensajesNoLeidos(int solicitudId)
        {
            try
            {
                var usuarioId = GetCurrentUserId();
                if (!usuarioId.HasValue)
                {
                    return Unauthorized();
                }

                var mensajes = await _mensajeService.ObtenerMensajesNoLeidosAsync(solicitudId, usuarioId.Value);
                return Ok(mensajes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al obtener mensajes no leídos para solicitud {solicitudId}");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Obtener cantidad de mensajes no leídos
        /// </summary>
        [HttpGet("solicitud/{solicitudId}/cantidad-no-leidos")]
        public async Task<ActionResult<int>> ObtenerCantidadMensajesNoLeidos(int solicitudId)
        {
            try
            {
                var usuarioId = GetCurrentUserId();
                if (!usuarioId.HasValue)
                {
                    return Unauthorized();
                }

                var cantidad = await _mensajeService.ObtenerCantidadMensajesNoLeidosAsync(solicitudId, usuarioId.Value);
                return Ok(cantidad);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al obtener cantidad de mensajes no leídos para solicitud {solicitudId}");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Marcar mensajes como leídos
        /// </summary>
        [HttpPost("solicitud/{solicitudId}/marcar-leidos")]
        public async Task<ActionResult> MarcarMensajesComoLeidos(int solicitudId)
        {
            try
            {
                var usuarioId = GetCurrentUserId();
                if (!usuarioId.HasValue)
                {
                    return Unauthorized();
                }

                await _mensajeService.MarcarMensajesComoLeidosAsync(solicitudId, usuarioId.Value);
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al marcar mensajes como leídos para solicitud {solicitudId}");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Eliminar un mensaje
        /// </summary>
        [HttpDelete("{mensajeId}")]
        public async Task<ActionResult> EliminarMensaje(int mensajeId)
        {
            try
            {
                var usuarioId = GetCurrentUserId();
                if (!usuarioId.HasValue)
                {
                    return Unauthorized();
                }

                var resultado = await _mensajeService.EliminarMensajeAsync(mensajeId, usuarioId.Value);
                
                if (!resultado)
                {
                    return NotFound("Mensaje no encontrado o no tienes permisos para eliminarlo");
                }

                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al eliminar mensaje {mensajeId}");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Obtener el ID del usuario actual desde el token JWT
        /// </summary>
        private int? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                return null;

            return userId;
        }
    }
} 