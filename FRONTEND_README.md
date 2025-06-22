# 🐕 PetCare - Aplicación Completa

Aplicación completa de PetCare con **Backend .NET** y **Frontend React**.

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

## 🚀 Despliegue Rápido

### Opción 1: Backend con Docker + Frontend Manual (Recomendado)
```bash
# 1. Desplegar API + Base de datos
docker-compose up -d

# 2. Verificar API
curl http://localhost:5000/api/auth/health

# 3. Ejecutar Frontend manualmente
cd PetCareFrond
npm install
npm run dev

# 4. Acceder a la aplicación
# Frontend: http://localhost:3000
# API: http://localhost:5000
# Swagger: http://localhost:5000/swagger
```


## 🛠️ Desarrollo Local

### Backend (.NET con Docker)
```bash
# Ejecutar API con Docker
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f petcare-api

# Reconstruir después de cambios
docker-compose down
docker-compose up --build -d
```

### Frontend (React Manual)
```bash
# Instalar dependencias
cd PetCareFrond
npm install

# Ejecutar en desarrollo
npm run dev

# Frontend disponible en: http://localhost:3000
```

## 📱 Características del Frontend

### ✅ Funcionalidades
- **Login/Registro** - Formularios de autenticación funcionales
- **Diseño Moderno** - UI atractiva con gradientes
- **TypeScript** - Tipado fuerte
- **Responsive** - Adaptable a móviles
- **Manejo de Estados** - Loading, errores, éxito
- **CORS Configurado** - Comunicación con API Docker

### 🎨 Diseño
- **Gradiente de fondo** - Azul a púrpura
- **Tarjeta blanca** con sombra suave
- **Animaciones** en botones e inputs
- **Mensajes de estado** con colores apropiados

### 🔐 Autenticación
- **JWT Tokens** - Almacenados en localStorage
- **Headers automáticos** - Token incluido en requests
- **Persistencia** - Tokens entre sesiones
- **CORS Habilitado** - Comunicación con contenedores Docker

## 🌐 Endpoints de la API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Registrar usuario |
| `POST` | `/api/auth/login` | Iniciar sesión |
| `GET` | `/api/auth/health` | Verificar estado |

## 🧪 Pruebas

### Probar API
```bash
# Verificar estado
curl http://localhost:5000/api/auth/health

# Registrar usuario
curl -X POST "http://localhost:5000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!","name":"Test User"}'

# Iniciar sesión
curl -X POST "http://localhost:5000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!"}'
```

### Probar Frontend
1. Abrir http://localhost:3000
2. Probar registro con datos válidos
3. Probar login con credenciales
4. Verificar mensajes de éxito/error

## 🔧 Configuración

### Variables de Entorno Frontend
```typescript
// En PetCareFrond/src/services/api.ts
const API_BASE_URL = 'http://localhost:5000/api';
```

### Variables de Entorno Backend
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

### CORS Configurado
El backend tiene CORS configurado para permitir peticiones desde `http://localhost:3000`:
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

## 🐛 Solución de Problemas

### Error de PowerShell
Si no puedes ejecutar npm:
1. Usar **Command Prompt** en lugar de PowerShell
2. O cambiar política: `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`

### Error de CORS
- ✅ **Resuelto**: CORS configurado en backend
- Verificar que API esté en puerto 5000
- Verificar que frontend esté en puerto 3000

### Error de Conexión
- Verificar que contenedores estén ejecutándose: `docker ps`
- Verificar logs: `docker-compose logs petcare-api`
- Verificar puertos disponibles

### Error de Dependencias
```bash
# Limpiar e reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Reconstruir Contenedores
```bash
# Después de cambios en el backend
docker-compose down
docker-compose up --build -d
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
- Probar en diferentes navegadores

## 🚀 Producción

### Build de Producción
```bash
# Frontend
cd PetCareFrond
npm run build

# Backend
dotnet publish -c Release
```

### Despliegue
1. **Build de imágenes:**
   ```bash
   docker-compose -f docker-compose.full.yml build
   ```

2. **Desplegar:**
   ```bash
   docker-compose -f docker-compose.full.yml up -d
   ```

3. **Verificar:**
   - Frontend: http://tu-dominio:3000
   - API: http://tu-dominio:5000
   - Swagger: http://tu-dominio:5000/swagger

## 📞 Soporte

- 🐛 **Issues**: [GitHub Issues](https://github.com/WooshC/PetCareServicios/issues)
- 📧 **Email**: soporte@petcare.com
- 💬 **Discord**: [Servidor de Discord](https://discord.gg/petcare)

---

<div align="center">
  <p>🚀 <strong>¡PetCare Completo Funcionando!</strong></p>
  <p>🐕 Backend .NET + Frontend React</p>
  <p>✨ Docker + SQL Server + JWT + CORS</p>
  <p>✅ Login y Register Funcionando</p>
</div> 
