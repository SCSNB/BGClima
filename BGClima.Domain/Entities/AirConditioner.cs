using System;
using System.Collections.Generic;

namespace BGClima.Domain.Entities
{
    public class AirConditioner
    {
        public int Id { get; set; }
        public string Model { get; set; }
        public int BrandId { get; set; }
        public Brand Brand { get; set; }
        public int? SeriesId { get; set; }
        public Series Series { get; set; }
        public int AirConditionerTypeId { get; set; }
        public AirConditionerType AirConditionerType { get; set; }
        public string Description { get; set; }
        public string Features { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsInStock { get; set; }
        public decimal? NoiseLevel { get; set; }
        public ICollection<Specification> Specifications { get; set; }
        public ICollection<Price> Prices { get; set; }
        public ICollection<Image> Images { get; set; }
        public ICollection<AirConditionerCategory> AirConditionerCategories { get; set; }
        public Installation Installation { get; set; }
        public Performance Performance { get; set; }
        public AirFlow AirFlow { get; set; }
        public Filter Filter { get; set; }
        public Operation Operation { get; set; }
        public Warranty Warranty { get; set; }
public int WarrantyMonths { get; set; }
public bool HasWiFi { get; set; }
public bool HasInverter { get; set; }
    }
}
