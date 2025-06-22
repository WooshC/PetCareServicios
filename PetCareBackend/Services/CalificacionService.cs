using Microsoft.EntityFrameworkCore;
using PetCareServicios.Data;
using PetCareServicios.Models.Auth;
using PetCareServicios.Models.Calificaciones;
using PetCareServicios.Services.Interfaces;

namespace PetCareServicios.Services
{
    /// <summary>
    /// Servicio para la gestión de calificaciones y reseñas
    /// </summary>
    public class CalificacionService : ICalificacionService
    {
        private readonly CalificacionesDbContext _calificacionesContext;
        private readonly AppDbContext _authContext;

        public CalificacionService(CalificacionesDbContext calificacionesContext, AppDbContext authContext)
        {
            _calificacionesContext = calificacionesContext;
            _authContext = authContext;
        }

        // ===== OPERACIONES GENERALES =====

        public async Task<List<CalificacionResponse>> GetAllCalificacionesAsync()
        {
            var calificaciones = await _calificacionesContext.Calificaciones
                .OrderByDescending(c => c.FechaCalificacion)
                .ToListAsync();

            return await MapToResponseList(calificaciones);
        }

        public async Task<CalificacionResponse?> GetCalificacionByIdAsync(int calificacionId)
        {
            var calificacion = await _calificacionesContext.Calificaciones
                .FirstOrDefaultAsync(c => c.CalificacionID == calificacionId);

            if (calificacion == null)
                return null;

            return await MapToResponse(calificacion);
        }

        // ===== OPERACIONES PARA CUIDADORES =====

        public async Task<List<CalificacionResponse>> GetCalificacionesByCuidadorAsync(int cuidadorId)
        {
            var calificaciones = await _calificacionesContext.Calificaciones
                .Where(c => c.CuidadorID == cuidadorId)
                .OrderByDescending(c => c.FechaCalificacion)
                .ToListAsync();

            return await MapToResponseList(calificaciones);
        }

        public async Task<decimal> GetCalificacionPromedioByCuidadorAsync(int cuidadorId)
        {
            var promedio = await _calificacionesContext.Calificaciones
                .Where(c => c.CuidadorID == cuidadorId)
                .AverageAsync(c => (double)c.Puntuacion);

            return Math.Round((decimal)promedio, 2);
        }

        // ===== OPERACIONES PARA CLIENTES =====

        public async Task<List<CalificacionResponse>> GetCalificacionesByClienteAsync(int clienteId)
        {
            var calificaciones = await _calificacionesContext.Calificaciones
                .Where(c => c.ClienteID == clienteId)
                .OrderByDescending(c => c.FechaCalificacion)
                .ToListAsync();

            return await MapToResponseList(calificaciones);
        }

        public async Task<CalificacionResponse> CreateCalificacionAsync(CalificacionRequest request)
        {
            // Verificar que no existe ya una calificación del mismo cliente al mismo cuidador
            var calificacionExistente = await _calificacionesContext.Calificaciones
                .FirstOrDefaultAsync(c => c.CuidadorID == request.CuidadorID && c.ClienteID == request.ClienteID);

            if (calificacionExistente != null)
                throw new InvalidOperationException("Ya has calificado a este cuidador");

            var calificacion = new Calificacion
            {
                CuidadorID = request.CuidadorID,
                ClienteID = request.ClienteID,
                Puntuacion = request.Puntuacion,
                Comentario = request.Comentario,
                FechaCalificacion = DateTime.UtcNow
            };

            _calificacionesContext.Calificaciones.Add(calificacion);
            await _calificacionesContext.SaveChangesAsync();

            return await MapToResponse(calificacion);
        }

