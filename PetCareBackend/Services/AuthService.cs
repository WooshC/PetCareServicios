using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using PetCareServicios.Models.Auth;
using PetCareServicios.Services.Interfaces;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace PetCareServicios.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<User> _userManager;
        private readonly IConfiguration _configuration;

        // Diccionario para almacenar tokens de restablecimiento (en producción usar Redis o base de datos)
        private static readonly Dictionary<string, PasswordResetInfo> _resetTokens = new();

        public AuthService(UserManager<User> userManager, IConfiguration configuration)
        {
            _userManager = userManager;
            _configuration = configuration;
        }

        public async Task<AuthResponse> LoginAsync(LoginRequest request)
        {
            var user = await _userManager.FindByEmailAsync(request.Email);
            
            if (user == null || !await _userManager.CheckPasswordAsync(user, request.Password))
            {
                return new AuthResponse 
                { 
                    Success = false, 
                    Message = "Credenciales inválidas" 
                };
            }

            var token = await GenerateJwtToken(user);
            
            return new AuthResponse 
            { 
                Success = true, 
                Token = token, 
                Message = "Login exitoso" 
            };
        }

        public async Task<AuthResponse> RegisterAsync(User user, string password)
        {
            if (string.IsNullOrEmpty(user.Email) || await _userManager.FindByEmailAsync(user.Email) != null)
            {
                return new AuthResponse 
                { 
                    Success = false, 
                    Message = "El email ya está registrado o es inválido" 
                };
            }

            var result = await _userManager.CreateAsync(user, password);
            
            if (!result.Succeeded)
            {
                return new AuthResponse 
                { 
                    Success = false, 
                    Message = string.Join(", ", result.Errors.Select(e => e.Description)) 
                };
            }

            var token = await GenerateJwtToken(user);
            
            return new AuthResponse 
            { 
                Success = true, 
                Token = token, 
                Message = "Usuario registrado exitosamente" 
            };
        }

        public async Task<string> GenerateJwtToken(User user)
        {
            var jwtSettings = _configuration.GetSection("Jwt");
            var key = Encoding.ASCII.GetBytes(jwtSettings["Key"] ?? "default-key-32-characters-long");

            // Obtener los roles del usuario
            var userRoles = await _userManager.GetRolesAsync(user);
            var roleClaims = userRoles.Select(role => new Claim(ClaimTypes.Role, role));

            var tokenHandler = new JwtSecurityTokenHandler();
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Email, user.Email ?? ""),
                    new Claim(ClaimTypes.Name, user.Name)
                }.Concat(roleClaims)),
                Expires = DateTime.UtcNow.AddHours(24),
                Issuer = jwtSettings["Issuer"],
                Audience = jwtSettings["Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        // ===== MÉTODOS DE RECUPERACIÓN DE CONTRASEÑA =====

        public async Task<PasswordResetResponse> RequestPasswordResetAsync(PasswordResetRequest request)
        {
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null)
            {
                // Por seguridad, no revelamos si el email existe o no
                return new PasswordResetResponse 
                { 
                    Success = true, 
                    Message = "Si el email está registrado, recibirás un enlace para restablecer tu contraseña" 
                };
            }

            // Generar token único
            var token = GenerateResetToken();
            var expirationTime = DateTime.UtcNow.AddHours(1); // Token válido por 1 hora

            // Almacenar token (en producción usar Redis o base de datos)
            _resetTokens[token] = new PasswordResetInfo
            {
                UserId = user.Id,
                Email = user.Email ?? "",
                ExpirationTime = expirationTime
            };

            // En producción, aquí enviarías un email con el token
            // Por ahora, solo retornamos el token para testing
            return new PasswordResetResponse 
            { 
                Success = true, 
                Message = "Token de restablecimiento generado exitosamente",
                Token = token // En producción, NO incluir el token en la respuesta
            };
        }

        public async Task<PasswordResetResponse> ConfirmPasswordResetAsync(PasswordResetConfirmRequest request)
        {
            // Validar token
            if (!_resetTokens.TryGetValue(request.Token, out var resetInfo))
            {
                return new PasswordResetResponse 
                { 
                    Success = false, 
                    Message = "Token inválido o expirado" 
                };
            }

            // Verificar expiración
            if (DateTime.UtcNow > resetInfo.ExpirationTime)
            {
                _resetTokens.Remove(request.Token);
                return new PasswordResetResponse 
                { 
                    Success = false, 
                    Message = "Token expirado" 
                };
            }

            // Buscar usuario
            var user = await _userManager.FindByIdAsync(resetInfo.UserId.ToString());
            if (user == null)
            {
                _resetTokens.Remove(request.Token);
                return new PasswordResetResponse 
                { 
                    Success = false, 
                    Message = "Usuario no encontrado" 
                };
            }

            // Cambiar contraseña
            var result = await _userManager.ResetPasswordAsync(user, request.Token, request.NewPassword);
            if (!result.Succeeded)
            {
                return new PasswordResetResponse 
                { 
                    Success = false, 
                    Message = string.Join(", ", result.Errors.Select(e => e.Description)) 
                };
            }

            // Eliminar token usado
            _resetTokens.Remove(request.Token);

            return new PasswordResetResponse 
            { 
                Success = true, 
                Message = "Contraseña restablecida exitosamente" 
            };
        }

        public Task<bool> ValidateResetTokenAsync(string token)
        {
            if (!_resetTokens.TryGetValue(token, out var resetInfo))
                return Task.FromResult(false);

            if (DateTime.UtcNow > resetInfo.ExpirationTime)
            {
                _resetTokens.Remove(token);
                return Task.FromResult(false);
            }

            return Task.FromResult(true);
        }

        // ===== MÉTODO PARA TESTING - CAMBIO DIRECTO DE CONTRASEÑA =====

        public async Task<PasswordResetResponse> ChangePasswordDirectlyAsync(DirectPasswordChangeRequest request)
        {
            // Buscar usuario por email
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null)
            {
                return new PasswordResetResponse 
                { 
                    Success = false, 
                    Message = "Usuario no encontrado" 
                };
            }

            // Generar token de reset temporal
            var resetToken = await _userManager.GeneratePasswordResetTokenAsync(user);
            
            // Cambiar contraseña usando el token generado
            var result = await _userManager.ResetPasswordAsync(user, resetToken, request.NewPassword);
            
            if (!result.Succeeded)
            {
                return new PasswordResetResponse 
                { 
                    Success = false, 
                    Message = string.Join(", ", result.Errors.Select(e => e.Description)) 
                };
            }

            return new PasswordResetResponse 
            { 
                Success = true, 
                Message = "Contraseña cambiada exitosamente" 
            };
        }

        // ===== MÉTODOS AUXILIARES =====

        private string GenerateResetToken()
        {
            var randomBytes = new byte[32];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(randomBytes);
            }
            return Convert.ToBase64String(randomBytes).Replace("+", "-").Replace("/", "_").Replace("=", "");
        }

        // ===== CLASES AUXILIARES =====

        private class PasswordResetInfo
        {
            public int UserId { get; set; }
            public string Email { get; set; } = string.Empty;
            public DateTime ExpirationTime { get; set; }
        }
    }
} 