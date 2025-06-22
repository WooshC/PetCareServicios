using Microsoft.AspNetCore.Mvc;
using PetCareServicios.Models.Auth;
using PetCareServicios.Services.Interfaces;
using Microsoft.AspNetCore.Identity;

namespace PetCareServicios.Controllers
{
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

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequestWithRole request)
        {
            var response = await _authService.LoginAsync(new LoginRequest 
            { 
                Email = request.Email, 
                Password = request.Password 
            });
            
            if (!response.Success)
                return BadRequest(response);

            // Verificar que el usuario tenga el rol correcto
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
                
            return Ok(response);
        }

        [HttpPost("register")]
        public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequestWithRole request)
        {
            var user = new User
            {
                UserName = request.Email,
                Email = request.Email,
                Name = request.Name,
                CreatedAt = DateTime.UtcNow
            };

            var response = await _authService.RegisterAsync(user, request.Password);
            
            if (!response.Success)
                return BadRequest(response);

            // Asignar rol al usuario
            if (!await _roleManager.RoleExistsAsync(request.Role))
            {
                await _roleManager.CreateAsync(new UserRole { Name = request.Role });
            }

            await _userManager.AddToRoleAsync(user, request.Role);
                
            return Ok(response);
        }

        [HttpGet("health")]
        public ActionResult<string> Health()
        {
            return Ok("PetCare API is running!");
        }
    }

    public class LoginRequestWithRole
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
    }

    public class RegisterRequestWithRole
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
    }
} 