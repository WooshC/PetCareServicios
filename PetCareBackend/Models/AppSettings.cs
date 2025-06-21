namespace PetCareServicios.Models
{
    public class AppSettings
    {
        public JwtSettings Jwt { get; set; } = new();
    }

    public class JwtSettings
    {
        public string Key { get; set; } = string.Empty;
        public string Issuer { get; set; } = string.Empty;
        public string Audience { get; set; } = string.Empty;
        public int ExpirationHours { get; set; } = 24;
    }
} 