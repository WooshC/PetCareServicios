using Microsoft.EntityFrameworkCore;
using PetCareServicios.Models.Solicitudes;

namespace PetCareServicios.Data
{
    /// <summary>
    /// Contexto de base de datos específico para la gestión de solicitudes de servicios
    /// Maneja el flujo completo de solicitudes entre clientes y cuidadores
    /// </summary>
    public class SolicitudesDbContext : DbContext
    {
        public SolicitudesDbContext(DbContextOptions<SolicitudesDbContext> options) : base(options)
        {
        }

        // ===== ENTIDADES PRINCIPALES =====

        /// <summary>
        /// Solicitudes de servicios de clientes a cuidadores
        /// </summary>
        public DbSet<Solicitud> Solicitudes { get; set; }

        // ===== CONFIGURACIÓN DEL MODELO =====

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ===== CONFIGURACIÓN DE SOLICITUD =====
            modelBuilder.Entity<Solicitud>(entity =>
            {
                entity.HasKey(e => e.SolicitudID);
                entity.Property(e => e.SolicitudID).ValueGeneratedOnAdd();
                
                // Propiedades opcionales
                entity.Property(e => e.ClienteID).IsRequired(false);
                entity.Property(e => e.CuidadorID).IsRequired(false);
                
                // Propiedades requeridas
                entity.Property(e => e.TipoServicio).HasMaxLength(50).IsRequired();
                entity.Property(e => e.Descripcion).HasColumnType("TEXT").IsRequired();
                entity.Property(e => e.FechaHoraInicio).IsRequired();
                entity.Property(e => e.DuracionHoras).IsRequired();
                entity.Property(e => e.Ubicacion).HasMaxLength(200).IsRequired();
                
                // Estado y fechas
                entity.Property(e => e.Estado).HasMaxLength(20).HasDefaultValue("Pendiente");
                entity.Property(e => e.FechaCreacion).HasDefaultValueSql("GETUTCDATE()");
                
                // Restricciones
                entity.ToTable("Solicitudes", t =>
                {
                    t.HasCheckConstraint("CHK_Duracion", "DuracionHoras > 0");
                    t.HasCheckConstraint("CHK_Estado", "Estado IN ('Pendiente', 'Aceptada', 'En Progreso', 'Fuera de Tiempo', 'Finalizada', 'Rechazada')");
                });
                
                // Índices para mejorar el rendimiento
                entity.HasIndex(e => e.CuidadorID).HasDatabaseName("IX_Solicitudes_CuidadorID");
                entity.HasIndex(e => e.ClienteID).HasDatabaseName("IX_Solicitudes_ClienteID");
                entity.HasIndex(e => e.Estado).HasDatabaseName("IX_Solicitudes_Estado");
                entity.HasIndex(e => e.FechaHoraInicio).HasDatabaseName("IX_Solicitudes_FechaHoraInicio");
                entity.HasIndex(e => new { e.CuidadorID, e.Estado }).HasDatabaseName("IX_Solicitudes_CuidadorID_Estado");
                entity.HasIndex(e => new { e.ClienteID, e.Estado }).HasDatabaseName("IX_Solicitudes_ClienteID_Estado");
            });
        }
    }
} 