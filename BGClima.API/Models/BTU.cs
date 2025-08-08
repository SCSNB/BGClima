using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BGClima.API.Models
{
    [Table("BTU", Schema = "bgclima")]
    public class BTU
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string Value { get; set; }  // Пример: "9000", "12000", "18000"

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
