namespace BGClima.API.DTOs
{
    public class CreateProductAttributeDto
    {
        public string AttributeKey { get; set; }
        public string AttributeValue { get; set; }
        public string GroupName { get; set; }
        public int DisplayOrder { get; set; } = 0;
        public bool IsVisible { get; set; } = true;
    }
}
