using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using PetCareServicios.Models.Auth;

namespace PetCareServicios.Data
{
    public class AppDbContext : IdentityDbContext<User, UserRole, int>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Cuidador> Cuidadores { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configuración adicional para User si es necesaria
            modelBuilder.Entity<User>(entity =>
            {
                entity.Property(e => e.Name).HasMaxLength(100);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            });

            // Configuración adicional para UserRole si es necesaria
            modelBuilder.Entity<UserRole>(entity =>
            {
                entity.Property(e => e.Description).HasMaxLength(200);
            });

            // Configuración para Cuidador
            modelBuilder.Entity<Cuidador>(entity =>
            {
                entity.HasKey(e => e.CuidadorID);
                entity.Property(e => e.CuidadorID).ValueGeneratedOnAdd();
                
                entity.Property(e => e.DocumentoIdentidad).HasMaxLength(20).IsRequired();
                entity.Property(e => e.TelefonoEmergencia).HasMaxLength(15);
                entity.Property(e => e.Biografia).HasColumnType("TEXT");
                entity.Property(e => e.Experiencia).HasColumnType("TEXT");
                entity.Property(e => e.HorarioAtencion).HasMaxLength(100);
                entity.Property(e => e.TarifaPorHora).HasColumnType("DECIMAL(10,2)");
                entity.Property(e => e.CalificacionPromedio).HasColumnType("DECIMAL(3,2)").HasDefaultValue(0.0m);
                
                entity.Property(e => e.DocumentoVerificado).HasDefaultValue(false);
                entity.Property(e => e.FechaCreacion).HasDefaultValueSql("GETUTCDATE()");
                
                // Relación con User
                entity.HasOne(e => e.Usuario)
                      .WithMany()
                      .HasForeignKey(e => e.UsuarioID)
                      .OnDelete(DeleteBehavior.Cascade);
                
                // Índice único en UsuarioID
                entity.HasIndex(e => e.UsuarioID).IsUnique();
            });
        }
    }
} 