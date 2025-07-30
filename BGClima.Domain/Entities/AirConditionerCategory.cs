namespace BGClima.Domain.Entities
{
    public class AirConditionerCategory
    {
        public int AirConditionerId { get; set; }
        public AirConditioner AirConditioner { get; set; }
        public int CategoryId { get; set; }
        public Category Category { get; set; }
    }
}
