using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BGClima.API.Models;
using Microsoft.EntityFrameworkCore;

namespace BGClima.API.Data
{
    public static class SeedData
    {
        public static async Task SeedAsync(BGClimaContext context)
        {
            // При InMemory използваме EnsureCreated, иначе Migrate
            if (context.Database.IsInMemory())
            {
                await context.Database.EnsureCreatedAsync();
            }
            else
            {
                await context.Database.MigrateAsync();
            }

            // Референтни данни: BTU, EnergyClass, ProductType
            if (!await context.BTUs.AnyAsync())
            {
                await context.BTUs.AddRangeAsync(new[]
                {
                    new BTU { Value = "9000" },
                    new BTU { Value = "12000" },
                    new BTU { Value = "18000" },
                    new BTU { Value = "24000" }
                });
            }

            if (!await context.EnergyClasses.AnyAsync())
            {
                await context.EnergyClasses.AddRangeAsync(new[]
                {
                    new EnergyClass { Class = "A+" },
                    new EnergyClass { Class = "A++" },
                    new EnergyClass { Class = "A+++" }
                });
            }

            if (!await context.ProductTypes.AnyAsync())
            {
                await context.ProductTypes.AddRangeAsync(new[]
                {
                    new ProductType { Name = "Климатик" },
                    new ProductType { Name = "Термопомпа" },
                    new ProductType { Name = "Мулти сплит система" }
                });
            }

            await context.SaveChangesAsync();

            // Seed за марки (ако липсват)
            if (!await context.Brands.AnyAsync())
            {
                var brands = new List<Brand>
                {
                    new Brand { Name = "Daikin", Country = "Japan" },
                    new Brand { Name = "Mitsubishi Electric", Country = "Japan" },
                    new Brand { Name = "Gree", Country = "China" },
                    new Brand { Name = "Fujitsu", Country = "Japan" }
                };

                await context.Brands.AddRangeAsync(brands);
                await context.SaveChangesAsync();
            }

            // Не презапълваме, ако вече има продукти
            if (await context.Products.AnyAsync())
            {
                return;
            }

            // Намираме нужните референтни записи
            var ACType = await context.ProductTypes.FirstAsync();

            var daikin = await context.Brands.FirstAsync(b => b.Name == "Daikin");
            var mitsubishi = await context.Brands.FirstAsync(b => b.Name == "Mitsubishi Electric");
            var gree = await context.Brands.FirstAsync(b => b.Name == "Gree");

            var products = new List<Product>
            {
                new Product
                {
                    Name = "Daikin FTXB35C",
                    Description = "Енергоефективен стенен климатик",
                    BrandId = daikin.Id,
                    ProductTypeId = ACType.Id,
                    Price = 1399.00m,
                    Sku = "DK-FTXB35C",
                    ImageUrl = "https://via.placeholder.com/300x200?text=Daikin+FTXB35C",
                    SeoTitle = "Daikin FTXB35C",
                    SeoDescription = "Daikin FTXB35C е енергоефективен стенен климатик",
                    SeoKeywords = "Daikin, FTXB35C, климатик",
                    MetaDescription = "Daikin FTXB35C климатик",
                    MetaKeywords = "Daikin, FTXB35C, климатик",
                    IsActive = true,
                    IsNew = true
                },
                new Product
                {
                    Name = "Mitsubishi MSZ-HR25",
                    Description = "Тих и надежден климатик за дома",
                    BrandId = mitsubishi.Id,
                    ProductTypeId = ACType.Id,
                    Price = 1199.00m,
                    Sku = "ME-MSZ-HR25",
                    ImageUrl = "https://via.placeholder.com/300x200?text=Mitsubishi+MSZ-HR25",
                    SeoTitle = "Mitsubishi MSZ-HR25",
                    SeoDescription = "Mitsubishi MSZ-HR25 тих и надежден климатик",
                    SeoKeywords = "Mitsubishi, MSZ-HR25, климатик",
                    MetaDescription = "Mitsubishi MSZ-HR25 климатик",
                    MetaKeywords = "Mitsubishi, MSZ-HR25, климатик",
                    IsActive = true,
                    IsNew = true
                },
                new Product
                {
                    Name = "Gree Fairy 12",
                    Description = "Климатик с вграден Wi‑Fi",
                    BrandId = gree.Id,
                    ProductTypeId = ACType.Id,
                    Price = 999.00m,
                    Sku = "GR-FAIRY-12",
                    ImageUrl = "https://via.placeholder.com/300x200?text=Gree+Fairy+12",
                    SeoTitle = "Gree Fairy 12",
                    SeoDescription = "Gree Fairy 12 климатик с Wi‑Fi",
                    SeoKeywords = "Gree, Fairy 12, климатик",
                    MetaDescription = "Gree Fairy 12 климатик",
                    MetaKeywords = "Gree, Fairy 12, климатик",
                    IsActive = true,
                    IsNew = true,
                    IsOnSale = true,
                    OldPrice = 1099.00m
                }
            };

            await context.Products.AddRangeAsync(products);
            await context.SaveChangesAsync();
        }
    }
} 