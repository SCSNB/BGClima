using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BGClima.Domain.Entities
{
    public class EnergyClass
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        [StringLength(10)]
        public string Class { get; set; }  // Пример: "A++", "A+++"


        // Navigation property
        public virtual ICollection<Product> Products { get; set; } = new List<Product>();
    }
}
