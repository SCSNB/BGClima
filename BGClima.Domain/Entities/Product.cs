namespace BGClima.Domain.Entities
{
    public class Product
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int CategoryId { get; set; }
        public Category Category { get; set; } = null!;
        public ICollection<ProductImage> Images { get; set; } = new List<ProductImage>();
        public ICollection<ProductFeature> Features { get; set; } = new List<ProductFeature>();
        public Stock Stock { get; set; } = null!;
        public Price Price { get; set; } = null!;
    }
} 