using Microsoft.EntityFrameworkCore;
using PetCareServicios.Data;
using PetCareServicios.Models.Auth;
using PetCareServicios.Models.Cuidadores;
using PetCareServicios.Services.Interfaces;

namespace PetCareServicios.Services
{
    /// <summary>
    /// Servicio para la gestión de cuidadores usando la nueva base de datos separada
    /// </summary>
    public class CuidadorService : ICuidadorService
    {
        private readonly CuidadoresDbContext _cuidadoresContext;
        private readonly AppDbContext _authContext;

        public CuidadorService(CuidadoresDbContext cuidadoresContext, AppDbContext authContext)
        {
            _cuidadoresContext = cuidadoresContext;
            _authContext = authContext;
        }

        /// <summary>
        /// Obtiene un cuidador por su ID de usuario
        /// </summary>
        public async Task<CuidadorResponse?> GetCuidadorByUsuarioIdAsync(int usuarioId)
        {
            var cuidador = await _cuidadoresContext.Cuidadores
                .FirstOrDefaultAsync(c => c.UsuarioID == usuarioId);

            if (cuidador == null)
                return null;

            // Obtener información del usuario desde la base de datos de autenticación
            var usuario = await _authContext.Users.FindAsync(usuarioId);
            
            return MapToResponse(cuidador, usuario);
        }

        /// <summary>
        /// Obtiene un cuidador por su ID
        /// </summary>
        public async Task<CuidadorResponse?> GetCuidadorByIdAsync(int cuidadorId)
        {
            var cuidador = await _cuidadoresContext.Cuidadores
                .FirstOrDefaultAsync(c => c.CuidadorID == cuidadorId);

            if (cuidador == null)
                return null;

            // Obtener información del usuario desde la base de datos de autenticación
            var usuario = await _authContext.Users.FindAsync(cuidador.UsuarioID);
            
            return MapToResponse(cuidador, usuario);
        }

        /// <summary>
        /// Obtiene todos los cuidadores activos
        /// </summary>
        public async Task<List<CuidadorResponse>> GetAllCuidadoresAsync()
        {
            var cuidadores = await _cuidadoresContext.Cuidadores
                .Where(c => c.Estado == "Activo")
                .ToListAsync();

            // Obtener todos los usuarios correspondientes
            var usuarioIds = cuidadores.Select(c => c.UsuarioID).ToList();
            var usuarios = await _authContext.Users
                .Where(u => usuarioIds.Contains(u.Id))
                .ToDictionaryAsync(u => u.Id, u => u);

            return cuidadores.Select(c => MapToResponse(c, usuarios.GetValueOrDefault(c.UsuarioID))).ToList();
        }

        /// <summary>
        /// Crea un nuevo perfil de cuidador
        /// </summary>
        public async Task<CuidadorResponse> CreateCuidadorAsync(int usuarioId, CuidadorRequest request)
        {
            // Verificar que el usuario existe en la base de datos de autenticación
            var usuario = await _authContext.Users.FindAsync(usuarioId);
            if (usuario == null)
                throw new ArgumentException("Usuario no encontrado");

            // Verificar que no existe ya un cuidador para este usuario
            var cuidadorExistente = await _cuidadoresContext.Cuidadores
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
                Estado = "Activo",
                FechaCreacion = DateTime.UtcNow
            };

            _cuidadoresContext.Cuidadores.Add(cuidador);
            await _cuidadoresContext.SaveChangesAsync();

            return MapToResponse(cuidador, usuario);
        }

        /// <summary>
        /// Actualiza un perfil de cuidador existente
        /// </summary>
        public async Task<CuidadorResponse?> UpdateCuidadorAsync(int cuidadorId, CuidadorRequest request)
        {
            var cuidador = await _cuidadoresContext.Cuidadores.FindAsync(cuidadorId);
            if (cuidador == null)
                return null;

            cuidador.DocumentoIdentidad = request.DocumentoIdentidad;
            cuidador.TelefonoEmergencia = request.TelefonoEmergencia;
            cuidador.Biografia = request.Biografia;
            cuidador.Experiencia = request.Experiencia;
            cuidador.HorarioAtencion = request.HorarioAtencion;
            cuidador.TarifaPorHora = request.TarifaPorHora;
            cuidador.FechaActualizacion = DateTime.UtcNow;

            await _cuidadoresContext.SaveChangesAsync();

            // Obtener información del usuario
            var usuario = await _authContext.Users.FindAsync(cuidador.UsuarioID);
            
            return MapToResponse(cuidador, usuario);
        }

        /// <summary>
        /// Elimina un perfil de cuidador (marca como inactivo)
        /// </summary>
        public async Task<bool> DeleteCuidadorAsync(int cuidadorId)
        {
            var cuidador = await _cuidadoresContext.Cuidadores.FindAsync(cuidadorId);
            if (cuidador == null)
                return false;

            cuidador.Estado = "Inactivo";
            cuidador.FechaActualizacion = DateTime.UtcNow;

            await _cuidadoresContext.SaveChangesAsync();
            return true;
        }

        /// <summary>
        /// Verifica el documento de un cuidador
        /// </summary>
        public async Task<bool> VerificarDocumentoAsync(int cuidadorId)
        {
            var cuidador = await _cuidadoresContext.Cuidadores.FindAsync(cuidadorId);
            if (cuidador == null)
                return false;

            cuidador.DocumentoVerificado = true;
            cuidador.FechaVerificacion = DateTime.UtcNow;
            cuidador.FechaActualizacion = DateTime.UtcNow;

            await _cuidadoresContext.SaveChangesAsync();
            return true;
        }

        /// <summary>
        /// Mapea un cuidador a su respuesta DTO
        /// </summary>
        private static CuidadorResponse MapToResponse(Cuidador cuidador, User? usuario)
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
                Estado = cuidador.Estado,
                NombreUsuario = usuario?.Name ?? string.Empty,
                EmailUsuario = usuario?.Email ?? string.Empty
            };
        }
    }
} 