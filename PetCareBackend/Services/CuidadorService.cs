using Microsoft.EntityFrameworkCore;
using PetCareServicios.Data;
using PetCareServicios.Models.Auth;
using PetCareServicios.Services.Interfaces;

namespace PetCareServicios.Services
{
    public class CuidadorService : ICuidadorService
    {
        private readonly AppDbContext _context;

        public CuidadorService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<CuidadorResponse?> GetCuidadorByUsuarioIdAsync(int usuarioId)
        {
            var cuidador = await _context.Cuidadores
                .Include(c => c.Usuario)
                .FirstOrDefaultAsync(c => c.UsuarioID == usuarioId);

            return cuidador != null ? MapToResponse(cuidador) : null;
        }

        public async Task<CuidadorResponse?> GetCuidadorByIdAsync(int cuidadorId)
        {
            var cuidador = await _context.Cuidadores
                .Include(c => c.Usuario)
                .FirstOrDefaultAsync(c => c.CuidadorID == cuidadorId);

            return cuidador != null ? MapToResponse(cuidador) : null;
        }

        public async Task<List<CuidadorResponse>> GetAllCuidadoresAsync()
        {
            var cuidadores = await _context.Cuidadores
                .Include(c => c.Usuario)
                .ToListAsync();

            return cuidadores.Select(MapToResponse).ToList();
        }

        public async Task<CuidadorResponse> CreateCuidadorAsync(int usuarioId, CuidadorRequest request)
        {
            // Verificar que el usuario existe
            var usuario = await _context.Users.FindAsync(usuarioId);
            if (usuario == null)
                throw new ArgumentException("Usuario no encontrado");

            // Verificar que no existe ya un cuidador para este usuario
            var cuidadorExistente = await _context.Cuidadores
                .FirstOrDefaultAsync(c => c.UsuarioID == usuarioId);
            
            if (cuidadorExistente != null)
                throw new InvalidOperationException("Ya existe un perfil de cuidador para este usuario");

            var cuidador = new Cuidador
            {
                UsuarioID = usuarioId,
                DocumentoIdentidad = request.DocumentoIdentidad,
                TelefonoEmergencia = request.TelefonoEmergencia,
                Biografia = request.Biografia,
                Experiencia = request.Experiencia,
                HorarioAtencion = request.HorarioAtencion,
                TarifaPorHora = request.TarifaPorHora,
                FechaCreacion = DateTime.UtcNow
            };

            _context.Cuidadores.Add(cuidador);
            await _context.SaveChangesAsync();

            // Cargar el usuario para la respuesta
            await _context.Entry(cuidador).Reference(c => c.Usuario).LoadAsync();

            return MapToResponse(cuidador);
        }

        public async Task<CuidadorResponse?> UpdateCuidadorAsync(int cuidadorId, CuidadorRequest request)
        {
            var cuidador = await _context.Cuidadores.FindAsync(cuidadorId);
            if (cuidador == null)
                return null;

            cuidador.DocumentoIdentidad = request.DocumentoIdentidad;
            cuidador.TelefonoEmergencia = request.TelefonoEmergencia;
            cuidador.Biografia = request.Biografia;
            cuidador.Experiencia = request.Experiencia;
            cuidador.HorarioAtencion = request.HorarioAtencion;
            cuidador.TarifaPorHora = request.TarifaPorHora;

            await _context.SaveChangesAsync();

            // Cargar el usuario para la respuesta
            await _context.Entry(cuidador).Reference(c => c.Usuario).LoadAsync();

            return MapToResponse(cuidador);
        }

        public async Task<bool> DeleteCuidadorAsync(int cuidadorId)
        {
            var cuidador = await _context.Cuidadores.FindAsync(cuidadorId);
            if (cuidador == null)
                return false;

            _context.Cuidadores.Remove(cuidador);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> VerificarDocumentoAsync(int cuidadorId)
        {
            var cuidador = await _context.Cuidadores.FindAsync(cuidadorId);
            if (cuidador == null)
                return false;

            cuidador.DocumentoVerificado = true;
            cuidador.FechaVerificacion = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        private static CuidadorResponse MapToResponse(Cuidador cuidador)
        {
            return new CuidadorResponse
            {
                CuidadorID = cuidador.CuidadorID,
                UsuarioID = cuidador.UsuarioID,
                DocumentoIdentidad = cuidador.DocumentoIdentidad,
                TelefonoEmergencia = cuidador.TelefonoEmergencia,
                Biografia = cuidador.Biografia,
                Experiencia = cuidador.Experiencia,
                HorarioAtencion = cuidador.HorarioAtencion,
                TarifaPorHora = cuidador.TarifaPorHora,
                CalificacionPromedio = cuidador.CalificacionPromedio,
                DocumentoVerificado = cuidador.DocumentoVerificado,
                FechaVerificacion = cuidador.FechaVerificacion,
                FechaCreacion = cuidador.FechaCreacion,
                NombreUsuario = cuidador.Usuario?.Name ?? string.Empty,
                EmailUsuario = cuidador.Usuario?.Email ?? string.Empty
            };
        }
    }
} 