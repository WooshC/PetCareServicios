using PetCareServicios.Models.Auth;

namespace PetCareServicios.Services.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponse> LoginAsync(LoginRequest request);
        Task<AuthResponse> RegisterAsync(User user, string password);
        string GenerateJwtToken(User user);
    }
} 