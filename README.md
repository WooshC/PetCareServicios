# 🐕 PetCare Servicios

Aplicación completa de PetCare con **Backend .NET Core** y **Frontend React**, desplegada con Docker.

## 🚀 Estado del Proyecto

✅ **Backend**: API .NET Core con autenticación JWT  
✅ **Frontend**: React con TypeScript y diseño moderno  
✅ **Base de Datos**: SQL Server con Entity Framework  
✅ **Docker**: Contenedores configurados y funcionando  
✅ **CORS**: Configurado para comunicación frontend-backend  
✅ **Autenticación**: Login y registro funcionando  

## 🏗️ Arquitectura

```
PetCareServicios/
├── 📁 PetCareBackend/          # API .NET Core
│   ├── 📁 Controllers/         # Controladores de API
│   ├── 📁 Models/             # Modelos de datos
│   ├── 📁 Services/           # Lógica de negocio
│   └── 📁 Data/               # Entity Framework
├── 📁 PetCareFrond/           # Frontend React
│   ├── 📁 src/                # Código fuente React
│   ├── 📁 public/             # Archivos públicos
│   └── 📝 package.json        # Dependencias
├── 🐳 docker-compose.yml      # Backend + DB
├── 🐳 docker-compose.full.yml # Backend + Frontend + DB
└── 📝 README_DEPLOY.md        # Guía de despliegue
```

## 🚀 Inicio Rápido

### Opción 1: Backend Docker + Frontend Manual (Recomendado)

```bash
# 1. Clonar el repositorio

git clone https://github.com/WooshC/PetCareServicios.git

cd PetCareServicios

# 2. Desplegar backend y base de datos
docker-compose up -d

# 3. Verificar API
curl http://localhost:5000/api/auth/health


```

### Opción 2: Desarrollo Local

```bash
# 1. Clonar el repositorio
git clone https://github.com/WooshC/PetCareServicios
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

# 4. Ejecutar frontend
cd PetCareFrond
npm install
npm run dev

# 5. Acceder a la aplicación
# Frontend: http://localhost:3000
# API: http://localhost:5000
# Swagger: http://localhost:5000/swagger
```

### Opción 2: Todo con Docker

```bash
# Desplegar aplicación completa
docker-compose -f docker-compose.full.yml up -d

# Acceder a la aplicación
# Frontend: http://localhost:3000
# API: http://localhost:5000
```

## 🛠️ Tecnologías

### Backend
- **.NET 8** - Framework de desarrollo
- **Entity Framework Core** - ORM para base de datos
- **ASP.NET Core Identity** - Sistema de autenticación
- **JWT Bearer** - Tokens de autenticación
- **SQL Server** - Base de datos
- **Swagger** - Documentación de API

### Frontend
- **React 18** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool rápido
- **Axios** - Cliente HTTP
- **CSS3** - Estilos modernos

### DevOps
- **Docker** - Contenedores
- **Docker Compose** - Orquestación
- **CORS** - Cross-Origin Resource Sharing

## 📱 Funcionalidades

### ✅ Implementadas
- **Autenticación JWT** - Login y registro seguros
- **Base de Datos** - SQL Server con migraciones
- **API RESTful** - Endpoints documentados
- **Frontend React** - UI moderna y responsive
- **CORS Configurado** - Comunicación frontend-backend
- **Docker** - Despliegue containerizado

### 🔄 En Desarrollo
- Dashboard de usuario
- Gestión de mascotas
- Citas veterinarias
- Historial médico

## 🌐 Endpoints de la API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Registrar usuario |
| `POST` | `/api/auth/login` | Iniciar sesión |
| `GET` | `/api/auth/health` | Verificar estado |

## 🔧 Configuración

### Variables de Entorno
```json
{
  "ConnectionStrings": {

    "DefaultConnection": "Server=db;Database=PetCareAuth;User=sa;Password=YourStrong@Passw0rd;TrustServerCertificate=True;"
  },
  "Jwt": {
    "Key": "YourSuperSecretKeyForJWTTokenGeneration",
    "Issuer": "PetCareApp",
    "Audience": "PetCareUsers"
  }
}
```

### CORS
Configurado para permitir peticiones desde `http://localhost:3000`:
```csharp
policy.WithOrigins("http://localhost:3000")
      .AllowAnyHeader()
      .AllowAnyMethod()
      .AllowCredentials();
```

## 🐛 Solución de Problemas

### Error de CORS
- ✅ **Resuelto**: CORS configurado en backend
- Verificar que API esté en puerto 5000
- Verificar que frontend esté en puerto 3000

### Error de Conexión
```bash
# Verificar contenedores
docker ps

# Ver logs
docker-compose logs petcare-api

# Reconstruir
docker-compose down
docker-compose up --build -d
```

### Error de PowerShell
```bash
# Usar Command Prompt o cambiar política
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## 📊 Monitoreo

### Verificar Servicios
```bash
# Estado de contenedores
docker ps

# Logs en tiempo real
docker-compose logs -f

# Uso de recursos
docker stats
```

### Verificar Frontend
- Abrir DevTools (F12)
- Revisar Console para errores
- Verificar Network para requests

## 🚀 Despliegue

### Desarrollo
```bash
# Backend con Docker
docker-compose up -d

# Frontend manual
cd PetCareFrond
npm run dev
```

### Producción
```bash
# Build y despliegue completo
docker-compose -f docker-compose.full.yml up --build -d
```

## 📚 Documentación

- 📖 [FRONTEND_README.md](FRONTEND_README.md) - Guía completa del frontend
- 📖 [README_DEPLOY.md](README_DEPLOY.md) - Guía de despliegue
- 📖 [PetCareFrond/README.md](PetCareFrond/README.md) - Documentación del frontend
- 📖 [PetCareFrond/INSTALACION.md](PetCareFrond/INSTALACION.md) - Guía de instalación

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte


- 🐛 **Issues**: [GitHub Issues](https://github.com/WooshC/PetCareServicios/issues)
- 📧 **Email**: soporte@petcare.com

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.


---

<div align="center">

  <p>🚀 <strong>¡PetCare Servicios Funcionando!</strong></p>
  <p>🐕 Backend .NET + Frontend React</p>
  <p>✨ Docker + SQL Server + JWT + CORS</p>
  <p>✅ Login y Register Operativos</p>
  <p>🔗 API Documentada con Swagger</p>
</div> 

