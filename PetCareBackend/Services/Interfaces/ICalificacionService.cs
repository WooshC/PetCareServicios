using PetCareServicios.Models.Calificaciones;

namespace PetCareServicios.Services.Interfaces
{
    public interface ICalificacionService
    {
        // ===== OPERACIONES GENERALES =====
        Task<List<CalificacionResponse>> GetAllCalificacionesAsync();
        Task<CalificacionResponse?> GetCalificacionByIdAsync(int calificacionId);
        
        // ===== OPERACIONES PARA CUIDADORES =====
        Task<List<CalificacionResponse>> GetCalificacionesByCuidadorAsync(int cuidadorId);
        Task<decimal> GetCalificacionPromedioByCuidadorAsync(int cuidadorId);
        
        // ===== OPERACIONES PARA CLIENTES =====
        Task<List<CalificacionResponse>> GetCalificacionesByClienteAsync(int clienteId);
        Task<CalificacionResponse> CreateCalificacionAsync(CalificacionRequest request);
        Task<CalificacionResponse?> UpdateCalificacionAsync(int calificacionId, CalificacionRequest request);
        Task<bool> DeleteCalificacionAsync(int calificacionId, int clienteId);
        
        // ===== OPERACIONES DE CONSULTA =====
        Task<List<CalificacionResponse>> GetCalificacionesByPuntuacionAsync(int puntuacionMinima);
        Task<List<CalificacionResponse>> GetCalificacionesByFechaAsync(DateTime fechaInicio, DateTime fechaFin);
        
        // ===== OPERACIONES ADMINISTRATIVAS =====
        Task<bool> DeleteCalificacionAdminAsync(int calificacionId);
        Task<List<CalificacionResponse>> GetCalificacionesRecientesAsync(int cantidad = 10);
    }
} 