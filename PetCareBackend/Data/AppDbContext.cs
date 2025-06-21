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
        }
    }
} 