# 🐕 PetCare - Sistema de Cuidado de Mascotas

Sistema completo de gestión de cuidadores de mascotas con autenticación JWT, roles de usuario y dashboard interactivo.

## 🚀 Inicio Rápido

### Instalación con Docker (Recomendado)
```bash
# Clonar repositorio
git clone https://github.com/WooshC/PetCareServicios.git
cd PetCareServicios

# Ejecutar con Docker Compose
docker-compose up -d

# Verificar funcionamiento
curl http://localhost:5000/api/auth/health
```

### Acceso a la Aplicación
- **Frontend**: http://localhost:3000
- **API**: http://localhost:5000
- **Swagger**: http://localhost:5000/swagger

## ✨ Características Principales

### 🔐 Autenticación y Roles
- **JWT Tokens** - Autenticación segura
- **Roles de Usuario** - Cliente y Cuidador
- **Validación de Credenciales** - Verificación completa
- **Verificación de Roles** - Control de acceso específico

### 👥 Gestión de Usuarios
- **Registro con Rol** - Selección de tipo de usuario
- **Login Inteligente** - Redirección según rol
- **Perfiles de Cuidador** - Información detallada
- **Dashboard Personalizado** - Interfaz específica por rol

### 🏠 Dashboard de Cuidador
- **Perfil Completo** - Foto, calificaciones, verificación
- **Información de Contacto** - Documento, teléfono, email
- **Servicios y Tarifas** - Precios y disponibilidad
- **Biografía y Experiencia** - Información personal
- **Estadísticas** - Métricas de rendimiento

### 🎨 Interfaz Moderna
- **Bootstrap 5** - Diseño responsive y moderno
- **TypeScript** - Tipado fuerte para mejor desarrollo
- **Validación en Tiempo Real** - Feedback inmediato
- **Navegación Intuitiva** - Flujo claro entre vistas

## 🏗️ Arquitectura

### Stack Tecnológico
```
Frontend: React 18 + TypeScript + Vite + Bootstrap 5
Backend:  .NET 8 + Entity Framework + ASP.NET Identity
Database: SQL Server
Auth:     JWT Tokens
Deploy:   Docker + Docker Compose
```

### Estructura del Proyecto
```
PetCareServicios/
├── PetCareBackend/          # API .NET
│   ├── Controllers/         # Controladores de API
│   ├── Services/           # Lógica de negocio
│   ├── Models/             # Modelos de datos
│   ├── Data/               # Contexto de base de datos
│   └── Middleware/         # Middleware personalizado
├── PetCareFrond/           # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── services/       # Servicios de API
│   │   ├── types/          # Tipos TypeScript
│   │   └── App.tsx         # Componente principal
│   └── public/             # Archivos estáticos
├── Migrations/             # Migraciones de EF
└── docker-compose.yml      # Configuración Docker
```

## 📖 Uso Básico

### Flujo de Usuario Cliente
1. **Acceso**: http://localhost:3000
2. **Registro**: Seleccionar "Cliente" → Completar formulario
3. **Login**: Ingresar credenciales → Dashboard de cliente

### Flujo de Usuario Cuidador
1. **Registro**: Seleccionar "Cuidador" → Completar formulario
2. **Perfil**: Completar información del perfil
3. **Dashboard**: Ver información completa y estadísticas

## 📚 Documentación Detallada

Para información específica sobre instalación, configuración y uso, consulta:

- **[📖 README Backend](README_BACKEND.md)** - Instalación, configuración y API del backend
- **[🔧 README Mantenimiento](README_MANTENIMIENTO.md)** - Debugging, modificaciones y troubleshooting
- **[🚀 README Deploy](README_DEPLOY.md)** - Guía de despliegue y configuración de producción

## 🔌 API Endpoints Principales

### Autenticación
```
POST /api/auth/login      # Login con rol
POST /api/auth/register   # Registro con rol
GET  /api/auth/health     # Estado de la API
```

### Cuidadores
```
GET    /api/cuidador/mi-perfil    # Mi perfil (autenticado)
POST   /api/cuidador              # Crear perfil
PUT    /api/cuidador/mi-perfil    # Actualizar mi perfil
```

## 🐛 Problemas Comunes

### Error de CORS
```bash
# Verificar que el backend esté ejecutándose
curl http://localhost:5000/api/auth/health
```

### Error de Conexión
```bash
# Verificar contenedores
docker ps

# Ver logs
docker-compose logs petcare-api
```

### Frontend No Se Conecta
```bash
# Verificar URL en servicios de API
# Revisar Network tab del navegador
```

## 📞 Soporte

- **Issues**: [GitHub Issues](https://github.com/WooshC/PetCareServicios/issues)
- **Email**: soporte@petcare.com

---

<div align="center">
  <p>🐕 <strong>¡PetCare Funcionando!</strong></p>
  <p>✨ Sistema Completo de Cuidado de Mascotas</p>
  <p>🔐 Autenticación JWT + Roles</p>
  <p>📱 Dashboard Interactivo</p>
  <p>🐳 Docker + .NET + React</p>
</div> 

