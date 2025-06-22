using PetCareServicios.Models.Auth;

namespace PetCareServicios.Services.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponse> LoginAsync(LoginRequest request);
        Task<AuthResponse> RegisterAsync(User user, string password);
        Task<string> GenerateJwtToken(User user);
        
        // ===== MÉTODOS DE RECUPERACIÓN DE CONTRASEÑA =====
        Task<PasswordResetResponse> RequestPasswordResetAsync(PasswordResetRequest request);
        Task<PasswordResetResponse> ConfirmPasswordResetAsync(PasswordResetConfirmRequest request);
        Task<bool> ValidateResetTokenAsync(string token);
        
        // ===== MÉTODO PARA TESTING - CAMBIO DIRECTO DE CONTRASEÑA =====
        Task<PasswordResetResponse> ChangePasswordDirectlyAsync(DirectPasswordChangeRequest request);
    }
} 