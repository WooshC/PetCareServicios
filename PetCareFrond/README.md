# 🐕 PetCare Frontend

Frontend de React para la aplicación PetCare con sistema de autenticación funcional.

## 🚀 Características

- ✅ **Login y Registro** - Formularios de autenticación funcionales
- ✅ **Diseño Moderno** - UI atractiva con gradientes y animaciones
- ✅ **TypeScript** - Tipado fuerte para mejor desarrollo
- ✅ **Axios** - Cliente HTTP para comunicación con API
- ✅ **Responsive** - Diseño adaptable a diferentes dispositivos
- ✅ **Manejo de Estados** - Estados de carga y mensajes de error/éxito
- ✅ **CORS Configurado** - Comunicación con API Docker
- ✅ **JWT Tokens** - Autenticación segura

## 🛠️ Tecnologías

- **React 18** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool rápido
- **Axios** - Cliente HTTP
- **CSS3** - Estilos modernos con gradientes

## 📦 Instalación

### Prerrequisitos
- Node.js 16+ 
- npm o yarn
- API de PetCare ejecutándose en Docker (`http://localhost:5000`)

### Pasos de instalación

1. **Instalar dependencias:**
```bash
npm install
```

2. **Ejecutar en modo desarrollo:**
```bash
npm run dev
```

3. **Abrir en el navegador:**
```
http://localhost:3000
```

## 🔧 Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Ejecuta en modo desarrollo |
| `npm run build` | Construye para producción |
| `npm run preview` | Previsualiza build de producción |
| `npm run lint` | Ejecuta el linter |

## 🌐 Configuración

### Variables de Entorno
El frontend está configurado para conectarse a la API en `http://localhost:5000`. Si necesitas cambiar la URL, modifica el archivo `src/services/api.ts`:

```typescript
const API_BASE_URL = 'http://tu-api-url:puerto/api';
```

### Proxy de Desarrollo
El archivo `vite.config.ts` incluye un proxy para desarrollo que redirige las peticiones `/api` a `http://localhost:5000`.

### CORS Configurado
El backend tiene CORS configurado para permitir peticiones desde `http://localhost:3000`:
```csharp
policy.WithOrigins("http://localhost:3000")
      .AllowAnyHeader()
      .AllowAnyMethod()
      .AllowCredentials();
```

## 📱 Uso

### Login
1. Ingresa tu email y contraseña
2. Haz clic en "Iniciar Sesión"
3. El token se guardará automáticamente en localStorage
4. Verás un mensaje de éxito

### Registro
1. Completa el formulario con nombre, email y contraseña
2. La contraseña debe tener mínimo 8 caracteres
3. Haz clic en "Registrarse"
4. El token se guardará automáticamente en localStorage
5. Verás un mensaje de éxito

## 🏗️ Estructura del Proyecto

```
src/
├── 📁 types/
│   └── 📝 auth.ts              # Tipos TypeScript para autenticación
├── 📁 services/
│   └── 🔌 api.ts               # Servicio de comunicación con API
├── 📝 App.tsx                  # Componente principal
├── 📝 main.tsx                 # Punto de entrada
└── 📝 index.css                # Estilos globales
```

## 🔐 Autenticación

### Flujo de Autenticación
1. **Login/Registro** → API devuelve token JWT
2. **Token se guarda** en localStorage
3. **Requests automáticos** incluyen token en headers
4. **Logout** → Token se elimina de localStorage

### Persistencia
- Los tokens se guardan en `localStorage`
- Se incluyen automáticamente en todas las peticiones
- Se mantienen entre sesiones del navegador

### Seguridad
- Tokens JWT con expiración de 24 horas
- Headers de autorización automáticos
- Validación de credenciales en el backend

## 🎨 Diseño

### Características del UI
- **Gradiente de fondo** - Azul a púrpura
- **Tarjeta blanca** con sombra suave
- **Animaciones** en botones y inputs
- **Mensajes de estado** con colores apropiados
- **Responsive** para móviles y desktop

### Paleta de Colores
- **Primario**: `#667eea` (Azul)
- **Secundario**: `#764ba2` (Púrpura)
- **Éxito**: `#059669` (Verde)
- **Error**: `#e74c3c` (Rojo)
- **Texto**: `#333` (Gris oscuro)

## 🐛 Solución de Problemas

### Error de CORS
Si ves errores de CORS, asegúrate de que:
- ✅ **Resuelto**: CORS configurado en backend
- La API esté ejecutándose en `http://localhost:5000`
- El proxy esté configurado correctamente en `vite.config.ts`

### Error de Conexión
Si no puedes conectar con la API:
1. Verifica que los contenedores Docker estén ejecutándose: `docker ps`
2. Revisa la URL en `src/services/api.ts`
3. Verifica los logs del contenedor: `docker-compose logs petcare-api`

### Error de Dependencias
Si hay errores de módulos no encontrados:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Error de PowerShell
Si no puedes ejecutar npm en PowerShell:
1. Usar **Command Prompt** en lugar de PowerShell
2. O cambiar política: `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`

## 🚀 Despliegue

### Build de Producción
```bash
npm run build
```

### Servir Build
```bash
npm run preview
```

### Despliegue en Servidor
1. Ejecuta `npm run build`
2. Copia la carpeta `dist` al servidor
3. Configura el servidor web para servir archivos estáticos
4. Asegúrate de que la API esté accesible desde el frontend


## 🔄 Desarrollo con Docker

### Configuración Recomendada
- **Backend**: Ejecutar con Docker (`docker-compose up -d`)
- **Frontend**: Ejecutar manualmente (`npm run dev`)
- **Ventajas**: 
  - Hot reload en frontend
  - CORS configurado correctamente
  - Fácil debugging

### Comandos Útiles
```bash
# Verificar contenedores
docker ps

# Ver logs del backend
docker-compose logs -f petcare-api

# Reconstruir backend después de cambios
docker-compose down
docker-compose up --build -d
```

## 📞 Soporte

- 🐛 **Issues**: [GitHub Issues](https://github.com/WooshC/PetCareServicios/issues)
- 📧 **Email**: soporte@petcare.com
- 💬 **Discord**: [Servidor de Discord](https://discord.gg/petcare)

---

<div align="center">
  <p>🐕 <strong>¡PetCare Frontend Funcionando!</strong></p>
  <p>✨ React + TypeScript + Vite</p>
  <p>✅ Login y Register Operativos</p>
  <p>🔗 Conectado con API Docker</p>
</div> 