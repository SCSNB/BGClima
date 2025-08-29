namespace BGClima.API.DTOs
{
    public class ProductDescriptionImageDto
    {
        public int Id { get; set; }
        public string ImageUrl { get; set; }
        public string? AltText { get; set; }
        public int DisplayOrder { get; set; }
    }
}
