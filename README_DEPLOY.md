# 🚀 PetCare API - Guía de Despliegue

Guía rápida para desplegar la API de PetCare usando Docker.

## ⚡ Despliegue Rápido

### 1️⃣ Ejecutar con Docker Compose
```bash
# Clonar y navegar al proyecto
git clone <url-del-repositorio>
cd PetCareServicios

# Desplegar
docker-compose up -d

# Verificar estado
curl http://localhost:5000/api/auth/health
```

### 2️⃣ Verificar Servicios
| Servicio | URL | Estado |
|----------|-----|--------|
| **🌐 API** | http://localhost:5000 | ✅ Activo |
| **📚 Swagger** | http://localhost:5000/swagger | ✅ Documentación |
| **🗄️ Base de Datos** | localhost:14433 | ✅ SQL Server |

## 🔧 Comandos Útiles

### Gestión de Contenedores
```bash
# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs petcare-api

# Detener servicios
docker-compose down

# Reiniciar servicios
docker-compose restart

# Ver estado de contenedores
docker-compose ps
```

### Gestión de Base de Datos
```bash
# Conectar a SQL Server
docker exec -it petcareservicios-db-1 /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P YourStrong@Passw0rd

# Ver logs de base de datos
docker-compose logs db
```

## 📋 Endpoints Disponibles

### 🔐 Autenticación
| Método | Endpoint | Descripción | Ejemplo |
|--------|----------|-------------|---------|
| `POST` | `/api/auth/register` | Registrar usuario | [Ver ejemplo](#registrar-usuario) |
| `POST` | `/api/auth/login` | Iniciar sesión | [Ver ejemplo](#iniciar-sesión) |
| `GET` | `/api/auth/health` | Verificar estado | [Ver ejemplo](#verificar-estado) |

## 🧪 Ejemplos de Prueba

### 🔑 Registrar Usuario
```bash
curl -X POST "http://localhost:5000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123",
    "name": "Test User"
  }'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Usuario registrado exitosamente"
}
```

### 🔐 Iniciar Sesión
```bash
curl -X POST "http://localhost:5000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123"
  }'
```

### 🏥 Verificar Estado
```bash
curl -X GET "http://localhost:5000/api/auth/health"
```

**Respuesta esperada:**
```
"PetCare API is running!"
```

## 🏗️ Estructura del Proyecto
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
│   │   ├── 📋 20241201000000_InitialIdentity.cs
│   │   └── 📋 AppDbContextModelSnapshot.cs
│   └── 📁 Middleware/
│       └── 🔐 JwtMiddleware.cs           # Middleware de autenticación JWT
├── 🐳 docker-compose.yml                 # Configuración de Docker Compose
├── 🐳 Dockerfile                         # Imagen de Docker
└── ⚙️ appsettings.json                   # Configuración de la aplicación
```

## ⚙️ Configuración

### 🔧 Tecnologías Utilizadas
- **Framework**: .NET 8
- **Base de Datos**: SQL Server 2022
- **ORM**: Entity Framework Core
- **Autenticación**: JWT + ASP.NET Core Identity
- **Documentación**: Swagger/OpenAPI
- **Contenedores**: Docker & Docker Compose

### 🔐 Configuración JWT
```json
{
  "Jwt": {
    "Key": "YourSuperSecretKeyForJWTTokenGeneration",
    "Issuer": "PetCareApp",
    "Audience": "PetCareUsers",
    "ExpireMinutes": 60
  }
}
```

### 🗄️ Configuración de Base de Datos
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=db;Database=PetCareAuth;User=sa;Password=YourStrong@Passw0rd;TrustServerCertificate=True;"
  }
}
```

## ⚠️ Requisitos de Seguridad

### 🔑 Contraseñas
- **Mínimo 8 caracteres**
- **Al menos un dígito**
- **Al menos una mayúscula**
- **Emails únicos**

### 🔐 Tokens JWT
- **Expiración**: 24 horas
- **Algoritmo**: HMAC SHA256
- **Validación**: Issuer, Audience, Lifetime

## 🐛 Solución de Problemas

### ❌ Error "Invalid object name 'AspNetUsers'"
**Causa**: Las migraciones no se han aplicado correctamente.

**Solución 1 - Reiniciar contenedores:**
```bash
docker-compose down
docker-compose up -d
```

**Solución 2 - Limpiar base de datos:**
```bash
docker-compose down
docker volume rm petcareservicios_sql_data
docker-compose up -d
```

### ❌ Error de Conexión a Base de Datos
**Verificar:**
- ✅ SQL Server esté ejecutándose
- ✅ Credenciales correctas en `docker-compose.yml`
- ✅ Puerto 14433 disponible
- ✅ Red Docker funcionando

### ❌ Error de Autenticación JWT
**Verificar:**
- ✅ Clave JWT tenga al menos 32 caracteres
- ✅ Issuer y Audience correctos
- ✅ Token no haya expirado
- ✅ Formato correcto: `Bearer <token>`

### ❌ Contenedor no inicia
**Verificar:**
```bash
# Ver logs detallados
docker-compose logs

# Verificar puertos ocupados
netstat -an | findstr :5000
netstat -an | findstr :14433

# Verificar espacio en disco
docker system df
```

## 📊 Monitoreo

### 🔍 Verificar Estado de Servicios
```bash
# Estado de contenedores
docker-compose ps

# Uso de recursos
docker stats

# Logs en tiempo real
docker-compose logs -f petcare-api
```

### 📈 Métricas de Base de Datos
```bash
# Conectar a SQL Server
docker exec -it petcareservicios-db-1 /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P YourStrong@Passw0rd

# Ver tablas creadas
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'
```

## 🧪 Testing Completo

### 🔄 Flujo de Prueba Completo
```bash
# 1. Verificar estado
curl http://localhost:5000/api/auth/health

# 2. Registrar usuario
curl -X POST "http://localhost:5000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!","name":"Test User"}'

# 3. Iniciar sesión
curl -X POST "http://localhost:5000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!"}'

# 4. Verificar Swagger
# Abrir: http://localhost:5000/swagger
```

### 🎯 Pruebas con Swagger
1. Abrir http://localhost:5000/swagger
2. Expandir sección `/api/auth`
3. Probar endpoints directamente
4. Ver respuestas en tiempo real

## 📞 Soporte

### 🆘 Problemas Comunes
- **Contenedor no inicia**: Verificar puertos y Docker Desktop
- **Error de migración**: Reiniciar contenedores
- **Error de autenticación**: Verificar configuración JWT
- **Base de datos no conecta**: Verificar credenciales

### 📧 Contacto
- 🐛 **Issues**: [GitHub Issues](https://github.com/tu-usuario/PetCareServicios/issues)
- 📧 **Email**: soporte@petcare.com
- 💬 **Discord**: [Servidor de Discord](https://discord.gg/petcare)

---

<div align="center">
  <p>🚀 <strong>¡Listo para desplegar!</strong></p>
  <p>🐕 �� 🐦 🐠</p>
</div> 