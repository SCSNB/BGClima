using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BGClima.API.Models
{
    [Table("product_images", Schema = "bgclima")]
    public class ProductImage : BaseEntity
    {
        [Required]
        [Column("product_id")]
        public int ProductId { get; set; }

        [Required]
        [Column("image_url")]
        [StringLength(500)]
        public string ImageUrl { get; set; }

        [Column("is_primary")]
        public bool IsPrimary { get; set; } = false;

        [Column("display_order")]
        public int DisplayOrder { get; set; } = 0;

        [StringLength(250)]
        public string AltText { get; set; }

        // Navigation property
        [ForeignKey("ProductId")]
        public virtual Product Product { get; set; }
    }
}
