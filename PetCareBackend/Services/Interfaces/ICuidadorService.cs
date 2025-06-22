using PetCareServicios.Models.Auth;
using PetCareServicios.Models.Cuidadores;

namespace PetCareServicios.Services.Interfaces
{
    public interface ICuidadorService
    {
        Task<CuidadorResponse?> GetCuidadorByUsuarioIdAsync(int usuarioId);
        Task<CuidadorResponse?> GetCuidadorByIdAsync(int cuidadorId);
        Task<List<CuidadorResponse>> GetAllCuidadoresAsync();
        Task<CuidadorResponse> CreateCuidadorAsync(int usuarioId, CuidadorRequest request);
        Task<CuidadorResponse?> UpdateCuidadorAsync(int cuidadorId, CuidadorRequest request);
        Task<bool> DeleteCuidadorAsync(int cuidadorId);
        Task<bool> VerificarDocumentoAsync(int cuidadorId);
    }
} 