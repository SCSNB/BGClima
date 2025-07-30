using System.Collections.Generic;

namespace BGClima.Domain.Entities
{
    public class Series
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int BrandId { get; set; }
        public Brand Brand { get; set; }
        public string Description { get; set; }
        public ICollection<AirConditioner> AirConditioners { get; set; }
    }
}
