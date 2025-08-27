using System.Threading.Tasks;

namespace BGClima.Domain.Entities
{
    public interface IProductRepository : IRepository<Product>
    {
        // Add product-specific methods here if needed
        Task<Product?> GetProductWithDetailsAsync(int id);
        Task<IEnumerable<Product>> GetProductsByCategoryAsync(string categoryName);
    }
} 