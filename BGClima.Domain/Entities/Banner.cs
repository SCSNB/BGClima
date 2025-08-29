using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BGClima.Domain.Entities
{
    public class Banner
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
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
    
    public enum BannerType
    {
        HeroSlider,    // Слайд (Главен слайдер)
        MainLeft,      // Основен ляв (голям банер вляво)
        TopRight,      // Дясно горе (малък горен десен)
        MiddleRight,   // Дясно среда (среден десен)
        BottomRight    // Дясно долу (долен десен)
    }
}
