namespace BGClima.Domain.Entities
{
    public class ProductImage
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string Url { get; set; } = string.Empty;
        public Product Product { get; set; } = null!;
    }
} 