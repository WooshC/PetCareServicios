using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PetCareServicios.Models.Calificaciones;
using PetCareServicios.Services.Interfaces;
using System.Security.Claims;

namespace PetCareServicios.Controllers
{
    /// <summary>
    /// Controlador para gestionar calificaciones y reseñas
    /// Solo los clientes pueden crear calificaciones para los cuidadores
    /// Requiere autenticación JWT para todas las operaciones
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CalificacionController : ControllerBase
    {
        private readonly ICalificacionService _calificacionService;

        public CalificacionController(ICalificacionService calificacionService)
        {
            _calificacionService = calificacionService;
        }

        // ===== OPERACIONES GENERALES =====

        /// <summary>
        /// Obtiene todas las calificaciones
        /// Requiere permisos de administrador
        /// </summary>
        /// <returns>Lista de todas las calificaciones</returns>
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<List<CalificacionResponse>>> GetAllCalificaciones()
        {
            var calificaciones = await _calificacionService.GetAllCalificacionesAsync();
            return Ok(calificaciones);
        }

        /// <summary>
        /// Obtiene una calificación específica por ID
        /// </summary>
        /// <param name="id">ID de la calificación</param>
        /// <returns>Datos de la calificación o NotFound si no existe</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<CalificacionResponse>> GetCalificacion(int id)
        {
            var calificacion = await _calificacionService.GetCalificacionByIdAsync(id);
            if (calificacion == null)
                return NotFound("Calificación no encontrada");

            return Ok(calificacion);
        }

        // ===== OPERACIONES PARA CUIDADORES =====

        /// <summary>
        /// Obtiene las calificaciones del cuidador autenticado
        /// FLUJO:
        /// 1. Extrae el ID del usuario del token JWT
        /// 2. Busca el perfil de cuidador asociado
        /// 3. Retorna las calificaciones del cuidador
        /// </summary>
        /// <returns>Lista de calificaciones del cuidador</returns>
        [HttpGet("mis-calificaciones")]
        [Authorize(Roles = "Cuidador")]
        public async Task<ActionResult<List<CalificacionResponse>>> GetMisCalificaciones()
        {
            var cuidadorId = GetCurrentCuidadorId();
            if (cuidadorId == null)
                return Unauthorized("No tienes un perfil de cuidador");

            var calificaciones = await _calificacionService.GetCalificacionesByCuidadorAsync(cuidadorId.Value);
            return Ok(calificaciones);
        }

        /// <summary>
        /// Obtiene el promedio de calificaciones del cuidador autenticado
        /// </summary>
        /// <returns>Promedio de calificaciones</returns>
        [HttpGet("mi-promedio")]
        [Authorize(Roles = "Cuidador")]
        public async Task<ActionResult<decimal>> GetMiPromedio()
        {
            var cuidadorId = GetCurrentCuidadorId();
            if (cuidadorId == null)
                return Unauthorized("No tienes un perfil de cuidador");

            var promedio = await _calificacionService.GetCalificacionPromedioByCuidadorAsync(cuidadorId.Value);
            return Ok(promedio);
        }

        /// <summary>
        /// Obtiene las calificaciones de un cuidador específico
        /// </summary>
        /// <param name="cuidadorId">ID del cuidador</param>
        /// <returns>Lista de calificaciones del cuidador</returns>
        [HttpGet("cuidador/{cuidadorId}")]
        public async Task<ActionResult<List<CalificacionResponse>>> GetCalificacionesByCuidador(int cuidadorId)
        {
            var calificaciones = await _calificacionService.GetCalificacionesByCuidadorAsync(cuidadorId);
            return Ok(calificaciones);
        }

        /// <summary>
        /// Obtiene el promedio de calificaciones de un cuidador específico
        /// </summary>
        /// <param name="cuidadorId">ID del cuidador</param>
        /// <returns>Promedio de calificaciones</returns>
        [HttpGet("cuidador/{cuidadorId}/promedio")]
        public async Task<ActionResult<decimal>> GetPromedioByCuidador(int cuidadorId)
        {
            var promedio = await _calificacionService.GetCalificacionPromedioByCuidadorAsync(cuidadorId);
            return Ok(promedio);
        }

        // ===== OPERACIONES PARA CLIENTES =====

        /// <summary>
        /// Obtiene las calificaciones realizadas por el cliente autenticado
        /// FLUJO:
        /// 1. Extrae el ID del usuario del token JWT
        /// 2. Busca el perfil de cliente asociado
        /// 3. Retorna las calificaciones realizadas por el cliente
        /// </summary>
        /// <returns>Lista de calificaciones realizadas</returns>
        [HttpGet("mis-resenas")]
        [Authorize(Roles = "Cliente")]
        public async Task<ActionResult<List<CalificacionResponse>>> GetMisResenas()
        {
            var clienteId = GetCurrentClienteId();
            if (clienteId == null)
                return Unauthorized("No tienes un perfil de cliente");

            var calificaciones = await _calificacionService.GetCalificacionesByClienteAsync(clienteId.Value);
            return Ok(calificaciones);
        }

        /// <summary>
        /// Crea una nueva calificación para un cuidador
        /// FLUJO:
        /// 1. Extrae el ID del usuario del token JWT
        /// 2. Busca el perfil de cliente asociado
        /// 3. Crea la calificación con los datos proporcionados
        /// 4. Retorna la calificación creada
        /// </summary>
        /// <param name="request">Datos de la calificación</param>
        /// <returns>Calificación creada</returns>
        [HttpPost]
        [Authorize(Roles = "Cliente")]
        public async Task<ActionResult<CalificacionResponse>> CreateCalificacion([FromBody] CalificacionRequest request)
        {
            try
            {
                var clienteId = GetCurrentClienteId();
                if (clienteId == null)
                    return Unauthorized("No tienes un perfil de cliente");

                // Asignar el cliente autenticado a la calificación
                request.ClienteID = clienteId.Value;

                var calificacion = await _calificacionService.CreateCalificacionAsync(request);
                return CreatedAtAction(nameof(GetCalificacion), new { id = calificacion.CalificacionID }, calificacion);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        /// <summary>
        /// Actualiza una calificación realizada por el cliente autenticado
        /// </summary>
        /// <param name="id">ID de la calificación</param>
        /// <param name="request">Datos actualizados</param>
        /// <returns>Calificación actualizada</returns>
        [HttpPut("{id}")]
        [Authorize(Roles = "Cliente")]
        public async Task<ActionResult<CalificacionResponse>> UpdateCalificacion(int id, [FromBody] CalificacionRequest request)
        {
            var clienteId = GetCurrentClienteId();
            if (clienteId == null)
                return Unauthorized("No tienes un perfil de cliente");

            // Verificar que la calificación pertenece al cliente
            var calificacionExistente = await _calificacionService.GetCalificacionByIdAsync(id);
            if (calificacionExistente == null || calificacionExistente.ClienteID != clienteId)
                return NotFound("Calificación no encontrada");

            // Asignar el cliente autenticado a la calificación
            request.ClienteID = clienteId.Value;

            var calificacion = await _calificacionService.UpdateCalificacionAsync(id, request);
            if (calificacion == null)
                return NotFound("Calificación no encontrada");

            return Ok(calificacion);
        }

        /// <summary>
        /// Elimina una calificación realizada por el cliente autenticado
        /// </summary>
        /// <param name="id">ID de la calificación</param>
        /// <returns>NoContent si se elimina exitosamente</returns>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Cliente")]
        public async Task<ActionResult> DeleteCalificacion(int id)
        {
            var clienteId = GetCurrentClienteId();
            if (clienteId == null)
                return Unauthorized("No tienes un perfil de cliente");

            var result = await _calificacionService.DeleteCalificacionAsync(id, clienteId.Value);
            if (!result)
                return NotFound("Calificación no encontrada");

            return NoContent();
        }

        // ===== OPERACIONES DE CONSULTA =====

        /// <summary>
        /// Obtiene calificaciones por puntuación mínima
        /// Requiere permisos de administrador
        /// </summary>
        /// <param name="puntuacionMinima">Puntuación mínima</param>
        /// <returns>Lista de calificaciones con la puntuación especificada o superior</returns>
        [HttpGet("por-puntuacion/{puntuacionMinima}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<List<CalificacionResponse>>> GetCalificacionesByPuntuacion(int puntuacionMinima)
        {
            var calificaciones = await _calificacionService.GetCalificacionesByPuntuacionAsync(puntuacionMinima);
            return Ok(calificaciones);
        }

        /// <summary>
        /// Obtiene calificaciones recientes
        /// Requiere permisos de administrador
        /// </summary>
        /// <param name="cantidad">Cantidad de calificaciones a obtener</param>
        /// <returns>Lista de calificaciones recientes</returns>
        [HttpGet("recientes")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<List<CalificacionResponse>>> GetCalificacionesRecientes([FromQuery] int cantidad = 10)
        {
            var calificaciones = await _calificacionService.GetCalificacionesRecientesAsync(cantidad);
            return Ok(calificaciones);
        }

        // ===== OPERACIONES ADMINISTRATIVAS =====

        /// <summary>
        /// Elimina una calificación (administrador)
        /// </summary>
        /// <param name="id">ID de la calificación</param>
        /// <returns>NoContent si se elimina exitosamente</returns>
        [HttpDelete("admin/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> DeleteCalificacionAdmin(int id)
        {
            var result = await _calificacionService.DeleteCalificacionAdminAsync(id);
            if (!result)
                return NotFound("Calificación no encontrada");

            return NoContent();
        }

        // ===== MÉTODOS AUXILIARES =====

        /// <summary>
        /// Obtiene el ID del cliente autenticado
        /// </summary>
        /// <returns>ID del cliente o null si no se puede obtener</returns>
        private int? GetCurrentClienteId()
        {
            // Este método debería obtener el ClienteID desde el perfil del usuario
            // Por ahora, usamos el UsuarioID como referencia
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                return null;

            // En una implementación real, aquí buscarías el ClienteID asociado al UsuarioID
            // Por simplicidad, asumimos que el UsuarioID es el ClienteID
            return userId;
        }

        /// <summary>
        /// Obtiene el ID del cuidador autenticado
        /// </summary>
        /// <returns>ID del cuidador o null si no se puede obtener</returns>
        private int? GetCurrentCuidadorId()
        {
            // Este método debería obtener el CuidadorID desde el perfil del usuario
            // Por ahora, usamos el UsuarioID como referencia
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                return null;

            // En una implementación real, aquí buscarías el CuidadorID asociado al UsuarioID
            // Por simplicidad, asumimos que el UsuarioID es el CuidadorID
            return userId;
        }
    }
} 