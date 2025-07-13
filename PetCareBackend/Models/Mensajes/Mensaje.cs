using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PetCareServicios.Models.Mensajes
{
    public class Mensaje
    {
        [Key]
        public int MensajeID { get; set; }

        [Required]
        public int SolicitudID { get; set; }

        [Required]
        public int RemitenteID { get; set; }

        [Required]
        [StringLength(1000)]
        public string Contenido { get; set; } = string.Empty;

        [Required]
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        [Required]
        public bool EsLeido { get; set; } = false;

        public DateTime? FechaLectura { get; set; }

        [StringLength(20)]
        public string TipoMensaje { get; set; } = "Texto"; // Texto, Sistema, etc.

        // Campos adicionales para auditoría
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
        public DateTime? FechaActualizacion { get; set; }
    }
} 