using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using BGClima.API.Models.Enums;

namespace BGClima.API.Models
{
    /// <summary>
    /// Основен клас за продуктите в системата (климатици и топлинни помпи)
    /// </summary>
    [Table("products", Schema = "bgclima")]
    public class Product : BaseEntity
    {
        /// <summary>
        /// Тип на продукта (климатик или топлинна помпа)
        /// </summary>
        [Required]
        [Column("product_type")]
        public ProductType ProductType { get; set; }

        /// <summary>
        /// Идентификатор на конкретния продукт в съответната таблица (AirConditioner или HeatPump)
        /// </summary>
        [Required]
        [Column("product_id")]
        public int ProductId { get; set; }

        /// <summary>
        /// Идентификатор на категорията, към която принадлежи продуктът
        /// </summary>
        [Column("category_id")]
        public int? CategoryId { get; set; }
        
        /// <summary>
        /// Навигационно свойство към категорията на продукта
        /// </summary>
        [ForeignKey("CategoryId")]
        public virtual ProductCategory Category { get; set; }

        /// <summary>
        /// Идентификатор на марката на продукта
        /// </summary>
        [Column("brand_id")]
        public int? BrandId { get; set; }
        
        /// <summary>
        /// Навигационно свойство към марката на продукта
        /// </summary>
        [ForeignKey("BrandId")]
        public virtual Brand Brand { get; set; }

        /// <summary>
        /// Уникален артикулен номер на продукта
        /// </summary>
        [StringLength(100)]
        public string SKU { get; set; }

        /// <summary>
        /// Име на продукта (задължително поле)
        /// </summary>
        [Required]
        [StringLength(250)]
        public string Name { get; set; }

        /// <summary>
        /// Кратко описание на продукта за списъчни изгледи
        /// </summary>
        [Column("short_description")]
        public string ShortDescription { get; set; }

        /// <summary>
        /// Основна цена на продукта
        /// </summary>
        [Column(TypeName = "decimal(10, 2)")]
        public decimal Price { get; set; }

        /// <summary>
        /// Промоционална цена на продукта (незадължително)
        /// </summary>
        [Column("promo_price", TypeName = "decimal(10, 2)")]
        public decimal? PromoPrice { get; set; }

        /// <summary>
        /// Дали продуктът е маркиран като препоръчан
        /// </summary>
        [Column("is_featured")]
        public bool IsFeatured { get; set; } = false;

        /// <summary>
        /// Дали продуктът е активен и трябва да се показва в каталога
        /// </summary>
        [Column("is_active")]
        public bool IsActive { get; set; } = true;

        /// <summary>
        /// Заглавие за SEO цели
        /// </summary>
        [Column("meta_title")]
        [StringLength(250)]
        public string MetaTitle { get; set; }

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

        // Navigation properties
        
        /// <summary>
        /// Детайли за продукта, ако е климатик
        /// </summary>
        public virtual AirConditioner AirConditioner { get; set; }
        
        /// <summary>
        /// Детайли за продукта, ако е топлинна помпа
        /// </summary>
        public virtual HeatPump HeatPump { get; set; }
        
        /// <summary>
        /// Колекция от изображения на продукта
        /// </summary>
        public virtual ICollection<ProductImage> Images { get; set; }
        
        /// <summary>
        /// Колекция от спецификации на продукта
        /// </summary>
        public virtual ICollection<ProductSpecification> Specifications { get; set; }
    }
}
