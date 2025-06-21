using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using PetCareServicios.Models.Auth;
using PetCareServicios.Services.Interfaces;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace PetCareServicios.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<User> _userManager;
        private readonly IConfiguration _configuration;

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

            var token = GenerateJwtToken(user);
            
            return new AuthResponse 
            { 
                Success = true, 
                Token = token, 
                Message = "Login exitoso" 
            };
        }

        public async Task<AuthResponse> RegisterAsync(User user, string password)
        {
            if (await _userManager.FindByEmailAsync(user.Email) != null)
            {
                return new AuthResponse 
                { 
                    Success = false, 
                    Message = "El email ya está registrado" 
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

            var token = GenerateJwtToken(user);
            
            return new AuthResponse 
            { 
                Success = true, 
                Token = token, 
                Message = "Usuario registrado exitosamente" 
            };
        }

        public string GenerateJwtToken(User user)
        {
            var jwtSettings = _configuration.GetSection("Jwt");
            var key = Encoding.ASCII.GetBytes(jwtSettings["Key"] ?? "default-key-32-characters-long");

            var tokenHandler = new JwtSecurityTokenHandler();
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Email, user.Email ?? ""),
                    new Claim(ClaimTypes.Name, user.Name)
                }),
                Expires = DateTime.UtcNow.AddHours(24),
                Issuer = jwtSettings["Issuer"],
                Audience = jwtSettings["Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
} 