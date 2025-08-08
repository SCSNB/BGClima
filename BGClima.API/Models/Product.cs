using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BGClima.API.Models
{
    /// <summary>
    /// Основен клас за продуктите в системата (климатици и топлинни помпи)
    /// </summary>
    [Table("Product", Schema = "bgclima")]
    public class Product
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        [StringLength(255)]
        public string Name { get; set; }

        public string Description { get; set; }

        [Required]
        [ForeignKey("Brand")]
        public int BrandId { get; set; }
        public virtual Brand Brand { get; set; }

        [ForeignKey("BTU")]
        public int? BTUId { get; set; }
        public virtual BTU BTU { get; set; }

        [ForeignKey("EnergyClass")]
        public int? EnergyClassId { get; set; }
        public virtual EnergyClass EnergyClass { get; set; }

        [Required]
        [ForeignKey("ProductType")]
        public int ProductTypeId { get; set; }
        public virtual ProductType ProductType { get; set; }

        [Required]
        [Column(TypeName = "decimal(10, 2)")]
        public decimal Price { get; set; }

        [Column(TypeName = "decimal(10, 2)")]
        public decimal? OldPrice { get; set; }

        public int StockQuantity { get; set; } = 0;
        public bool IsActive { get; set; } = true;
        public bool IsFeatured { get; set; } = false;
        public bool IsOnSale { get; set; } = false;
        public bool IsNew { get; set; } = true;

        [StringLength(100)]
        public string Sku { get; set; }

        [StringLength(255)]
        public string SeoTitle { get; set; }
        
        public string SeoDescription { get; set; }
        
        [StringLength(500)]
        public string SeoKeywords { get; set; }

        public string ImageUrl { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual ICollection<ProductAttribute> Attributes { get; set; } = new List<ProductAttribute>();
        public virtual ICollection<ProductImage> Images { get; set; } = new List<ProductImage>();

        /// <summary>
        /// Мета описание за SEO цели
        /// </summary>
        [Column("meta_description")]
        public string MetaDescription { get; set; }

        /// <summary>
        /// Ключови думи за търсачки
        /// </summary>
        [Column("meta_keywords")]
        public string MetaKeywords { get; set; }
    }
}
