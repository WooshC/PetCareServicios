using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using PetCareServicios.Data;
using PetCareServicios.Models.Auth;
using PetCareServicios.Services;
using PetCareServicios.Services.Interfaces;
using PetCareServicios.Middleware;

namespace PetCareServicios.Configuraciones
{
    public static class ServiceConfiguration
    {
        public static void AddPetCareServices(this IServiceCollection services, IConfiguration configuration)
        {
            // Bases de datos
            services.AddDbContext<AppDbContext>(options =>
                options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));
            services.AddDbContext<CuidadoresDbContext>(options =>
                options.UseSqlServer(configuration.GetConnectionString("CuidadoresConnection")));
            services.AddDbContext<ClientesDbContext>(options =>
                options.UseSqlServer(configuration.GetConnectionString("ClientesConnection")));
            services.AddDbContext<SolicitudesDbContext>(options =>
                options.UseSqlServer(configuration.GetConnectionString("SolicitudesConnection")));
            services.AddDbContext<CalificacionesDbContext>(options =>
                options.UseSqlServer(configuration.GetConnectionString("CalificacionesConnection")));

            // Identity
            services.AddIdentity<User, UserRole>(options =>
            {
                options.Password.RequireDigit = true;
                options.Password.RequireLowercase = true;
                options.Password.RequireUppercase = true;
                options.Password.RequireNonAlphanumeric = false;
                options.Password.RequiredLength = 8;
                options.User.RequireUniqueEmail = true;
                options.SignIn.RequireConfirmedEmail = false;
            })
            .AddEntityFrameworkStores<AppDbContext>()
            .AddDefaultTokenProviders();

            // JWT
            services.AddJwtAuthentication(configuration);

            // Autorización
            services.AddAuthorization(options =>
            {
                options.AddPolicy("RequireAdminRole", policy => policy.RequireRole("Admin"));
                options.AddPolicy("RequireClienteRole", policy => policy.RequireRole("Cliente"));
                options.AddPolicy("RequireCuidadorRole", policy => policy.RequireRole("Cuidador"));
            });

            // Servicios personalizados
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<ICuidadorService, CuidadorService>();
            services.AddScoped<IClienteService, ClienteService>();
            services.AddScoped<ISolicitudService, SolicitudService>();
            services.AddScoped<ICalificacionService, CalificacionService>();

            // CORS
            services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontend", policy =>
                {
                    policy.WithOrigins("http://localhost:3000", "http://localhost:5173")
                          .AllowAnyHeader()
                          .AllowAnyMethod()
                          .AllowCredentials();
                });
            });
        }
    }
} 