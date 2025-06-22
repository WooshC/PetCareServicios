using Microsoft.EntityFrameworkCore;
using PetCareServicios.Models.Clientes;

namespace PetCareServicios.Data
{
    /// <summary>
    /// Contexto de base de datos específico para la gestión de clientes
    /// Separado del contexto de autenticación para mejor organización y escalabilidad
    /// </summary>
    public class ClientesDbContext : DbContext
    {
        public ClientesDbContext(DbContextOptions<ClientesDbContext> options) : base(options)
        {
        }

        // ===== ENTIDADES PRINCIPALES =====

        /// <summary>
        /// Perfiles de clientes con información de contacto
        /// </summary>
        public DbSet<Cliente> Clientes { get; set; }

        // ===== CONFIGURACIÓN DEL MODELO =====

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ===== CONFIGURACIÓN DE CLIENTE =====
            modelBuilder.Entity<Cliente>(entity =>
            {
                entity.HasKey(e => e.ClienteID);
                entity.Property(e => e.ClienteID).ValueGeneratedOnAdd();
                
                // Propiedades requeridas
                entity.Property(e => e.UsuarioID).IsRequired();
                entity.Property(e => e.DocumentoIdentidad).HasMaxLength(20).IsRequired();
                entity.Property(e => e.TelefonoEmergencia).HasMaxLength(15).IsRequired();
                
                // Estados y fechas
                entity.Property(e => e.DocumentoVerificado).HasDefaultValue(false);
                entity.Property(e => e.Estado).HasMaxLength(20).HasDefaultValue("Activo");
                entity.Property(e => e.FechaCreacion).HasDefaultValueSql("GETUTCDATE()");
                
                // Índices
                entity.HasIndex(e => e.UsuarioID).IsUnique();
                entity.HasIndex(e => e.DocumentoIdentidad).IsUnique();
            });
        }
    }
} 