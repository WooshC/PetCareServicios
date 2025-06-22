using Microsoft.EntityFrameworkCore;
using PetCareServicios.Models.Auth;
using PetCareServicios.Models.Cuidadores;

namespace PetCareServicios.Data
{
    /// <summary>
    /// Contexto de base de datos específico para la gestión de cuidadores
    /// Separado del contexto de autenticación para mejor organización y escalabilidad
    /// </summary>
    public class CuidadoresDbContext : DbContext
    {
        public CuidadoresDbContext(DbContextOptions<CuidadoresDbContext> options) : base(options)
        {
        }

        // ===== ENTIDADES PRINCIPALES =====

        /// <summary>
        /// Perfiles de cuidadores con información detallada
        /// </summary>
        public DbSet<Cuidador> Cuidadores { get; set; }

        // ===== CONFIGURACIÓN DEL MODELO =====

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ===== CONFIGURACIÓN DE CUIDADOR =====
            modelBuilder.Entity<Cuidador>(entity =>
            {
                entity.HasKey(e => e.CuidadorID);
                entity.Property(e => e.CuidadorID).ValueGeneratedOnAdd();
                
                // Propiedades requeridas
                entity.Property(e => e.UsuarioID).IsRequired();
                entity.Property(e => e.DocumentoIdentidad).HasMaxLength(20).IsRequired();
                entity.Property(e => e.TelefonoEmergencia).HasMaxLength(15).IsRequired();
                
                // Propiedades opcionales
                entity.Property(e => e.Biografia).HasColumnType("TEXT");
                entity.Property(e => e.Experiencia).HasColumnType("TEXT");
                entity.Property(e => e.HorarioAtencion).HasMaxLength(100);
                entity.Property(e => e.TarifaPorHora).HasColumnType("DECIMAL(10,2)");
                entity.Property(e => e.CalificacionPromedio).HasColumnType("DECIMAL(3,2)").HasDefaultValue(0.0m);
                
                // Estados y fechas
                entity.Property(e => e.DocumentoVerificado).HasDefaultValue(false);
                entity.Property(e => e.FechaCreacion).HasDefaultValueSql("GETUTCDATE()");
                
                // Índices
                entity.HasIndex(e => e.UsuarioID).IsUnique();
                entity.HasIndex(e => e.DocumentoIdentidad).IsUnique();
            });
        }
    }
} 