using BGClima.Domain.Entities;
using BGClima.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace BGClima.API.Data
{
    public static class DbInitializer
    {
        public static void Seed(AppDbContext context)
        {
            context.Database.Migrate();

            // Seed AirConditionerTypes
            if (!context.AirConditionerTypes.Any())
            {
                var types = new List<AirConditionerType>
                {
                    new AirConditionerType { Name = "Инверторен", Description = "Инверторен климатик" },
                    new AirConditionerType { Name = "Конвенционален", Description = "Конвенционален климатик" }
                };
                context.AirConditionerTypes.AddRange(types);
                context.SaveChanges();
            }

            if (!context.Brands.Any())
            {
                var brands = new List<Brand>
                {
                    new Brand { Name = "Daikin", Description = "Японски климатик Daikin", LogoUrl = "" },
                    new Brand { Name = "Mitsubishi Electric", Description = "Японски климатик Mitsubishi Electric", LogoUrl = "" },
                    new Brand { Name = "Gree", Description = "Китайски климатик Gree", LogoUrl = "" },
                    new Brand { Name = "Fujitsu", Description = "Японски климатик Fujitsu", LogoUrl = "" }
                };
                context.Brands.AddRange(brands);
                context.SaveChanges();
            }

            if (!context.Categories.Any())
            {
                var categories = new List<Category>
                {
                    new Category { Name = "Инверторни климатици", Description = "Инверторни" },
                    new Category { Name = "Мултисплит системи", Description = "Мултисплит" },
                    new Category { Name = "Подови климатици", Description = "Подови" }
                };
                context.Categories.AddRange(categories);
                context.SaveChanges();
            }

            if (!context.AirConditioners.Any())
            {
                var inverterType = context.AirConditionerTypes.FirstOrDefault(t => t.Name == "Инверторен");
                var daikin = context.Brands.FirstOrDefault(b => b.Name == "Daikin");
                var category = context.Categories.FirstOrDefault(c => c.Name == "Инверторни климатици");

                Console.WriteLine($"inverterType?.Id = {inverterType?.Id}, daikin?.Id = {daikin?.Id}, category?.Id = {category?.Id}");

                if (inverterType == null || daikin == null || category == null)
                {
                    Console.WriteLine("Seed пропуснат: Липсва inverterType, daikin или category!");
                    return;
                }
                if (daikin != null && category != null)
                {
                    var ac = new AirConditioner
                    {
                        Model = "FTXB35C",
                        Description = "Инверторен климатик Daikin FTXB35C",
                        BrandId = daikin.Id,
                        AirConditionerTypeId = inverterType?.Id ?? 1,
                        IsInStock = true,
                        WarrantyMonths = 36,
                        HasWiFi = true,
                        HasInverter = true,
                        NoiseLevel = 21.5M,
                        Features = "",
                        Specifications = new List<Specification>(),
                        Prices = new List<Price>(),
                        Images = new List<Image>(),
                        AirConditionerCategories = new List<AirConditionerCategory>()
                    };
                    ac.AirConditionerCategories.Add(new AirConditionerCategory { CategoryId = category.Id });
                    ac.Prices.Add(new Price { PriceValue = 1599, OldPrice = 1799, IsPromo = true, ValidFrom = DateTime.UtcNow, ValidTo = DateTime.UtcNow.AddMonths(1) });
                    ac.Images.Add(new Image { Url = "https://www.bgclima.com/files/products/daikin-ftxb35c.jpg", AltText = "Daikin FTXB35C", IsMain = true, Order = 1 });
                    context.AirConditioners.Add(ac);
                    context.SaveChanges();
                }
            }
        }
    }
}
