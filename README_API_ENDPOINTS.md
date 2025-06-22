# 🚀 PetCare API - Documentación de Endpoints

## 📋 Resumen General

La API de PetCare está organizada en 5 controladores principales, cada uno manejando una funcionalidad específica del sistema:

- **AuthController** - Autenticación, registro y recuperación de contraseña
- **CuidadorController** - Gestión de perfiles de cuidadores
- **ClienteController** - Gestión de perfiles de clientes
- **SolicitudController** - Gestión de solicitudes de servicios
- **CalificacionController** - Gestión de calificaciones y reseñas

---

## 🔐 AuthController - Autenticación

### Base URL: `/api/auth`

| Método | Endpoint | Descripción | Roles Requeridos | Body |
|--------|----------|-------------|------------------|------|
| `POST` | `/login` | Iniciar sesión con rol | Público | `LoginRequestWithRole` |
| `POST` | `/register` | Registrar nuevo usuario | Público | `RegisterRequestWithRole` |
| `POST` | `/forgot-password` | Solicitar restablecimiento | Público | `PasswordResetRequest` |
| `POST` | `/reset-password` | Confirmar restablecimiento | Público | `PasswordResetConfirmRequest` |
| `GET` | `/validate-reset-token` | Validar token de reset | Público | Query: `token` |
| `GET` | `/health` | Estado de la API | Público | - |

### DTOs de Autenticación

```csharp
// Login con rol
public class LoginRequestWithRole
{
    public string Email { get; set; }
    public string Password { get; set; }
    public string Role { get; set; } // "Cliente" o "Cuidador"
}

// Registro con rol
public class RegisterRequestWithRole
{
    public string Email { get; set; }
    public string Password { get; set; }
    public string Name { get; set; }
    public string Role { get; set; } // "Cliente" o "Cuidador"
}

// Recuperación de contraseña
public class PasswordResetRequest
{
    public string Email { get; set; }
}

public class PasswordResetConfirmRequest
{
    public string Token { get; set; }
    public string NewPassword { get; set; }
    public string ConfirmPassword { get; set; }
}
```

---

## 👨‍⚕️ CuidadorController - Gestión de Cuidadores

### Base URL: `/api/cuidador`

| Método | Endpoint | Descripción | Roles Requeridos | Body |
|--------|----------|-------------|------------------|------|
| `GET` | `/` | Obtener todos los cuidadores | Admin | - |
| `GET` | `/{id}` | Obtener cuidador por ID | Admin | - |
| `GET` | `/mi-perfil` | Obtener perfil propio | Cuidador | - |
| `POST` | `/` | Crear perfil de cuidador | Cuidador | `CuidadorRequest` |
| `PUT` | `/{id}` | Actualizar cuidador | Admin | `CuidadorRequest` |
| `PUT` | `/mi-perfil` | Actualizar perfil propio | Cuidador | `CuidadorRequest` |
| `DELETE` | `/{id}` | Eliminar cuidador | Admin | - |
| `POST` | `/{id}/verificar` | Verificar documento | Admin | - |

### DTOs de Cuidador

```csharp
public class CuidadorRequest
{
    public string DocumentoIdentidad { get; set; }
    public string TelefonoEmergencia { get; set; }
    public string? Biografia { get; set; }
    public string? Experiencia { get; set; }
    public string? HorarioAtencion { get; set; }
    public decimal? TarifaPorHora { get; set; }
}

public class CuidadorResponse
{
    public int CuidadorID { get; set; }
    public int UsuarioID { get; set; }
    public string DocumentoIdentidad { get; set; }
    public string TelefonoEmergencia { get; set; }
    public string? Biografia { get; set; }
    public string? Experiencia { get; set; }
    public string? HorarioAtencion { get; set; }
    public decimal? TarifaPorHora { get; set; }
    public decimal CalificacionPromedio { get; set; }
    public bool DocumentoVerificado { get; set; }
    public DateTime? FechaVerificacion { get; set; }
    public DateTime FechaCreacion { get; set; }
    public DateTime? FechaActualizacion { get; set; }
    public string Estado { get; set; }
    public string NombreUsuario { get; set; }
    public string EmailUsuario { get; set; }
}
```

---

## 👤 ClienteController - Gestión de Clientes

### Base URL: `/api/cliente`

