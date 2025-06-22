using PetCareServicios.Models.Clientes;

namespace PetCareServicios.Services.Interfaces
{
    public interface IClienteService
    {
        Task<ClienteResponse?> GetClienteByUsuarioIdAsync(int usuarioId);
        Task<ClienteResponse?> GetClienteByIdAsync(int clienteId);
        Task<List<ClienteResponse>> GetAllClientesAsync();
        Task<ClienteResponse> CreateClienteAsync(int usuarioId, ClienteRequest request);
        Task<ClienteResponse?> UpdateClienteAsync(int clienteId, ClienteRequest request);
        Task<bool> DeleteClienteAsync(int clienteId);
        Task<bool> VerificarDocumentoAsync(int clienteId);
    }
} 