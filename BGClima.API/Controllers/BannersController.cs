using Microsoft.AspNetCore.Mvc;
using BGClima.Domain.Entities;
using BGClima.Domain.Interfaces;
using BGClima.API.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;

namespace BGClima.API.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class BannersController : ControllerBase
    {
        private readonly IBannerRepository _bannerRepository;
        private readonly IMapper _mapper;

        public BannersController(IBannerRepository bannerRepository, IMapper mapper)
        {
            _bannerRepository = bannerRepository;
            _mapper = mapper;
        }

        // GET: api/Banners
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BannerDto>>> GetBanners()
        {
            var banners = await _bannerRepository.GetAllBannersAsync();
            return Ok(_mapper.Map<IEnumerable<BannerDto>>(banners));
        }

        // GET: api/banners/type/{type}
        [HttpGet("type/{type}")]
        public async Task<ActionResult<IEnumerable<BannerDto>>> GetBannersByType(BannerType type)
        {
            var banners = await _bannerRepository.GetActiveBannersByTypeAsync(type);
            return Ok(_mapper.Map<IEnumerable<BannerDto>>(banners));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<BannerDto>> GetBanner(int id)
        {
            var banner = await _bannerRepository.GetBannerByIdAsync(id);
            if (banner == null)
                return NotFound();

            return Ok(_mapper.Map<BannerDto>(banner));
        }

        [HttpPost]
        public async Task<ActionResult<BannerDto>> CreateBanner(BannerDto bannerDto)
        {
            var banner = _mapper.Map<Banner>(bannerDto);
            await _bannerRepository.AddBannerAsync(banner);
            
            var result = _mapper.Map<BannerDto>(banner);
            return CreatedAtAction(nameof(GetBanner), new { id = result.Id }, result);
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateBanner(int id, BannerDto bannerDto)
        {
            if (id != bannerDto.Id)
                return BadRequest();

            var banner = await _bannerRepository.GetBannerByIdAsync(id);
            if (banner == null)
                return NotFound();

            _mapper.Map(bannerDto, banner);
            await _bannerRepository.UpdateBannerAsync(banner);

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteBanner(int id)
        {
            var banner = await _bannerRepository.GetBannerByIdAsync(id);
            if (banner == null)
                return NotFound();

            await _bannerRepository.DeleteBannerAsync(id);
            return NoContent();
        }
    }
}
