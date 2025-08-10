using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BGClima.Domain.Entities
{
    /// <summary>
    /// Представлява марка на климатични уреди и топлинни помпи
    /// </summary>
    public class Brand
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        /// <summary>
        /// Име на марката (задължително поле)
        /// </summary>
        [Required]
        [StringLength(100)]
        public string Name { get; set; }

        /// <summary>
        /// Държава на произход
        /// </summary>
        [StringLength(100)]
        public string Country { get; set; }

        // Navigation properties
        /// <summary>
        /// Колекция от всички продукти на тази марка
        /// </summary>
        public virtual ICollection<Product> Products { get; set; } = new List<Product>();
    }
}
