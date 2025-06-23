using System.ComponentModel.DataAnnotations;
using PetCareServicios.Models.Cuidadores;

namespace PetCareServicios.Models.Solicitudes
{
    public class SolicitudRequest
    {
        public int? ClienteID { get; set; }

        public int? CuidadorID { get; set; }

        [Required]
        [StringLength(50)]
        public string TipoServicio { get; set; } = string.Empty;

        [Required]
        public string Descripcion { get; set; } = string.Empty;

        [Required]
        public DateTime FechaHoraInicio { get; set; }

        [Required]
        [Range(1, 24)]
        public int DuracionHoras { get; set; }

        [Required]
        [StringLength(200)]
        public string Ubicacion { get; set; } = string.Empty;
    }

    public class SolicitudResponse
    {
        public int SolicitudID { get; set; }
        public int? ClienteID { get; set; }
        public int? CuidadorID { get; set; }
        public string TipoServicio { get; set; } = string.Empty;
        public string Descripcion { get; set; } = string.Empty;
        public DateTime FechaHoraInicio { get; set; }
        public int DuracionHoras { get; set; }
        public string Ubicacion { get; set; } = string.Empty;
        public string Estado { get; set; } = string.Empty;
        public DateTime FechaCreacion { get; set; }
        public DateTime? FechaActualizacion { get; set; }
        public DateTime? FechaAceptacion { get; set; }
        public DateTime? FechaInicioServicio { get; set; }
        public DateTime? FechaFinalizacion { get; set; }
        
        // Información adicional del cliente y cuidador
        public string NombreCliente { get; set; } = string.Empty;
        public string EmailCliente { get; set; } = string.Empty;
        public string TelefonoCliente { get; set; } = string.Empty;
        public string NombreCuidador { get; set; } = string.Empty;
        public string EmailCuidador { get; set; } = string.Empty;
    }

    public class SolicitudEstadoRequest
    {
        [Required]
        public string Estado { get; set; } = string.Empty;
    }

    public class AsignarCuidadorRequest
    {
        [Required]
        public int CuidadorID { get; set; }
    }
} 