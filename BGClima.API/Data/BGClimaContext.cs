using BGClima.API.Models;
using BGClima.API.Models.Enums;
using Microsoft.EntityFrameworkCore;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace BGClima.API.Data
{
    public class BGClimaContext : DbContext
    {
        public BGClimaContext(DbContextOptions<BGClimaContext> options) : base(options)
        {
        }

        // Основни модели
        public DbSet<Brand> Brands { get; set; }
        public DbSet<ProductCategory> ProductCategories { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<AirConditioner> AirConditioners { get; set; }
        public DbSet<HeatPump> HeatPumps { get; set; }
        public DbSet<ProductImage> ProductImages { get; set; }
        public DbSet<ProductSpecification> ProductSpecifications { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Конфигурация на схемата по подразбиране
            modelBuilder.HasDefaultSchema("bgclima");

            // Конфигурация на връзките за Product
            modelBuilder.Entity<Product>()
                .HasOne(p => p.Brand)
                .WithMany(b => b.Products)
                .HasForeignKey(p => p.BrandId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Product>()
                .HasOne(p => p.Category)
                .WithMany(c => c.Products)
                .HasForeignKey(p => p.CategoryId)
                .OnDelete(DeleteBehavior.SetNull);

            // Конфигурация на връзката между Product и AirConditioner
            modelBuilder.Entity<Product>()
                .HasOne(p => p.AirConditioner)
                .WithOne(a => a.Product)
                .HasForeignKey<AirConditioner>(a => a.Id)
                .OnDelete(DeleteBehavior.Cascade);

            // Конфигурация на връзката между Product и HeatPump
            modelBuilder.Entity<Product>()
                .HasOne(p => p.HeatPump)
                .WithOne(h => h.Product)
                .HasForeignKey<HeatPump>(h => h.Id)
                .OnDelete(DeleteBehavior.Cascade);

            // Конфигурация на връзките за изображения и спецификации
            modelBuilder.Entity<ProductImage>()
                .HasOne(pi => pi.Product)
                .WithMany(p => p.Images)
                .HasForeignKey(pi => pi.ProductId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ProductSpecification>()
                .HasOne(ps => ps.Product)
                .WithMany(p => p.Specifications)
                .HasForeignKey(ps => ps.ProductId)
                .OnDelete(DeleteBehavior.Cascade);

            // Конфигурация на йерархична категория
            modelBuilder.Entity<ProductCategory>()
                .HasOne(c => c.Parent)
                .WithMany(c => c.Children)
                .HasForeignKey(c => c.ParentId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
