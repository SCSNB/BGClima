namespace BGClima.Domain.Entities
{
    public class Specification
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Value { get; set; }
        public int AirConditionerId { get; set; }
        public AirConditioner AirConditioner { get; set; }
    }
}
