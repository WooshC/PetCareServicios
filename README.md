# 🐕 PetCare - Sistema de Cuidado de Mascotas

Sistema completo de gestión de cuidadores de mascotas con autenticación JWT, roles de usuario y dashboard interactivo.

## 📋 Índice
1. [Características](#características)
2. [Arquitectura](#arquitectura)
3. [Instalación](#instalación)
4. [Uso](#uso)
5. [API Endpoints](#api-endpoints)
6. [Base de Datos](#base-de-datos)
7. [Mantenimiento](#mantenimiento)
8. [Troubleshooting](#troubleshooting)

---

## ✨ Características

### 🔐 Autenticación y Autorización
- **JWT Tokens** - Autenticación segura con tokens de 24 horas
- **Roles de Usuario** - Cliente y Cuidador con permisos específicos
- **Validación de Credenciales** - Verificación de email y contraseña
- **Verificación de Roles** - Control de acceso basado en roles

### 👥 Gestión de Usuarios
- **Registro de Usuarios** - Formulario completo con validaciones
- **Login con Rol** - Selección de tipo de usuario al iniciar sesión
- **Perfiles de Cuidador** - Información detallada y verificación
- **Dashboard Personalizado** - Interfaz específica por rol

### 🏠 Dashboard de Cuidador
- **Perfil Completo** - Foto, calificaciones, verificación
- **Información de Contacto** - Documento, teléfono, email
- **Servicios Ofrecidos** - Lista de servicios disponibles
- **Tarifas y Horarios** - Precios y disponibilidad
- **Biografía y Experiencia** - Información personal
- **Estadísticas** - Métricas de rendimiento

### 🎨 Interfaz de Usuario
- **Diseño Moderno** - Bootstrap 5 con gradientes y animaciones
- **Responsive** - Adaptable a móviles y desktop
- **Validación en Tiempo Real** - Feedback inmediato al usuario
- **Mensajes de Estado** - Notificaciones de éxito y error
- **Navegación Intuitiva** - Flujo claro entre vistas

---

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

---

## 🚀 Instalación

### Prerrequisitos
- Docker Desktop
- Node.js 16+ (para desarrollo frontend)
- .NET 8 SDK (para desarrollo backend)

### Instalación Completa con Docker

1. **Clonar el repositorio:**
```bash
git clone https://github.com/WooshC/PetCareServicios.git
cd PetCareServicios
```

2. **Ejecutar con Docker Compose:**
```bash
docker-compose up -d
```

3. **Verificar que todo esté funcionando:**
```bash
# Verificar contenedores
docker ps

# Verificar API
curl http://localhost:5000/api/auth/health

# Acceder a la aplicación
# Frontend: http://localhost:3000
# API: http://localhost:5000
```

### Instalación para Desarrollo

1. **Backend con Docker, Frontend manual:**
```bash
# Ejecutar solo backend y base de datos
docker-compose up -d

# Instalar dependencias del frontend
cd PetCareFrond
npm install

# Ejecutar frontend en desarrollo
npm run dev
```

2. **Todo manual (sin Docker):**
```bash
# Configurar base de datos SQL Server
# Modificar connection string en appsettings.json

# Ejecutar backend
dotnet run

# Ejecutar frontend
cd PetCareFrond
npm install
npm run dev
```

---

## 📖 Uso

### Flujo de Usuario Cliente

1. **Acceso a la aplicación:**
   - Abrir `http://localhost:3000`
   - Ver página de login/registro

2. **Registro como Cliente:**
   - Hacer clic en "Regístrate aquí"
   - Seleccionar rol "Cliente"
   - Completar formulario (nombre, email, contraseña)
   - Hacer clic en "Registrarse"
   - Será redirigido al dashboard de cliente

3. **Login como Cliente:**
   - Seleccionar rol "Cliente"
   - Ingresar email y contraseña
   - Hacer clic en "Ingresar"
   - Acceder al dashboard de cliente

### Flujo de Usuario Cuidador

1. **Registro como Cuidador:**
   - Hacer clic en "Regístrate aquí"
   - Seleccionar rol "Cuidador"
   - Completar formulario de registro
   - Será redirigido al formulario de perfil

2. **Completar Perfil de Cuidador:**
   - Documento de identidad
   - Teléfono de emergencia
   - Horario de atención (opcional)
   - Tarifa por hora (opcional)
   - Biografía (opcional)
   - Experiencia (opcional)
   - Hacer clic en "Crear Perfil de Cuidador"

3. **Dashboard de Cuidador:**
   - Ver información completa del perfil
   - Estado de verificación del documento
   - Calificaciones y estadísticas
   - Opciones de gestión

### Funcionalidades del Dashboard

#### Para Clientes:
- Información básica de la cuenta
- Opción de cerrar sesión
- (Futuras funcionalidades: buscar cuidadores, hacer reservas)

#### Para Cuidadores:
- **Perfil Completo:**
  - Foto de perfil
  - Nombre y tipo de usuario
  - Calificación promedio con estrellas
  - Estado de verificación del documento

- **Información de Contacto:**
  - Documento de identidad
  - Teléfono de emergencia
  - Email
  - Fecha de registro

- **Servicios y Tarifas:**
  - Lista de servicios ofrecidos
  - Tarifa por hora
  - Horario de atención
  - Estado de disponibilidad

- **Información Personal:**
  - Biografía
  - Experiencia
  - Estadísticas de trabajo

---

## 🔌 API Endpoints

### Autenticación
```
POST /api/auth/login
POST /api/auth/register
GET  /api/auth/health
```

### Cuidadores
```
GET    /api/cuidador                    # Listar todos los cuidadores
GET    /api/cuidador/{id}               # Obtener cuidador por ID
GET    /api/cuidador/mi-perfil          # Obtener mi perfil (autenticado)
POST   /api/cuidador                    # Crear perfil de cuidador
PUT    /api/cuidador/{id}               # Actualizar cuidador (admin)
PUT    /api/cuidador/mi-perfil          # Actualizar mi perfil
DELETE /api/cuidador/{id}               # Eliminar cuidador (admin)
POST   /api/cuidador/{id}/verificar     # Verificar documento (admin)
```

### Autenticación Requerida
Todos los endpoints de cuidadores requieren token JWT en el header:
```
Authorization: Bearer <token>
```

---

## 🗄️ Base de Datos

### Tablas Principales

#### AspNetUsers (Usuarios)
```sql
Id (int, PK)
UserName (nvarchar)
Email (nvarchar)
Name (nvarchar)
CreatedAt (datetime)
```

#### AspNetRoles (Roles)
```sql
Id (int, PK)
Name (nvarchar)
Description (nvarchar)
```

#### Cuidadores
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
FechaCreacion (datetime, default GETUTCDATE())
```

### Relaciones
- `Cuidadores.UsuarioID` → `AspNetUsers.Id` (1:1)
- Sistema de roles de ASP.NET Identity

### Migraciones
```bash
# Crear nueva migración
dotnet ef migrations add NombreMigracion

# Aplicar migraciones
dotnet ef database update

# Revertir migración
dotnet ef database update NombreMigracionAnterior
```

---

## 🔧 Mantenimiento

Para información detallada sobre mantenimiento, debugging y modificaciones del código, consulta el **[README de Mantenimiento](README_MANTENIMIENTO.md)**.

### Puntos Clave de Mantenimiento:

1. **Autenticación y Autorización**
   - Configuración JWT en `appsettings.json`
   - Middleware de autenticación
   - Gestión de roles

2. **Base de Datos**
   - Migraciones de Entity Framework
   - Configuración de conexión
   - Backup y restauración

3. **Frontend**
   - Estados y navegación en React
   - Servicios de API
   - Validaciones de formularios

4. **Deployment**
   - Configuración Docker
   - Variables de entorno
   - Logs y monitoreo

---

## 🐛 Troubleshooting

### Problemas Comunes

#### Error de CORS
```bash
# Verificar configuración en Program.cs
# Asegurar que CORS esté configurado correctamente
```

#### Error de Conexión a Base de Datos
```bash
# Verificar que SQL Server esté ejecutándose
docker ps | grep sqlserver

# Verificar connection string
# Revisar logs del contenedor
docker-compose logs petcare-db
```

#### Error de Autenticación
```bash
# Verificar configuración JWT
# Revisar logs del backend
docker-compose logs petcare-api

# Verificar token en localStorage del navegador
```

#### Frontend No Se Conecta
```bash
# Verificar que el backend esté ejecutándose
curl http://localhost:5000/api/auth/health

# Verificar URL en servicios de API
# Revisar Network tab del navegador
```

### Logs Útiles
```bash
# Ver logs del backend
docker-compose logs -f petcare-api

# Ver logs de la base de datos
docker-compose logs -f petcare-db

# Ver logs del frontend (si está en Docker)
docker-compose logs -f petcare-frontend
```

### Comandos de Recuperación
```bash
# Reconstruir contenedores
docker-compose down
docker-compose up --build -d

# Resetear base de datos
docker-compose down -v
docker-compose up -d

# Limpiar cache de npm
cd PetCareFrond
rm -rf node_modules package-lock.json
npm install
```

---

## 📞 Soporte

- **Documentación**: Este README y [README de Mantenimiento](README_MANTENIMIENTO.md)
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

