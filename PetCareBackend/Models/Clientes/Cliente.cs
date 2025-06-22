using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PetCareServicios.Models.Clientes
{
    public class Cliente
    {
        [Key]
        public int ClienteID { get; set; }

        [Required]
        public int UsuarioID { get; set; }

        [Required]
        [StringLength(20)]
        public string DocumentoIdentidad { get; set; } = string.Empty;

        [StringLength(15)]
        public string TelefonoEmergencia { get; set; } = string.Empty;

        public bool DocumentoVerificado { get; set; } = false;

        public DateTime? FechaVerificacion { get; set; }

        [StringLength(20)]
        public string Estado { get; set; } = "Activo";

        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

        public DateTime? FechaActualizacion { get; set; }

        // Nota: No usamos ForeignKey ni Navigation Property porque estamos usando bases de datos separadas
        // La relación se maneja a nivel de aplicación usando el UsuarioID
    }
} 