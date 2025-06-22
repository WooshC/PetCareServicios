using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PetCareServicios.Models.Auth;
using PetCareServicios.Services.Interfaces;
using System.Security.Claims;

namespace PetCareServicios.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CuidadorController : ControllerBase
    {
        private readonly ICuidadorService _cuidadorService;

        public CuidadorController(ICuidadorService cuidadorService)
        {
            _cuidadorService = cuidadorService;
        }

        [HttpGet]
        public async Task<ActionResult<List<CuidadorResponse>>> GetAllCuidadores()
        {
            var cuidadores = await _cuidadorService.GetAllCuidadoresAsync();
            return Ok(cuidadores);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<CuidadorResponse>> GetCuidador(int id)
        {
            var cuidador = await _cuidadorService.GetCuidadorByIdAsync(id);
            if (cuidador == null)
                return NotFound("Cuidador no encontrado");

            return Ok(cuidador);
        }

        [HttpGet("mi-perfil")]
        public async Task<ActionResult<CuidadorResponse>> GetMiPerfil()
        {
            var usuarioId = GetCurrentUserId();
            if (usuarioId == null)
                return Unauthorized();

            var cuidador = await _cuidadorService.GetCuidadorByUsuarioIdAsync(usuarioId.Value);
            if (cuidador == null)
                return NotFound("No tienes un perfil de cuidador");

            return Ok(cuidador);
        }

        [HttpPost]
        public async Task<ActionResult<CuidadorResponse>> CreateCuidador([FromBody] CuidadorRequest request)
        {
            try
            {
                var usuarioId = GetCurrentUserId();
                if (usuarioId == null)
                    return Unauthorized();

                var cuidador = await _cuidadorService.CreateCuidadorAsync(usuarioId.Value, request);
                return CreatedAtAction(nameof(GetCuidador), new { id = cuidador.CuidadorID }, cuidador);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message);
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<CuidadorResponse>> UpdateCuidador(int id, [FromBody] CuidadorRequest request)
        {
            var cuidador = await _cuidadorService.UpdateCuidadorAsync(id, request);
            if (cuidador == null)
                return NotFound("Cuidador no encontrado");

            return Ok(cuidador);
        }

        [HttpPut("mi-perfil")]
        public async Task<ActionResult<CuidadorResponse>> UpdateMiPerfil([FromBody] CuidadorRequest request)
        {
            var usuarioId = GetCurrentUserId();
            if (usuarioId == null)
                return Unauthorized();

            var miCuidador = await _cuidadorService.GetCuidadorByUsuarioIdAsync(usuarioId.Value);
            if (miCuidador == null)
                return NotFound("No tienes un perfil de cuidador");

            var cuidador = await _cuidadorService.UpdateCuidadorAsync(miCuidador.CuidadorID, request);
            return Ok(cuidador);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")] // Solo administradores pueden eliminar
        public async Task<ActionResult> DeleteCuidador(int id)
        {
            var result = await _cuidadorService.DeleteCuidadorAsync(id);
            if (!result)
                return NotFound("Cuidador no encontrado");

            return NoContent();
        }

        [HttpPost("{id}/verificar")]
        [Authorize(Roles = "Admin")] // Solo administradores pueden verificar
        public async Task<ActionResult> VerificarDocumento(int id)
        {
            var result = await _cuidadorService.VerificarDocumentoAsync(id);
            if (!result)
                return NotFound("Cuidador no encontrado");

            return Ok(new { message = "Documento verificado exitosamente" });
        }

        private int? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                return null;

            return userId;
        }
    }
} 