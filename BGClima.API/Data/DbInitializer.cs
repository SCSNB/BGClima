using BGClima.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;

namespace BGClima.API.Data
{
    public static class DbInitializer
    {
        public static void Initialize(BGClimaContext context, Microsoft.Extensions.Logging.ILogger logger)
        {
            try
            {
                context.Database.EnsureCreated();

                // Seed Brands
                if (!context.Brands.Any())
                {
                    var brands = new List<Brand>
                    {
                        new Brand { 
                            Name = "Daikin", 
                            Description = "Японски климатик Daikin", 
                            LogoUrl = "/images/brands/daikin.png"
                        },
                        new Brand { 
                            Name = "Mitsubishi Electric", 
                            Description = "Японски климатик Mitsubishi Electric", 
                            LogoUrl = "/images/brands/mitsubishi.png"
                        },
                        new Brand { 
                            Name = "Gree", 
                            Description = "Китайски климатик Gree", 
                            LogoUrl = "/images/brands/gree.png"
                        },
                        new Brand { 
                            Name = "Fujitsu", 
                            Description = "Японски климатик Fujitsu", 
                            LogoUrl = "/images/brands/fujitsu.png"
                        }
                    };
                    
                    context.Brands.AddRange(brands);
                    context.SaveChanges();
                    logger.LogInformation("Seeded the database with brands.");
                }

                // Seed Categories
                if (!context.ProductCategories.Any())
                {
                    var categories = new List<ProductCategory>
                    {
                        new ProductCategory { 
                            Name = "Инверторни климатици",
                            Slug = "invertorni-klimatitsi",
                            Description = "Високоефективни инверторни климатици"
                        },
                        new ProductCategory { 
                            Name = "Мултисплит системи",
                            Slug = "multisplit-sistemi",
                            Description = "Мултисплит климатични системи"
                        },
                        new ProductCategory { 
                            Name = "Подови климатици",
                            Slug = "podovi-klimatitsi",
                            Description = "Климатици с подово разположение"
                        }
                    };
                    
                    context.ProductCategories.AddRange(categories);
                    context.SaveChanges();
                    logger.LogInformation("Seeded the database with product categories.");
                }

                // Seed Products (Air Conditioners)
                if (!context.Products.Any() && context.Brands.Any() && context.ProductCategories.Any())
                {
                    var brand = context.Brands.First();
                    var category = context.ProductCategories.First();
                    
                    // Създаване на климатик
                    var airConditioner = new AirConditioner
                    {
                        ModelName = "FTXF35D",
                        Description = "Инверторен климатик с висока енергийна ефективност",
                        CoolingEnergyClass = "A++",
                        HeatingEnergyClass = "A+",
                        CoolingCapacityBtu = 12000,
                        HeatingCapacityBtu = 13000,
                        CoolingCapacityKw = 3.5m,
                        HeatingCapacityKw = 3.8m,
                        PowerInputCooling = 0.9m,
                        PowerInputHeating = 0.8m,
                        SeerRating = 6.1m,
                        ScopRating = 4.2m,
                        NoiseLevelIndoorDbMin = 19,
                        NoiseLevelIndoorDbMax = 38,
                        NoiseLevelOutdoorDb = 45,
                        IndoorUnitSize = "295×800×200",
                        OutdoorUnitSize = "550×765×285",
                        WeightIndoorKg = 9.5m,
                        WeightOutdoorKg = 28.0m,
                        RefrigerantType = "R32",
                        RefrigerantQuantityKg = 0.85m,
                        PowerSupplyVoltage = "220-240V, 50Hz",
                        PowerSupplyVoltageOutdoor = "220-240V, 50Hz",
                        AirflowIndoorM3H = 600,
                        AirflowOutdoorM3H = 1800,
                        RoomSizeM2 = 35,
                        MinOperatingTempC = -15.0m,
                        MaxOperatingTempC = 46.0m,
                        MaxPipeLengthM = 15.0m,
                        MaxHeightDiffM = 12.0m,
                        WarrantyYears = 3,
                        WarrantyDescription = "Гаранция 3 години за всички части и 5 години за компресора",
                        HasWifi = true,
                        HasIonizer = true,
                        HasSelfClean = true,
                        IsInverter = true,
                        HasPlasma = true,
                        HasUvLight = false,
                        HasSmartControl = true,
                        HasTimer = true,
                        HasSleepMode = true,
                        HasFollowMe = true,
                        HasAutoRestart = true
                    };

                    var product = new Product
                    {
                        ProductType = ProductType.AirConditioner,
                        Name = "Daikin FTXF35D Инверторен климатик",
                        ShortDescription = "Високоефективен инверторен климатик с Wi-Fi управление",
                        SKU = "DAI-FTXF35D",
                        BrandId = brand.Id,
                        CategoryId = category.Id,
                        Price = 1899.00m,
                        PromoPrice = 1799.00m,
                        IsFeatured = true,
                        IsActive = true,
                        MetaTitle = "Daikin FTXF35D - Инверторен климатик с Wi-Fi | BGClima",
                        MetaDescription = "Инверторен климатик Daikin FTXF35D с висока енергийна ефективност A++/A+, Wi-Fi управление и тиха работа от 19 dB",
                        MetaKeywords = "инверторен климатик, daikin, wifi климатик, тих климатик, енергийно ефективен",
                        AirConditioner = airConditioner
                    };

                    // Свързване на навигационните свойства
                    airConditioner.Product = product;

                    context.Products.Add(product);
                    context.AirConditioners.Add(airConditioner);
                    context.SaveChanges();

                    logger.LogInformation("Seeded the database with sample air conditioner.");
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Възникна грешка при инициализиране на базата данни.");
                throw;
            }
        }
    }
}
