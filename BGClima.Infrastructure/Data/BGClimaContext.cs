using BGClima.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;

namespace BGClima.Infrastructure.Data
{
    public class BGClimaContext : IdentityDbContext<IdentityUser, IdentityRole, string>
    {
        public BGClimaContext(DbContextOptions<BGClimaContext> options) : base(options)
        {
        }

        // DbSet свойства за всяка таблица
        public DbSet<Brand> Brands { get; set; }
        public DbSet<BTU> BTUs { get; set; }
        public DbSet<EnergyClass> EnergyClasses { get; set; }
        public DbSet<ProductType> ProductTypes { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<ProductAttribute> ProductAttributes { get; set; }
        public DbSet<ProductImage> ProductImages { get; set; }
        public DbSet<Banner> Banners { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder
            .HasDbFunction(() => GetMaxHeatingPowerSql(default!))
            .HasName("get_max_heating_power");

            // Конфигурация на Brand
            modelBuilder.Entity<Brand>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Country).HasMaxLength(100);
            });

            // Конфигурация на BTU
            modelBuilder.Entity<BTU>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Value).IsRequired().HasMaxLength(50);
            });

            // Конфигурация на EnergyClass
            modelBuilder.Entity<EnergyClass>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Class).IsRequired().HasMaxLength(10);
            });

            // Конфигурация на ProductType
            modelBuilder.Entity<ProductType>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(50);
            });

            // Конфигурация на Product
            modelBuilder.Entity<Product>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(255);
                entity.Property(e => e.Price).HasColumnType("decimal(10, 2)");
                entity.Property(e => e.OldPrice).HasColumnType("decimal(10, 2)");
                entity.Property(e => e.Sku).HasMaxLength(100);

                // Връзки
                entity.HasOne(p => p.Brand)
                    .WithMany(b => b.Products)
                    .HasForeignKey(p => p.BrandId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(p => p.BTU)
                    .WithMany()
                    .HasForeignKey(p => p.BTUId)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(p => p.EnergyClass)
                    .WithMany(ec => ec.Products)
                    .HasForeignKey(p => p.EnergyClassId)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(p => p.ProductType)
                    .WithMany(pt => pt.Products)
                    .HasForeignKey(p => p.ProductTypeId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Конфигурация на ProductAttribute
            modelBuilder.Entity<ProductAttribute>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.AttributeKey).IsRequired().HasMaxLength(100);
                entity.Property(e => e.AttributeValue).IsRequired().HasMaxLength(255);
                entity.Property(e => e.GroupName).HasMaxLength(100);

                entity.HasOne(pa => pa.Product)
                    .WithMany(p => p.Attributes)
                    .HasForeignKey(pa => pa.ProductId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<ProductImage>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.ImageUrl).IsRequired();
                entity.Property(e => e.AltText).HasMaxLength(500);
                entity.Property(e => e.DisplayOrder).IsRequired();
                entity.Property(e => e.IsPrimary).IsRequired().HasDefaultValue(false);
                entity.Property(e => e.IsDescription).IsRequired().HasDefaultValue(false);

                entity.HasOne(pi => pi.Product)
                    .WithMany(p => p.Images)
                    .HasForeignKey(pi => pi.ProductId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Banner>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.ImageUrl).IsRequired().HasMaxLength(500);
                entity.Property(e => e.TargetUrl).HasMaxLength(1000);
                entity.Property(e => e.DisplayOrder).IsRequired();
                entity.Property(e => e.IsActive).IsRequired();
                entity.Property(e => e.Type).IsRequired();
            });

            // Създаване на индекси
            modelBuilder.Entity<Product>()
                .HasIndex(p => p.BrandId);

            modelBuilder.Entity<Product>()
                .HasIndex(p => p.ProductTypeId);

            modelBuilder.Entity<ProductAttribute>()
                .HasIndex(pa => pa.ProductId);

            modelBuilder.Entity<ProductImage>()
                .HasIndex(pi => pi.ProductId);
        }
    

            [DbFunction("get_max_heating_power", IsBuiltIn = false)]
        public static double? GetMaxHeatingPowerSql(string attrValue)
            => throw new NotSupportedException(); // EF will translate this to SQL
    }
}
