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

        public SolicitudService(SolicitudesDbContext solicitudesContext, AppDbContext authContext)
        {
            _solicitudesContext = solicitudesContext;
            _authContext = authContext;
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

            solicitud.Estado = "Cancelada";
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
                var cuidador = await _authContext.Users.FindAsync(solicitud.CuidadorID.Value);
                if (cuidador != null)
                {
                    response.NombreCuidador = cuidador.Name;
                    response.EmailCuidador = cuidador.Email ?? string.Empty;
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