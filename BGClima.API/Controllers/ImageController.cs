using BGClima.Application.Services;
using BGClima.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BGClima.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ImageController : ControllerBase
{
    private readonly IImageService _imageService;
    private readonly ILogger<ImageController> _logger;
    private readonly BGClimaContext _context;

    public ImageController(
        IImageService imageService,
        ILogger<ImageController> logger,
        BGClimaContext context)
    {
        _imageService = imageService;
        _logger = logger;
        _context = context;
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

    /// <summary>
    /// Deletes an image by its ID
    /// </summary>
    /// <param name="id">The ID of the image to delete</param>
    /// <returns>No content if successful</returns>
    /// <summary>
    /// Deletes an image by its ID
    /// </summary>
    /// <param name="id">The ID of the image to delete</param>
    /// <returns>No content if successful</returns>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> DeleteImage(int id)
    {
        _logger.LogInformation("DeleteImage called with ID: {ImageId}", id);
        
        try
        {
            var image = await _context.ProductImages.FindAsync(id);
            if (image == null)
            {
                _logger.LogWarning("Image with ID {ImageId} not found", id);
                return NotFound(new { error = $"Image with ID {id} not found" });
            }

            // Delete the blob from storage
            var result = await _imageService.DeleteImageAsync(image.ImageUrl);
            if (!result)
            {
                // Log warning but continue to delete the database record
                _logger.LogWarning("Failed to delete image from storage: {ImageUrl}", image.ImageUrl);
            }

            // Remove from database
            _context.ProductImages.Remove(image);
            await _context.SaveChangesAsync();
            
            _logger.LogInformation("Image with ID {ImageId} deleted successfully", id);
            return Ok(new { message = "Image deleted successfully" });
        }
        catch (DbUpdateException dbEx)
        {
            _logger.LogError(dbEx, "Database error while deleting image with ID {ImageId}", id);
            return StatusCode(500, new { 
                error = "A database error occurred while deleting the image", 
                details = dbEx.InnerException?.Message ?? dbEx.Message 
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error deleting image with ID {ImageId}", id);
            return StatusCode(500, new { 
                error = "An unexpected error occurred while deleting the image", 
                details = ex.Message 
            });
        }
    }

    private static bool IsValidImageFile(IFormFile file)
    {
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp" };
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        return allowedExtensions.Contains(extension);
    }
}
