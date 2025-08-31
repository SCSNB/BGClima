using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BGClima.Domain.Entities;
using BGClima.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;

namespace BGClima.API.Data
{
    public static class SeedData
    {
        public static async Task SeedAsync(BGClimaContext context)
        {
            // Batch seed all reference data in one transaction
            var brands = new List<Brand>();
            var energyClasses = new List<EnergyClass>();
            var btus = new List<BTU>();
            var productTypes = new List<ProductType>();

            // Seed Banners
            if (!await context.Banners.AnyAsync())
            {
                var banners = new List<Banner>
                {
                    new Banner 
                    { 
                        Name = "Daikin FTXB-E/RXB-E Намаление", 
                        ImageUrl = "https://bgclima.com/cms/slides2/daikin-promo.jpg", 
                        TargetUrl = "/products/daikin-ftxbe-rxbe",
                        DisplayOrder = 1,
                        IsActive = true,
                        Type = BannerType.HeroSlider
                    },
                    new Banner 
                    { 
                        Name = "Безплатна доставка и монтаж", 
                        ImageUrl = "https://bgclima.com/cms/slides2/free-installation.jpg", 
                        TargetUrl = "/promotions/free-installation",
                        DisplayOrder = 2,
                        IsActive = true,
                        Type = BannerType.TopRight
                    },
                    new Banner 
                    { 
                        Name = "Daikin - Инверторна технология", 
                        ImageUrl = "https://bgclima.com/cms/slides2/daikin-technology.jpg", 
                        TargetUrl = "/brands/daikin",
                        DisplayOrder = 3,
                        IsActive = true,
                        Type = BannerType.HeroSlider
                    },
                    new Banner 
                    { 
                        Name = "Гаранция до 5 години", 
                        ImageUrl = "https://bgclima.com/cms/slides2/warranty.jpg", 
                        TargetUrl = "/warranty",
                        DisplayOrder = 4,
                        IsActive = true,
                        Type = BannerType.MiddleRight
                    },
                    new Banner 
                    { 
                        Name = "Специални оферти", 
                        ImageUrl = "https://bgclima.com/cms/slides2/special-offers.jpg", 
                        TargetUrl = "/special-offers",
                        DisplayOrder = 5,
                        IsActive = true,
                        Type = BannerType.BottomRight
                    }
                };

                await context.Banners.AddRangeAsync(banners);
                await context.SaveChangesAsync();
            }

            // Seed Brands
            if (!await context.Brands.AnyAsync())
            {
                brands = new List<Brand>
                {
                    new Brand { Name = "Daikin", Country = "Япония" },
                    new Brand { Name = "Mitsubishi Electric", Country = "Япония" },
                    new Brand { Name = "Toshiba", Country = "Япония" },
                    new Brand { Name = "Fujitsu", Country = "Япония" },
                    new Brand { Name = "Gree", Country = "Китай" },
                    new Brand { Name = "Haier", Country = "Китай" },
                    new Brand { Name = "LG", Country = "Южна Корея" },
                    new Brand { Name = "Samsung", Country = "Южна Корея" },
                    new Brand { Name = "Ballu", Country = "Русия" },
                    new Brand { Name = "Hyundai", Country = "Южна Корея" }
                };
                await context.Brands.AddRangeAsync(brands);
            }

            // Seed Energy Classes
            if (!await context.EnergyClasses.AnyAsync())
            {
                energyClasses = new List<EnergyClass>
                {
                    new EnergyClass { Class = "A+++" },
                    new EnergyClass { Class = "A++" },
                    new EnergyClass { Class = "A+" },
                    new EnergyClass { Class = "A" },
                    new EnergyClass { Class = "B" },
                    new EnergyClass { Class = "C" },
                    new EnergyClass { Class = "D" }
                };
                await context.EnergyClasses.AddRangeAsync(energyClasses);
            }

            // Seed BTU Values
            if (!await context.BTUs.AnyAsync())
            {
                btus = new List<BTU>
                {
                    new BTU { Value = "9000 BTU" },
                    new BTU { Value = "12000 BTU" },
                    new BTU { Value = "18000 BTU" },
                    new BTU { Value = "24000 BTU" },
                    new BTU { Value = "30000 BTU" },
                    new BTU { Value = "36000 BTU" }
                };
                await context.BTUs.AddRangeAsync(btus);
            }

            // Seed Product Types
            if (!await context.ProductTypes.AnyAsync())
            {
                productTypes = new List<ProductType>
                {
                    new ProductType { Name = "Стандартен климатик" },
                    new ProductType { Name = "Инверторен климатик" },
                    new ProductType { Name = "Мулти сплит система" },
                    new ProductType { Name = "Канален климатик" },
                    new ProductType { Name = "Касетъчен климатик" },
                    new ProductType { Name = "Топлинна помпа" }
                };
                await context.ProductTypes.AddRangeAsync(productTypes);
            }

            // Single SaveChanges for all reference data
            await context.SaveChangesAsync();

            // Get reference entities in batch to avoid multiple queries
            var allBrands = brands.Any() ? brands : await context.Brands.ToListAsync();
            var allBtus = btus.Any() ? btus : await context.BTUs.ToListAsync();
            var allEnergyClasses = energyClasses.Any() ? energyClasses : await context.EnergyClasses.ToListAsync();
            var allProductTypes = productTypes.Any() ? productTypes : await context.ProductTypes.ToListAsync();

            var daikinBrand = allBrands.First(b => b.Name == "Daikin");
            var mitsubishiBrand = allBrands.First(b => b.Name == "Mitsubishi Electric");
            var btu9000 = allBtus.First(b => b.Value == "9000 BTU");
            var btu12000 = allBtus.First(b => b.Value == "12000 BTU");
            var energyClassAplusplus = allEnergyClasses.First(e => e.Class == "A++");
            var energyClassAplusplusplus = allEnergyClasses.First(e => e.Class == "A+++");
            var inverterType = allProductTypes.First(t => t.Name == "Инверторен климатик");

            // Seed Products
            var products = new List<Product>
            {
                new Product
                {
                    Name = "Daikin FTXB-E/RXB-E",
                    Description = "Инверторен климатик с висок енергиен клас A++",
                    BrandId = daikinBrand.Id,
                    BTUId = btu9000.Id,
                    EnergyClassId = energyClassAplusplus.Id,
                    ProductTypeId = inverterType.Id,
                    Price = 1299.00m,
                    OldPrice = 1399.00m,
                    StockQuantity = 10,
                    IsActive = true,
                    IsFeatured = true,
                    IsOnSale = true,
                    IsNew = true,
                    Sku = "DAI-FTXBE-9000",
                    ImageUrl = "/images/daikin-ftxbe-rxbe.jpg",
                },
                new Product
                {
                    Name = "Mitsubishi Electric MSZ-LN35VG2B / MUZ-LN35VG2",
                    Description = "Сензорен инверторен климатик с висок енергиен клас A+++",
                    BrandId = mitsubishiBrand.Id,
                    BTUId = btu12000.Id,
                    EnergyClassId = energyClassAplusplusplus.Id,
                    ProductTypeId = inverterType.Id,
                    Price = 1599.00m,
                    OldPrice = 1699.00m,
                    StockQuantity = 5,
                    IsActive = true,
                    IsFeatured = true,
                    IsOnSale = false,
                    IsNew = true,
                    Sku = "MIT-LN35VG2",
                    ImageUrl = "/images/mitsubishi-ln35vg2.jpg"
                }
            };

            // Add more products for variety
            var greeBrand = allBrands.First(b => b.Name == "Gree");
            var btu18000 = allBtus.First(b => b.Value == "18000 BTU");
            var energyClassAplus = allEnergyClasses.First(e => e.Class == "A+");
            var standardType = allProductTypes.First(t => t.Name == "Стандартен климатик");

            products.Add(new Product
            {
                Name = "Gree Breezeless 18",
                Description = "Стандартен климатик с тиха работа и високо качество",
                BrandId = greeBrand.Id,
                BTUId = btu18000.Id,
                EnergyClassId = energyClassAplus.Id,
                ProductTypeId = standardType.Id,
                Price = 899.00m,
                OldPrice = 999.00m,
                StockQuantity = 15,
                IsActive = true,
                IsFeatured = false,
                IsOnSale = true,
                IsNew = false,
                Sku = "GREE-BREEZE-18",
                ImageUrl = "/images/gree-breezeless-18.jpg"
            });

            await context.Products.AddRangeAsync(products);
            await context.SaveChangesAsync();

            // Prepare all related data in memory to minimize database calls
            var productImages = new List<ProductImage>();
            var productAttributes = new List<ProductAttribute>();

            // Images for Daikin product
            var daikinProduct = products[0];
            productImages.AddRange(new[]
            {
                new ProductImage
                {
                    ProductId = daikinProduct.Id,
                    ImageUrl = "/images/daikin-ftxbe-rxbe-1.jpg",
                    AltText = "Daikin FTXB-E/RXB-E - преден изглед",
                    DisplayOrder = 1,
                    IsPrimary = true
                },
                new ProductImage
                {
                    ProductId = daikinProduct.Id,
                    ImageUrl = "/images/daikin-ftxbe-rxbe-2.jpg",
                    AltText = "Daikin FTXB-E/RXB-E - страничен изглед",
                    DisplayOrder = 2,
                    IsPrimary = false
                }
            });

            // Images for Mitsubishi product
            var mitsubishiProduct = products[1];
            productImages.AddRange(new[]
            {
                new ProductImage
                {
                    ProductId = mitsubishiProduct.Id,
                    ImageUrl = "/images/mitsubishi-ln35vg2-1.jpg",
                    AltText = "Mitsubishi Electric MSZ-LN35VG2B - преден изглед",
                    DisplayOrder = 1,
                    IsPrimary = true
                },
                new ProductImage
                {
                    ProductId = mitsubishiProduct.Id,
                    ImageUrl = "/images/mitsubishi-ln35vg2-2.jpg",
                    AltText = "Mitsubishi Electric MSZ-LN35VG2B - страничен изглед",
                    DisplayOrder = 2,
                    IsPrimary = false
                }
            });

            // Images for Gree product
            var greeProduct = products[2];
            productImages.AddRange(new[]
            {
                new ProductImage
                {
                    ProductId = greeProduct.Id,
                    ImageUrl = "/images/gree-breezeless-18-1.jpg",
                    AltText = "Gree Breezeless 18 - преден изглед",
                    DisplayOrder = 1,
                    IsPrimary = true
                },
                new ProductImage
                {
                    ProductId = greeProduct.Id,
                    ImageUrl = "/images/gree-breezeless-18-2.jpg",
                    AltText = "Gree Breezeless 18 - страничен изглед",
                    DisplayOrder = 2,
                    IsPrimary = false
                }
            });

            // Prepare product attributes in the same loop to avoid multiple iterations

            // Attributes for Daikin product
            productAttributes.AddRange(new[]
            {
                new ProductAttribute
                {
                    ProductId = daikinProduct.Id,
                    AttributeKey = "Тип на инсталацията",
                    AttributeValue = "Настен",
                    DisplayOrder = 1,
                    GroupName = "Основни характеристики",
                    IsVisible = true
                },
                new ProductAttribute
                {
                    ProductId = daikinProduct.Id,
                    AttributeKey = "Отдавана мощност (охлаждане)",
                    AttributeValue = "2.6 kW",
                    DisplayOrder = 2,
                    GroupName = "Основни характеристики",
                    IsVisible = true
                },
                new ProductAttribute
                {
                    ProductId = daikinProduct.Id,
                    AttributeKey = "Отдавана мощност (отопление)",
                    AttributeValue = "3.4 kW",
                    DisplayOrder = 3,
                    GroupName = "Основни характеристики",
                    IsVisible = true
                },
                new ProductAttribute
                {
                    ProductId = daikinProduct.Id,
                    AttributeKey = "Енергиен клас (охлаждане)",
                    AttributeValue = "A++",
                    DisplayOrder = 4,
                    GroupName = "Енергийна ефективност",
                    IsVisible = true
                },
                new ProductAttribute
                {
                    ProductId = daikinProduct.Id,
                    AttributeKey = "Енергиен клас (отопление)",
                    AttributeValue = "A+",
                    DisplayOrder = 5,
                    GroupName = "Енергийна ефективност",
                    IsVisible = true
                },
                new ProductAttribute
                {
                    ProductId = daikinProduct.Id,
                    AttributeKey = "Ниво на шум (вътрешно тяло)",
                    AttributeValue = "19 dB",
                    DisplayOrder = 6,
                    GroupName = "Допълнителни характеристики",
                    IsVisible = true
                },
                new ProductAttribute
                {
                    ProductId = daikinProduct.Id,
                    AttributeKey = "Ниво на шум (външно тяло)",
                    AttributeValue = "45 dB",
                    DisplayOrder = 7,
                    GroupName = "Допълнителни характеристики",
                    IsVisible = true
                },
                new ProductAttribute
                {
                    ProductId = daikinProduct.Id,
                    AttributeKey = "Гаранция",
                    AttributeValue = "3 години",
                    DisplayOrder = 8,
                    GroupName = "Гаранция и поддръжка",
                    IsVisible = true
                }
            });

            // Attributes for Mitsubishi product
            productAttributes.AddRange(new[]
            {
                new ProductAttribute
                {
                    ProductId = mitsubishiProduct.Id,
                    AttributeKey = "Тип на инсталацията",
                    AttributeValue = "Настен",
                    DisplayOrder = 1,
                    GroupName = "Основни характеристики",
                    IsVisible = true
                },
                new ProductAttribute
                {
                    ProductId = mitsubishiProduct.Id,
                    AttributeKey = "Отдавана мощност (охлаждане)",
                    AttributeValue = "3.5 kW",
                    DisplayOrder = 2,
                    GroupName = "Основни характеристики",
                    IsVisible = true
                },
                new ProductAttribute
                {
                    ProductId = mitsubishiProduct.Id,
                    AttributeKey = "Отдавана мощност (отопление)",
                    AttributeValue = "4.0 kW",
                    DisplayOrder = 3,
                    GroupName = "Основни характеристики",
                    IsVisible = true
                },
                new ProductAttribute
                {
                    ProductId = mitsubishiProduct.Id,
                    AttributeKey = "Енергиен клас (охлаждане)",
                    AttributeValue = "A+++",
                    DisplayOrder = 4,
                    GroupName = "Енергийна ефективност",
                    IsVisible = true
                },
                new ProductAttribute
                {
                    ProductId = mitsubishiProduct.Id,
                    AttributeKey = "Енергиен клас (отопление)",
                    AttributeValue = "A++",
                    DisplayOrder = 5,
                    GroupName = "Енергийна ефективност",
                    IsVisible = true
                },
                new ProductAttribute
                {
                    ProductId = mitsubishiProduct.Id,
                    AttributeKey = "Ниво на шум (вътрешно тяло)",
                    AttributeValue = "20 dB",
                    DisplayOrder = 6,
                    GroupName = "Допълнителни характеристики",
                    IsVisible = true
                },
                new ProductAttribute
                {
                    ProductId = mitsubishiProduct.Id,
                    AttributeKey = "Ниво на шум (външно тяло)",
                    AttributeValue = "43 dB",
                    DisplayOrder = 7,
                    GroupName = "Допълнителни характеристики",
                    IsVisible = true
                },
                new ProductAttribute
                {
                    ProductId = mitsubishiProduct.Id,
                    AttributeKey = "Гаранция",
                    AttributeValue = "5 години",
                    DisplayOrder = 8,
                    GroupName = "Гаранция и поддръжка",
                    IsVisible = true
                }
            });

            // Attributes for Gree product
            productAttributes.AddRange(new[]
            {
                new ProductAttribute
                {
                    ProductId = greeProduct.Id,
                    AttributeKey = "Тип на инсталацията",
                    AttributeValue = "Настен",
                    DisplayOrder = 1,
                    GroupName = "Основни характеристики",
                    IsVisible = true
                },
                new ProductAttribute
                {
                    ProductId = greeProduct.Id,
                    AttributeKey = "Отдавана мощност (охлаждане)",
                    AttributeValue = "5.2 kW",
                    DisplayOrder = 2,
                    GroupName = "Основни характеристики",
                    IsVisible = true
                },
                new ProductAttribute
                {
                    ProductId = greeProduct.Id,
                    AttributeKey = "Отдавана мощност (отопление)",
                    AttributeValue = "5.8 kW",
                    DisplayOrder = 3,
                    GroupName = "Основни характеристики",
                    IsVisible = true
                },
                new ProductAttribute
                {
                    ProductId = greeProduct.Id,
                    AttributeKey = "Енергиен клас (охлаждане)",
                    AttributeValue = "A+",
                    DisplayOrder = 4,
                    GroupName = "Енергийна ефективност",
                    IsVisible = true
                },
                new ProductAttribute
                {
                    ProductId = greeProduct.Id,
                    AttributeKey = "Енергиен клас (отопление)",
                    AttributeValue = "A",
                    DisplayOrder = 5,
                    GroupName = "Енергийна ефективност",
                    IsVisible = true
                },
                new ProductAttribute
                {
                    ProductId = greeProduct.Id,
                    AttributeKey = "Ниво на шум (вътрешно тяло)",
                    AttributeValue = "22 dB",
                    DisplayOrder = 6,
                    GroupName = "Допълнителни характеристики",
                    IsVisible = true
                },
                new ProductAttribute
                {
                    ProductId = greeProduct.Id,
                    AttributeKey = "Ниво на шум (външно тяло)",
                    AttributeValue = "48 dB",
                    DisplayOrder = 7,
                    GroupName = "Допълнителни характеристики",
                    IsVisible = true
                },
                new ProductAttribute
                {
                    ProductId = greeProduct.Id,
                    AttributeKey = "Гаранция",
                    AttributeValue = "2 години",
                    DisplayOrder = 8,
                    GroupName = "Гаранция и поддръжка",
                    IsVisible = true
                }
            });

            // Single batch insert for all images and attributes
            await context.ProductImages.AddRangeAsync(productImages);
            await context.ProductAttributes.AddRangeAsync(productAttributes);
            await context.SaveChangesAsync();
        }

        public static async Task SeedIdentityDataAsync(IServiceProvider serviceProvider)
        {
            var userManager = serviceProvider.GetRequiredService<UserManager<IdentityUser>>();
            var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();

            // Delete existing admin user if exists to ensure proper role assignment
            var existingAdmin = await userManager.FindByNameAsync("admin");
            if (existingAdmin != null)
            {
                await userManager.DeleteAsync(existingAdmin);
            }

            // Create roles in batch
            var roles = new[] { "ADMIN", "ContentManager", "USER" };
            var rolesToCreate = new List<IdentityRole>();
            
            foreach (var roleName in roles)
            {
                if (!await roleManager.RoleExistsAsync(roleName))
                {
                    rolesToCreate.Add(new IdentityRole(roleName));
                }
            }

            // Create all roles
            foreach (var role in rolesToCreate)
            {
                await roleManager.CreateAsync(role);
            }

            // Create admin user
            var adminUser = new IdentityUser
            {
                UserName = "admin",
                Email = "admin@bgclima.com",
                EmailConfirmed = true
            };

            var result = await userManager.CreateAsync(adminUser, "Admin1!");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(adminUser, "ADMIN");
            }
        }
    }
} 