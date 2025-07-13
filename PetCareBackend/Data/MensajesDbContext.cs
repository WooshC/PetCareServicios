using Microsoft.EntityFrameworkCore;
using PetCareServicios.Models.Mensajes;

namespace PetCareServicios.Data
{
    public class MensajesDbContext : DbContext
    {
        public MensajesDbContext(DbContextOptions<MensajesDbContext> options) : base(options)
        {
        }

        public DbSet<Mensaje> Mensajes { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configuración de la tabla Mensajes
            modelBuilder.Entity<Mensaje>(entity =>
            {
                entity.ToTable("Mensajes");
                
                entity.HasKey(e => e.MensajeID);
                
                entity.Property(e => e.Contenido)
                    .IsRequired()
                    .HasMaxLength(1000);
                
                entity.Property(e => e.Timestamp)
                    .IsRequired();
                
                entity.Property(e => e.EsLeido)
                    .IsRequired()
                    .HasDefaultValue(false);
                
                entity.Property(e => e.TipoMensaje)
                    .HasMaxLength(20)
                    .HasDefaultValue("Texto");
                
                entity.Property(e => e.FechaCreacion)
                    .IsRequired()
                    .HasDefaultValueSql("GETUTCDATE()");
                
                // Índices para mejorar el rendimiento
                entity.HasIndex(e => e.SolicitudID);
                entity.HasIndex(e => e.RemitenteID);
                entity.HasIndex(e => e.Timestamp);
                entity.HasIndex(e => new { e.SolicitudID, e.Timestamp });
            });
        }
    }
} 