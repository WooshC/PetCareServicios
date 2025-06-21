using Microsoft.AspNetCore.Identity;

namespace PetCareServicios.Models.Auth
{
    public class UserRole : IdentityRole<int>
    {
        public string Description { get; set; } = string.Empty;
    }
} 