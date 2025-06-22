using Microsoft.EntityFrameworkCore;
using PetCareServicios.Data;
using PetCareServicios.Models.Auth;
using PetCareServicios.Models.Solicitudes;
using PetCareServicios.Services.Interfaces;

namespace PetCareServicios.Services
{
    /// <summary>
    /// Servicio para la gestión de solicitudes de servicios
    /// </summary>
    public class SolicitudService : ISolicitudService
    {
        private readonly SolicitudesDbContext _solicitudesContext;
        private readonly AppDbContext _authContext;
        private readonly CuidadoresDbContext _cuidadoresContext;

        public SolicitudService(SolicitudesDbContext solicitudesContext, AppDbContext authContext, CuidadoresDbContext cuidadoresContext)
        {
            _solicitudesContext = solicitudesContext;
            _authContext = authContext;
            _cuidadoresContext = cuidadoresContext;
        }

        // ===== OPERACIONES GENERALES =====

        public async Task<List<SolicitudResponse>> GetAllSolicitudesAsync()
        {
            var solicitudes = await _solicitudesContext.Solicitudes
                .OrderByDescending(s => s.FechaCreacion)
                .ToListAsync();

            return await MapToResponseList(solicitudes);
        }

        public async Task<SolicitudResponse?> GetSolicitudByIdAsync(int solicitudId)
        {
            var solicitud = await _solicitudesContext.Solicitudes
                .FirstOrDefaultAsync(s => s.SolicitudID == solicitudId);

            if (solicitud == null)
                return null;

            return await MapToResponse(solicitud);
        }

        // ===== OPERACIONES PARA CLIENTES =====

        public async Task<List<SolicitudResponse>> GetSolicitudesByClienteAsync(int clienteId)
        {
            var solicitudes = await _solicitudesContext.Solicitudes
                .Where(s => s.ClienteID == clienteId)
                .OrderByDescending(s => s.FechaCreacion)
                .ToListAsync();

            return await MapToResponseList(solicitudes);
        }

        public async Task<SolicitudResponse> CreateSolicitudAsync(SolicitudRequest request)
        {
            var solicitud = new Solicitud
            {
                ClienteID = request.ClienteID,
                CuidadorID = request.CuidadorID,
                TipoServicio = request.TipoServicio,
                Descripcion = request.Descripcion,
                FechaHoraInicio = request.FechaHoraInicio,
                DuracionHoras = request.DuracionHoras,
                Ubicacion = request.Ubicacion,
                Estado = "Pendiente",
                FechaCreacion = DateTime.UtcNow
            };

            _solicitudesContext.Solicitudes.Add(solicitud);
            await _solicitudesContext.SaveChangesAsync();

            return await MapToResponse(solicitud);
        }

        public async Task<SolicitudResponse?> UpdateSolicitudAsync(int solicitudId, SolicitudRequest request)
        {
            var solicitud = await _solicitudesContext.Solicitudes.FindAsync(solicitudId);
            if (solicitud == null)
                return null;

            solicitud.TipoServicio = request.TipoServicio;
            solicitud.Descripcion = request.Descripcion;
            solicitud.FechaHoraInicio = request.FechaHoraInicio;
            solicitud.DuracionHoras = request.DuracionHoras;
            solicitud.Ubicacion = request.Ubicacion;
            solicitud.FechaActualizacion = DateTime.UtcNow;

            await _solicitudesContext.SaveChangesAsync();

            return await MapToResponse(solicitud);
        }

        public async Task<bool> DeleteSolicitudAsync(int solicitudId, int clienteId)
        {
            var solicitud = await _solicitudesContext.Solicitudes
                .FirstOrDefaultAsync(s => s.SolicitudID == solicitudId && s.ClienteID == clienteId);

            if (solicitud == null)
                return false;

            _solicitudesContext.Solicitudes.Remove(solicitud);
            await _solicitudesContext.SaveChangesAsync();
            return true;
        }

