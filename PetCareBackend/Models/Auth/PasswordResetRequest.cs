using System.ComponentModel.DataAnnotations;

namespace PetCareServicios.Models.Auth
{
    /// <summary>
    /// DTO para solicitar restablecimiento de contraseña
    /// </summary>
    public class PasswordResetRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
    }

    /// <summary>
    /// DTO para confirmar restablecimiento de contraseña
    /// </summary>
    public class PasswordResetConfirmRequest
    {
        [Required]
        public string Token { get; set; } = string.Empty;

        [Required]
        [MinLength(8)]
        public string NewPassword { get; set; } = string.Empty;

        [Required]
        [Compare("NewPassword")]
        public string ConfirmPassword { get; set; } = string.Empty;
    }

    /// <summary>
    /// DTO para cambio de contraseña directo (para testing)
    /// </summary>
    public class DirectPasswordChangeRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(8)]
        public string NewPassword { get; set; } = string.Empty;

        [Required]
        [Compare("NewPassword")]
        public string ConfirmPassword { get; set; } = string.Empty;
    }

    /// <summary>
    /// DTO para respuesta de restablecimiento de contraseña
    /// </summary>
    public class PasswordResetResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public string? Token { get; set; }
    }
} 