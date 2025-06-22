# 🐕 PetCare - Sistema de Cuidado de Mascotas

Sistema completo de cuidado de mascotas con backend .NET y frontend React, incluyendo autenticación, roles de usuario y gestión de cuidadores.

## 🚀 Características Principales

### ✅ Autenticación y Roles
- **Sistema de Login/Registro** con selección de roles
- **Roles de Usuario**: Cliente y Cuidador
- **Autenticación JWT** con tokens seguros
- **Validación de roles** en el backend

### ✅ Gestión de Cuidadores
- **Perfil de Cuidador** completo con información detallada
- **Documento de identidad** y verificación
- **Biografía y experiencia** personalizada
- **Horarios de atención** y tarifas
- **Calificación promedio** automática
- **Verificación de documentos** por administradores

### ✅ Base de Datos
- **SQL Server** con Entity Framework Core
- **Migraciones automáticas** con retry logic
- **Relaciones** entre usuarios y cuidadores
- **Índices optimizados** para consultas rápidas

### ✅ Frontend Moderno
- **React 18** con TypeScript
- **Bootstrap 5** para diseño responsive
- **Formularios interactivos** con validación
- **Navegación fluida** entre vistas
- **Mensajes de estado** en tiempo real

## 🏗️ Arquitectura

```
PetCareServicios/
├── 📁 PetCareBackend/          # API .NET Core
│   ├── 📁 Controllers/         # Controladores API
│   ├── 📁 Models/             # Modelos de datos
│   ├── 📁 Services/           # Lógica de negocio
│   └── 📁 Data/               # Contexto de base de datos
├── 📁 PetCareFrond/           # Frontend React
│   ├── 📁 src/
│   │   ├── 📁 components/     # Componentes React
│   │   ├── 📁 services/       # Servicios API
│   │   └── 📁 types/          # Tipos TypeScript
└── 📁 Migrations/             # Migraciones de BD
```

## 🛠️ Tecnologías

### Backend
- **.NET 8** - Framework principal
- **Entity Framework Core** - ORM
- **SQL Server** - Base de datos
- **Identity** - Autenticación y autorización
- **JWT** - Tokens de autenticación
- **Docker** - Contenedorización

### Frontend
- **React 18** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool rápido
- **Bootstrap 5** - Framework CSS
- **Axios** - Cliente HTTP

## 📦 Instalación y Configuración

### Prerrequisitos
- Docker Desktop
- Node.js 16+
- .NET 8 SDK (para desarrollo local)

### 1. Clonar el Repositorio
```bash
git clone https://github.com/WooshC/PetCareServicios.git
cd PetCareServicios
```

### 2. Desplegar Backend con Docker
```bash
# Construir y ejecutar contenedores
docker-compose up --build -d

# Verificar que estén ejecutándose
docker ps

# Ver logs si es necesario
docker-compose logs -f petcare-api
```

### 3. Configurar Frontend
```bash
cd PetCareFrond

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev
```

### 4. Acceder a la Aplicación
- **Frontend**: http://localhost:3000
- **API**: http://localhost:5000
- **Swagger**: http://localhost:5000/swagger

## 🔐 Funcionalidades de Autenticación

### Registro de Usuarios
1. **Seleccionar rol**: Cliente o Cuidador
2. **Completar formulario**: Nombre, email, contraseña
3. **Validación automática** de datos
4. **Asignación de rol** en la base de datos

### Login con Roles
1. **Seleccionar tipo de usuario**
2. **Ingresar credenciales**
3. **Verificación de rol** en el backend
4. **Redirección automática** según el rol

### Flujo de Cuidador
1. **Registro como Cuidador**
2. **Completar perfil** con información adicional
3. **Documento de identidad** y teléfono de emergencia
4. **Biografía y experiencia** personalizada
5. **Configurar horarios** y tarifas

## 📊 Base de Datos

### Tabla Cuidadores
```sql
CREATE TABLE Cuidadores (
    CuidadorID INT IDENTITY(1,1) PRIMARY KEY,
    UsuarioID INT NOT NULL FOREIGN KEY REFERENCES AspNetUsers(Id),
    DocumentoIdentidad VARCHAR(20) NOT NULL,
    TelefonoEmergencia VARCHAR(15) NOT NULL,
    Biografia TEXT,
    Experiencia TEXT,
    HorarioAtencion VARCHAR(100),
    TarifaPorHora DECIMAL(10,2),
    CalificacionPromedio DECIMAL(3,2) DEFAULT 0.0,
    DocumentoVerificado BIT DEFAULT 0,
    FechaVerificacion DATETIME,
    FechaCreacion DATETIME DEFAULT GETUTCDATE(),
    CONSTRAINT UQ_Cuidador_Usuario UNIQUE (UsuarioID)
);
```

