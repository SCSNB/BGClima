using BGClima.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace BGClima.Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<IdentityUser> _userManager;
        private readonly SignInManager<IdentityUser> _signInManager;
        private readonly IConfiguration _configuration;

        public AuthService(
            UserManager<IdentityUser> userManager,
            SignInManager<IdentityUser> signInManager,
            IConfiguration configuration)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _configuration = configuration;
        }

        public async Task<LoginResponse> LoginAsync(LoginRequest request)
        {
            var user = await _userManager.FindByNameAsync(request.Username);
            if (user == null)
            {
                throw new InvalidOperationException("Invalid username or password");
            }

            var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password, false);
            if (!result.Succeeded)
            {
                throw new InvalidOperationException("Invalid username or password");
            }

            var roles = await _userManager.GetRolesAsync(user);
            var token = GenerateJwtToken(user, roles);

            return new LoginResponse
            {
                Id = user.Id,
                Username = user.UserName ?? string.Empty,
                Email = user.Email ?? string.Empty,
                Roles = roles.ToList(),
                Token = token
            };
        }

        public async Task<bool> RegisterAsync(RegisterRequest request)
        {
            if (request.Password != request.ConfirmPassword)
            {
                throw new InvalidOperationException("Passwords do not match");
            }

            var user = new IdentityUser
            {
                UserName = request.Username,
                Email = request.Email,
                EmailConfirmed = true
            };

            var result = await _userManager.CreateAsync(user, request.Password);
            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new InvalidOperationException($"Registration failed: {errors}");
            }

            // Assign default role
            await _userManager.AddToRoleAsync(user, "USER");

            return true;
        }

        public async Task<bool> LogoutAsync()
        {
            await _signInManager.SignOutAsync();
            return true;
        }

        private string GenerateJwtToken(IdentityUser user, IList<string> roles)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var jwtSecret = _configuration.GetValue<string>("JWT_SECRET_KEY") ??
                Environment.GetEnvironmentVariable("JWT_SECRET_KEY") ??
                jwtSettings["SecretKey"] ?? "your-super-secret-key-with-at-least-32-characters";
            var key = Encoding.ASCII.GetBytes(jwtSecret);
            var issuer = jwtSettings["Issuer"] ?? "BGClima";
            var audience = jwtSettings["Audience"] ?? "BGClimaUsers";
            var expirationHours = int.Parse(jwtSettings["ExpirationHours"] ?? "24");

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Name, user.UserName ?? string.Empty),
                new Claim(ClaimTypes.Email, user.Email ?? string.Empty)
            };

            // Add roles to claims
            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddHours(expirationHours),
                Issuer = issuer,
                Audience = audience,
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature)
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }
    }
} 