using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BGClima.Domain.Entities;
using BGClima.Infrastructure.Data;
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

            // Намираме нужните референтни записи
            var ACType = await context.ProductTypes.FirstAsync();

            // Добавяме Nippon ако го няма
            if (!await context.Brands.AnyAsync(b => b.Name == "Nippon"))
            {
                await context.Brands.AddAsync(new Brand { Name = "Nippon", Country = "Japan" });
                await context.SaveChangesAsync();
            }

            var daikin = await context.Brands.FirstAsync(b => b.Name == "Daikin");
            var nippon = await context.Brands.FirstAsync(b => b.Name == "Nippon");
            
            // Изтриваме старите продукти, ако има такива
            var existingProducts = await context.Products.ToListAsync();
            if (existingProducts.Any())
            {
                context.Products.RemoveRange(existingProducts);
                await context.SaveChangesAsync();
            }

            // Добавяме текущите продукти
            var products = new List<Product>
            {
                new Product
                {
                    Id = 1,
                    Name = "Daikin FTXA20BT / RXA20A",
                    Description = "Енергоефективен стенен климатик",
                    BrandId = daikin.Id,
                    ProductTypeId = ACType.Id,
                    BTUId = 2,
                    EnergyClassId = 3,
                    Price = 3890.00m,
                    OldPrice = 4046.00m,
                    StockQuantity = 1,
                    Sku = "DK-FTXB35C",
                    ImageUrl = "https://www.bgclima.com/cms/climaimg/251/img1.jpg",
                    IsActive = true,
                    IsFeatured = true,
                    IsOnSale = true,
                    IsNew = false
                },
                new Product
                {
                    Id = 2,
                    Name = "Daikin -FTXC35D / RXC35D",
                    Description = "Тих и надежден климатик за дома",
                    BrandId = daikin.Id,
                    ProductTypeId = ACType.Id,
                    BTUId = 2,
                    EnergyClassId = 1,
                    Price = 1590.00m,
                    OldPrice = 1770.00m,
                    StockQuantity = 2,
                    Sku = "ME-MSZ-HR25",
                    ImageUrl = "https://www.bgclima.com/cms/climaimg/284/img1.jpg",
                    IsActive = true,
                    IsFeatured = true,
                    IsOnSale = true,
                    IsNew = false
                },
                new Product
                {
                    Id = 4,
                    Name = "Daikin FTXB35C",
                    Description = "Климатик Daikin",
                    BrandId = daikin.Id,
                    ProductTypeId = ACType.Id,
                    BTUId = 1,
                    EnergyClassId = 2,
                    Price = 1499.00m,
                    OldPrice = 1699.00m,
                    StockQuantity = 4,
                    Sku = "model",
                    ImageUrl = "https://www.klimaticite.bg/web/img/202502/37809/40061/0/invertoren-klimatik-daikin-sensira-ftxc35-e-rxc35-e.webp",
                    IsActive = true,
                    IsFeatured = true,
                    IsOnSale = true,
                    IsNew = true
                },
                new Product
                {
                    Id = 5,
                    Name = "тест снимки",
                    Description = "тест на снимки",
                    BrandId = daikin.Id,
                    ProductTypeId = ACType.Id,
                    BTUId = 1,
                    EnergyClassId = 1,
                    Price = 123.00m,
                    OldPrice = 1234.00m,
                    StockQuantity = 1,
                    Sku = "",
                    ImageUrl = "https://www.klimaticite.bg/web/img/202502/37809/40061/0/invertoren-klimatik-daikin-sensira-ftxc35-e-rxc35-e.webp",
                    IsActive = true,
                    IsFeatured = false,
                    IsOnSale = false,
                    IsNew = true
                },
                new Product
                {
                    Id = 6,
                    Name = "Daikin FTXB55C",
                    Description = "DAIKIN",
                    BrandId = daikin.Id,
                    ProductTypeId = ACType.Id,
                    BTUId = 2,
                    EnergyClassId = 2,
                    Price = 1399.00m,
                    OldPrice = 1499.00m,
                    StockQuantity = 1,
                    Sku = "",
                    ImageUrl = "https://www.bgclima.com/cms/climaimg/284/img1.jpg",
                    IsActive = true,
                    IsFeatured = true,
                    IsOnSale = true,
                    IsNew = false
                },
                new Product
                {
                    Id = 7,
                    Name = "Daikin -FTXJ20AS / RXJ20A",
                    Description = "",
                    BrandId = daikin.Id,
                    ProductTypeId = ACType.Id,
                    BTUId = 1,
                    EnergyClassId = 3,
                    Price = 4075.00m,
                    StockQuantity = 2,
                    Sku = "",
                    ImageUrl = "https://www.bgclima.com/cms/climaimg/377/img1.jpg",
                    IsActive = true,
                    IsFeatured = true,
                    IsOnSale = false,
                    IsNew = true
                },
                new Product
                {
                    Id = 8,
                    Name = "Daikin -FTXJ25AB / RXJ25A",
                    Description = "",
                    BrandId = daikin.Id,
                    ProductTypeId = ACType.Id,
                    BTUId = 1,
                    EnergyClassId = 3,
                    Price = 4206.00m,
                    StockQuantity = 1,
                    Sku = "",
                    ImageUrl = "https://www.bgclima.com/cms/climaimg/383/img1.jpg",
                    IsActive = true,
                    IsFeatured = true,
                    IsOnSale = false,
                    IsNew = true
                },
                new Product
                {
                    Id = 9,
                    Name = "тест 2",
                    Description = "",
                    BrandId = daikin.Id,
                    ProductTypeId = ACType.Id,
                    BTUId = 1,
                    EnergyClassId = 2,
                    Price = 1234.00m,
                    OldPrice = 1255.00m,
                    StockQuantity = 1,
                    Sku = "",
                    ImageUrl = "https://www.bgclima.com/cms/climaimg/284/img1.jpg",
                    IsActive = true,
                    IsFeatured = true,
                    IsOnSale = true,
                    IsNew = false
                },
                new Product
                {
                    Id = 10,
                    Name = "Nippon - KFR 14DC ECO ENERGY",
                    Description = "",
                    BrandId = nippon.Id,
                    ProductTypeId = ACType.Id,
                    BTUId = 2,
                    EnergyClassId = 2,
                    Price = 1380.00m,
                    StockQuantity = 1,
                    Sku = "",
                    ImageUrl = "https://www.bgclima.com/cms/climaimg/337/img1.jpg",
                    IsActive = true,
                    IsFeatured = true,
                    IsOnSale = false,
                    IsNew = true
                }
            };

            await context.Products.AddRangeAsync(products);
            await context.SaveChangesAsync();
        }
    }
} 