using BGClima.Domain.Entities;

namespace BGClima.Application.Services
{
    public class ProductService : IProductService
    {
        private readonly IProductRepository _productRepository;

        public ProductService(IProductRepository productRepository)
        {
            _productRepository = productRepository;
        }

        public async Task<IEnumerable<Product>> GetAllAsync()
        {
            return await _productRepository.GetAllAsync();
        }

        public async Task<Product?> GetByIdAsync(int id)
        {
            return await _productRepository.GetByIdAsync(id);
        }

        public async Task<Product?> GetProductWithDetailsAsync(int id)
        {
            return await _productRepository.GetProductWithDetailsAsync(id);
        }

        public async Task<Product> CreateAsync(Product product)
        {
            await _productRepository.AddAsync(product);
            await _productRepository.SaveChangesAsync();
            return product;
        }

        public async Task UpdateAsync(Product product)
        {
            _productRepository.Update(product);
            await _productRepository.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var product = await _productRepository.GetByIdAsync(id);
            if (product != null)
            {
                _productRepository.Delete(product);
                await _productRepository.SaveChangesAsync();
            }
        }
    }
} 