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
├── 🐳 docker-compose.yml      # Solo backend + DB
├── 🐳 docker-compose.full.yml # Backend + Frontend + DB
└── 📝 README_DEPLOY.md        # Guía de despliegue
```

## 🚀 Despliegue Rápido

### Opción 1: Solo Backend (Recomendado para desarrollo)
```bash
# Desplegar API + Base de datos
docker-compose up -d

# Verificar API
curl http://localhost:5000/api/auth/health
```

### Opción 2: Aplicación Completa
```bash
# Desplegar todo (API + Frontend + DB)
docker-compose -f docker-compose.full.yml up -d

# Acceder a la aplicación
# Frontend: http://localhost:3000
# API: http://localhost:5000
# Swagger: http://localhost:5000/swagger
```

## 🛠️ Desarrollo Local

### Backend (.NET)
```bash
# Ejecutar API localmente
cd PetCareBackend
dotnet run

# API disponible en: http://localhost:5000
```

### Frontend (React)
```bash
# Instalar dependencias (ver INSTALACION.md)
cd PetCareFrond
npm install

# Ejecutar en desarrollo
npm run dev

# Frontend disponible en: http://localhost:3000
```

## 📱 Características del Frontend

### ✅ Funcionalidades
- **Login/Registro** - Formularios de autenticación
- **Diseño Moderno** - UI atractiva con gradientes
- **TypeScript** - Tipado fuerte
- **Responsive** - Adaptable a móviles
- **Manejo de Estados** - Loading, errores, éxito

### 🎨 Diseño
- **Gradiente de fondo** - Azul a púrpura
- **Tarjeta blanca** con sombra suave
- **Animaciones** en botones e inputs
- **Mensajes de estado** con colores apropiados

### 🔐 Autenticación
- **JWT Tokens** - Almacenados en localStorage
- **Headers automáticos** - Token incluido en requests
- **Persistencia** - Tokens entre sesiones

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
```bash
# En PetCareFrond/src/services/api.ts
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

## 🐛 Solución de Problemas

### Error de PowerShell
Si no puedes ejecutar npm:
1. Usar **Command Prompt** en lugar de PowerShell
2. O cambiar política: `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`

### Error de CORS
- Verificar que API esté en puerto 5000
- Revisar proxy en `vite.config.ts`
- Verificar configuración de nginx

### Error de Conexión
- Verificar que todos los servicios estén ejecutándose
- Revisar puertos disponibles
- Verificar firewall

### Error de Dependencias
```bash
# Limpiar e reinstalar
rm -rf node_modules package-lock.json
npm install
```

## 📊 Monitoreo

### Verificar Servicios
```bash
# Estado de contenedores
docker-compose ps

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

- 🐛 **Issues**: [GitHub Issues](https://github.com/tu-usuario/PetCareServicios/issues)
- 📧 **Email**: soporte@petcare.com
- 💬 **Discord**: [Servidor de Discord](https://discord.gg/petcare)

---

<div align="center">
  <p>🚀 <strong>¡PetCare Completo Listo!</strong></p>
  <p>🐕 Backend .NET + Frontend React</p>
  <p>✨ Docker + SQL Server + JWT</p>
</div> 