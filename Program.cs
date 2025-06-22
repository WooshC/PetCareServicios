using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using PetCareServicios.Data;
using PetCareServicios.Models.Auth;
using PetCareServicios.Services;
using PetCareServicios.Services.Interfaces;
using PetCareServicios.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add CORS
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


// Configure DbContext with Identity (Base de datos de autenticación)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Configure CuidadoresDbContext (Base de datos de cuidadores)
builder.Services.AddDbContext<CuidadoresDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("CuidadoresConnection")));

// Configure SolicitudesDbContext (Base de datos de solicitudes)
builder.Services.AddDbContext<SolicitudesDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("SolicitudesConnection")));

// Configure CalificacionesDbContext (Base de datos de calificaciones)
builder.Services.AddDbContext<CalificacionesDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("CalificacionesConnection")));

// Add Identity
builder.Services.AddIdentity<User, UserRole>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequiredLength = 8;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = true;
    options.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<AppDbContext>()
.AddDefaultTokenProviders();

// Configure JWT Authentication
builder.Services.AddJwtAuthentication(builder.Configuration);

// Add custom services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ICuidadorService, CuidadorService>();

var app = builder.Build();

// Configure pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}



// Use CORS
app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Apply migrations with retry logic for all databases
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();
    
    try
    {
        // Get all DbContexts
        var authDb = services.GetRequiredService<AppDbContext>();
        var cuidadoresDb = services.GetRequiredService<CuidadoresDbContext>();
        var solicitudesDb = services.GetRequiredService<SolicitudesDbContext>();
        var calificacionesDb = services.GetRequiredService<CalificacionesDbContext>();
        var maxAttempts = 5;
        
        for (int attempt = 1; attempt <= maxAttempts; attempt++)
        {
            try
            {
                logger.LogInformation("Applying migrations to PetCareAuth database (attempt {Attempt})...", attempt);
                authDb.Database.Migrate();
                logger.LogInformation("PetCareAuth migrations applied successfully");
                
                logger.LogInformation("Applying migrations to PetCareCuidadores database (attempt {Attempt})...", attempt);
                cuidadoresDb.Database.Migrate();
                logger.LogInformation("PetCareCuidadores migrations applied successfully");
                
                logger.LogInformation("Applying migrations to PetCareSolicitudes database (attempt {Attempt})...", attempt);
                solicitudesDb.Database.Migrate();
                logger.LogInformation("PetCareSolicitudes migrations applied successfully");
                
                logger.LogInformation("Applying migrations to PetCareCalificaciones database (attempt {Attempt})...", attempt);
                calificacionesDb.Database.Migrate();
                logger.LogInformation("PetCareCalificaciones migrations applied successfully");
                
                break;
            }
            catch (Exception ex) when (attempt < maxAttempts)
            {
                logger.LogWarning(ex, "Migration attempt {Attempt} failed", attempt);
                Thread.Sleep(5000 * attempt);
            }
        }
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "An error occurred while applying migrations");
    }
}

app.Run();