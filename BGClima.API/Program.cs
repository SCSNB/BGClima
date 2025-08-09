using BGClima.API.Data;
using BGClima.Domain.Entities;
using BGClima.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.OpenApi.Models;
using Npgsql.EntityFrameworkCore.PostgreSQL;
using System;
using System.IO;
using System.Reflection;
using Npgsql.EntityFrameworkCore.PostgreSQL;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddControllersWithViews();

// Register DbContext with PostgreSQL
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ??
                      "Host=localhost;Port=5432;Database=bgclima;Username=postgres;Password=;";

// Register BGClimaContext
builder.Services.AddDbContext<BGClima.Infrastructure.Data.BGClimaContext>(options =>
    options.UseNpgsql(connectionString, npgsqlOptions =>
    {
        npgsqlOptions.EnableRetryOnFailure(
            maxRetryCount: 5,
            maxRetryDelay: TimeSpan.FromSeconds(30),
            errorCodesToAdd: null);
        npgsqlOptions.MigrationsAssembly("BGClima.Infrastructure");
    }));

// Register repositories
builder.Services.AddScoped<BGClima.Domain.Entities.IProductRepository, BGClima.Infrastructure.Repositories.ProductRepository>();

// Register application services
builder.Services.AddScoped<BGClima.Application.Services.IProductService, BGClima.Application.Services.ProductService>();

// Register AutoMapper
builder.Services.AddAutoMapper(typeof(Program).Assembly);

// Enable detailed errors and sensitive data logging in development
// Note: Removed AddDatabaseDeveloperPageExceptionFilter as it's not available in the current context

// Add CORS policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularDev",
        policy => policy
            .WithOrigins(
                "http://localhost:4200", // Angular dev server (default port)
                "http://localhost:4201"  // Angular dev server (custom port)
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials());
});

var app = builder.Build();

// Apply pending migrations on startup
try
{
    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<BGClimaContext>();

    // Apply migrations and seed sample data
    if (app.Environment.IsDevelopment())
    {
        await SeedData.SeedAsync(dbContext);
    }
}
catch (Exception ex)
{
    var logger = app.Services.GetRequiredService<ILogger<Program>>();
    logger.LogError(ex, "An error occurred while migrating or initializing the database.");
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
