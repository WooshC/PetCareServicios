using System.ComponentModel.DataAnnotations;

namespace PetCareServicios.Models.Auth
{
    public class CuidadorRequest
    {
        [Required]
        [StringLength(20)]
        public string DocumentoIdentidad { get; set; } = string.Empty;

        [Required]
        [StringLength(15)]
        public string TelefonoEmergencia { get; set; } = string.Empty;

        public string? Biografia { get; set; }

        public string? Experiencia { get; set; }

        [StringLength(100)]
        public string? HorarioAtencion { get; set; }

        [Range(0, 999999.99)]
        public decimal? TarifaPorHora { get; set; }
    }

    public class CuidadorResponse
    {
        public int CuidadorID { get; set; }
        public int UsuarioID { get; set; }
        public string DocumentoIdentidad { get; set; } = string.Empty;
        public string TelefonoEmergencia { get; set; } = string.Empty;
        public string? Biografia { get; set; }
        public string? Experiencia { get; set; }
        public string? HorarioAtencion { get; set; }
        public decimal? TarifaPorHora { get; set; }
        public decimal CalificacionPromedio { get; set; }
        public bool DocumentoVerificado { get; set; }
        public DateTime? FechaVerificacion { get; set; }
        public DateTime FechaCreacion { get; set; }
        public DateTime? FechaActualizacion { get; set; }
        public string Estado { get; set; } = string.Empty;
        public string NombreUsuario { get; set; } = string.Empty;
        public string EmailUsuario { get; set; } = string.Empty;
    }
} 