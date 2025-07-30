namespace BGClima.Domain.Entities
{
    public class Image
    {
        public int Id { get; set; }
        public int AirConditionerId { get; set; }
        public AirConditioner AirConditioner { get; set; }
        public string Url { get; set; }
        public string AltText { get; set; }
        public bool IsMain { get; set; }
        public int Order { get; set; }
    }
}
