using BGClima.API.Models;
using Microsoft.EntityFrameworkCore;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace BGClima.API.Data
{
    public class BGClimaContext : DbContext
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

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Задаване на схема по подразбиране
            modelBuilder.HasDefaultSchema("bgclima");

            // Конфигурация на Brand
            modelBuilder.Entity<Brand>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Country).HasMaxLength(100);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            });

            // Конфигурация на BTU
            modelBuilder.Entity<BTU>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Value).IsRequired().HasMaxLength(50);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            });

            // Конфигурация на EnergyClass
            modelBuilder.Entity<EnergyClass>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Class).IsRequired().HasMaxLength(10);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            });

            // Конфигурация на ProductType
            modelBuilder.Entity<ProductType>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(50);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            });

            // Конфигурация на Product
            modelBuilder.Entity<Product>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(255);
                entity.Property(e => e.Price).HasColumnType("decimal(10, 2)");
                entity.Property(e => e.OldPrice).HasColumnType("decimal(10, 2)");
                entity.Property(e => e.Sku).HasMaxLength(100);
                entity.Property(e => e.SeoTitle).HasMaxLength(255);
                entity.Property(e => e.SeoKeywords).HasMaxLength(500);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

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
                    .WithMany()
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
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne(pa => pa.Product)
                    .WithMany(p => p.Attributes)
                    .HasForeignKey(pa => pa.ProductId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Конфигурация на ProductImage
            modelBuilder.Entity<ProductImage>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.AltText).HasMaxLength(255);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne(pi => pi.Product)
                    .WithMany(p => p.Images)
                    .HasForeignKey(pi => pi.ProductId)
                    .OnDelete(DeleteBehavior.Cascade);
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
    }
}
