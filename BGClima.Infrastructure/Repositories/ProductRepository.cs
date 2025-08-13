using BGClima.Infrastructure.Data;
using BGClima.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace BGClima.Infrastructure.Repositories
{
    public class ProductRepository : Repository<Product>, IProductRepository
    {
        public ProductRepository(BGClimaContext context) : base(context) { }

        public async Task<Product?> GetProductWithDetailsAsync(int id)
        {
            return await _dbSet
                .Include(p => p.ProductType)
                .Include(p => p.Images)
                .Include(p => p.Attributes)
                .Include(p => p.Brand)
                .Include(p => p.BTU)
                .Include(p => p.EnergyClass)
                .FirstOrDefaultAsync(p => p.Id == id);
        }
    }
} 