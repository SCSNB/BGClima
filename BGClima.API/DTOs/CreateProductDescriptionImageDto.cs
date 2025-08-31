namespace BGClima.API.DTOs
{
    public class CreateProductDescriptionImageDto
    {
        public string ImageUrl { get; set; }
        public string? AltText { get; set; }
        public int DisplayOrder { get; set; }
    }
}