        public async Task<SolicitudResponse?> CancelarSolicitudAsync(int solicitudId, int clienteId)
        {
            var solicitud = await _solicitudesContext.Solicitudes
                .FirstOrDefaultAsync(s => s.SolicitudID == solicitudId && s.ClienteID == clienteId);

            if (solicitud == null)
                return null;

            solicitud.Estado = "Rechazada";
            solicitud.FechaActualizacion = DateTime.UtcNow;

            await _solicitudesContext.SaveChangesAsync();

            return await MapToResponse(solicitud);
        }

        // ===== OPERACIONES PARA CUIDADORES =====

        public async Task<List<SolicitudResponse>> GetSolicitudesByCuidadorAsync(int cuidadorId)
        {
            var solicitudes = await _solicitudesContext.Solicitudes
                .Where(s => s.CuidadorID == cuidadorId)
                .OrderByDescending(s => s.FechaCreacion)
                .ToListAsync();

            return await MapToResponseList(solicitudes);
        }

        public async Task<List<SolicitudResponse>> GetSolicitudesPendientesAsync()
        {
            var solicitudes = await _solicitudesContext.Solicitudes
                .Where(s => s.Estado == "Pendiente")
                .OrderBy(s => s.FechaCreacion)
                .ToListAsync();

            return await MapToResponseList(solicitudes);
        }

        public async Task<List<SolicitudResponse>> GetSolicitudesPendientesByCuidadorAsync(int cuidadorId)
        {
            var solicitudes = await _solicitudesContext.Solicitudes
                .Where(s => s.CuidadorID == cuidadorId && s.Estado == "Pendiente")
                .OrderBy(s => s.FechaCreacion)
                .ToListAsync();

            return await MapToResponseList(solicitudes);
        }

        public async Task<List<SolicitudResponse>> GetSolicitudesActivasByCuidadorAsync(int cuidadorId)
        {
            var solicitudes = await _solicitudesContext.Solicitudes
                .Where(s => s.CuidadorID == cuidadorId && 
                           (s.Estado == "Aceptada" || s.Estado == "Fuera de Tiempo" || s.Estado == "En Progreso"))
                .OrderByDescending(s => s.FechaCreacion)
                .ToListAsync();

            return await MapToResponseList(solicitudes);
        }

        public async Task<SolicitudResponse?> AceptarSolicitudAsync(int solicitudId, int cuidadorId)
        {
            var solicitud = await _solicitudesContext.Solicitudes
                .FirstOrDefaultAsync(s => s.SolicitudID == solicitudId && s.Estado == "Pendiente");

            if (solicitud == null)
                return null;

            solicitud.CuidadorID = cuidadorId;
            solicitud.Estado = "Aceptada";
            solicitud.FechaAceptacion = DateTime.UtcNow;
            solicitud.FechaActualizacion = DateTime.UtcNow;

            await _solicitudesContext.SaveChangesAsync();

            return await MapToResponse(solicitud);
        }

        public async Task<SolicitudResponse?> RechazarSolicitudAsync(int solicitudId, int cuidadorId)
        {
            var solicitud = await _solicitudesContext.Solicitudes
                .FirstOrDefaultAsync(s => s.SolicitudID == solicitudId && s.CuidadorID == cuidadorId);

            if (solicitud == null)
                return null;

            solicitud.Estado = "Rechazada";
            solicitud.FechaActualizacion = DateTime.UtcNow;

            await _solicitudesContext.SaveChangesAsync();

            return await MapToResponse(solicitud);
        }

        public async Task<SolicitudResponse?> IniciarServicioAsync(int solicitudId, int cuidadorId)
        {
            var solicitud = await _solicitudesContext.Solicitudes
                .FirstOrDefaultAsync(s => s.SolicitudID == solicitudId && s.CuidadorID == cuidadorId && s.Estado == "Aceptada");

            if (solicitud == null)
                return null;

            solicitud.Estado = "En Progreso";
            solicitud.FechaInicioServicio = DateTime.UtcNow;
            solicitud.FechaActualizacion = DateTime.UtcNow;

            await _solicitudesContext.SaveChangesAsync();

            return await MapToResponse(solicitud);
        }

