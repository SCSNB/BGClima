using Azure.Storage.Blobs;

public static class TestAzureConnection
{
    public static async Task<string> TestConnection(string connectionString, string containerName)
    {
        try
        {
            var blobServiceClient = new BlobServiceClient(connectionString);
            var containerClient = blobServiceClient.GetBlobContainerClient(containerName);
            
            // Test if we can access the container
            var exists = await containerClient.ExistsAsync();
            
            if (exists)
            {
                return "Connection successful - container exists";
            }
            else
            {
                // Try to create the container
                await containerClient.CreateIfNotExistsAsync();
                return "Connection successful - container created";
            }
        }
        catch (Exception ex)
        {
            return $"Connection failed: {ex.Message}";
        }
    }
}
