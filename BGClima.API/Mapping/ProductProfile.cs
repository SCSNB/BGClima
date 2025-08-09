using AutoMapper;
using BGClima.API.DTOs;
using BGClima.Domain.Entities;

namespace BGClima.API.Mapping
{
    public class ProductProfile : Profile
    {
        public ProductProfile()
        {
            // Map от модел към DTO
            CreateMap<Product, ProductDto>();
            CreateMap<Brand, BrandDto>();
            CreateMap<BTU, BTUInfoDto>();
            CreateMap<EnergyClass, EnergyClassDto>();
            CreateMap<ProductType, ProductTypeDto>();
            CreateMap<ProductAttribute, ProductAttributeDto>();
            CreateMap<ProductImage, ProductImageDto>();

            // Map от DTO към модел (за създаване)
            CreateMap<CreateProductDto, Product>();
            CreateMap<CreateProductAttributeDto, ProductAttribute>();
            CreateMap<CreateProductImageDto, ProductImage>();
        }
    }
}
