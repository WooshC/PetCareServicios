using System.ComponentModel.DataAnnotations;

namespace PetCareServicios.Models.Clientes
{
    public class ClienteRequest
    {
        [Required]
        [StringLength(20)]
        public string DocumentoIdentidad { get; set; } = string.Empty;

        [Required]
        [StringLength(15)]
        public string TelefonoEmergencia { get; set; } = string.Empty;
    }

    public class ClienteResponse
    {
        public int ClienteID { get; set; }
        public int UsuarioID { get; set; }
        public string DocumentoIdentidad { get; set; } = string.Empty;
        public string TelefonoEmergencia { get; set; } = string.Empty;
        public bool DocumentoVerificado { get; set; }
        public DateTime? FechaVerificacion { get; set; }
        public DateTime FechaCreacion { get; set; }
        public DateTime? FechaActualizacion { get; set; }
        public string Estado { get; set; } = string.Empty;
        public string NombreUsuario { get; set; } = string.Empty;
        public string EmailUsuario { get; set; } = string.Empty;
    }
} 