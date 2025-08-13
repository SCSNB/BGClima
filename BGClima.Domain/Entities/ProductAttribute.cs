using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BGClima.Domain.Entities
{
    public class ProductAttribute
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        [ForeignKey("Product")]
        public int ProductId { get; set; }
        public virtual Product Product { get; set; }

        [Required]
        [StringLength(100)]
        public string AttributeKey { get; set; }   // Пример: "COP", "Шум", "Отоплителна мощност"

        [Required]
        [StringLength(255)]
        public string AttributeValue { get; set; } // Пример: "3.8", "21 dB", "5.2 kW"

        public int DisplayOrder { get; set; } = 0; // Контролира реда при сравнение

        [StringLength(100)]
        public string GroupName { get; set; }      // Пример: "Производителност", "Консумация"

        public bool IsVisible { get; set; } = true; // Скриване на вътрешни атрибути
    }
}
