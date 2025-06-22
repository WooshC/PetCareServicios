# 📖 README Backend - PetCare API

Documentación detallada del backend de PetCare con .NET 8, Entity Framework y autenticación JWT.

## 🚀 Instalación del Backend

### Prerrequisitos
- **Docker Desktop** (recomendado)
- **.NET 8 SDK** (para desarrollo local)
- **SQL Server** (incluido en Docker)

### Opción 1: Docker (Recomendado)

#### Instalación Completa
```bash
# Clonar repositorio
git clone https://github.com/WooshC/PetCareServicios.git
cd PetCareServicios

# Ejecutar backend y base de datos
docker-compose up -d

# Verificar funcionamiento
curl http://localhost:5000/api/auth/health
```

#### Solo Backend (para desarrollo frontend)
```bash
# Ejecutar solo backend y base de datos
docker-compose up -d

# El frontend puede ejecutarse manualmente
cd PetCareFrond
npm install
npm run dev
```

### Opción 2: Desarrollo Local

#### Configurar Base de Datos
```bash
# Instalar SQL Server localmente o usar Docker
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=YourStrong@Passw0rd" \
  -p 1433:1433 --name sqlserver -d mcr.microsoft.com/mssql/server:2022-latest
```

#### Configurar Conexión
Editar `appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=PetCareAuth;User=sa;Password=YourStrong@Passw0rd;TrustServerCertificate=True;",
    "CuidadoresConnection": "Server=localhost;Database=PetCareCuidadores;User=sa;Password=YourStrong@Passw0rd;TrustServerCertificate=True;"
  }
}
```

#### Ejecutar Backend
```bash
# Restaurar dependencias
dotnet restore

# Aplicar migraciones
dotnet ef database update --context AppDbContext
dotnet ef database update --context CuidadoresDbContext

# Ejecutar aplicación
dotnet run
```

## 🏗️ Arquitectura del Backend

### Estructura de Capas
```
Controllers/           # Controladores de API
├── AuthController.cs  # Autenticación y registro
└── CuidadorController.cs  # Gestión de cuidadores

Services/              # Lógica de negocio
├── AuthService.cs     # Servicio de autenticación
├── CuidadorService.cs # Servicio de cuidadores
└── Interfaces/        # Contratos de servicios

Models/                # Modelos de datos
├── Auth/              # Modelos de autenticación
│   ├── User.cs        # Usuario (Identity)
│   ├── UserRole.cs    # Rol de usuario
│   ├── LoginRequest.cs # Solicitud de login
│   └── AuthResponse.cs # Respuesta de autenticación
├── Cuidadores/        # Modelos de cuidadores
│   ├── Cuidador.cs    # Entidad cuidador
│   └── CuidadorRequest.cs # DTOs
└── AppSettings.cs     # Configuraciones

Data/                  # Acceso a datos
├── AppDbContext.cs    # Contexto de autenticación
└── CuidadoresDbContext.cs # Contexto de cuidadores

Middleware/            # Middleware personalizado
└── JwtMiddleware.cs   # Configuración JWT
```

### Base de Datos Separada
El sistema utiliza **dos bases de datos separadas**:

1. **PetCareAuth** - Autenticación y usuarios
   - `AspNetUsers` - Usuarios del sistema
   - `AspNetRoles` - Roles disponibles
   - `AspNetUserRoles` - Asignación de roles

2. **PetCareCuidadores** - Gestión de cuidadores
   - `Cuidadores` - Perfiles de cuidadores

## 🔌 API Endpoints

### 🔐 Autenticación

#### POST `/api/auth/login`
Inicia sesión con validación de rol.

**Request:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "Password123",
  "role": "Cuidador"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Login exitoso"
}
```

#### POST `/api/auth/register`
Registra un nuevo usuario con asignación de rol.

**Request:**
```json
{
  "email": "nuevo@ejemplo.com",
  "password": "Password123",
  "name": "Juan Pérez",
  "role": "Cuidador"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Usuario registrado exitosamente"
}
```

#### GET `/api/auth/health`
Verifica el estado de la API.

**Response:**
```
"PetCare API is running!"
```

### 👥 Cuidadores

#### GET `/api/cuidador`
Obtiene todos los cuidadores registrados.
**Requiere autenticación**

#### GET `/api/cuidador/{id}`
Obtiene un cuidador específico por ID.
**Requiere autenticación**

#### GET `/api/cuidador/mi-perfil`
Obtiene el perfil del cuidador autenticado.
**Requiere autenticación**

**Response:**
```json
{
  "cuidadorID": 1,
  "usuarioID": 1,
  "documentoIdentidad": "12345678",
  "telefonoEmergencia": "+57 300 123 4567",
  "biografia": "Amante de los animales...",
  "experiencia": "5 años cuidando mascotas...",
  "horarioAtencion": "Lunes a Viernes 8:00 AM - 6:00 PM",
  "tarifaPorHora": 25000,
  "calificacionPromedio": 4.5,
  "documentoVerificado": true,
  "fechaCreacion": "2025-01-15T10:30:00Z",
  "nombreUsuario": "Juan Pérez",
  "emailUsuario": "juan@ejemplo.com"
}
```

#### POST `/api/cuidador`
Crea un nuevo perfil de cuidador.
**Requiere autenticación**

**Request:**
```json
{
  "documentoIdentidad": "12345678",
  "telefonoEmergencia": "+57 300 123 4567",
  "biografia": "Amante de los animales...",
  "experiencia": "5 años cuidando mascotas...",
  "horarioAtencion": "Lunes a Viernes 8:00 AM - 6:00 PM",
  "tarifaPorHora": 25000
}
```

#### PUT `/api/cuidador/mi-perfil`
Actualiza el perfil del cuidador autenticado.
**Requiere autenticación**

#### PUT `/api/cuidador/{id}`
Actualiza un cuidador específico.
**Requiere rol Admin**

#### DELETE `/api/cuidador/{id}`
Elimina un cuidador.
**Requiere rol Admin**

#### POST `/api/cuidador/{id}/verificar`
Marca el documento de un cuidador como verificado.
**Requiere rol Admin**

## 🔐 Autenticación JWT

### Configuración
```json
{
  "Jwt": {
    "Key": "YourSuperSecretKeyForJWTTokenGeneration",
    "Issuer": "PetCareApp",
    "Audience": "PetCareUsers",
    "ExpirationHours": 24
  }
}
```

### Claims del Token
```csharp
new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
new Claim(ClaimTypes.Email, user.Email ?? ""),
new Claim(ClaimTypes.Name, user.Name)
```

### Uso en Requests
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🗄️ Base de Datos

### Migraciones

#### Crear Nueva Migración
```bash
# Para autenticación
dotnet ef migrations add NombreMigracion --context AppDbContext

