using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PetCareServicios.Models.Clientes;
using PetCareServicios.Services.Interfaces;
using System.Security.Claims;

namespace PetCareServicios.Controllers
{
    /// <summary>
    /// Controlador para gestionar perfiles de clientes
    /// Maneja CRUD de clientes y operaciones específicas como verificación
    /// Requiere autenticación JWT para todas las operaciones
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ClienteController : ControllerBase
    {
        private readonly IClienteService _clienteService;

        public ClienteController(IClienteService clienteService)
        {
            _clienteService = clienteService;
        }

        /// <summary>
        /// Obtiene todos los clientes registrados
        /// Requiere permisos de administrador
        /// </summary>
        /// <returns>Lista de todos los clientes</returns>
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<List<ClienteResponse>>> GetAllClientes()
        {
            var clientes = await _clienteService.GetAllClientesAsync();
            return Ok(clientes);
        }

        /// <summary>
        /// Obtiene un cliente específico por ID
        /// Requiere permisos de administrador
        /// </summary>
        /// <param name="id">ID del cliente</param>
        /// <returns>Datos del cliente o NotFound si no existe</returns>
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ClienteResponse>> GetCliente(int id)
        {
            var cliente = await _clienteService.GetClienteByIdAsync(id);
            if (cliente == null)
                return NotFound("Cliente no encontrado");

            return Ok(cliente);
        }

        /// <summary>
        /// Obtiene el perfil del cliente autenticado
        /// FLUJO:
        /// 1. Extrae el ID del usuario del token JWT
        /// 2. Busca el perfil de cliente asociado
        /// 3. Retorna los datos del perfil
        /// </summary>
        /// <returns>Perfil del cliente autenticado</returns>
        [HttpGet("mi-perfil")]
        public async Task<ActionResult<ClienteResponse>> GetMiPerfil()
        {
            // Extraer ID del usuario del token JWT
            var usuarioId = GetCurrentUserId();
            if (usuarioId == null)
                return Unauthorized();

            // Buscar perfil de cliente asociado al usuario
            var cliente = await _clienteService.GetClienteByUsuarioIdAsync(usuarioId.Value);
            if (cliente == null)
                return NotFound("No tienes un perfil de cliente");

            return Ok(cliente);
        }

        /// <summary>
        /// Crea un nuevo perfil de cliente para el usuario autenticado
        /// FLUJO:
        /// 1. Extrae el ID del usuario del token JWT
        /// 2. Valida que no exista ya un perfil
        /// 3. Crea el perfil con los datos proporcionados
        /// 4. Retorna el perfil creado
        /// </summary>
        /// <param name="request">Datos del perfil de cliente</param>
        /// <returns>Perfil creado o error si ya existe</returns>
        [HttpPost]
        public async Task<ActionResult<ClienteResponse>> CreateCliente([FromBody] ClienteRequest request)
        {
            try
            {
                // Extraer ID del usuario del token JWT
                var usuarioId = GetCurrentUserId();
                if (usuarioId == null)
                    return Unauthorized();

                // Crear perfil de cliente
                var cliente = await _clienteService.CreateClienteAsync(usuarioId.Value, request);
                return CreatedAtAction(nameof(GetCliente), new { id = cliente.ClienteID }, cliente);
            }
            catch (ArgumentException ex)
            {
                // Error de validación (usuario no encontrado, etc.)
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                // Error de conflicto (ya existe perfil)
                return Conflict(ex.Message);
            }
        }

        /// <summary>
        /// Actualiza un perfil de cliente específico
        /// Requiere permisos de administrador
        /// </summary>
        /// <param name="id">ID del cliente</param>
        /// <param name="request">Datos actualizados</param>
        /// <returns>Perfil actualizado o NotFound si no existe</returns>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ClienteResponse>> UpdateCliente(int id, [FromBody] ClienteRequest request)
        {
            var cliente = await _clienteService.UpdateClienteAsync(id, request);
            if (cliente == null)
                return NotFound("Cliente no encontrado");

            return Ok(cliente);
        }

        /// <summary>
        /// Actualiza el perfil del cliente autenticado
        /// FLUJO:
        /// 1. Extrae el ID del usuario del token JWT
        /// 2. Busca el perfil asociado
        /// 3. Actualiza con los nuevos datos
        /// 4. Retorna el perfil actualizado
        /// </summary>
        /// <param name="request">Datos actualizados del perfil</param>
        /// <returns>Perfil actualizado</returns>
        [HttpPut("mi-perfil")]
        public async Task<ActionResult<ClienteResponse>> UpdateMiPerfil([FromBody] ClienteRequest request)
        {
            // Extraer ID del usuario del token JWT
            var usuarioId = GetCurrentUserId();
            if (usuarioId == null)
                return Unauthorized();

            // Buscar perfil del usuario
            var miCliente = await _clienteService.GetClienteByUsuarioIdAsync(usuarioId.Value);
            if (miCliente == null)
                return NotFound("No tienes un perfil de cliente");

            // Actualizar perfil
            var cliente = await _clienteService.UpdateClienteAsync(miCliente.ClienteID, request);
            return Ok(cliente);
        }

        /// <summary>
        /// Elimina un perfil de cliente
        /// Requiere permisos de administrador
        /// </summary>
        /// <param name="id">ID del cliente a eliminar</param>
        /// <returns>NoContent si se elimina exitosamente</returns>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> DeleteCliente(int id)
        {
            var result = await _clienteService.DeleteClienteAsync(id);
            if (!result)
                return NotFound("Cliente no encontrado");

            return NoContent();
        }

        /// <summary>
        /// Marca el documento de un cliente como verificado
        /// Requiere permisos de administrador
        /// FLUJO:
        /// 1. Busca el cliente por ID
        /// 2. Marca el documento como verificado
        /// 3. Actualiza la fecha de verificación
        /// </summary>
        /// <param name="id">ID del cliente</param>
        /// <returns>Mensaje de confirmación</returns>
        [HttpPost("{id}/verificar")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> VerificarDocumento(int id)
        {
            var result = await _clienteService.VerificarDocumentoAsync(id);
            if (!result)
                return NotFound("Cliente no encontrado");

            return Ok(new { message = "Documento verificado exitosamente" });
        }

        /// <summary>
        /// Extrae el ID del usuario del token JWT actual
        /// Método auxiliar para obtener la identidad del usuario autenticado
        /// </summary>
        /// <returns>ID del usuario o null si no se puede extraer</returns>
        private int? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                return null;

            return userId;
        }
    }
} 