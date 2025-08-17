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
                    Description = "Енергоефективен стенен климатик с инверторна технология",
                    BrandId = daikin.Id,
                    ProductTypeId = ACType.Id,
                    Price = 1899.00m,
                    OldPrice = 1999.00m,
                    Sku = "DK-FTXB35C",
                    ImageUrl = "https://via.placeholder.com/300x200?text=Daikin+FTXB35C",
                    IsActive = true,
                    IsNew = true,
                    IsOnSale = true,
                    StockQuantity = 5
                },
                new Product
                {
                    Name = "Mitsubishi MSZ-HR25",
                    Description = "Тих и надежден климатик за дома с филтър за прахови частици",
                    BrandId = mitsubishi.Id,
                    ProductTypeId = ACType.Id,
                    Price = 1699.00m,
                    OldPrice = 1799.00m,
                    Sku = "ME-MSZ-HR25",
                    ImageUrl = "https://via.placeholder.com/300x200?text=Mitsubishi+MSZ-HR25",
                    IsActive = true,
                    IsNew = true,
                    IsOnSale = true,
                    StockQuantity = 3
                },
                new Product
                {
                    Name = "Gree Bora GWH09AAB-K6DNA5A/I",
                    Description = "Иновативен климатик с вграден Wi-Fi и тих режим на работа",
                    BrandId = gree.Id,
                    ProductTypeId = ACType.Id,
                    Price = 1399.00m,
                    OldPrice = 1499.00m,
                    Sku = "GR-BORA-09",
                    ImageUrl = "https://via.placeholder.com/300x200?text=Gree+Bora",
                    IsActive = true,
                    IsNew = true,
                    IsOnSale = true,
                    StockQuantity = 4
                },
                new Product
                {
                    Name = "Fujitsu ASYG09LMCA",
                    Description = "Високоефективен климатик с ниско ниво на шум",
                    BrandId = await context.Brands.Where(b => b.Name == "Fujitsu").Select(b => b.Id).FirstAsync(),
                    ProductTypeId = ACType.Id,
                    Price = 1599.00m,
                    OldPrice = 1699.00m,
                    Sku = "FJ-ASYG09LMCA",
                    ImageUrl = "https://via.placeholder.com/300x200?text=Fujitsu+ASYG09LMCA",
                    IsActive = true,
                    IsNew = true,
                    StockQuantity = 2
                },
                new Product
                {
                    Name = "Daikin Emura FTXJ20MW",
                    Description = "Елегантен дизайн с висока енергийна ефективност",
                    BrandId = daikin.Id,
                    ProductTypeId = ACType.Id,
                    Price = 2199.00m,
                    Sku = "DK-EMURA-20",
                    ImageUrl = "https://via.placeholder.com/300x200?text=Daikin+Emura",
                    IsActive = true,
                    IsNew = true,
                    StockQuantity = 1
                },
                new Product
                {
                    Name = "Mitsubishi Heavy SRK20ZS-W",
                    Description = "Мощен климатик за големи помещения",
                    BrandId = mitsubishi.Id,
                    ProductTypeId = ACType.Id,
                    Price = 1999.00m,
                    OldPrice = 2199.00m,
                    Sku = "MH-SRK20ZS",
                    ImageUrl = "https://via.placeholder.com/300x200?text=Mitsubishi+Heavy",
                    IsActive = true,
                    IsOnSale = true,
                    StockQuantity = 3
                },
                new Product
                {
                    Name = "Gree U-Crown 24",
                    Description = "Интелигентен климатик с WiFi управление и йонен филтър",
                    BrandId = gree.Id,
                    ProductTypeId = ACType.Id,
                    Price = 1799.00m,
                    Sku = "GR-UCROWN-24",
                    ImageUrl = "https://via.placeholder.com/300x200?text=Gree+U-Crown",
                    IsActive = true,
                    IsNew = true,
                    StockQuantity = 2
                },
                new Product
                {
                    Name = "Daikin Perfera FTXP25M",
                    Description = "Тих и енергийно ефективен климатик с вграден WiFi",
                    BrandId = daikin.Id,
                    ProductTypeId = ACType.Id,
                    Price = 2099.00m,
                    OldPrice = 2299.00m,
                    Sku = "DK-PERFERA-25",
                    ImageUrl = "https://via.placeholder.com/300x200?text=Daikin+Perfera",
                    IsActive = true,
                    IsOnSale = true,
                    StockQuantity = 3
                }
            };

            await context.Products.AddRangeAsync(products);
            await context.SaveChangesAsync();
        }
    }
} 