        public async Task<SolicitudResponse?> FinalizarServicioAsync(int solicitudId, int cuidadorId)
        {
            var solicitud = await _solicitudesContext.Solicitudes
                .FirstOrDefaultAsync(s => s.SolicitudID == solicitudId && s.CuidadorID == cuidadorId && s.Estado == "En Progreso");

            if (solicitud == null)
                return null;

            solicitud.Estado = "Finalizada";
            solicitud.FechaFinalizacion = DateTime.UtcNow;
            solicitud.FechaActualizacion = DateTime.UtcNow;

            await _solicitudesContext.SaveChangesAsync();

            return await MapToResponse(solicitud);
        }

        // ===== OPERACIONES DE CONSULTA =====

        public async Task<List<SolicitudResponse>> GetSolicitudesByEstadoAsync(string estado)
        {
            var solicitudes = await _solicitudesContext.Solicitudes
                .Where(s => s.Estado == estado)
                .OrderByDescending(s => s.FechaCreacion)
                .ToListAsync();

            return await MapToResponseList(solicitudes);
        }

        public async Task<List<SolicitudResponse>> GetSolicitudesByFechaAsync(DateTime fechaInicio, DateTime fechaFin)
        {
            var solicitudes = await _solicitudesContext.Solicitudes
                .Where(s => s.FechaCreacion >= fechaInicio && s.FechaCreacion <= fechaFin)
                .OrderByDescending(s => s.FechaCreacion)
                .ToListAsync();

            return await MapToResponseList(solicitudes);
        }

        public async Task<List<SolicitudResponse>> GetSolicitudesByTipoServicioAsync(string tipoServicio)
        {
            var solicitudes = await _solicitudesContext.Solicitudes
                .Where(s => s.TipoServicio == tipoServicio)
                .OrderByDescending(s => s.FechaCreacion)
                .ToListAsync();

            return await MapToResponseList(solicitudes);
        }

        // ===== OPERACIONES ADMINISTRATIVAS =====

        public async Task<bool> DeleteSolicitudAdminAsync(int solicitudId)
        {
            var solicitud = await _solicitudesContext.Solicitudes.FindAsync(solicitudId);
            if (solicitud == null)
                return false;

            _solicitudesContext.Solicitudes.Remove(solicitud);
            await _solicitudesContext.SaveChangesAsync();
            return true;
        }

        public async Task<SolicitudResponse?> CambiarEstadoAsync(int solicitudId, string nuevoEstado)
        {
            var solicitud = await _solicitudesContext.Solicitudes.FindAsync(solicitudId);
            if (solicitud == null)
                return null;

            solicitud.Estado = nuevoEstado;
            solicitud.FechaActualizacion = DateTime.UtcNow;

            await _solicitudesContext.SaveChangesAsync();

            return await MapToResponse(solicitud);
        }

        public async Task<List<SolicitudResponse>> GetSolicitudesRecientesAsync(int cantidad = 10)
        {
            var solicitudes = await _solicitudesContext.Solicitudes
                .OrderByDescending(s => s.FechaCreacion)
                .Take(cantidad)
                .ToListAsync();

            return await MapToResponseList(solicitudes);
        }

        // ===== NUEVOS MÉTODOS PARA ASIGNACIÓN DE CUIDADORES =====

        public async Task<List<CuidadorResponse>> GetCuidadoresDisponiblesAsync()
        {
            // Obtener todos los cuidadores activos (sin filtrar por verificación)
            var cuidadores = await _cuidadoresContext.Cuidadores
                .Where(c => c.Estado == "Activo")
                .ToListAsync();

            // Obtener información de usuarios correspondientes
            var usuarioIds = cuidadores.Select(c => c.UsuarioID).ToList();
            var usuarios = await _authContext.Users
                .Where(u => usuarioIds.Contains(u.Id))
                .ToDictionaryAsync(u => u.Id, u => u);

            // Mapear a CuidadorResponse
            var cuidadoresResponse = new List<CuidadorResponse>();
            foreach (var cuidador in cuidadores)
            {
                var usuario = usuarios.GetValueOrDefault(cuidador.UsuarioID);
                cuidadoresResponse.Add(new CuidadorResponse
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
                });
            }

