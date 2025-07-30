using System.Collections.Generic;

namespace BGClima.Domain.Entities
{
    public class AirConditionerType
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public ICollection<AirConditioner> AirConditioners { get; set; }
    }
}
