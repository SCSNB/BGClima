using BGClima.Infrastructure;
using BGClima.Domain.Entities;
using BGClima.Application.Services;
using Microsoft.EntityFrameworkCore;
using BGClima.Infrastructure.Repositories;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddControllersWithViews();

// Register AppDbContext with PostgreSQL
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection") ??
        "Host=localhost;Database=bgclima;Username=postgres;Password=admin"));

// Register repositories
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<IProductService, ProductService>();

// Add CORS policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularDev",
        policy => policy
            .WithOrigins("http://localhost:4200") // Angular dev server
            .AllowAnyHeader()
            .AllowAnyMethod());
});

var app = builder.Build();

// Apply pending migrations on startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();

    // Only seed in Development
    var env = scope.ServiceProvider.GetRequiredService<IWebHostEnvironment>();
    if (env.IsDevelopment())
    {
        SeedTestData(db);
    }
}

void SeedTestData(AppDbContext db)
{
    // Seed categories if not present
    if (!db.Categories.Any())
    {
        db.Categories.AddRange(
            new Category { Id = 1, Name = "Solar Panels" },
            new Category { Id = 2, Name = "Inverters" },
            new Category { Id = 3, Name = "Batteries" }
        );
        db.SaveChanges();
    }

    // Only seed if there are no products, prices, stocks, images, or features
    bool needSeed = !db.Products.Any() && !db.Prices.Any() && !db.Stocks.Any() && !db.ProductImages.Any() && !db.ProductFeatures.Any();
    if (needSeed)
    {
        for (int i = 1; i <= 50; i++)
        {
            int categoryId = (i % 3) + 1;
            var product = new Product
            {
                Name = $"Product {i}",
                Description = $"Description for product {i}",
                CategoryId = categoryId
            };
            db.Products.Add(product);
            db.SaveChanges(); // Save to get product.Id for FK

            db.Prices.Add(new Price
            {
                ProductId = product.Id,
                Amount = 100 + i,
                Currency = "EUR"
            });
            db.Stocks.Add(new Stock
            {
                ProductId = product.Id,
                Quantity = 10 + i
            });
            db.ProductImages.Add(new ProductImage
            {
                ProductId = product.Id,
                Url = "/assets/solar-panel-placeholder.jpg"
            });
            db.ProductFeatures.Add(new ProductFeature
            {
                ProductId = product.Id,
                Name = $"Feature {i}",
                Value = $"Value {i}"
            });
        }
        db.SaveChanges();
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseDefaultFiles();
app.UseStaticFiles();
app.UseRouting();
app.UseCors("AllowAngularDev");
app.UseAuthorization();

app.MapControllers(); 
app.MapFallbackToFile("index.html");

app.Run();
