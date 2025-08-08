namespace BGClima.API.DTOs
{
    public class ProductAttributeDto
    {
        public int Id { get; set; }
        public string AttributeKey { get; set; }
        public string AttributeValue { get; set; }
        public string GroupName { get; set; }
        public int DisplayOrder { get; set; }
        public bool IsVisible { get; set; }
    }
}
