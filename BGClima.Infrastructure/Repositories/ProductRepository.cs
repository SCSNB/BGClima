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

        public async Task<IEnumerable<Product>> GetProductsByCategoryAsync(string categoryName)
        {
            var keyNeedle = "тип на инстала"; // обхваща "Тип на инсталацията"
            var value = categoryName?.Trim().ToLower();

            // приемаме и синонима "Настен" за "Стенен тип"
            var altValue = value == "стенен тип" ? "настен" : null;

            return await _dbSet
                .Include(p => p.Brand)
                .Include(p => p.BTU)
                .Include(p => p.EnergyClass)
                .Where(p => p.Attributes.Any(a =>
                    a.AttributeKey != null && a.AttributeValue != null &&
                    a.AttributeKey.ToLower().Contains(keyNeedle) &&
                    (
                        a.AttributeValue.ToLower() == value ||
                        (altValue != null && a.AttributeValue.ToLower() == altValue)
                    )
                ))
                .ToListAsync();
        }
    }
} 