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
using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.Http;
using System.Linq;
using System.Threading.Tasks;

var builder = WebApplication.CreateBuilder(args);

// Add logging
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddControllers();

// Register BGClimaContext with PostgreSQL
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<BGClima.Infrastructure.Data.BGClimaContext>(options =>
    options.UseNpgsql(connectionString, npgsqlOptions =>
    {
        npgsqlOptions.EnableRetryOnFailure(
            maxRetryCount: 5,
            maxRetryDelay: TimeSpan.FromSeconds(30),
            errorCodesToAdd: null);
    }));

// Register repositories
builder.Services.AddScoped<BGClima.Domain.Entities.IProductRepository, BGClima.Infrastructure.Repositories.ProductRepository>();
builder.Services.AddScoped<BGClima.Domain.Interfaces.IBannerRepository, BGClima.Infrastructure.Repositories.BannerRepository>();

// Register application services
builder.Services.AddScoped<BGClima.Application.Services.IProductService, BGClima.Application.Services.ProductService>();

// Register AutoMapper
builder.Services.AddAutoMapper(
    typeof(Program).Assembly,
    typeof(BGClima.API.Mapping.BannerProfile).Assembly
);

// Enable detailed errors and sensitive data logging in development
// Note: Removed AddDatabaseDeveloperPageExceptionFilter as it's not available in the current context

// Add CORS policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularDev",
        policy => policy
            .WithOrigins(
                "http://localhost:4200" // Angular dev server (default port)
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials());
});

var app = builder.Build();


// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    
    // Only use HTTPS redirection in production
    app.UseHttpsRedirection();
}
else
{
    app.UseHttpsRedirection();
}

app.UseDefaultFiles();
app.UseStaticFiles();
app.UseRouting();
app.UseCors("AllowAngularDev");
app.UseAuthorization();

app.MapControllers(); 

// Log all registered routes
app.UseEndpoints(endpoints =>
{
    endpoints.MapControllers();
    
    // Log all registered routes
    var logger = app.Services.GetRequiredService<ILogger<Program>>();
    var source = endpoints.DataSources.First();
    foreach (var endpoint in source.Endpoints.OfType<RouteEndpoint>())
    {
        var routePattern = endpoint.RoutePattern.RawText;
        var httpMethod = endpoint.Metadata.OfType<HttpMethodMetadata>().FirstOrDefault()?.HttpMethods.FirstOrDefault() ?? "(any)";
        logger.LogInformation($"Registered route: {httpMethod} {routePattern}");
    }
});

// Initialize database with seed data
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try 
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogInformation("Starting to seed the database...");
        
        var context = services.GetRequiredService<BGClima.Infrastructure.Data.BGClimaContext>();
        await SeedData.SeedAsync(context);
        
        logger.LogInformation("Database seeding completed successfully.");
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while seeding the database.");
        throw; // Re-throw to ensure we see the error
    }
}

app.MapFallbackToFile("index.html");

await app.RunAsync();
