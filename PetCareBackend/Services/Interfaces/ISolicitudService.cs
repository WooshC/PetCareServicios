using PetCareServicios.Models.Solicitudes;

namespace PetCareServicios.Services.Interfaces
{
    public interface ISolicitudService
    {
        // ===== OPERACIONES GENERALES =====
        Task<List<SolicitudResponse>> GetAllSolicitudesAsync();
        Task<SolicitudResponse?> GetSolicitudByIdAsync(int solicitudId);
        
        // ===== OPERACIONES PARA CLIENTES =====
        Task<List<SolicitudResponse>> GetSolicitudesByClienteAsync(int clienteId);
        Task<SolicitudResponse> CreateSolicitudAsync(SolicitudRequest request);
        Task<SolicitudResponse?> UpdateSolicitudAsync(int solicitudId, SolicitudRequest request);
        Task<bool> DeleteSolicitudAsync(int solicitudId, int clienteId);
        Task<SolicitudResponse?> CancelarSolicitudAsync(int solicitudId, int clienteId);
        
        // ===== OPERACIONES PARA CUIDADORES =====
        Task<List<SolicitudResponse>> GetSolicitudesByCuidadorAsync(int cuidadorId);
        Task<List<SolicitudResponse>> GetSolicitudesPendientesAsync();
        Task<SolicitudResponse?> AceptarSolicitudAsync(int solicitudId, int cuidadorId);
        Task<SolicitudResponse?> RechazarSolicitudAsync(int solicitudId, int cuidadorId);
        Task<SolicitudResponse?> IniciarServicioAsync(int solicitudId, int cuidadorId);
        Task<SolicitudResponse?> FinalizarServicioAsync(int solicitudId, int cuidadorId);
        
        // ===== OPERACIONES DE CONSULTA =====
        Task<List<SolicitudResponse>> GetSolicitudesByEstadoAsync(string estado);
        Task<List<SolicitudResponse>> GetSolicitudesByFechaAsync(DateTime fechaInicio, DateTime fechaFin);
        Task<List<SolicitudResponse>> GetSolicitudesByTipoServicioAsync(string tipoServicio);
        
        // ===== OPERACIONES ADMINISTRATIVAS =====
        Task<bool> DeleteSolicitudAdminAsync(int solicitudId);
        Task<SolicitudResponse?> CambiarEstadoAsync(int solicitudId, string nuevoEstado);
        Task<List<SolicitudResponse>> GetSolicitudesRecientesAsync(int cantidad = 10);
    }
} 