            return cuidadoresResponse;
        }

        public async Task<SolicitudResponse?> AsignarCuidadorAsync(int solicitudId, int clienteId, int cuidadorId)
        {
            // Verificar que la solicitud existe y pertenece al cliente
            var solicitud = await _solicitudesContext.Solicitudes
                .FirstOrDefaultAsync(s => s.SolicitudID == solicitudId && s.ClienteID == clienteId);

            if (solicitud == null)
                return null;

            // Verificar que la solicitud esté en estado "Pendiente"
            if (solicitud.Estado != "Pendiente")
                return null;

            // Verificar que el cuidador existe y está activo
            var cuidador = await _cuidadoresContext.Cuidadores
                .FirstOrDefaultAsync(c => c.CuidadorID == cuidadorId && c.Estado == "Activo");

            if (cuidador == null)
                return null;

            // Asignar el cuidador a la solicitud (mantener estado "Pendiente")
            solicitud.CuidadorID = cuidadorId;
            // No cambiar el estado - se mantiene "Pendiente" hasta que el cuidador la acepte
            solicitud.FechaActualizacion = DateTime.UtcNow;

            await _solicitudesContext.SaveChangesAsync();

            return await MapToResponse(solicitud);
        }

        // ===== MÉTODOS AUXILIARES =====

        private async Task<SolicitudResponse> MapToResponse(Solicitud solicitud)
        {
            var response = new SolicitudResponse
            {
                SolicitudID = solicitud.SolicitudID,
                ClienteID = solicitud.ClienteID,
                CuidadorID = solicitud.CuidadorID,
                TipoServicio = solicitud.TipoServicio,
                Descripcion = solicitud.Descripcion,
                FechaHoraInicio = solicitud.FechaHoraInicio,
                DuracionHoras = solicitud.DuracionHoras,
                Ubicacion = solicitud.Ubicacion,
                Estado = solicitud.Estado,
                FechaCreacion = solicitud.FechaCreacion,
                FechaActualizacion = solicitud.FechaActualizacion,
                FechaAceptacion = solicitud.FechaAceptacion,
                FechaInicioServicio = solicitud.FechaInicioServicio,
                FechaFinalizacion = solicitud.FechaFinalizacion
            };

            // Obtener información del cliente
            if (solicitud.ClienteID.HasValue)
            {
                var cliente = await _authContext.Users.FindAsync(solicitud.ClienteID.Value);
                if (cliente != null)
                {
                    response.NombreCliente = cliente.Name;
                    response.EmailCliente = cliente.Email ?? string.Empty;
                }
            }

            // Obtener información del cuidador
            if (solicitud.CuidadorID.HasValue)
            {
                // Primero buscar el perfil de cuidador
                var perfilCuidador = await _cuidadoresContext.Cuidadores
                    .FirstOrDefaultAsync(c => c.CuidadorID == solicitud.CuidadorID.Value);
                
                if (perfilCuidador != null)
                {
                    // Luego buscar la información del usuario asociado
                    var cuidador = await _authContext.Users.FindAsync(perfilCuidador.UsuarioID);
                    if (cuidador != null)
                    {
                        response.NombreCuidador = cuidador.Name;
                        response.EmailCuidador = cuidador.Email ?? string.Empty;
                    }
                }
            }

            return response;
        }

        private async Task<List<SolicitudResponse>> MapToResponseList(List<Solicitud> solicitudes)
        {
            var responses = new List<SolicitudResponse>();

            foreach (var solicitud in solicitudes)
            {
                responses.Add(await MapToResponse(solicitud));
            }

            return responses;
        }
    }
} 