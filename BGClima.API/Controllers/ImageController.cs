using Microsoft.AspNetCore.Mvc;
using BGClima.Application.Services;
using Microsoft.AspNetCore.Authorization;

namespace BGClima.API.Controllers;

[ApiController]
[Route("api/[controller]")]
//[Authorize]
public class ImageController : ControllerBase
{
    private readonly IImageService _imageService;

    public ImageController(IImageService imageService)
    {
        _imageService = imageService;
    }


    [HttpPost("upload")]
    public async Task<IActionResult> UploadImage(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new { error = "No file provided" });
        }

        if (!IsValidImageFile(file))
        {
            return BadRequest(new { error = "Invalid file type. Only images are allowed." });
        }

        try
        {
            var imageUrl = await _imageService.UploadImageAsync(file);
            return Ok(new { imageUrl });
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("Azure Storage connection string"))
        {
            return StatusCode(500, new { error = "Image upload service is not properly configured. Please contact administrator.", details = ex.Message });
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("Azure Storage error"))
        {
            return StatusCode(500, new { error = $"Storage service error: {ex.Message}", details = ex.InnerException?.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = $"Error uploading image: {ex.Message}", details = ex.InnerException?.Message, stackTrace = ex.StackTrace });
        }
    }

    [HttpPost("upload-multiple")]
    public async Task<IActionResult> UploadMultipleImages(List<IFormFile> files)
    {
        if (files == null || files.Count == 0)
        {
            return BadRequest("No files provided");
        }

        var uploadResults = new List<object>();

        foreach (var file in files)
        {
            if (!IsValidImageFile(file))
            {
                uploadResults.Add(new { fileName = file.FileName, error = "Invalid file type" });
                continue;
            }

            try
            {
                var imageUrl = await _imageService.UploadImageAsync(file);
                uploadResults.Add(new { fileName = file.FileName, imageUrl });
            }
            catch (Exception ex)
            {
                uploadResults.Add(new { fileName = file.FileName, error = ex.Message });
            }
        }

        return Ok(new { results = uploadResults });
    }

    private static bool IsValidImageFile(IFormFile file)
    {
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp" };
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        return allowedExtensions.Contains(extension);
    }
}
