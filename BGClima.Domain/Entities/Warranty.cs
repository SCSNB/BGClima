namespace BGClima.Domain.Entities
{
    public class Warranty
    {
        public int Id { get; set; }
        public string Description { get; set; }
        public int? AirConditionerId { get; set; }
        public AirConditioner AirConditioner { get; set; }
    }
}
