using BGClima.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace BGClima.Infrastructure.Repositories
{
    public class ProductRepository : Repository<Product>, IProductRepository
    {
        public ProductRepository(AppDbContext context) : base(context) { }

        public async Task<Product?> GetProductWithDetailsAsync(int id)
        {
            return await _dbSet
                .Include(p => p.Category)
                .Include(p => p.Images)
                .Include(p => p.Features)
                .Include(p => p.Stock)
                .Include(p => p.Price)
                .FirstOrDefaultAsync(p => p.Id == id);
        }
    }
} 