using BGClima.Domain.Entities;

namespace BGClima.Application.Services
{
    public interface IAuthService
    {
        Task<LoginResponse> LoginAsync(LoginRequest request);
        Task<bool> RegisterAsync(RegisterRequest request);
        Task<bool> LogoutAsync();
    }
} 