using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BGClima.API.Models
{
    /// <summary>
    /// Представлява марка на климатични уреди и топлинни помпи
    /// </summary>
    [Table("brands", Schema = "bgclima")]
    public class Brand : BaseEntity
    {
        /// <summary>
        /// Име на марката (задължително поле)
        /// </summary>
        [Required]
        [StringLength(250)]
        public string Name { get; set; }

        /// <summary>
        /// Описание на марката и нейните особености
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// URL адрес на логото на марката
        /// </summary>
        [StringLength(500)]
        [Column("logo_url")]
        public string LogoUrl { get; set; }

        // Navigation properties
        /// <summary>
        /// Колекция от всички продукти на тази марка
        /// </summary>
        public virtual ICollection<Product> Products { get; set; }
        
        /// <summary>
        /// Колекция от климатици на тази марка
        /// </summary>
        public virtual ICollection<AirConditioner> AirConditioners { get; set; }
        
        /// <summary>
        /// Колекция от топлинни помпи на тази марка
        /// </summary>
        public virtual ICollection<HeatPump> HeatPumps { get; set; }
    }
}
