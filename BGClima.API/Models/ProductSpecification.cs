using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using BGClima.API.Models.Enums;

namespace BGClima.API.Models
{
    [Table("product_specifications", Schema = "bgclima")]
    public class ProductSpecification : BaseEntity
    {
        [Required]
        [Column("product_id")]
        public int ProductId { get; set; }

        [Required]
        [Column("product_type")]
        public ProductType ProductType { get; set; }

        [Required]
        [Column("specification_key")]
        [StringLength(100)]
        public string SpecificationKey { get; set; }

        [Required]
        [Column("specification_value")]
        public string SpecificationValue { get; set; }

        [Column("display_order")]
        public int DisplayOrder { get; set; } = 0;

        [Column("is_visible")]
        public bool IsVisible { get; set; } = true;

        // Navigation property
        [ForeignKey("ProductId")]
        public virtual Product Product { get; set; }
    }
}
