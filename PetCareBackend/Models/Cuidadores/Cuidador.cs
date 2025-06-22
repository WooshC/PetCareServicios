using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PetCareServicios.Models.Cuidadores
{
    public class Cuidador
    {
        [Key]
        public int CuidadorID { get; set; }

        [Required]
        public int UsuarioID { get; set; }

        [Required]
        [StringLength(20)]
        public string DocumentoIdentidad { get; set; } = string.Empty;

        [StringLength(15)]
        public string TelefonoEmergencia { get; set; } = string.Empty;

        [Column(TypeName = "TEXT")]
        public string? Biografia { get; set; }

        [Column(TypeName = "TEXT")]
        public string? Experiencia { get; set; }

        [StringLength(100)]
        public string? HorarioAtencion { get; set; }

        [Column(TypeName = "DECIMAL(10,2)")]
        public decimal? TarifaPorHora { get; set; }

        [Column(TypeName = "DECIMAL(3,2)")]
        public decimal CalificacionPromedio { get; set; } = 0.0m;

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