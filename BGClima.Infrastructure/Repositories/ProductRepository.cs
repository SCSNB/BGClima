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

            var acceptedValues = new List<string>();

            if (!string.IsNullOrWhiteSpace(value))
            {
                acceptedValues.Add(value);

                if (value == "стенен тип")
                {
                    acceptedValues.Add("настен");
                    acceptedValues.Add("хиперинвертори");
                }
            }

            return await _dbSet
                .Include(p => p.Brand)
                .Include(p => p.BTU)
                .Include(p => p.EnergyClass)
                .Where(p => p.Attributes.Any(a =>
                    a.AttributeKey != null && a.AttributeValue != null &&
                    a.AttributeKey.ToLower().Contains(keyNeedle) &&
                    acceptedValues.Contains(a.AttributeValue.ToLower())
                ))
                .ToListAsync();
        }
    }
} 