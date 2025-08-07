using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BGClima.API.Models
{
    public class ProductCategory : BaseEntity
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; }

        [Required]
        [MaxLength(100)]
        public string Slug { get; set; }

        public string Description { get; set; }

        public int? ParentId { get; set; }
        
        [ForeignKey("ParentId")]
        public virtual ProductCategory Parent { get; set; }
        
        public virtual ICollection<ProductCategory> Children { get; set; }
        public virtual ICollection<Product> Products { get; set; }
    }
}
