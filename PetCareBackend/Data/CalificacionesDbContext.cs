using Microsoft.EntityFrameworkCore;
using PetCareServicios.Models.Calificaciones;

namespace PetCareServicios.Data
{
    /// <summary>
    /// Contexto de base de datos específico para la gestión de calificaciones y reseñas
    /// Maneja el sistema de calificaciones entre clientes y cuidadores
    /// </summary>
    public class CalificacionesDbContext : DbContext
    {
        public CalificacionesDbContext(DbContextOptions<CalificacionesDbContext> options) : base(options)
        {
        }

        // ===== ENTIDADES PRINCIPALES =====

        /// <summary>
        /// Calificaciones y reseñas de clientes a cuidadores
        /// </summary>
        public DbSet<Calificacion> Calificaciones { get; set; }

        // ===== CONFIGURACIÓN DEL MODELO =====

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ===== CONFIGURACIÓN DE CALIFICACIÓN =====
            modelBuilder.Entity<Calificacion>(entity =>
            {
                entity.HasKey(e => e.CalificacionID);
                entity.Property(e => e.CalificacionID).ValueGeneratedOnAdd();
                
                // Propiedades requeridas
                entity.Property(e => e.CuidadorID).IsRequired();
                entity.Property(e => e.ClienteID).IsRequired();
                entity.Property(e => e.Puntuacion).IsRequired();
                entity.Property(e => e.Comentario).HasColumnType("TEXT");
                
                // Fecha
                entity.Property(e => e.FechaCalificacion).HasDefaultValueSql("GETUTCDATE()");
                
                // Restricciones
                entity.HasCheckConstraint("CHK_Puntuacion", "Puntuacion BETWEEN 1 AND 5");
                
                // Índices para mejorar el rendimiento
                entity.HasIndex(e => e.CuidadorID).HasDatabaseName("IX_Calificaciones_CuidadorID");
                entity.HasIndex(e => e.ClienteID).HasDatabaseName("IX_Calificaciones_ClienteID");
                entity.HasIndex(e => e.FechaCalificacion).HasDatabaseName("IX_Calificaciones_FechaCalificacion");
                entity.HasIndex(e => new { e.CuidadorID, e.FechaCalificacion }).HasDatabaseName("IX_Calificaciones_CuidadorID_Fecha");
                
                // Índice único para evitar calificaciones duplicadas del mismo cliente al mismo cuidador
                entity.HasIndex(e => new { e.CuidadorID, e.ClienteID }).IsUnique().HasDatabaseName("IX_Calificaciones_CuidadorID_ClienteID_Unique");
            });
        }
    }
} 