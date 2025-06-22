using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using PetCareServicios.Data;
using PetCareServicios.Middleware;
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

// Base de datos principal para autenticación
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Base de datos para cuidadores
builder.Services.AddDbContext<CuidadoresDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("CuidadoresConnection")));

// Base de datos para clientes
builder.Services.AddDbContext<ClientesDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("ClientesConnection")));

// Base de datos para solicitudes
builder.Services.AddDbContext<SolicitudesDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("SolicitudesConnection")));

// Base de datos para calificaciones
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
    options.SignIn.RequireConfirmedEmail = false; // Cambiar a true en producción
})
.AddEntityFrameworkStores<AppDbContext>()
.AddDefaultTokenProviders();

// ===== CONFIGURACIÓN DE AUTENTICACIÓN JWT =====

builder.Services.AddJwtAuthentication(builder.Configuration);

// ===== CONFIGURACIÓN DE AUTORIZACIÓN =====

builder.Services.AddAuthorization(options =>
{
    // Políticas de autorización
    options.AddPolicy("RequireAdminRole", policy => policy.RequireRole("Admin"));
    options.AddPolicy("RequireClienteRole", policy => policy.RequireRole("Cliente"));
    options.AddPolicy("RequireCuidadorRole", policy => policy.RequireRole("Cuidador"));
});

// ===== REGISTRO DE SERVICIOS =====

// Servicios de autenticación
builder.Services.AddScoped<IAuthService, AuthService>();

// Servicios de gestión de perfiles
builder.Services.AddScoped<ICuidadorService, CuidadorService>();
builder.Services.AddScoped<IClienteService, ClienteService>();

// Servicios de gestión de solicitudes y calificaciones
builder.Services.AddScoped<ISolicitudService, SolicitudService>();
builder.Services.AddScoped<ICalificacionService, CalificacionService>();

// ===== CONFIGURACIÓN DE CORS =====

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// ===== CONFIGURACIÓN DE LA APLICACIÓN =====

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

// ===== APLICACIÓN DE MIGRACIONES =====

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    
    try
    {
        Console.WriteLine("🔄 Iniciando aplicación de migraciones...");
        
        // Obtener todos los contextos
        var appContext = services.GetRequiredService<AppDbContext>();
        var cuidadoresContext = services.GetRequiredService<CuidadoresDbContext>();
        var clientesContext = services.GetRequiredService<ClientesDbContext>();
        var solicitudesContext = services.GetRequiredService<SolicitudesDbContext>();
        var calificacionesContext = services.GetRequiredService<CalificacionesDbContext>();

        // Lista de contextos para aplicar migraciones
        var contexts = new (string Name, DbContext Context)[]
        {
            ("AppDbContext", appContext),
            ("CuidadoresDbContext", cuidadoresContext),
            ("ClientesDbContext", clientesContext),
            ("SolicitudesDbContext", solicitudesContext),
            ("CalificacionesDbContext", calificacionesContext)
        };

        // Aplicar migraciones a cada contexto
        foreach (var contextInfo in contexts)
        {
            try
            {
                Console.WriteLine($"📊 Aplicando migraciones a {contextInfo.Name}...");
                
                // Para la base de datos de Auth, agregar más reintentos
                int maxRetries = contextInfo.Name.Contains("AppDbContext") ? 5 : 2;
                int currentRetry = 0;
                
                while (currentRetry < maxRetries)
                {
                    try
                    {
                        // Aplicar migraciones directamente (sin EnsureCreatedAsync)
                        await contextInfo.Context.Database.MigrateAsync();
                        Console.WriteLine($"✅ Migraciones aplicadas exitosamente a {contextInfo.Name}");
                        break; // Salir del bucle si es exitoso
                    }
                    catch (Exception ex)
                    {
                        currentRetry++;
                        Console.WriteLine($"⚠️ Intento {currentRetry}/{maxRetries} falló para {contextInfo.Name}: {ex.Message}");
                        
                        if (currentRetry >= maxRetries)
                        {
                            throw; // Re-lanzar la excepción si se agotaron los intentos
                        }
                        
                        // Esperar antes del siguiente intento
                        int waitTime = currentRetry * 3; // 3, 6, 9, 12 segundos
                        Console.WriteLine($"⏳ Esperando {waitTime} segundos antes del siguiente intento...");
                        await Task.Delay(waitTime * 1000);
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error al aplicar migraciones a {contextInfo.Name}: {ex.Message}");
                
                // Si es un error de conexión, esperar un poco y reintentar
                if (ex.Message.Contains("connection") || ex.Message.Contains("timeout") || ex.Message.Contains("database"))
                {
                    Console.WriteLine("⏳ Esperando 10 segundos antes de reintentar...");
                    await Task.Delay(10000);
                    
                    try
                    {
                        await contextInfo.Context.Database.MigrateAsync();
                        Console.WriteLine($"✅ Migraciones aplicadas exitosamente a {contextInfo.Name} (reintento final)");
                    }
                    catch (Exception retryEx)
                    {
                        Console.WriteLine($"❌ Error en reintento final para {contextInfo.Name}: {retryEx.Message}");
                    }
                }
            }
        }

        Console.WriteLine("🎉 Proceso de migraciones completado");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ Error general al aplicar migraciones: {ex.Message}");
        Console.WriteLine($"📋 Stack trace: {ex.StackTrace}");
    }
}

// ===== INICIO DE LA APLICACIÓN =====

Console.WriteLine("🚀 PetCare API iniciando...");
Console.WriteLine($"📊 Entorno: {app.Environment.EnvironmentName}");
Console.WriteLine($"🌐 URL: {app.Urls.FirstOrDefault() ?? "No configurada"}");

app.Run();