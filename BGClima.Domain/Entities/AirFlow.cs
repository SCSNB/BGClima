namespace BGClima.Domain.Entities
{
    public class AirFlow
    {
        public int Id { get; set; }
        public string Description { get; set; }
        public decimal? Value { get; set; }
        public int? AirConditionerId { get; set; }
        public AirConditioner AirConditioner { get; set; }
    }
}
