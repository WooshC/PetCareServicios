using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using PetCareServicios.Data;
using PetCareServicios.Middleware;
using PetCareServicios.Models;
using PetCareServicios.Models.Auth;
using PetCareServicios.Services;
using PetCareServicios.Services.Interfaces;

var builder = WebApplication.CreateBuilder(args);

// ===== CONFIGURACIÓN DE SERVICIOS =====

// Agregar servicios al contenedor
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ===== CONFIGURACIÓN DE BASES DE DATOS =====

// Base de datos de autenticación
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("AuthConnection")));

// Base de datos de cuidadores
builder.Services.AddDbContext<CuidadoresDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("CuidadoresConnection")));

// Base de datos de clientes
builder.Services.AddDbContext<ClientesDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("ClientesConnection")));

// Base de datos de solicitudes
builder.Services.AddDbContext<SolicitudesDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("SolicitudesConnection")));

// Base de datos de calificaciones
builder.Services.AddDbContext<CalificacionesDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("CalificacionesConnection")));

// ===== CONFIGURACIÓN DE IDENTITY =====

builder.Services.AddIdentity<User, UserRole>(options =>
{
    // Configuración de contraseñas
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequiredLength = 8;

    // Configuración de usuarios
    options.User.RequireUniqueEmail = true;
    options.SignIn.RequireConfirmedEmail = false;
})
.AddEntityFrameworkStores<AppDbContext>()
.AddDefaultTokenProviders();

// ===== CONFIGURACIÓN DE JWT =====

builder.Services.AddJwtAuthentication(builder.Configuration);

// ===== CONFIGURACIÓN DE CORS =====

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// ===== REGISTRO DE SERVICIOS =====

// Servicios de autenticación
builder.Services.AddScoped<IAuthService, AuthService>();

// Servicios de cuidadores
builder.Services.AddScoped<ICuidadorService, CuidadorService>();

// ===== CONFIGURACIÓN DE AUTORIZACIÓN =====

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
    options.AddPolicy("CuidadorOnly", policy => policy.RequireRole("Cuidador"));
    options.AddPolicy("ClienteOnly", policy => policy.RequireRole("Cliente"));
});

var app = builder.Build();

// ===== CONFIGURACIÓN DE PIPELINE =====

// Configurar el pipeline de solicitudes HTTP
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Configurar CORS
app.UseCors("AllowFrontend");

// Configurar autenticación y autorización
app.UseAuthentication();
app.UseAuthorization();

// Mapear controladores
app.MapControllers();

// ===== MIGRACIONES Y SEED DATA =====

// Aplicar migraciones al iniciar la aplicación
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();
    
    try
    {
        // Obtener todos los DbContexts
        var authContext = services.GetRequiredService<AppDbContext>();
        var cuidadoresContext = services.GetRequiredService<CuidadoresDbContext>();
        var clientesContext = services.GetRequiredService<ClientesDbContext>();
        var solicitudesContext = services.GetRequiredService<SolicitudesDbContext>();
        var calificacionesContext = services.GetRequiredService<CalificacionesDbContext>();

        // Lista de contextos para aplicar migraciones
        var contexts = new (DbContext context, string dbName)[]
        {
            (authContext, "PetCareAuth"),
            (cuidadoresContext, "PetCareCuidadores"),
            (clientesContext, "PetCareClientes"),
            (solicitudesContext, "PetCareSolicitudes"),
            (calificacionesContext, "PetCareCalificaciones")
        };

        // Aplicar migraciones con retry mechanism
        var maxAttempts = 10;
        var delaySeconds = 10;

        foreach (var contextInfo in contexts)
        {
            for (int attempt = 1; attempt <= maxAttempts; attempt++)
            {
                try
                {
                    logger.LogInformation("Aplicando migraciones a {Database} (intento {Attempt}/{MaxAttempts})...", contextInfo.dbName, attempt, maxAttempts);
                    contextInfo.context.Database.Migrate();
                    logger.LogInformation("✅ Migraciones aplicadas exitosamente a {Database}", contextInfo.dbName);
                    break;
                }
                catch (Exception ex) when (attempt < maxAttempts)
                {
                    logger.LogWarning(ex, "❌ Error al aplicar migraciones a {Database} (intento {Attempt})", contextInfo.dbName, attempt);
                    logger.LogInformation("⏳ Esperando {Delay} segundos antes del siguiente intento...", delaySeconds);
                    Thread.Sleep(delaySeconds * 1000);
                    delaySeconds *= 2; // Exponential backoff
                }
            }
        }

        Console.WriteLine("✅ Todas las migraciones aplicadas exitosamente");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "❌ Error crítico al aplicar migraciones");
        Console.WriteLine($"❌ Error al aplicar migraciones: {ex.Message}");
    }
}

app.Run();