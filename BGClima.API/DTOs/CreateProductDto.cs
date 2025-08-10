using System.Collections.Generic;

namespace BGClima.API.DTOs
{
    public class CreateProductDto
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public int BrandId { get; set; }
        public int? BTUId { get; set; }
        public int? EnergyClassId { get; set; }
        public int ProductTypeId { get; set; }
        public decimal Price { get; set; }
        public decimal? OldPrice { get; set; }
        public int StockQuantity { get; set; } = 0;
        public bool IsActive { get; set; } = true;
        public bool IsFeatured { get; set; } = false;
        public bool IsOnSale { get; set; } = false;
        public bool IsNew { get; set; } = true;
        public string Sku { get; set; }
        public string ImageUrl { get; set; }
        
        public ICollection<CreateProductAttributeDto> Attributes { get; set; } = new List<CreateProductAttributeDto>();
        public ICollection<CreateProductImageDto> Images { get; set; } = new List<CreateProductImageDto>();
    }
}
