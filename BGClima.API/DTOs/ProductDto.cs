using System;
using System.Collections.Generic;

namespace BGClima.API.DTOs
{
    public class ProductDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        public decimal? OldPrice { get; set; }
        public bool IsOnSale { get; set; }
        public bool IsNew { get; set; }
        public bool IsFeatured { get; set; }
        public bool IsActive { get; set; }
        public int StockQuantity { get; set; }
        public string Sku { get; set; }
        public string ImageUrl { get; set; }
        
        // Navigation properties
        public BrandDto Brand { get; set; }
        public BTUInfoDto BTU { get; set; }
        public EnergyClassDto EnergyClass { get; set; }
        public ProductTypeDto ProductType { get; set; }
        
        // Collections
        public ICollection<ProductAttributeDto> Attributes { get; set; } = new List<ProductAttributeDto>();
        public ICollection<ProductImageDto> Images { get; set; } = new List<ProductImageDto>();
    }
}
