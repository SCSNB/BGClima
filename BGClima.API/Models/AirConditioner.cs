using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BGClima.API.Models
{
    /// <summary>
    /// Детайлен модел за климатични уреди, който разширява основния Product модел
    /// </summary>
    [Table("air_conditioners", Schema = "bgclima")]
    public class AirConditioner : BaseEntity
    {
        /// <summary>
        /// Уникален идентификатор, който съвпада с ProductId от основния Product модел
        /// </summary>
        [Key]
        [Column("id")]
        public int Id { get; set; }

        /// <summary>
        /// Име на модела (задължително поле)
        /// </summary>
        [Required]
        [Column("model_name")]
        [StringLength(250)]
        public string ModelName { get; set; }

        /// <summary>
        /// Подробно описание на климатика и неговите характеристики
        /// </summary>
        public string Description { get; set; }

        // ========== Енергийна ефективност ==========

        /// <summary>
        /// Енергиен клас при охлаждане (напр. A, A+, A++ и т.н.)
        /// </summary>
        [Column("cooling_energy_class")]
        [StringLength(3)]
        public string CoolingEnergyClass { get; set; }

        /// <summary>
        /// Енергиен клас при отопление (напр. A, A+, A++ и т.н.)
        /// </summary>
        [Column("heating_energy_class")]
        [StringLength(3)]
        public string HeatingEnergyClass { get; set; }

        // ========== Капацитет и мощност ==========

        /// <summary>
        /// Охладителен капацитет в BTU/h
        /// </summary>
        [Column("cooling_capacity_btu")]
        public int? CoolingCapacityBtu { get; set; }

        /// <summary>
        /// Топлинен капацитет в BTU/h
        /// </summary>
        [Column("heating_capacity_btu")]
        public int? HeatingCapacityBtu { get; set; }

        /// <summary>
        /// Охладителен капацитет в киловати (kW)
        /// </summary>
        [Column("cooling_capacity_kw", TypeName = "decimal(5, 2)")]
        public decimal? CoolingCapacityKw { get; set; }

        /// <summary>
        /// Топлинен капацитет в киловати (kW)
        /// </summary>
        [Column("heating_capacity_kw", TypeName = "decimal(5, 2)")]
        public decimal? HeatingCapacityKw { get; set; }

        /// <summary>
        /// Консумирана мощност при охлаждане (kW)
        /// </summary>
        [Column("power_input_cooling", TypeName = "decimal(5, 2)")]
        public decimal? PowerInputCooling { get; set; }

        /// <summary>
        /// Консумирана мощност при отопление (kW)
        /// </summary>
        [Column("power_input_heating", TypeName = "decimal(5, 2)")]
        public decimal? PowerInputHeating { get; set; }

        // ========== Коефициенти на ефективност ==========

        /// <summary>
        /// SEER рейтинг (Сезонна ефективност при охлаждане)
        /// </summary>
        [Column("seer_rating", TypeName = "decimal(3, 1)")]
        public decimal? SeerRating { get; set; }

        /// <summary>
        /// SCOP рейтинг (Сезонна ефективност при отопление)
        /// </summary>
        [Column("scop_rating", TypeName = "decimal(3, 1)")]
        public decimal? ScopRating { get; set; }

        // ========== Шумови характеристики ==========

        /// <summary>
        /// Минимално ниво на шум на вътрешното тяло (dB)
        /// </summary>
        [Column("noise_level_indoor_db_min", TypeName = "decimal(4, 1)")]
        public decimal? NoiseLevelIndoorDbMin { get; set; }

        /// <summary>
        /// Максимално ниво на шум на вътрешното тяло (dB)
        /// </summary>
        [Column("noise_level_indoor_db_max", TypeName = "decimal(4, 1)")]
        public decimal? NoiseLevelIndoorDbMax { get; set; }

        /// <summary>
        /// Ниво на шум на външното тяло (dB)
        /// </summary>
        [Column("noise_level_outdoor_db", TypeName = "decimal(4, 1)")]
        public decimal? NoiseLevelOutdoorDb { get; set; }

        // ========== Физически характеристики ==========

        /// <summary>
        /// Размери на вътрешното тяло (В x Ш x Д в мм)
        /// </summary>
        [Column("indoor_unit_size")]
        [StringLength(100)]
        public string IndoorUnitSize { get; set; }

        /// <summary>
        /// Размери на външното тяло (В x Ш x Д в мм)
        /// </summary>
        [Column("outdoor_unit_size")]
        [StringLength(100)]
        public string OutdoorUnitSize { get; set; }

        /// <summary>
        /// Тегло на вътрешното тяло (кг)
        /// </summary>
        [Column("weight_indoor_kg", TypeName = "decimal(5, 1)")]
        public decimal? WeightIndoorKg { get; set; }

        /// <summary>
        /// Тегло на външното тяло (кг)
        /// </summary>
        [Column("weight_outdoor_kg", TypeName = "decimal(5, 1)")]
        public decimal? WeightOutdoorKg { get; set; }

        // ========== Хладилен агент ==========

        /// <summary>
        /// Тип хладилен агент (напр. R32, R410A)
        /// </summary>
        [Column("refrigerant_type")]
        [StringLength(50)]
        public string RefrigerantType { get; set; }

        /// <summary>
        /// Количество хладилен агент (кг)
        /// </summary>
        [Column("refrigerant_quantity_kg", TypeName = "decimal(4, 2)")]
        public decimal? RefrigerantQuantityKg { get; set; }

        // ========== Електрически параметри ==========

        /// <summary>
        /// Напрежение и честота на захранване (напр. 220-240V, 50Hz)
        /// </summary>
        [Column("power_supply_voltage")]
        [StringLength(50)]
        public string PowerSupplyVoltage { get; set; }

        /// <summary>
        /// Напрежение на захранване за външното тяло (ако е различно)
        /// </summary>
        [Column("power_supply_voltage_outdoor")]
        [StringLength(50)]
        public string PowerSupplyVoltageOutdoor { get; set; }

        // ========== Въздушен поток ==========

        /// <summary>
        /// Дебит на въздуха от вътрешното тяло (m³/h)
        /// </summary>
        [Column("airflow_indoor_m3h")]
        public int? AirflowIndoorM3H { get; set; }

        /// <summary>
        /// Дебит на въздуха от външното тяло (m³/h)
        /// </summary>
        [Column("airflow_outdoor_m3h")]
        public int? AirflowOutdoorM3H { get; set; }

        // ========== Инсталационни параметри ==========

        /// <summary>
        /// Препоръчителен размер на помещението (кв.м.)
        /// </summary>
        [Column("room_size_m2")]
        public int? RoomSizeM2 { get; set; }

        /// <summary>
        /// Минимална работна температура при отопление (°C)
        /// </summary>
        [Column("min_operating_temp_c", TypeName = "decimal(3, 1)")]
        public decimal? MinOperatingTempC { get; set; }

        /// <summary>
        /// Максимална работна температура при охлаждане (°C)
        /// </summary>
        [Column("max_operating_temp_c", TypeName = "decimal(3, 1)")]
        public decimal? MaxOperatingTempC { get; set; }

        /// <summary>
        /// Максимална дължина на фреоновата тръба (м)
        /// </summary>
        [Column("max_pipe_length_m", TypeName = "decimal(4, 1)")]
        public decimal? MaxPipeLengthM { get; set; }

        /// <summary>
        /// Максимална височинна разлика между вътрешно и външно тяло (м)
        /// </summary>
        [Column("max_height_diff_m", TypeName = "decimal(3, 1)")]
        public decimal? MaxHeightDiffM { get; set; }

        // ========== Гаранция ==========

        /// <summary>
        /// Гаранционен период в години
        /// </summary>
        [Column("warranty_years")]
        public int? WarrantyYears { get; set; }

        /// <summary>
        /// Допълнителна информация за гаранцията
        /// </summary>
        [Column("warranty_description")]
        public string WarrantyDescription { get; set; }

        // ========== Допълнителни функции ==========

        /// <summary>
        /// Вграден Wi-Fi модул за дистанционно управление
        /// </summary>
        [Column("has_wifi")]
        public bool HasWifi { get; set; } = false;

        /// <summary>
        /// Йонизатор на въздуха
        /// </summary>
        [Column("has_ionizer")]
        public bool HasIonizer { get; set; } = false;

        /// <summary>
        /// Функция за самоочистване на изпарителя
        /// </summary>
        [Column("has_self_clean")]
        public bool HasSelfClean { get; set; } = false;

        /// <summary>
        /// Инверторна технология за по-ефективна работа
        /// </summary>
        [Column("is_inverter")]
        public bool IsInverter { get; set; } = false;

        /// <summary>
        /// Плазмен филтър за по-добро почистване на въздуха
        /// </summary>
        [Column("has_plasma")]
        public bool HasPlasma { get; set; } = false;

        /// <summary>
        /// UV лампа за дезинфекция на въздуха
        /// </summary>
        [Column("has_uv_light")]
        public bool HasUvLight { get; set; } = false;

        /// <summary>
        /// Възможност за управление чрез смартфон
        /// </summary>
        [Column("has_smart_control")]
        public bool HasSmartControl { get; set; } = false;

        /// <summary>
        /// Вграден таймер за включване/изключване
        /// </summary>
        [Column("has_timer")]
        public bool HasTimer { get; set; } = false;

        /// <summary>
        /// Режим на сън за по-тиха работа през нощта
        /// </summary>
        [Column("has_sleep_mode")]
        public bool HasSleepMode { get; set; } = false;

        /// <summary>
        /// Функция за проследяване на местоположението на дистанционното
        /// </summary>
        [Column("has_follow_me")]
        public bool HasFollowMe { get; set; } = false;

        /// <summary>
        /// Автоматично рестартиране след прекъсване на тока
        /// </summary>
        [Column("has_auto_restart")]
        public bool HasAutoRestart { get; set; } = false;

        // ========== Навигационни свойства ==========

        /// <summary>
        /// Навигационно свойство към основния продукт
        /// </summary>
        public virtual Product Product { get; set; }
    }
}
