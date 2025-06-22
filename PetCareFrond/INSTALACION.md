# 📦 Instalación del Frontend PetCare

## ✅ Estado Actual

**¡El frontend ya está funcionando correctamente!** 

- ✅ **CORS Configurado** - Comunicación con API Docker
- ✅ **Login Funcionando** - Autenticación JWT operativa
- ✅ **Register Funcionando** - Registro de usuarios operativo
- ✅ **Docker Backend** - API ejecutándose en contenedores

## 🚀 Configuración Recomendada

### Backend con Docker + Frontend Manual

```bash
# 1. Desplegar backend y base de datos
docker-compose up -d

# 2. Verificar API
curl http://localhost:5000/api/auth/health

# 3. Ejecutar frontend
cd PetCareFrond
npm install
npm run dev

# 4. Acceder a la aplicación
# Frontend: http://localhost:3000
# API: http://localhost:5000
```

## ⚠️ Problema de PowerShell (Resuelto)

Si ves el error:
```
No se puede cargar el archivo C:\Program Files\nodejs\npm.ps1 porque la ejecución de scripts está deshabilitada
```

## 🔧 Soluciones

### Opción 1: Usar Command Prompt (Recomendado)
1. Abre **Command Prompt** (cmd) como administrador
2. Navega a la carpeta del proyecto:
   ```cmd
   cd C:\Users\USUARIO\source\repos\PetCareServicios\PetCareFrond
   ```
3. Instala las dependencias:
   ```cmd
   npm install
   ```

### Opción 2: Cambiar Política de PowerShell
1. Abre **PowerShell** como administrador
2. Ejecuta:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```
3. Confirma con "S" o "Y"
4. Instala las dependencias:
   ```powershell
   npm install
   ```

### Opción 3: Usar Git Bash
1. Abre **Git Bash**
2. Navega al proyecto:
   ```bash
   cd /c/Users/USUARIO/source/repos/PetCareServicios/PetCareFrond
   ```
3. Instala dependencias:
   ```bash
   npm install
   ```

## 🚀 Después de la Instalación

Una vez instaladas las dependencias:

1. **Ejecutar en desarrollo:**
   ```bash
   npm run dev
   ```

2. **Abrir en navegador:**
   ```
   http://localhost:3000
   ```

3. **Verificar que la API esté ejecutándose:**
   ```
   http://localhost:5000/api/auth/health
   ```

## 📋 Verificación

Para verificar que todo funciona:

1. ✅ API ejecutándose en puerto 5000
2. ✅ Frontend ejecutándose en puerto 3000
3. ✅ Formulario de login visible
4. ✅ Posibilidad de cambiar a registro
5. ✅ Conexión exitosa con la API
6. ✅ Login y registro funcionando

## 🐛 Si hay problemas

### Error de CORS
- ✅ **Resuelto**: CORS configurado en backend
- Verifica que la API esté en `http://localhost:5000`
- Verifica que los contenedores estén ejecutándose: `docker ps`

### Error de módulos
- Elimina `node_modules` y `package-lock.json`
- Ejecuta `npm install` nuevamente

### Error de puerto ocupado
- Cambia el puerto en `vite.config.ts`
- O mata el proceso que usa el puerto 3000

### Error de conexión con API
```bash
# Verificar contenedores
docker ps

# Ver logs del backend
docker-compose logs petcare-api

# Reconstruir si es necesario
docker-compose down
docker-compose up --build -d
```

## 🔄 Comandos Útiles

### Desarrollo
```bash
# Ejecutar frontend
npm run dev

# Build de producción
npm run build

# Previsualizar build
npm run preview

# Linter
npm run lint
```

### Docker
```bash
# Verificar contenedores
docker ps

# Ver logs
docker-compose logs -f petcare-api

# Reconstruir backend
docker-compose down
docker-compose up --build -d
```

---

¡El frontend está funcionando perfectamente! 🎉 