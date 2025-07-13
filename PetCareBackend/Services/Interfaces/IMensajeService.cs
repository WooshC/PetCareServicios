using PetCareServicios.Models.Mensajes;

namespace PetCareServicios.Services.Interfaces
{
    public interface IMensajeService
    {
        Task<Mensaje> CrearMensajeAsync(int solicitudId, int remitenteId, string contenido, string tipoMensaje = "Texto");
        Task<List<Mensaje>> ObtenerMensajesPorSolicitudAsync(int solicitudId);
        Task<List<Mensaje>> ObtenerMensajesNoLeidosAsync(int solicitudId, int usuarioId);
        Task MarcarMensajesComoLeidosAsync(int solicitudId, int usuarioId);
        Task<int> ObtenerCantidadMensajesNoLeidosAsync(int solicitudId, int usuarioId);
        Task<bool> EliminarMensajeAsync(int mensajeId, int usuarioId);
    }
} 