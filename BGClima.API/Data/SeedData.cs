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

            // Seed Brands
            if (!await context.Brands.AnyAsync())
            {
                brands = new List<Brand>
                {
                    new Brand { Name = "Daikin", Country = "Япония" },
                    new Brand { Name = "Mitsubishi Electric", Country = "Япония" },
                    new Brand { Name = "Toshiba", Country = "Япония" },
                    new Brand { Name = "Fujitsu", Country = "Япония" },
                    new Brand { Name = "Hitachi", Country = "Япония" },
                    new Brand { Name = "Gree", Country = "Китай" },
                    new Brand { Name = "AUX", Country = "Китай" },
                    new Brand { Name = "Nippon", Country = "Япония" },
                    new Brand { Name = "Inventor", Country = "Гърция" },
                    new Brand { Name = "Kobe", Country = "Япония" },
                    new Brand { Name = "Sendo", Country = "Китай" },
                    new Brand { Name = "Cooper & Hunter", Country = "САЩ" },
                    new Brand { Name = "Aqua Systems", Country = "България" }
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
                };
                await context.EnergyClasses.AddRangeAsync(energyClasses);
            }

            // Seed BTU Values
            if (!await context.BTUs.AnyAsync())
            {
                btus = new List<BTU>
                {
                    new BTU { Value = "7000 BTU" },
                    new BTU { Value = "9000 BTU" },
                    new BTU { Value = "10000 BTU" },
                    new BTU { Value = "12000 BTU" },
                    new BTU { Value = "13000 BTU" },
                    new BTU { Value = "14000 BTU" },
                    new BTU { Value = "16000 BTU" },
                    new BTU { Value = "18000 BTU" },
                    new BTU { Value = "20000 BTU" },
                    new BTU { Value = "22000 BTU" },
                    new BTU { Value = "24000 BTU" },
                    new BTU { Value = "30000 BTU" },
                    new BTU { Value = "36000 BTU" },
                    new BTU { Value = "42000 BTU" },
                    new BTU { Value = "45000 BTU" },
                    new BTU { Value = "48000 BTU" },
                    new BTU { Value = "50000 BTU" },
                    new BTU { Value = "54000 BTU" },
                    new BTU { Value = "55000 BTU" },
                    new BTU { Value = "60000 BTU" },
                    new BTU { Value = "66000 BTU" },
                    new BTU { Value = "72000 BTU" },
                    new BTU { Value = "90000 BTU" }
                };
                await context.BTUs.AddRangeAsync(btus);
            }

            // Seed Product Types
            if (!await context.ProductTypes.AnyAsync())
            {
                productTypes = new List<ProductType>
                {
                    new ProductType { Name = "Климатици стенен тип" },
                    new ProductType { Name = "Климатици колонен тип" },
                    new ProductType { Name = "Климатици канален тип" },
                    new ProductType { Name = "Климатици касетъчен тип" },
                    new ProductType { Name = "Климатици подов тип" },
                    new ProductType { Name = "Климатици подово - таванен тип" },
                    new ProductType { Name = "VRF / VRV" },
                    new ProductType { Name = "Мобилни / преносими климатици" },
                    new ProductType { Name = "Термопомпени системи" },
                    new ProductType { Name = "Мултисплит системи" },
                    new ProductType { Name = "БГКЛИМА тръбни топлообменници" },
                    new ProductType { Name = "Хиперинвертори" }
                };
                await context.ProductTypes.AddRangeAsync(productTypes);
            }

            await context.SaveChangesAsync();
        }

        public static async Task SeedIdentityDataAsync(IServiceProvider serviceProvider)
        {
            var userManager = serviceProvider.GetRequiredService<UserManager<IdentityUser>>();
            var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();

            var existingAdmin = await userManager.FindByNameAsync("admin");
            if (existingAdmin != null)
            {
                return;
            }

            var roles = new[] { "ADMIN", "ContentManager", "USER" };
            var rolesToCreate = new List<IdentityRole>();
            
            foreach (var roleName in roles)
            {
                if (!await roleManager.RoleExistsAsync(roleName))
                {
                    rolesToCreate.Add(new IdentityRole(roleName));
                }
            }

            foreach (var role in rolesToCreate)
            {
                await roleManager.CreateAsync(role);
            }

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