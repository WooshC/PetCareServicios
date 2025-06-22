# 📦 Instalación del Frontend PetCare

## ⚠️ Problema de PowerShell

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

## 🐛 Si hay problemas

### Error de CORS
- Verifica que la API esté en `http://localhost:5000`
- Revisa el proxy en `vite.config.ts`

### Error de módulos
- Elimina `node_modules` y `package-lock.json`
- Ejecuta `npm install` nuevamente

### Error de puerto ocupado
- Cambia el puerto en `vite.config.ts`
- O mata el proceso que usa el puerto 3000

---

¡El frontend está listo para usar! 🎉 