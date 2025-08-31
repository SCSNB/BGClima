using BGClima.Domain.Entities;
using System.ComponentModel.DataAnnotations;

namespace BGClima.API.DTOs
{
    public class BannerDto
    {
        public int Id { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = null!;
        
        [Required]
        [MaxLength(500)]
        public string ImageUrl { get; set; } = null!;
        
        [MaxLength(1000)]
        public string? TargetUrl { get; set; }
        
        [Required]
        public int DisplayOrder { get; set; }
        
        [Required]
        public bool IsActive { get; set; } = true;
        
        [Required]
        public BannerType Type { get; set; }
    }
}
