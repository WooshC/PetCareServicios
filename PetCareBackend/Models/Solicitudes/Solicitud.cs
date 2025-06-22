using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PetCareServicios.Models.Solicitudes
{
    public class Solicitud
    {
        [Key]
        public int SolicitudID { get; set; }

        public int? ClienteID { get; set; }

        public int? CuidadorID { get; set; }

        [Required]
        [StringLength(50)]
        public string TipoServicio { get; set; } = string.Empty; // Paseo, Guardería, Visita a domicilio

        [Required]
        [Column(TypeName = "TEXT")]
        public string Descripcion { get; set; } = string.Empty;

        [Required]
        public DateTime FechaHoraInicio { get; set; }

        [Required]
        [Range(1, 24)]
        public int DuracionHoras { get; set; }

        [Required]
        [StringLength(200)]
        public string Ubicacion { get; set; } = string.Empty;

        [Required]
        [StringLength(20)]
        public string Estado { get; set; } = "Pendiente"; // Pendiente, Aceptada, En Progreso, Fuera de Tiempo, Finalizada, Rechazada

        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

        public DateTime? FechaActualizacion { get; set; }

        public DateTime? FechaAceptacion { get; set; }

        public DateTime? FechaInicioServicio { get; set; }

        public DateTime? FechaFinalizacion { get; set; }

        // Nota: No usamos ForeignKey ni Navigation Property porque estamos usando bases de datos separadas
        // La relación se maneja a nivel de aplicación usando ClienteID y CuidadorID
    }
} 