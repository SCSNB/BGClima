using AutoMapper;
using BGClima.API.DTOs;
using BGClima.Application.Services;
using BGClima.Domain.Entities;
using BGClima.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BGClima.API.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class BannersController : ControllerBase
    {
        private readonly IBannerRepository _bannerRepository;
        private readonly IMapper _mapper;
        private readonly IImageService _imageService;
        private readonly ILogger<BannersController> _logger;

        public BannersController(
            IBannerRepository bannerRepository,
            IImageService imageService,
            ILogger<BannersController> logger,
            IMapper mapper)
        {
            _bannerRepository = bannerRepository ?? throw new ArgumentNullException(nameof(bannerRepository));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _imageService = imageService ?? throw new ArgumentNullException(nameof(_imageService));
            _logger = logger;
        }

        // GET: api/banners
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BannerDto>>> GetBanners()
        {
            try
            {
                var banners = await _bannerRepository.GetAllBannersAsync();
                return Ok(_mapper.Map<IEnumerable<BannerDto>>(banners));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Възникна грешка при извличане на банерите.", Error = ex.Message });
            }
        }

        // GET: api/banners/type/{type}
        [HttpGet("type/{type}")]
        public async Task<ActionResult<IEnumerable<BannerDto>>> GetBannersByType(BannerType type)
        {
            try
            {
                var banners = await _bannerRepository.GetActiveBannersByTypeAsync(type);
                return Ok(_mapper.Map<IEnumerable<BannerDto>>(banners));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = $"Възникна грешка при извличане на банерите от тип {type}.", Error = ex.Message });
            }
        }

        // GET: api/banners/5
        [HttpGet("{id}")]
        public async Task<ActionResult<BannerDto>> GetBanner(int id)
        {
            try
            {
                var banner = await _bannerRepository.GetBannerByIdAsync(id);
                if (banner == null)
                {
                    return NotFound(new { Message = $"Банер с ID {id} не е намерен." });
                }
                return Ok(_mapper.Map<BannerDto>(banner));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = $"Грешка при извличане на банер с ID {id}.", Error = ex.Message });
            }
        }

        // POST: api/banners
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<BannerDto>> CreateBanner([FromBody] BannerDto bannerDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new { Message = "Невалидни данни за банер.", Errors = ModelState.Values });
                }

                var banner = _mapper.Map<Banner>(bannerDto);
                await _bannerRepository.AddBannerAsync(banner);

                var result = _mapper.Map<BannerDto>(banner);
                return CreatedAtAction(nameof(GetBanner), new { id = result.Id }, result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Грешка при създаване на банер.", Error = ex.Message });
            }
        }

        // PUT: api/banners/5
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateBanner(int id, [FromBody] BannerDto bannerDto)
        {
            try
            {
                // If the DTO has an ID, it must match the route ID
                if (bannerDto.Id != null && id != bannerDto.Id)
                {
                    return BadRequest(new { Message = "ID в URL-то не съответства на ID в данните за банер." });
                }

                // Ensure the DTO has the correct ID from the route
                bannerDto.Id = id;

                var existingBanner = await _bannerRepository.GetBannerByIdAsync(id);
                if (existingBanner == null)
                {
                    return NotFound(new { Message = $"Банер с ID {id} не е намерен." });
                }

                // Update only the properties that were provided in the DTO
                if (bannerDto.Name != null)
                    existingBanner.Name = bannerDto.Name;

                if (bannerDto.ImageUrl != null)
                    existingBanner.ImageUrl = bannerDto.ImageUrl;

                if (bannerDto.TargetUrl != null) // This allows setting TargetUrl to null if needed
                    existingBanner.TargetUrl = bannerDto.TargetUrl;

                if (bannerDto.DisplayOrder != 0)
                    existingBanner.DisplayOrder = bannerDto.DisplayOrder;

                // For boolean and enum values, we need to explicitly check if they were provided
                if (bannerDto.IsActive != existingBanner.IsActive)
                    existingBanner.IsActive = bannerDto.IsActive;

                if (bannerDto.Type != existingBanner.Type)
                    existingBanner.Type = bannerDto.Type;

                await _bannerRepository.UpdateBannerAsync(existingBanner);

                return NoContent();
            }
            catch (Exception ex)
            {
                // Log the full exception for debugging
                Console.WriteLine($"Error updating banner: {ex}");
                return StatusCode(500, new
                {
                    Message = $"Грешка при обновяване на банер с ID {id}.",
                    Error = ex.Message,
                    Details = ex.StackTrace
                });
            }
        }

        // DELETE: api/banners/5
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteBanner(int id)
        {
            try
            {
                var banner = await _bannerRepository.GetBannerByIdAsync(id);
                if (banner == null)
                {
                    return NotFound(new { Message = $"Банер с ID {id} не е намерен." });
                }

                // Delete the blob from storage
                var result = await _imageService.DeleteImageAsync(banner.ImageUrl);
                if (!result)
                {
                    // Log warning but continue to delete the database record
                    _logger.LogError("Failed to delete image from storage: {ImageUrl}", banner.ImageUrl);
                }

                await _bannerRepository.DeleteBannerAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = $"Грешка при изтриване на банер с ID {id}.", Error = ex.Message });
            }
        }
    }
}
