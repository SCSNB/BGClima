namespace BGClima.Domain.Entities
{
    public class ProductDescriptionImage
    {
        public int Id { get; set; }
        public string ImageUrl { get; set; }
        public string? AltText { get; set; }
        public int DisplayOrder { get; set; }

        public int ProductId { get; set; }
        public virtual Product Product { get; set; }
    }
}
