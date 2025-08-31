using AutoMapper;
using BGClima.API.DTOs;
using BGClima.Domain.Entities;

namespace BGClima.API.Mapping
{
    public class BannerProfile : Profile
    {
        public BannerProfile()
        {
            CreateMap<Banner, BannerDto>();
            CreateMap<BannerDto, Banner>();
        }
    }
}
