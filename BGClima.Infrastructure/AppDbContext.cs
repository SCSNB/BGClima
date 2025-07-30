
using Microsoft.EntityFrameworkCore;
using BGClima.Domain.Entities;

namespace BGClima.Infrastructure
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Product> Products { get; set; } = null!;
        public DbSet<Category> Categories { get; set; } = null!;
        public DbSet<ProductImage> ProductImages { get; set; } = null!;
        public DbSet<ProductFeature> ProductFeatures { get; set; } = null!;
        public DbSet<Stock> Stocks { get; set; } = null!;
        public DbSet<Price> Prices { get; set; } = null!;

        public DbSet<Brand> Brands { get; set; } = null!;
        public DbSet<AirConditioner> AirConditioners { get; set; } = null!;
        public DbSet<Series> Series { get; set; } = null!;
        public DbSet<Image> Images { get; set; } = null!;
        public DbSet<AirConditionerType> AirConditionerTypes { get; set; } = null!;
        public DbSet<AirConditionerCategory> AirConditionerCategories { get; set; } = null!;
        public DbSet<AirFlow> AirFlows { get; set; } = null!;
        public DbSet<Filter> Filters { get; set; } = null!;
        public DbSet<Installation> Installations { get; set; } = null!;
        public DbSet<Operation> Operations { get; set; } = null!;
        public DbSet<Performance> Performances { get; set; } = null!;
        public DbSet<Specification> Specifications { get; set; } = null!;
        public DbSet<Warranty> Warranties { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<AirConditionerCategory>().HasKey(ac => new { ac.AirConditionerId, ac.CategoryId });
        }
    }
} 