using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;
using SixLabors.ImageSharp.Formats.Jpeg;

namespace BGClima.Application.Services;

public class ImageService : IImageService
{
    private readonly BlobServiceClient _blobServiceClient;
    private readonly string _containerName;

    public ImageService(IConfiguration configuration)
    {
        var connectionString = configuration["AzureStorage:ConnectionString"];
        _containerName = configuration.GetSection("AzureStorage:Container").Value ?? "product-images";
        
        // Get Azure Storage Key from environment variable
        var storageKey = Environment.GetEnvironmentVariable("AZURE_STORAGE_KEY") ?? 
                        configuration["AZURE_STORAGE_KEY"];
        
        // Replace placeholder in connection string if key is found
        if (!string.IsNullOrEmpty(storageKey))
        {
            connectionString = connectionString?.Replace("${AZURE_STORAGE_KEY}", storageKey);
        }

        if (string.IsNullOrEmpty(connectionString) || connectionString.Contains("!!PASTE_YOUR_STORAGE_CONNECTION_STRING_HERE!!"))
        {
            throw new InvalidOperationException("Azure Storage connection string is not properly configured.");
        }

        _blobServiceClient = new BlobServiceClient(connectionString);
    }

    public async Task<string> UploadImageAsync(IFormFile file)
    {
        if (file == null || file.Length == 0)
            throw new ArgumentException("File is empty or null");

        try
        {
            // Resize image before upload
            var resizedImageStream = await ResizeImageStreamAsync(file, 800, 600);
            
            // Generate unique filename
            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            
            // Get container client
            var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
            await containerClient.CreateIfNotExistsAsync(PublicAccessType.Blob);
            
            // Upload to Azure Blob Storage
            var blobClient = containerClient.GetBlobClient(fileName);
            
            var blobHttpHeaders = new BlobHttpHeaders
            {
                ContentType = GetContentType(file.FileName)
            };

            await blobClient.UploadAsync(resizedImageStream, new BlobUploadOptions
            {
                HttpHeaders = blobHttpHeaders
            });

            return blobClient.Uri.ToString();
        }
        catch (Azure.RequestFailedException ex)
        {
            throw new InvalidOperationException($"Azure Storage error: {ex.ErrorCode} - {ex.Message}", ex);
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException($"Failed to upload image: {ex.Message}", ex);
        }
    }

    public async Task<bool> DeleteImageAsync(string imageUrl)
    {
        try
        {
            var uri = new Uri(imageUrl);
            var fileName = Path.GetFileName(uri.LocalPath);
            
            var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
            var blobClient = containerClient.GetBlobClient(fileName);
            
            var response = await blobClient.DeleteIfExistsAsync();
            return response.Value;
        }
        catch
        {
            return false;
        }
    }

    public async Task<string> ResizeImageAsync(IFormFile file, int maxWidth = 800, int maxHeight = 600)
    {
        var resizedStream = await ResizeImageStreamAsync(file, maxWidth, maxHeight);
        
        // For this method, we'll return a data URL for preview purposes
        resizedStream.Position = 0;
        var bytes = new byte[resizedStream.Length];
        await resizedStream.ReadAsync(bytes, 0, bytes.Length);
        
        var base64 = Convert.ToBase64String(bytes);
        return $"data:{GetContentType(file.FileName)};base64,{base64}";
    }

    private async Task<MemoryStream> ResizeImageStreamAsync(IFormFile file, int maxWidth, int maxHeight)
    {
        using var image = await Image.LoadAsync(file.OpenReadStream());
        
        // Calculate new dimensions maintaining aspect ratio
        var ratioX = (double)maxWidth / image.Width;
        var ratioY = (double)maxHeight / image.Height;
        var ratio = Math.Min(ratioX, ratioY);
        
        var newWidth = (int)(image.Width * ratio);
        var newHeight = (int)(image.Height * ratio);
        
        // Resize image
        image.Mutate(x => x.Resize(newWidth, newHeight));
        
        // Save to memory stream
        var outputStream = new MemoryStream();
        await image.SaveAsJpegAsync(outputStream, new JpegEncoder { Quality = 85 });
        outputStream.Position = 0;
        
        return outputStream;
    }

    private static string GetContentType(string fileName)
    {
        var extension = Path.GetExtension(fileName).ToLowerInvariant();
        return extension switch
        {
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".gif" => "image/gif",
            ".bmp" => "image/bmp",
            ".webp" => "image/webp",
            _ => "application/octet-stream"
        };
    }
}
