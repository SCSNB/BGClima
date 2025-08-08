using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BGClima.API.Models
{
    /// <summary>
    /// Представлява марка на климатични уреди и топлинни помпи
    /// </summary>
    [Table("Brand", Schema = "bgclima")]
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

        /// <summary>
        /// Дата на създаване на записа
        /// </summary>
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Дата на последна актуализация
        /// </summary>
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        /// <summary>
        /// Колекция от всички продукти на тази марка
        /// </summary>
        public virtual ICollection<Product> Products { get; set; } = new List<Product>();
    }
}
