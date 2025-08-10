using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BGClima.Domain.Entities
{
    public class ProductType
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        public string Name { get; set; }  // Пример: "Климатик", "Термопомпа"

        // Navigation property
        public virtual ICollection<Product> Products { get; set; } = new List<Product>();
    }
}