| Método | Endpoint | Descripción | Roles Requeridos | Body |
|--------|----------|-------------|------------------|------|
| `GET` | `/` | Obtener todos los clientes | Admin | - |
| `GET` | `/{id}` | Obtener cliente por ID | Admin | - |
| `GET` | `/mi-perfil` | Obtener perfil propio | Cliente | - |
| `POST` | `/` | Crear perfil de cliente | Cliente | `ClienteRequest` |
| `PUT` | `/{id}` | Actualizar cliente | Admin | `ClienteRequest` |
| `PUT` | `/mi-perfil` | Actualizar perfil propio | Cliente | `ClienteRequest` |
| `DELETE` | `/{id}` | Eliminar cliente | Admin | - |
| `POST` | `/{id}/verificar` | Verificar documento | Admin | - |

### DTOs de Cliente

```csharp
public class ClienteRequest
{
    public string DocumentoIdentidad { get; set; }
    public string TelefonoEmergencia { get; set; }
}

public class ClienteResponse
{
    public int ClienteID { get; set; }
    public int UsuarioID { get; set; }
    public string DocumentoIdentidad { get; set; }
    public string TelefonoEmergencia { get; set; }
    public bool DocumentoVerificado { get; set; }
    public DateTime? FechaVerificacion { get; set; }
    public DateTime FechaCreacion { get; set; }
    public DateTime? FechaActualizacion { get; set; }
    public string Estado { get; set; }
    public string NombreUsuario { get; set; }
    public string EmailUsuario { get; set; }
}
```

---

## 📋 SolicitudController - Gestión de Solicitudes

### Base URL: `/api/solicitud`

#### Endpoints Generales
| Método | Endpoint | Descripción | Roles Requeridos | Body |
|--------|----------|-------------|------------------|------|
| `GET` | `/` | Obtener todas las solicitudes | Admin | - |
| `GET` | `/{id}` | Obtener solicitud por ID | Autenticado | - |

#### Endpoints para Clientes
| Método | Endpoint | Descripción | Roles Requeridos | Body |
|--------|----------|-------------|------------------|------|
| `GET` | `/mis-solicitudes` | Obtener solicitudes propias | Cliente | - |
| `POST` | `/` | Crear nueva solicitud | Cliente | `SolicitudRequest` |
| `PUT` | `/{id}` | Actualizar solicitud propia | Cliente | `SolicitudRequest` |
| `POST` | `/{id}/cancelar` | Cancelar solicitud propia | Cliente | - |
| `DELETE` | `/{id}` | Eliminar solicitud propia | Cliente | - |

#### Endpoints para Cuidadores
| Método | Endpoint | Descripción | Roles Requeridos | Body |
|--------|----------|-------------|------------------|------|
| `GET` | `/mis-servicios` | Obtener servicios asignados | Cuidador | - |
| `GET` | `/pendientes` | Obtener solicitudes pendientes | Cuidador | - |
| `POST` | `/{id}/aceptar` | Aceptar solicitud | Cuidador | - |
| `POST` | `/{id}/rechazar` | Rechazar solicitud | Cuidador | - |
| `POST` | `/{id}/iniciar` | Iniciar servicio | Cuidador | - |
| `POST` | `/{id}/finalizar` | Finalizar servicio | Cuidador | - |

#### Endpoints de Consulta (Admin)
| Método | Endpoint | Descripción | Roles Requeridos | Body |
|--------|----------|-------------|------------------|------|
| `GET` | `/por-estado/{estado}` | Filtrar por estado | Admin | - |
| `GET` | `/por-tipo/{tipoServicio}` | Filtrar por tipo | Admin | - |
| `GET` | `/recientes` | Obtener recientes | Admin | Query: `cantidad` |

#### Endpoints Administrativos
| Método | Endpoint | Descripción | Roles Requeridos | Body |
|--------|----------|-------------|------------------|------|
| `DELETE` | `/admin/{id}` | Eliminar solicitud | Admin | - |
| `PUT` | `/admin/{id}/estado` | Cambiar estado | Admin | `SolicitudEstadoRequest` |

### DTOs de Solicitud

