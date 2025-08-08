namespace BGClima.API.DTOs
{
    public class CreateProductImageDto
    {
        public string ImageUrl { get; set; }
        public string AltText { get; set; }
        public int DisplayOrder { get; set; } = 0;
        public bool IsPrimary { get; set; } = false;
    }
}
