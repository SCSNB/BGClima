using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using BGClima.API.Models.Enums;

namespace BGClima.API.Models
{
    [Table("heat_pumps", Schema = "bgclima")]
    public class HeatPump : BaseEntity
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("model_name")]
        [StringLength(100)]
        public string ModelName { get; set; }

        public string Description { get; set; }

        // Основни характеристики
        [Column("has_wifi")]
        public bool HasWifi { get; set; } = false;

        [Column("energy_class_cooling")]
        [StringLength(5)]
        public string EnergyClassCooling { get; set; }

        [Column("energy_class_heating")]
        [StringLength(5)]
        public string EnergyClassHeating { get; set; }

        // Мощности (номинални стойности)
        [Column("cooling_capacity_nominal_kw", TypeName = "decimal(5, 2)")]
        public decimal? CoolingCapacityNominalKw { get; set; }

        [Column("heating_capacity_nominal_kw", TypeName = "decimal(5, 2)")]
        public decimal? HeatingCapacityNominalKw { get; set; }

        [Column("power_input_cooling_nominal_kw", TypeName = "decimal(5, 2)")]
        public decimal? PowerInputCoolingNominalKw { get; set; }

        [Column("power_input_heating_nominal_kw", TypeName = "decimal(5, 2)")]
        public decimal? PowerInputHeatingNominalKw { get; set; }

        // Коефициенти на ефективност
        [Column("cop_rating", TypeName = "decimal(3, 1)")]
        public decimal? CopRating { get; set; }

        [Column("eer_rating", TypeName = "decimal(3, 1)")]
        public decimal? EerRating { get; set; }

        [Column("scop_rating", TypeName = "decimal(3, 1)")]
        public decimal? ScopRating { get; set; }

        // Температурни характеристики
        [Column("operating_temp_cooling_min", TypeName = "decimal(4, 1)")]
        public decimal? OperatingTempCoolingMin { get; set; }

        [Column("operating_temp_cooling_max", TypeName = "decimal(4, 1)")]
        public decimal? OperatingTempCoolingMax { get; set; }

        [Column("operating_temp_heating_min", TypeName = "decimal(4, 1)")]
        public decimal? OperatingTempHeatingMin { get; set; }

        [Column("operating_temp_heating_max", TypeName = "decimal(4, 1)")]
        public decimal? OperatingTempHeatingMax { get; set; }

        // Параметри на водата
        [Column("water_temp_cooling_min", TypeName = "decimal(4, 1)")]
        public decimal? WaterTempCoolingMin { get; set; }

        [Column("water_temp_cooling_max", TypeName = "decimal(4, 1)")]
        public decimal? WaterTempCoolingMax { get; set; }

        [Column("water_temp_heating_min", TypeName = "decimal(4, 1)")]
        public decimal? WaterTempHeatingMin { get; set; }

        [Column("water_temp_heating_max", TypeName = "decimal(4, 1)")]
        public decimal? WaterTempHeatingMax { get; set; }

        // Хладилен агент
        [Column("refrigerant_type")]
        [StringLength(20)]
        public string RefrigerantType { get; set; }

        // Електрически параметри
        [Column("power_supply_voltage")]
        [StringLength(50)]
        public string PowerSupplyVoltage { get; set; }

        [Column("power_supply_phase")]
        [StringLength(20)]
        public string PowerSupplyPhase { get; set; }

        [Column("power_supply_frequency", TypeName = "decimal(4, 1)")]
        public decimal? PowerSupplyFrequency { get; set; }

        // Вътрешно тяло
        [Column("indoor_unit_dimensions")]
        [StringLength(100)]
        public string IndoorUnitDimensions { get; set; }

        [Column("indoor_unit_weight_kg", TypeName = "decimal(5, 1)")]
        public decimal? IndoorUnitWeightKg { get; set; }

        [Column("indoor_unit_noise_cooling_db", TypeName = "decimal(4, 1)")]
        public decimal? IndoorUnitNoiseCoolingDb { get; set; }

        [Column("indoor_unit_noise_heating_db", TypeName = "decimal(4, 1)")]
        public decimal? IndoorUnitNoiseHeatingDb { get; set; }

        // Външно тяло
        [Column("outdoor_unit_compressor_type")]
        [StringLength(50)]
        public string OutdoorUnitCompressorType { get; set; }

        [Column("outdoor_unit_dimensions")]
        [StringLength(100)]
        public string OutdoorUnitDimensions { get; set; }

        [Column("outdoor_unit_weight_kg", TypeName = "decimal(5, 1)")]
        public decimal? OutdoorUnitWeightKg { get; set; }

        [Column("outdoor_unit_noise_cooling_db", TypeName = "decimal(4, 1)")]
        public decimal? OutdoorUnitNoiseCoolingDb { get; set; }

        [Column("outdoor_unit_noise_heating_db", TypeName = "decimal(4, 1)")]
        public decimal? OutdoorUnitNoiseHeatingDb { get; set; }

        // Тръбни връзки
        [Column("liquid_tube_diameter")]
        [StringLength(20)]
        public string LiquidTubeDiameter { get; set; }

        [Column("gas_tube_diameter")]
        [StringLength(20)]
        public string GasTubeDiameter { get; set; }

        // Транспортна информация за вътрешно тяло
        [Column("indoor_package_count")]
        public int? IndoorPackageCount { get; set; }

        [Column("indoor_package_dimensions")]
        [StringLength(100)]
        public string IndoorPackageDimensions { get; set; }

        [Column("indoor_package_weight_kg", TypeName = "decimal(5, 1)")]
        public decimal? IndoorPackageWeightKg { get; set; }

        // Транспортна информация за външно тяло
        [Column("outdoor_package_count")]
        public int? OutdoorPackageCount { get; set; }

        [Column("outdoor_package_dimensions")]
        [StringLength(100)]
        public string OutdoorPackageDimensions { get; set; }

        [Column("outdoor_package_weight_kg", TypeName = "decimal(5, 1)")]
        public decimal? OutdoorPackageWeightKg { get; set; }

        // Гаранция
        [Column("warranty_months")]
        public int? WarrantyMonths { get; set; }

        // Navigation property
        public virtual Product Product { get; set; }
    }
}