### Relaciones
- **Usuario → Cuidador**: 1:1 (Un usuario puede tener un perfil de cuidador)
- **Cascade Delete**: Al eliminar un usuario se elimina su perfil de cuidador
- **Índice único** en UsuarioID para evitar duplicados

## 🔌 API Endpoints

### Autenticación
- `POST /api/auth/login` - Login con rol
- `POST /api/auth/register` - Registro con rol
- `GET /api/auth/health` - Estado de la API

### Cuidadores
- `GET /api/cuidador` - Listar todos los cuidadores
- `GET /api/cuidador/{id}` - Obtener cuidador por ID
- `GET /api/cuidador/mi-perfil` - Obtener mi perfil de cuidador
- `POST /api/cuidador` - Crear perfil de cuidador
- `PUT /api/cuidador/{id}` - Actualizar cuidador
- `PUT /api/cuidador/mi-perfil` - Actualizar mi perfil
- `DELETE /api/cuidador/{id}` - Eliminar cuidador (Admin)
- `POST /api/cuidador/{id}/verificar` - Verificar documento (Admin)

## 🎨 Interfaz de Usuario

### Características del Diseño
- **Diseño responsive** para móviles y desktop
- **Gradientes modernos** y animaciones suaves
- **Formularios con validación** en tiempo real
- **Mensajes de estado** claros y visibles
- **Navegación intuitiva** entre vistas

### Componentes Principales
- **Layout**: Header y footer compartidos
- **CuidadorForm**: Formulario completo para perfiles de cuidador
- **RoleSelector**: Selección de roles con botones interactivos
- **Dashboard**: Vista principal después del login

## 🚀 Despliegue

### Producción con Docker
```bash
# Desplegar todo el stack
docker-compose -f docker-compose.full.yml up -d

# Verificar servicios
docker-compose ps

# Ver logs
docker-compose logs -f
```

### Variables de Entorno
```env
# Base de datos
ConnectionStrings__DefaultConnection=Server=db;Database=PetCareAuth;User=sa;Password=YourStrong@Passw0rd;TrustServerCertificate=True;

# JWT
Jwt__Key=your-super-secret-key-32-characters-long
Jwt__Issuer=PetCare
Jwt__Audience=PetCareUsers
```

## 🐛 Solución de Problemas

### Error de CORS
- ✅ **Resuelto**: CORS configurado para `http://localhost:3000`
- Verificar que la API esté en puerto 5000
- Revisar logs: `docker-compose logs petcare-api`

### Error de Base de Datos
- Verificar que SQL Server esté ejecutándose
- Revisar conexión: `docker-compose logs db`
- Reconstruir contenedores si es necesario

### Error de Frontend
- Limpiar cache: `npm run build`
- Reinstalar dependencias: `rm -rf node_modules && npm install`
- Verificar proxy en `vite.config.ts`

## 📈 Próximas Funcionalidades

- [ ] **Sistema de Calificaciones** - Clientes califican cuidadores
- [ ] **Solicitudes de Servicio** - Reservas y contrataciones
- [ ] **Chat en Tiempo Real** - Comunicación cliente-cuidador
- [ ] **Pagos Online** - Integración con pasarelas de pago
- [ ] **Notificaciones Push** - Alertas y recordatorios
- [ ] **Panel de Administración** - Gestión de usuarios y servicios

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 📞 Contacto

- **GitHub**: [@WooshC](https://github.com/WooshC)
- **Email**: soporte@petcare.com
- **Proyecto**: [PetCareServicios](https://github.com/WooshC/PetCareServicios)

---

<div align="center">
  <p>🐕 <strong>¡PetCare - El mejor cuidado para tu mascota!</strong></p>
  <p>✨ Sistema completo de autenticación y gestión de cuidadores</p>
  <p>✅ Backend .NET + Frontend React + Base de datos SQL Server</p>
  <p>🔗 Dockerizado y listo para producción</p>
</div> 

