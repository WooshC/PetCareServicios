using Microsoft.AspNetCore.Mvc;
using PetCareServicios.Models.Auth;
using PetCareServicios.Services.Interfaces;

namespace PetCareServicios.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
        {
            var response = await _authService.LoginAsync(request);
            
            if (!response.Success)
                return BadRequest(response);
                
            return Ok(response);
        }

        [HttpPost("register")]
        public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
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
                
            return Ok(response);
        }

        [HttpGet("health")]
        public ActionResult<string> Health()
        {
            return Ok("PetCare API is running!");
        }
    }

    public class RegisterRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
    }
} 