```csharp
public class SolicitudRequest
{
    public int? ClienteID { get; set; }
    public int? CuidadorID { get; set; }
    public string TipoServicio { get; set; }
    public string Descripcion { get; set; }
    public DateTime FechaHoraInicio { get; set; }
    public int DuracionHoras { get; set; }
    public string Ubicacion { get; set; }
}

public class SolicitudResponse
{
    public int SolicitudID { get; set; }
    public int? ClienteID { get; set; }
    public int? CuidadorID { get; set; }
    public string TipoServicio { get; set; }
    public string Descripcion { get; set; }
    public DateTime FechaHoraInicio { get; set; }
    public int DuracionHoras { get; set; }
    public string Ubicacion { get; set; }
    public string Estado { get; set; }
    public DateTime FechaCreacion { get; set; }
    public DateTime? FechaActualizacion { get; set; }
    public DateTime? FechaAceptacion { get; set; }
    public DateTime? FechaInicioServicio { get; set; }
    public DateTime? FechaFinalizacion { get; set; }
    public string NombreCliente { get; set; }
    public string EmailCliente { get; set; }
    public string NombreCuidador { get; set; }
    public string EmailCuidador { get; set; }
}

public class SolicitudEstadoRequest
{
    public string Estado { get; set; }
}
```

**Estados de Solicitud:**
- `Pendiente` - Solicitud creada, esperando cuidador
- `Aceptada` - Cuidador aceptó la solicitud
- `En Progreso` - Servicio iniciado
- `Finalizada` - Servicio completado
- `Rechazada` - Cuidador rechazó la solicitud
- `Cancelada` - Cliente canceló la solicitud
- `Fuera de Tiempo` - Servicio no completado en tiempo

---

## ⭐ CalificacionController - Gestión de Calificaciones

### Base URL: `/api/calificacion`

#### Endpoints Generales
| Método | Endpoint | Descripción | Roles Requeridos | Body |
|--------|----------|-------------|------------------|------|
| `GET` | `/` | Obtener todas las calificaciones | Admin | - |
| `GET` | `/{id}` | Obtener calificación por ID | Autenticado | - |

#### Endpoints para Cuidadores
| Método | Endpoint | Descripción | Roles Requeridos | Body |
|--------|----------|-------------|------------------|------|
| `GET` | `/mis-calificaciones` | Obtener calificaciones propias | Cuidador | - |
| `GET` | `/mi-promedio` | Obtener promedio propio | Cuidador | - |
| `GET` | `/cuidador/{cuidadorId}` | Ver calificaciones de cuidador | Autenticado | - |
| `GET` | `/cuidador/{cuidadorId}/promedio` | Ver promedio de cuidador | Autenticado | - |

#### Endpoints para Clientes
| Método | Endpoint | Descripción | Roles Requeridos | Body |
|--------|----------|-------------|------------------|------|
| `GET` | `/mis-resenas` | Obtener reseñas propias | Cliente | - |
| `POST` | `/` | Crear calificación | Cliente | `CalificacionRequest` |
| `PUT` | `/{id}` | Actualizar calificación propia | Cliente | `CalificacionRequest` |
| `DELETE` | `/{id}` | Eliminar calificación propia | Cliente | - |

#### Endpoints de Consulta (Admin)
| Método | Endpoint | Descripción | Roles Requeridos | Body |
|--------|----------|-------------|------------------|------|
| `GET` | `/por-puntuacion/{puntuacionMinima}` | Filtrar por puntuación | Admin | - |
| `GET` | `/recientes` | Obtener recientes | Admin | Query: `cantidad` |

#### Endpoints Administrativos
| Método | Endpoint | Descripción | Roles Requeridos | Body |
|--------|----------|-------------|------------------|------|
| `DELETE` | `/admin/{id}` | Eliminar calificación | Admin | - |

### DTOs de Calificación

```csharp
public class CalificacionRequest
{
    public int CuidadorID { get; set; }
    public int ClienteID { get; set; }
    public int Puntuacion { get; set; } // 1-5
    public string? Comentario { get; set; }
}

public class CalificacionResponse
{
    public int CalificacionID { get; set; }
    public int CuidadorID { get; set; }
    public int ClienteID { get; set; }
    public int Puntuacion { get; set; }
    public string? Comentario { get; set; }
    public DateTime FechaCalificacion { get; set; }
    public string NombreCliente { get; set; }
    public string EmailCliente { get; set; }
    public string NombreCuidador { get; set; }
    public string EmailCuidador { get; set; }
}
```

---

## 🔒 Autenticación y Autorización

### JWT Token
Todos los endpoints (excepto los públicos) requieren un token JWT válido en el header:
```
Authorization: Bearer <token>
```

### Roles del Sistema
- **Admin** - Acceso completo a todas las funcionalidades
- **Cliente** - Puede gestionar su perfil, crear solicitudes y calificar cuidadores
- **Cuidador** - Puede gestionar su perfil, ver solicitudes pendientes y gestionar servicios

