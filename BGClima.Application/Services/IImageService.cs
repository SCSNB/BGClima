using Microsoft.AspNetCore.Http;

namespace BGClima.Application.Services;

public interface IImageService
{
    Task<string> UploadImageAsync(IFormFile file);
    Task<bool> DeleteImageAsync(string imageUrl);
    Task<string> ResizeImageAsync(IFormFile file, int maxWidth = 800, int maxHeight = 600);
}
