using System.ComponentModel.DataAnnotations;

namespace PetCareServicios.Models.Calificaciones
{
    public class CalificacionRequest
    {
        [Required]
        public int CuidadorID { get; set; }

        [Required]
        public int ClienteID { get; set; }

        [Required]
        [Range(1, 5)]
        public int Puntuacion { get; set; }

        public string? Comentario { get; set; }
    }

    public class CalificacionResponse
    {
        public int CalificacionID { get; set; }
        public int CuidadorID { get; set; }
        public int ClienteID { get; set; }
        public int Puntuacion { get; set; }
        public string? Comentario { get; set; }
        public DateTime FechaCalificacion { get; set; }
        
        // Información adicional del cliente y cuidador
        public string NombreCliente { get; set; } = string.Empty;
        public string EmailCliente { get; set; } = string.Empty;
        public string NombreCuidador { get; set; } = string.Empty;
        public string EmailCuidador { get; set; } = string.Empty;
    }
} 