# Para cuidadores
dotnet ef migrations add NombreMigracion --context CuidadoresDbContext
```

#### Aplicar Migraciones
```bash
# Para autenticación
dotnet ef database update --context AppDbContext

# Para cuidadores
dotnet ef database update --context CuidadoresDbContext
```

#### Revertir Migración
```bash
dotnet ef database update NombreMigracionAnterior --context AppDbContext
```

### Esquema de Tablas

#### AspNetUsers (Autenticación)
```sql
Id (int, PK)
UserName (nvarchar)
Email (nvarchar)
Name (nvarchar)
CreatedAt (datetime)
```

#### Cuidadores (Gestión de Cuidadores)
```sql
CuidadorID (int, PK)
UsuarioID (int, FK -> AspNetUsers.Id)
DocumentoIdentidad (nvarchar(20))
TelefonoEmergencia (nvarchar(15))
Biografia (text, nullable)
Experiencia (text, nullable)
HorarioAtencion (nvarchar(100), nullable)
TarifaPorHora (decimal(10,2), nullable)
CalificacionPromedio (decimal(3,2), default 0.0)
DocumentoVerificado (bit, default false)
FechaVerificacion (datetime, nullable)
Estado (nvarchar(20), default 'Activo')
FechaCreacion (datetime, default GETUTCDATE())
FechaActualizacion (datetime, nullable)
```

## 🔧 Configuración

### Variables de Entorno
```bash
# JWT Configuration
JWT__KEY=YourSuperSecretKeyForJWTTokenGeneration
JWT__ISSUER=PetCareApp
JWT__AUDIENCE=PetCareUsers
JWT__EXPIRATIONHOURS=24

# Database Connections
CONNECTIONSTRINGS__DEFAULTCONNECTION=Server=db;Database=PetCareAuth;User=sa;Password=YourStrong@Passw0rd;TrustServerCertificate=True;
CONNECTIONSTRINGS__CUIDADORESCONNECTION=Server=db;Database=PetCareCuidadores;User=sa;Password=YourStrong@Passw0rd;TrustServerCertificate=True;
```

### CORS Configuration
```csharp
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
```

## 🐛 Troubleshooting

### Error de Conexión a Base de Datos
```bash
# Verificar que SQL Server esté ejecutándose
docker ps | grep sqlserver

# Verificar connection string
# Revisar logs del contenedor
docker-compose logs petcare-db
```

### Error "Invalid object name 'AspNetUsers'"
```bash
# Aplicar migraciones
dotnet ef database update --context AppDbContext
dotnet ef database update --context CuidadoresDbContext

# O reiniciar contenedores
docker-compose down
docker-compose up -d
```

### Error de Autenticación JWT
```bash
# Verificar configuración JWT en appsettings.json
# Revisar logs del backend
docker-compose logs petcare-api

# Verificar token en localStorage del navegador
```

### Error de CORS
```bash
# Verificar configuración CORS en Program.cs
# Asegurar que el frontend esté en http://localhost:3000
```

## 📊 Logs y Monitoreo

### Ver Logs en Tiempo Real
```bash
# Backend
docker-compose logs -f petcare-api

# Base de datos
docker-compose logs -f petcare-db
```

### Logs de Desarrollo
```bash
# Ver logs detallados
dotnet run --environment Development

# Ver logs de Entity Framework
# Agregar en appsettings.Development.json:
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.EntityFrameworkCore.Database.Command": "Information"
    }
  }
}
```

## 🔄 Comandos Útiles

### Desarrollo
```bash
# Restaurar dependencias
dotnet restore

# Compilar
dotnet build

# Ejecutar tests
dotnet test

# Limpiar
dotnet clean
```

### Docker
```bash
# Reconstruir imagen
docker-compose build --no-cache

# Ver logs
docker-compose logs -f

# Ejecutar comandos en contenedor
docker-compose exec petcare-api dotnet ef database update
```

### Base de Datos
```bash
# Conectar a SQL Server
docker exec -it petcareservicios-db-1 /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P YourStrong@Passw0rd

# Backup
docker exec petcareservicios-db-1 /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P YourStrong@Passw0rd -Q "BACKUP DATABASE PetCareAuth TO DISK = '/var/opt/mssql/backup/PetCareAuth.bak'"
```

---

<div align="center">
  <p>🔧 <strong>Backend PetCare</strong></p>
  <p>✨ .NET 8 + Entity Framework + JWT</p>
  <p>🗄️ SQL Server + Migraciones</p>
  <p>🐳 Docker + Docker Compose</p>
</div> 