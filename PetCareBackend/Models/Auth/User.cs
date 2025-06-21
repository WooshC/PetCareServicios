using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace PetCareServicios.Models.Auth
{
    public class User : IdentityUser<int>
    {
        public string Name { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
} 