        public async Task<CalificacionResponse?> UpdateCalificacionAsync(int calificacionId, CalificacionRequest request)
        {
            var calificacion = await _calificacionesContext.Calificaciones
                .FirstOrDefaultAsync(c => c.CalificacionID == calificacionId && c.ClienteID == request.ClienteID);

            if (calificacion == null)
                return null;

            calificacion.Puntuacion = request.Puntuacion;
            calificacion.Comentario = request.Comentario;
            calificacion.FechaCalificacion = DateTime.UtcNow; // Actualizar fecha

            await _calificacionesContext.SaveChangesAsync();

            return await MapToResponse(calificacion);
        }

        public async Task<bool> DeleteCalificacionAsync(int calificacionId, int clienteId)
        {
            var calificacion = await _calificacionesContext.Calificaciones
                .FirstOrDefaultAsync(c => c.CalificacionID == calificacionId && c.ClienteID == clienteId);

            if (calificacion == null)
                return false;

            _calificacionesContext.Calificaciones.Remove(calificacion);
            await _calificacionesContext.SaveChangesAsync();
            return true;
        }

        // ===== OPERACIONES DE CONSULTA =====

        public async Task<List<CalificacionResponse>> GetCalificacionesByPuntuacionAsync(int puntuacionMinima)
        {
            var calificaciones = await _calificacionesContext.Calificaciones
                .Where(c => c.Puntuacion >= puntuacionMinima)
                .OrderByDescending(c => c.FechaCalificacion)
                .ToListAsync();

            return await MapToResponseList(calificaciones);
        }

        public async Task<List<CalificacionResponse>> GetCalificacionesByFechaAsync(DateTime fechaInicio, DateTime fechaFin)
        {
            var calificaciones = await _calificacionesContext.Calificaciones
                .Where(c => c.FechaCalificacion >= fechaInicio && c.FechaCalificacion <= fechaFin)
                .OrderByDescending(c => c.FechaCalificacion)
                .ToListAsync();

            return await MapToResponseList(calificaciones);
        }

        // ===== OPERACIONES ADMINISTRATIVAS =====

        public async Task<bool> DeleteCalificacionAdminAsync(int calificacionId)
        {
            var calificacion = await _calificacionesContext.Calificaciones.FindAsync(calificacionId);
            if (calificacion == null)
                return false;

            _calificacionesContext.Calificaciones.Remove(calificacion);
            await _calificacionesContext.SaveChangesAsync();
            return true;
        }

        public async Task<List<CalificacionResponse>> GetCalificacionesRecientesAsync(int cantidad = 10)
        {
            var calificaciones = await _calificacionesContext.Calificaciones
                .OrderByDescending(c => c.FechaCalificacion)
                .Take(cantidad)
                .ToListAsync();

            return await MapToResponseList(calificaciones);
        }

        // ===== MÉTODOS AUXILIARES =====

        private async Task<CalificacionResponse> MapToResponse(Calificacion calificacion)
        {
            var response = new CalificacionResponse
            {
                CalificacionID = calificacion.CalificacionID,
                CuidadorID = calificacion.CuidadorID,
                ClienteID = calificacion.ClienteID,
                Puntuacion = calificacion.Puntuacion,
                Comentario = calificacion.Comentario,
                FechaCalificacion = calificacion.FechaCalificacion
            };

            // Obtener información del cliente
            var cliente = await _authContext.Users.FindAsync(calificacion.ClienteID);
            if (cliente != null)
            {
                response.NombreCliente = cliente.Name;
                response.EmailCliente = cliente.Email ?? string.Empty;
            }

            // Obtener información del cuidador
            var cuidador = await _authContext.Users.FindAsync(calificacion.CuidadorID);
            if (cuidador != null)
            {
                response.NombreCuidador = cuidador.Name;
                response.EmailCuidador = cuidador.Email ?? string.Empty;
            }

            return response;
        }

        private async Task<List<CalificacionResponse>> MapToResponseList(List<Calificacion> calificaciones)
        {
            var responses = new List<CalificacionResponse>();

            foreach (var calificacion in calificaciones)
            {
                responses.Add(await MapToResponse(calificacion));
            }

            return responses;
        }
    }
} 