using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using PetCareServicios.Data;
using PetCareServicios.Middleware;
using PetCareServicios.Models.Auth;
using PetCareServicios.Services;
using PetCareServicios.Services.Interfaces;
using PetCareServicios.Configuraciones;

var builder = WebApplication.CreateBuilder(args);

// ==================== CONFIGURACIÓN DE SERVICIOS ====================

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddPetCareServices(builder.Configuration);

var app = builder.Build();

// ==================== CONFIGURACIÓN DEL PIPELINE ====================

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.UseWebSockets();
app.MapControllers();

// ===== APLICACIÓN DE MIGRACIONES Y LOGS =====

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