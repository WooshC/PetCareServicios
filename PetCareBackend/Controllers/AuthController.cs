using Microsoft.AspNetCore.Mvc;
using PetCareServicios.Models.Auth;
using PetCareServicios.Services.Interfaces;
using Microsoft.AspNetCore.Identity;

namespace PetCareServicios.Controllers
{
    /// <summary>
    /// Controlador para manejar autenticación y registro de usuarios
    /// Gestiona login, registro, asignación de roles y recuperación de contraseña
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<UserRole> _roleManager;

        public AuthController(IAuthService authService, UserManager<User> userManager, RoleManager<UserRole> roleManager)
        {
            _authService = authService;
            _userManager = userManager;
            _roleManager = roleManager;
        }

        /// <summary>
        /// Inicia sesión de un usuario con validación de rol
        /// FLUJO:
        /// 1. Recibe credenciales y rol solicitado
        /// 2. Valida credenciales usando AuthService
        /// 3. Verifica que el usuario tenga el rol correcto
        /// 4. Retorna token JWT si todo es válido
        /// </summary>
        /// <param name="request">Credenciales y rol del usuario</param>
        /// <returns>Token JWT y mensaje de estado</returns>
        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequestWithRole request)
        {
            // Paso 1: Validar credenciales usando el servicio de autenticación
            var response = await _authService.LoginAsync(new LoginRequest 
            { 
                Email = request.Email, 
                Password = request.Password 
            });
            
            // Si las credenciales son inválidas, retornar error
            if (!response.Success)
                return BadRequest(response);

            // Paso 2: Verificar que el usuario tenga el rol correcto
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user != null)
            {
                var userRoles = await _userManager.GetRolesAsync(user);
                if (!userRoles.Contains(request.Role))
                {
                    return BadRequest(new AuthResponse 
                    { 
                        Success = false, 
                        Message = $"El usuario no tiene el rol {request.Role}" 
                    });
                }
            }
                
            // Paso 3: Retornar respuesta exitosa con token
            return Ok(response);
        }

        /// <summary>
        /// Registra un nuevo usuario con asignación de rol
        /// FLUJO:
        /// 1. Crea el usuario usando AuthService
        /// 2. Crea el rol si no existe
        /// 3. Asigna el rol al usuario
        /// 4. Retorna token JWT
        /// </summary>
        /// <param name="request">Datos del usuario y rol</param>
        /// <returns>Token JWT y mensaje de estado</returns>
        [HttpPost("register")]
        public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequestWithRole request)
        {
            // Paso 1: Crear objeto usuario con datos básicos
            var user = new User
            {
                UserName = request.Email,
                Email = request.Email,
                Name = request.Name,
                CreatedAt = DateTime.UtcNow
            };

            // Paso 2: Registrar usuario usando el servicio de autenticación
            var response = await _authService.RegisterAsync(user, request.Password);
            
            // Si hay error en el registro, retornar error
            if (!response.Success)
                return BadRequest(response);

            // Paso 3: Crear rol si no existe
            if (!await _roleManager.RoleExistsAsync(request.Role))
            {
                await _roleManager.CreateAsync(new UserRole { Name = request.Role });
            }

            // Paso 4: Asignar rol al usuario
            await _userManager.AddToRoleAsync(user, request.Role);
                
            // Paso 5: Retornar respuesta exitosa con token
            return Ok(response);
        }

        /// <summary>
        /// Solicita restablecimiento de contraseña
        /// FLUJO:
        /// 1. Recibe el email del usuario
        /// 2. Genera un token único de restablecimiento
        /// 3. Almacena el token temporalmente
        /// 4. En producción, envía un email con el enlace
        /// </summary>
        /// <param name="request">Email del usuario</param>
        /// <returns>Mensaje de confirmación</returns>
        [HttpPost("forgot-password")]
        public async Task<ActionResult<PasswordResetResponse>> ForgotPassword([FromBody] PasswordResetRequest request)
        {
            var response = await _authService.RequestPasswordResetAsync(request);
            
            if (response.Success)
                return Ok(response);
            else
                return BadRequest(response);
        }

        /// <summary>
        /// Confirma el restablecimiento de contraseña
        /// FLUJO:
        /// 1. Recibe el token y la nueva contraseña
        /// 2. Valida el token
        /// 3. Cambia la contraseña del usuario
        /// 4. Elimina el token usado
        /// </summary>
        /// <param name="request">Token y nueva contraseña</param>
        /// <returns>Mensaje de confirmación</returns>
        [HttpPost("reset-password")]
        public async Task<ActionResult<PasswordResetResponse>> ResetPassword([FromBody] PasswordResetConfirmRequest request)
        {
            var response = await _authService.ConfirmPasswordResetAsync(request);
            
            if (response.Success)
                return Ok(response);
            else
                return BadRequest(response);
        }

        /// <summary>
        /// Valida un token de restablecimiento de contraseña
        /// Útil para verificar si un token es válido antes de mostrar el formulario de nueva contraseña
        /// </summary>
        /// <param name="token">Token a validar</param>
        /// <returns>true si el token es válido, false en caso contrario</returns>
        [HttpGet("validate-reset-token")]
        public async Task<ActionResult<bool>> ValidateResetToken([FromQuery] string token)
        {
            var isValid = await _authService.ValidateResetTokenAsync(token);
            return Ok(isValid);
        }

        /// <summary>
        /// Cambia la contraseña directamente (SOLO PARA TESTING)
        /// FLUJO:
        /// 1. Recibe el email del usuario y la nueva contraseña
        /// 2. Busca el usuario por email
        /// 3. Genera un token temporal y cambia la contraseña
        /// 4. Retorna confirmación
        /// 
        /// ⚠️ ADVERTENCIA: Este endpoint es solo para testing.
        /// En producción, usar el flujo normal con tokens de recuperación.
        /// </summary>
        /// <param name="request">Email y nueva contraseña</param>
        /// <returns>Mensaje de confirmación</returns>
        [HttpPost("change-password-direct")]
        public async Task<ActionResult<PasswordResetResponse>> ChangePasswordDirect([FromBody] DirectPasswordChangeRequest request)
        {
            var response = await _authService.ChangePasswordDirectlyAsync(request);
            
            if (response.Success)
                return Ok(response);
            else
                return BadRequest(response);
        }

        /// <summary>
        /// Endpoint de salud para verificar que la API esté funcionando
        /// Útil para testing y monitoreo
        /// </summary>
        /// <returns>Mensaje de estado</returns>
        [HttpGet("health")]
        public ActionResult<string> Health()
        {
            return Ok("PetCare API is running!");
        }
    }

    /// <summary>
    /// DTO para login con rol específico
    /// Extiende LoginRequest básico agregando el campo Role
    /// </summary>
    public class LoginRequestWithRole
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
    }

    /// <summary>
    /// DTO para registro con rol específico
    /// Extiende RegisterRequest básico agregando el campo Role
    /// </summary>
    public class RegisterRequestWithRole
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
    }
} 