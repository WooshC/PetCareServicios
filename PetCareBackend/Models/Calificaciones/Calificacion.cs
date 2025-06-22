using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PetCareServicios.Models.Calificaciones
{
    public class Calificacion
    {
        [Key]
        public int CalificacionID { get; set; }

        [Required]
        public int CuidadorID { get; set; }

        [Required]
        public int ClienteID { get; set; }

        [Required]
        [Range(1, 5)]
        public int Puntuacion { get; set; }

        [Column(TypeName = "TEXT")]
        public string? Comentario { get; set; }

        public DateTime FechaCalificacion { get; set; } = DateTime.UtcNow;

        // Nota: No usamos ForeignKey ni Navigation Property porque estamos usando bases de datos separadas
        // La relación se maneja a nivel de aplicación usando ClienteID y CuidadorID
    }
} 