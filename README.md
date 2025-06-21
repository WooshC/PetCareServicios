# PetCare API 🐾

API REST para servicios de cuidado de mascotas desarrollada en **.NET 8** con autenticación JWT y ASP.NET Core Identity.

## 🚀 Características Principales

- **🔐 Autenticación JWT**: Sistema completo de registro y login de usuarios
- **🛡️ ASP.NET Core Identity**: Gestión robusta de usuarios y roles
- **📚 Documentación Swagger**: API documentada automáticamente
- **✅ Validación de Modelos**: Validaciones robustas con Data Annotations
- **🏥 Health Checks**: Endpoints para monitoreo del sistema
- **🗄️ Entity Framework Core**: ORM para acceso a base de datos SQL Server
- **🐳 Docker Ready**: Configuración completa para despliegue con contenedores

## 📋 Prerrequisitos

- **.NET 8.0 SDK** o superior
- **Docker Desktop** (recomendado)
- **SQL Server** (incluido en Docker Compose)

## 🛠️ Instalación y Despliegue

### Opción 1: Docker (Recomendado) 🐳

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd PetCareServicios

# 2. Ejecutar con Docker Compose
docker-compose up -d

# 3. Verificar que esté funcionando
curl http://localhost:5000/api/auth/health
```

### Opción 2: Desarrollo Local

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd PetCareServicios

# 2. Configurar la base de datos
# Actualizar la cadena de conexión en appsettings.json

# 3. Ejecutar las migraciones
dotnet ef database update

# 4. Ejecutar la aplicación
dotnet run
```

## 🌐 URLs de Acceso

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **API** | http://localhost:5000 | Endpoint principal de la API |
| **Swagger** | http://localhost:5000/swagger | Documentación interactiva |
| **Base de Datos** | localhost:14433 | SQL Server (usuario: sa, password: YourStrong@Passw0rd) |

## 📚 Endpoints de la API

### 🔐 Autenticación

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| `POST` | `/api/auth/register` | Registrar nuevo usuario | ❌ |
| `POST` | `/api/auth/login` | Iniciar sesión | ❌ |
| `GET` | `/api/auth/health` | Verificar estado de la API | ❌ |

### 📖 Ejemplos de Uso

#### 🔑 Registrar Usuario
```bash
curl -X POST "http://localhost:5000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@ejemplo.com",
    "password": "Contraseña123!",
    "name": "Juan Pérez"
  }'
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Usuario registrado exitosamente"
}
```

#### 🔐 Iniciar Sesión
```bash
curl -X POST "http://localhost:5000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@ejemplo.com",
    "password": "Contraseña123!"
  }'
```

#### 🏥 Verificar Estado
```bash
curl -X GET "http://localhost:5000/api/auth/health"
```

## 🏗️ Arquitectura del Proyecto

```
PetCareServicios/
├── 📁 PetCareBackend/
│   ├── 📁 Controllers/
│   │   └── 🔧 AuthController.cs          # Controlador de autenticación
│   ├── 📁 Models/Auth/
│   │   ├── 📝 LoginRequest.cs            # Modelo de solicitud de login
│   │   ├── 📝 AuthResponse.cs            # Modelo de respuesta de autenticación
│   │   ├── 👤 User.cs                    # Modelo de usuario (Identity)
│   │   └── 🎭 UserRole.cs                # Modelo de rol (Identity)
│   ├── 📁 Services/
│   │   ├── 📁 Interfaces/
│   │   │   └── 🔌 IAuthService.cs        # Interfaz del servicio de autenticación
│   │   └── 🔧 AuthService.cs             # Implementación del servicio
│   ├── 📁 Data/
│   │   └── 🗄️ AppDbContext.cs           # Contexto de Entity Framework
│   ├── 📁 Migrations/
│   │   └── 📋 Migraciones de Identity    # Migraciones de base de datos
│   └── 📁 Middleware/
│       └── 🔐 JwtMiddleware.cs           # Middleware de autenticación JWT
├── 🐳 docker-compose.yml                 # Configuración de Docker Compose
├── 🐳 Dockerfile                         # Imagen de Docker
└── ⚙️ appsettings.json                   # Configuración de la aplicación
```

## ⚙️ Configuración

### Variables de Entorno

```json
{
  "Jwt": {
    "Key": "tu-clave-secreta-muy-larga-para-jwt-32-caracteres-min",
    "Issuer": "PetCareApp",
    "Audience": "PetCareUsers",
    "ExpireMinutes": 60
  },
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost,14433;Database=PetCareAuth;User Id=sa;Password=YourStrong@Passw0rd;TrustServerCertificate=True;"
  }
}
```

### Requisitos de Contraseña

- **Mínimo 8 caracteres**
- **Al menos un dígito**
- **Al menos una mayúscula**
- **Emails únicos**

## 🐛 Solución de Problemas

### Error "Invalid object name 'AspNetUsers'"
```bash
# Reiniciar contenedores
docker-compose down
docker-compose up -d

# Si persiste, limpiar base de datos
docker-compose down
docker volume rm petcareservicios_sql_data
docker-compose up -d
```

### Error de Conexión a Base de Datos
- ✅ Verificar que SQL Server esté ejecutándose
- ✅ Confirmar que la cadena de conexión sea correcta
- ✅ Asegurar que las migraciones se hayan aplicado

### Error de Autenticación JWT
- ✅ Verificar que la clave JWT tenga al menos 32 caracteres
- ✅ Confirmar que el issuer y audience sean correctos
- ✅ Asegurar que el token no haya expirado

## 🧪 Testing

### Con Swagger
1. Abrir http://localhost:5000/swagger
2. Probar endpoints directamente desde la interfaz

### Con curl
```bash
# Health check
curl http://localhost:5000/api/auth/health

# Registrar usuario
curl -X POST "http://localhost:5000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!","name":"Test User"}'
```

## 🤝 Contribución

1. 🍴 Fork el proyecto
2. 🌿 Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. 💾 Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. 📤 Push a la rama (`git push origin feature/AmazingFeature`)
5. 🔄 Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la **Licencia MIT** - ver el archivo [LICENSE](LICENSE) para más detalles.

## 📞 Soporte

- 🐛 **Issues**: [Crear un issue](https://github.com/WooshC/PetCareServicios/issues)
- 📧 **Email**: soporte@petcare.com

---

<div align="center">
  <p>Desarrollado con ❤️ para el cuidado de mascotas</p>
  <p>🐕 �� 🐦 🐠</p>
</div> 