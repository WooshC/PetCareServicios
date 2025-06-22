using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PetCareServicios.Models.Solicitudes;
using PetCareServicios.Models.Auth;
using PetCareServicios.Services.Interfaces;
using System.Security.Claims;

namespace PetCareServicios.Controllers
{
    /// <summary>
    /// Controlador para gestionar solicitudes de servicios
    /// Maneja el flujo completo de solicitudes entre clientes y cuidadores
    /// Requiere autenticación JWT para todas las operaciones
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SolicitudController : ControllerBase
    {
        private readonly ISolicitudService _solicitudService;
        private readonly IClienteService _clienteService;
        private readonly ICuidadorService _cuidadorService;

        public SolicitudController(ISolicitudService solicitudService, IClienteService clienteService, ICuidadorService cuidadorService)
        {
            _solicitudService = solicitudService;
            _clienteService = clienteService;
            _cuidadorService = cuidadorService;
        }

        // ===== OPERACIONES GENERALES =====

        /// <summary>
        /// Obtiene todas las solicitudes
        /// Requiere permisos de administrador
        /// </summary>
        /// <returns>Lista de todas las solicitudes</returns>
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<List<SolicitudResponse>>> GetAllSolicitudes()
        {
            var solicitudes = await _solicitudService.GetAllSolicitudesAsync();
            return Ok(solicitudes);
        }

        /// <summary>
        /// Obtiene una solicitud específica por ID
        /// </summary>
        /// <param name="id">ID de la solicitud</param>
        /// <returns>Datos de la solicitud o NotFound si no existe</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<SolicitudResponse>> GetSolicitud(int id)
        {
            var solicitud = await _solicitudService.GetSolicitudByIdAsync(id);
            if (solicitud == null)
                return NotFound("Solicitud no encontrada");

            return Ok(solicitud);
        }

        // ===== OPERACIONES PARA CLIENTES =====

        /// <summary>
        /// Obtiene las solicitudes del cliente autenticado
        /// FLUJO:
        /// 1. Extrae el ID del usuario del token JWT
        /// 2. Busca el perfil de cliente asociado
        /// 3. Retorna las solicitudes del cliente
        /// </summary>
        /// <returns>Lista de solicitudes del cliente</returns>
        [HttpGet("mis-solicitudes")]
        [Authorize(Roles = "Cliente")]
        public async Task<ActionResult<List<SolicitudResponse>>> GetMisSolicitudes()
        {
            var clienteId = await GetCurrentClienteId();
            if (clienteId == null)
                return Unauthorized("No tienes un perfil de cliente");

            var solicitudes = await _solicitudService.GetSolicitudesByClienteAsync(clienteId.Value);
            return Ok(solicitudes);
        }

        /// <summary>
        /// Crea una nueva solicitud de servicio
        /// FLUJO:
        /// 1. Extrae el ID del usuario del token JWT
        /// 2. Busca el perfil de cliente asociado
        /// 3. Crea la solicitud con los datos proporcionados
        /// 4. Retorna la solicitud creada
        /// </summary>
        /// <param name="request">Datos de la solicitud</param>
        /// <returns>Solicitud creada</returns>
        [HttpPost]
        [Authorize(Roles = "Cliente")]
        public async Task<ActionResult<SolicitudResponse>> CreateSolicitud([FromBody] SolicitudRequest request)
        {
            var clienteId = await GetCurrentClienteId();
            if (clienteId == null)
                return Unauthorized("No tienes un perfil de cliente");

            // Asignar el cliente autenticado a la solicitud
            request.ClienteID = clienteId.Value;

            var solicitud = await _solicitudService.CreateSolicitudAsync(request);
            return CreatedAtAction(nameof(GetSolicitud), new { id = solicitud.SolicitudID }, solicitud);
        }

        /// <summary>
        /// Actualiza una solicitud del cliente autenticado
        /// Solo se pueden actualizar solicitudes en estado "Pendiente"
        /// </summary>
        /// <param name="id">ID de la solicitud</param>
        /// <param name="request">Datos actualizados</param>
        /// <returns>Solicitud actualizada</returns>
        [HttpPut("{id}")]
        [Authorize(Roles = "Cliente")]
        public async Task<ActionResult<SolicitudResponse>> UpdateSolicitud(int id, [FromBody] SolicitudRequest request)
        {
            var clienteId = await GetCurrentClienteId();
            if (clienteId == null)
                return Unauthorized("No tienes un perfil de cliente");

            // Verificar que la solicitud pertenece al cliente
            var solicitudExistente = await _solicitudService.GetSolicitudByIdAsync(id);
            if (solicitudExistente == null || solicitudExistente.ClienteID != clienteId)
                return NotFound("Solicitud no encontrada");

            if (solicitudExistente.Estado != "Pendiente")
                return BadRequest("Solo se pueden actualizar solicitudes pendientes");

            var solicitud = await _solicitudService.UpdateSolicitudAsync(id, request);
            return Ok(solicitud);
        }

        /// <summary>
        /// Cancela una solicitud del cliente autenticado
        /// Solo se pueden cancelar solicitudes en estado "Pendiente"
        /// </summary>
        /// <param name="id">ID de la solicitud</param>
        /// <returns>Solicitud cancelada</returns>
        [HttpPost("{id}/cancelar")]
        [Authorize(Roles = "Cliente")]
        public async Task<ActionResult<SolicitudResponse>> CancelarSolicitud(int id)
        {
            var clienteId = await GetCurrentClienteId();
            if (clienteId == null)
                return Unauthorized("No tienes un perfil de cliente");

            var solicitud = await _solicitudService.CancelarSolicitudAsync(id, clienteId.Value);
            if (solicitud == null)
                return NotFound("Solicitud no encontrada o no se puede cancelar");

            return Ok(solicitud);
        }

        /// <summary>
        /// Elimina una solicitud del cliente autenticado
        /// Solo se pueden eliminar solicitudes en estado "Pendiente"
        /// </summary>
        /// <param name="id">ID de la solicitud</param>
        /// <returns>NoContent si se elimina exitosamente</returns>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Cliente")]
        public async Task<ActionResult> DeleteSolicitud(int id)
        {
            var clienteId = await GetCurrentClienteId();
            if (clienteId == null)
                return Unauthorized("No tienes un perfil de cliente");

            var result = await _solicitudService.DeleteSolicitudAsync(id, clienteId.Value);
            if (!result)
                return NotFound("Solicitud no encontrada o no se puede eliminar");

            return NoContent();
        }

        /// <summary>
        /// Obtiene los cuidadores disponibles para una solicitud
        /// FLUJO:
        /// 1. Extrae el ID del usuario del token JWT
        /// 2. Busca el perfil de cliente asociado
        /// 3. Retorna la lista de cuidadores disponibles
        /// </summary>
        /// <returns>Lista de cuidadores disponibles</returns>
        [HttpGet("cuidadores-disponibles")]
        [Authorize(Roles = "Cliente")]
        public async Task<ActionResult<List<CuidadorResponse>>> GetCuidadoresDisponibles()
        {
            var clienteId = await GetCurrentClienteId();
            if (clienteId == null)
                return Unauthorized("No tienes un perfil de cliente");

            var cuidadores = await _solicitudService.GetCuidadoresDisponiblesAsync();
            return Ok(cuidadores);
        }

        /// <summary>
        /// Asigna un cuidador específico a una solicitud
        /// FLUJO:
        /// 1. Extrae el ID del usuario del token JWT
        /// 2. Busca el perfil de cliente asociado
        /// 3. Verifica que la solicitud pertenece al cliente
        /// 4. Asigna el cuidador a la solicitud
        /// 5. Cambia el estado a "Asignada"
        /// </summary>
        /// <param name="solicitudId">ID de la solicitud</param>
        /// <param name="request">ID del cuidador a asignar</param>
        /// <returns>Solicitud actualizada</returns>
        [HttpPost("{solicitudId}/asignar-cuidador")]
        [Authorize(Roles = "Cliente")]
        public async Task<ActionResult<SolicitudResponse>> AsignarCuidador(int solicitudId, [FromBody] AsignarCuidadorRequest request)
        {
            var clienteId = await GetCurrentClienteId();
            if (clienteId == null)
                return Unauthorized("No tienes un perfil de cliente");

            var solicitud = await _solicitudService.AsignarCuidadorAsync(solicitudId, clienteId.Value, request.CuidadorID);
            if (solicitud == null)
                return NotFound("Solicitud no encontrada o no se puede asignar el cuidador");

            return Ok(solicitud);
        }

        // ===== OPERACIONES PARA CUIDADORES =====

        /// <summary>
        /// Obtiene las solicitudes del cuidador autenticado
        /// FLUJO:
        /// 1. Extrae el ID del usuario del token JWT
        /// 2. Busca el perfil de cuidador asociado
        /// 3. Retorna las solicitudes del cuidador
        /// </summary>
        /// <returns>Lista de solicitudes del cuidador</returns>
        [HttpGet("mis-servicios")]
        [Authorize(Roles = "Cuidador")]
        public async Task<ActionResult<List<SolicitudResponse>>> GetMisServicios()
        {
            var cuidadorId = await GetCurrentCuidadorId();
            if (cuidadorId == null)
                return Unauthorized("No tienes un perfil de cuidador");

            var solicitudes = await _solicitudService.GetSolicitudesByCuidadorAsync(cuidadorId.Value);
            return Ok(solicitudes);
        }

        /// <summary>
        /// Obtiene las solicitudes pendientes asignadas al cuidador autenticado
        /// FLUJO:
        /// 1. Extrae el ID del usuario del token JWT
        /// 2. Busca el perfil de cuidador asociado
        /// 3. Retorna las solicitudes pendientes asignadas al cuidador
        /// </summary>
        /// <returns>Lista de solicitudes pendientes asignadas</returns>
        [HttpGet("mis-pendientes")]
        [Authorize(Roles = "Cuidador")]
        public async Task<ActionResult<List<SolicitudResponse>>> GetMisSolicitudesPendientes()
        {
            var cuidadorId = await GetCurrentCuidadorId();
            if (cuidadorId == null)
                return Unauthorized("No tienes un perfil de cuidador");

            var solicitudes = await _solicitudService.GetSolicitudesPendientesByCuidadorAsync(cuidadorId.Value);
            return Ok(solicitudes);
        }

        /// <summary>
        /// Acepta una solicitud pendiente
        /// FLUJO:
        /// 1. Extrae el ID del usuario del token JWT
        /// 2. Busca el perfil de cuidador asociado
        /// 3. Acepta la solicitud asignándola al cuidador
        /// </summary>
        /// <param name="id">ID de la solicitud</param>
        /// <returns>Solicitud aceptada</returns>
        [HttpPost("{id}/aceptar")]
        [Authorize(Roles = "Cuidador")]
        public async Task<ActionResult<SolicitudResponse>> AceptarSolicitud(int id)
        {
            var cuidadorId = await GetCurrentCuidadorId();
            if (cuidadorId == null)
                return Unauthorized("No tienes un perfil de cuidador");

            var solicitud = await _solicitudService.AceptarSolicitudAsync(id, cuidadorId.Value);
            if (solicitud == null)
                return NotFound("Solicitud no encontrada o no está pendiente");

            return Ok(solicitud);
        }

        /// <summary>
        /// Rechaza una solicitud aceptada
        /// </summary>
        /// <param name="id">ID de la solicitud</param>
        /// <returns>Solicitud rechazada</returns>
        [HttpPost("{id}/rechazar")]
        [Authorize(Roles = "Cuidador")]
        public async Task<ActionResult<SolicitudResponse>> RechazarSolicitud(int id)
        {
            var cuidadorId = await GetCurrentCuidadorId();
            if (cuidadorId == null)
                return Unauthorized("No tienes un perfil de cuidador");

            var solicitud = await _solicitudService.RechazarSolicitudAsync(id, cuidadorId.Value);
            if (solicitud == null)
                return NotFound("Solicitud no encontrada");

            return Ok(solicitud);
        }

        /// <summary>
        /// Inicia un servicio aceptado
        /// </summary>
        /// <param name="id">ID de la solicitud</param>
        /// <returns>Solicitud iniciada</returns>
        [HttpPost("{id}/iniciar")]
        [Authorize(Roles = "Cuidador")]
        public async Task<ActionResult<SolicitudResponse>> IniciarServicio(int id)
        {
            var cuidadorId = await GetCurrentCuidadorId();
            if (cuidadorId == null)
                return Unauthorized("No tienes un perfil de cuidador");

            var solicitud = await _solicitudService.IniciarServicioAsync(id, cuidadorId.Value);
            if (solicitud == null)
                return NotFound("Solicitud no encontrada o no está aceptada");

            return Ok(solicitud);
        }

        /// <summary>
        /// Finaliza un servicio en progreso
        /// </summary>
        /// <param name="id">ID de la solicitud</param>
        /// <returns>Solicitud finalizada</returns>
        [HttpPost("{id}/finalizar")]
        [Authorize(Roles = "Cuidador")]
        public async Task<ActionResult<SolicitudResponse>> FinalizarServicio(int id)
        {
            var cuidadorId = await GetCurrentCuidadorId();
            if (cuidadorId == null)
                return Unauthorized("No tienes un perfil de cuidador");

            var solicitud = await _solicitudService.FinalizarServicioAsync(id, cuidadorId.Value);
            if (solicitud == null)
                return NotFound("Solicitud no encontrada o no está en progreso");

            return Ok(solicitud);
        }

        // ===== OPERACIONES DE CONSULTA =====

        /// <summary>
        /// Obtiene solicitudes por estado
        /// Requiere permisos de administrador
        /// </summary>
        /// <param name="estado">Estado de las solicitudes</param>
        /// <returns>Lista de solicitudes con el estado especificado</returns>
        [HttpGet("por-estado/{estado}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<List<SolicitudResponse>>> GetSolicitudesByEstado(string estado)
        {
            var solicitudes = await _solicitudService.GetSolicitudesByEstadoAsync(estado);
            return Ok(solicitudes);
        }

        /// <summary>
        /// Obtiene solicitudes por tipo de servicio
        /// Requiere permisos de administrador
        /// </summary>
        /// <param name="tipoServicio">Tipo de servicio</param>
        /// <returns>Lista de solicitudes del tipo especificado</returns>
        [HttpGet("por-tipo/{tipoServicio}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<List<SolicitudResponse>>> GetSolicitudesByTipo(string tipoServicio)
        {
            var solicitudes = await _solicitudService.GetSolicitudesByTipoServicioAsync(tipoServicio);
            return Ok(solicitudes);
        }

        /// <summary>
        /// Obtiene solicitudes recientes
        /// Requiere permisos de administrador
        /// </summary>
        /// <param name="cantidad">Cantidad de solicitudes a obtener</param>
        /// <returns>Lista de solicitudes recientes</returns>
        [HttpGet("recientes")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<List<SolicitudResponse>>> GetSolicitudesRecientes([FromQuery] int cantidad = 10)
        {
            var solicitudes = await _solicitudService.GetSolicitudesRecientesAsync(cantidad);
            return Ok(solicitudes);
        }

        // ===== OPERACIONES ADMINISTRATIVAS =====

        /// <summary>
        /// Elimina una solicitud (administrador)
        /// </summary>
        /// <param name="id">ID de la solicitud</param>
        /// <returns>NoContent si se elimina exitosamente</returns>
        [HttpDelete("admin/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> DeleteSolicitudAdmin(int id)
        {
            var result = await _solicitudService.DeleteSolicitudAdminAsync(id);
            if (!result)
                return NotFound("Solicitud no encontrada");

            return NoContent();
        }

        /// <summary>
        /// Cambia el estado de una solicitud (administrador)
        /// </summary>
        /// <param name="id">ID de la solicitud</param>
        /// <param name="request">Nuevo estado</param>
        /// <returns>Solicitud actualizada</returns>
        [HttpPut("admin/{id}/estado")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<SolicitudResponse>> CambiarEstado(int id, [FromBody] SolicitudEstadoRequest request)
        {
            var solicitud = await _solicitudService.CambiarEstadoAsync(id, request.Estado);
            if (solicitud == null)
                return NotFound("Solicitud no encontrada");

            return Ok(solicitud);
        }

        // ===== MÉTODOS AUXILIARES =====

        /// <summary>
        /// Obtiene el ID del cliente autenticado
        /// </summary>
        /// <returns>ID del cliente o null si no se puede obtener</returns>
        private async Task<int?> GetCurrentClienteId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                return null;

            // Buscar el perfil de cliente asociado al usuario
            var cliente = await _clienteService.GetClienteByUsuarioIdAsync(userId);
            return cliente?.ClienteID;
        }

        /// <summary>
        /// Obtiene el ID del cuidador autenticado
        /// </summary>
        /// <returns>ID del cuidador o null si no se puede obtener</returns>
        private async Task<int?> GetCurrentCuidadorId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                return null;

            // Buscar el perfil de cuidador asociado al usuario
            var cuidador = await _cuidadorService.GetCuidadorByUsuarioIdAsync(userId);
            return cuidador?.CuidadorID;
        }
    }
} 