### Flujo de Autenticación
1. **Registro**: `POST /api/auth/register` con rol específico
2. **Login**: `POST /api/auth/login` con credenciales y rol
3. **Token**: Se recibe un JWT token válido por 24 horas
4. **Uso**: Incluir token en header `Authorization: Bearer <token>`

---

## 📊 Códigos de Respuesta

| Código | Descripción |
|--------|-------------|
| `200` | OK - Operación exitosa |
| `201` | Created - Recurso creado exitosamente |
| `400` | Bad Request - Datos inválidos |
| `401` | Unauthorized - Token inválido o faltante |
| `403` | Forbidden - Sin permisos para la operación |
| `404` | Not Found - Recurso no encontrado |
| `409` | Conflict - Conflicto (ej: perfil ya existe) |
| `500` | Internal Server Error - Error del servidor |

---

## 🚀 Ejemplos de Uso

### 1. Registro de Cliente
```bash
curl -X POST "http://localhost:5000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "cliente@ejemplo.com",
    "password": "Password123!",
    "name": "Juan Pérez",
    "role": "Cliente"
  }'
```

### 2. Login de Cuidador
```bash
curl -X POST "http://localhost:5000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "cuidador@ejemplo.com",
    "password": "Password123!",
    "role": "Cuidador"
  }'
```

### 3. Crear Perfil de Cuidador
```bash
curl -X POST "http://localhost:5000/api/cuidador" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "documentoIdentidad": "12345678",
    "telefonoEmergencia": "+573001234567",
    "biografia": "Amante de los animales con 5 años de experiencia",
    "experiencia": "Cuidado de perros y gatos",
    "horarioAtencion": "Lunes a Viernes 8:00 AM - 6:00 PM",
    "tarifaPorHora": 25000
  }'
```

### 4. Crear Solicitud de Servicio
```bash
curl -X POST "http://localhost:5000/api/solicitud" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "tipoServicio": "Paseo",
    "descripcion": "Necesito paseo para mi perro Golden Retriever",
    "fechaHoraInicio": "2025-01-15T10:00:00Z",
    "duracionHoras": 2,
    "ubicacion": "Calle 123 #45-67, Bogotá"
  }'
```

### 5. Calificar a un Cuidador
```bash
curl -X POST "http://localhost:5000/api/calificacion" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "cuidadorID": 1,
    "puntuacion": 5,
    "comentario": "Excelente servicio, muy profesional y cariñoso con mi mascota"
  }'
```

---

## 🔧 Configuración

### Variables de Entorno
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost,14433;Database=PetCareAuth;...",
    "CuidadoresConnection": "Server=localhost,14433;Database=PetCareCuidadores;...",
    "ClientesConnection": "Server=localhost,14433;Database=PetCareClientes;...",
    "SolicitudesConnection": "Server=localhost,14433;Database=PetCareSolicitudes;...",
    "CalificacionesConnection": "Server=localhost,14433;Database=PetCareCalificaciones;..."
  },
  "Jwt": {
    "Key": "YourSuperSecretKeyForJWTTokenGeneration",
    "Issuer": "PetCareApp",
    "Audience": "PetCareUsers",
    "ExpireMinutes": 60
  }
}
```

---

## 📝 Notas Importantes

1. **Bases de Datos Separadas**: Cada funcionalidad usa una base de datos independiente para mejor escalabilidad
2. **Tokens de Reset**: Los tokens de recuperación de contraseña expiran en 1 hora
3. **Calificaciones Únicas**: Un cliente solo puede calificar una vez a cada cuidador
4. **Estados de Solicitud**: Las solicitudes siguen un flujo específico de estados
5. **Seguridad**: Por seguridad, no se revela si un email existe en el sistema durante la recuperación de contraseña

---

## 🐛 Solución de Problemas

### Error 401 - Unauthorized
- Verificar que el token JWT sea válido
- Verificar que el token no haya expirado
- Verificar que el header `Authorization` esté correctamente formateado

### Error 403 - Forbidden
- Verificar que el usuario tenga el rol requerido para la operación
- Verificar que el usuario esté autenticado correctamente

### Error 409 - Conflict
- Verificar que no exista ya un perfil para el usuario
- Verificar que no exista ya una calificación del cliente al cuidador

### Error 500 - Internal Server Error
- Verificar que todas las bases de datos estén accesibles
- Verificar que las migraciones se hayan aplicado correctamente
- Revisar los logs del servidor para más detalles 