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

            // Map от DTO към модел (за създаване/редакция)
            CreateMap<CreateProductDto, Product>()
                .ForMember(dest => dest.Attributes, opt => opt.MapFrom(src => src.Attributes))
                .ForMember(dest => dest.Images, opt => opt.MapFrom(src => src.Images));
            CreateMap<CreateProductAttributeDto, ProductAttribute>();
            CreateMap<CreateProductImageDto, ProductImage>();
        }
    }
}
