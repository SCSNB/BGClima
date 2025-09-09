using BGClima.API.Data;
using BGClima.Domain.Entities;
using BGClima.Domain.Interfaces;
using BGClima.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using BGClima.Infrastructure.Repositories;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.Extensions.DependencyInjection;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .AddJsonFile("appsettings.json")
    .AddEnvironmentVariables();

// Configure Kestrel to listen on HTTP in development
if (builder.Environment.IsDevelopment())
{
    builder.WebHost.UseUrls("http://localhost:5000");
}
else
{
    builder.WebHost.UseUrls("http://0.0.0.0:8080");
}

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddControllers();

// Get connection string from environment variable (for Fly.io) or fall back to appsettings.json
var connectionString = builder.Configuration.GetValue<string>("DATABASE_URL") ??
                     Environment.GetEnvironmentVariable("DATABASE_URL") ??
                     builder.Configuration["DATABASE_URL"] ??
                     builder.Configuration.GetConnectionString("DefaultConnection") ??
                     "Host=localhost;Port=5432;Database=bgclima;Username=postgres;Password=admin";

// Log which config source is being used
if (!string.IsNullOrEmpty(builder.Configuration.GetValue<string>("DATABASE_URL")))
{
    Console.WriteLine("Using connection from DATABASE_URL environment variable");
}
else if (!string.IsNullOrEmpty(builder.Configuration.GetConnectionString("DefaultConnection")))
{
    Console.WriteLine("Using connection from appsettings.json");
}
else
{
    Console.WriteLine("Using default development connection string");
}

// For Fly.io, we need to format the connection string if it's in URL format
if (connectionString.StartsWith("postgres://"))
{
    var uri = new Uri(connectionString);
    var userInfo = uri.UserInfo.Split(':');
    connectionString = $"Host={uri.Host};Port={uri.Port};Database={uri.AbsolutePath.TrimStart('/')};Username={userInfo[0]};Password={userInfo[1]};SSL Mode=Require;Trust Server Certificate=true;";
}

// Mask sensitive information in logs
var safeConnectionString = new string(connectionString.Select((c, i) =>
    i > 5 && i < connectionString.Length - 5 && c != ';' ? '*' : c).ToArray());
Console.WriteLine($"Connection string: {safeConnectionString}");


// Register BGClimaContext
builder.Services.AddDbContext<BGClimaContext>(options =>
options.UseNpgsql(connectionString, npgsqlOptions =>
{
    npgsqlOptions.EnableRetryOnFailure(
        maxRetryCount: 3,
        maxRetryDelay: TimeSpan.FromSeconds(10),
        errorCodesToAdd: null);
    npgsqlOptions.MigrationsAssembly("BGClima.Infrastructure");
    npgsqlOptions.CommandTimeout(60); // 60 seconds timeout
})
.EnableSensitiveDataLogging(builder.Environment.IsDevelopment())
.ConfigureWarnings(warnings => warnings.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.MultipleCollectionIncludeWarning)));

// Configure Identity
builder.Services.AddIdentity<IdentityUser, IdentityRole>()
    .AddEntityFrameworkStores<BGClimaContext>()
    .AddDefaultTokenProviders();

// Configure JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var key = Encoding.ASCII.GetBytes(jwtSettings["SecretKey"] ?? "your-super-secret-key-with-at-least-32-characters");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = jwtSettings["Issuer"] ?? "BGClima",
        ValidateAudience = true,
        ValidAudience = jwtSettings["Audience"] ?? "BGClimaUsers",
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

// Register repositories and services
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<BGClima.Application.Services.IProductService, BGClima.Application.Services.ProductService>();
builder.Services.AddScoped<BGClima.Application.Services.IAuthService, BGClima.Application.Services.AuthService>();
//// Register repositories
//builder.Services.AddScoped<BGClima.Domain.Entities.IProductRepository, BGClima.Infrastructure.Repositories.ProductRepository>();

//// Register application services
//builder.Services.AddScoped<BGClima.Application.Services.IProductService, BGClima.Application.Services.ProductService>();

builder.Services.AddScoped<BGClima.Application.Services.IImageService, BGClima.Application.Services.ImageService>();
//// Register repositories
//builder.Services.AddScoped<BGClima.Domain.Entities.IProductRepository, BGClima.Infrastructure.Repositories.ProductRepository>();

// Register banner repository
builder.Services.AddScoped<IBannerRepository, BannerRepository>();

// Register AutoMapper
builder.Services.AddAutoMapper(typeof(Program).Assembly);

// Enable detailed errors and sensitive data logging in development
// Note: Removed AddDatabaseDeveloperPageExceptionFilter as it's not available in the current context

// Add CORS policy with explicit origins and credentials
builder.Services.AddCors(options =>
{
    var origins = builder.Environment.IsDevelopment()
        ? new[] { "http://localhost:4200" }
        : new[] { "https://bgclima.fly.dev" };

    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(origins)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials()
              .WithExposedHeaders("Content-Disposition")
              .SetPreflightMaxAge(TimeSpan.FromMinutes(10));
    });
});

var app = builder.Build();

//Apply pending migrations on startup
// Comment migrations
//using var scope = app.Services.CreateScope();
//var dbContext = scope.ServiceProvider.GetRequiredService<BGClimaContext>();
//dbContext.Database.Migrate();
//Apply migrations and seed sample data

//await SeedData.SeedIdentityDataAsync(scope.ServiceProvider);
//await SeedData.SeedAsync(dbContext);


// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();

    // Don't use HTTPS redirection in development
    // app.UseHttpsRedirection();
}
else
{
    app.UseHttpsRedirection();
}

// The order of middleware is important here
app.UseRouting();

// CORS must be after UseRouting and before any other middleware
app.UseCors();

// Add CORS headers to responses
app.Use(async (context, next) =>
{
    var origin = context.Request.Headers["Origin"];
    
    if (!string.IsNullOrEmpty(origin) && 
        (origin.ToString().StartsWith("http://localhost:") || 
         origin.ToString().StartsWith("https://bgclima.fly.dev")))
    {
        context.Response.Headers.Add("Access-Control-Allow-Origin", origin);
        context.Response.Headers.Add("Access-Control-Allow-Credentials", "true");
    }
    
    await next();
});

// Authentication & Authorization
app.UseAuthentication();
app.UseAuthorization();

// Static files should come after routing
app.UseDefaultFiles();
app.UseStaticFiles();

// Configure endpoints and log all registered routes
app.UseEndpoints(endpoints =>
{
    endpoints.MapControllers();
    
    // Log all registered routes in development
    if (app.Environment.IsDevelopment())
    {
        var logger = app.Logger;
        var source = endpoints.DataSources.First();
        foreach (var endpoint in source.Endpoints.OfType<RouteEndpoint>())
        {
            var routePattern = endpoint.RoutePattern.RawText;
            var httpMethods = endpoint.Metadata.OfType<HttpMethodMetadata>().FirstOrDefault()?.HttpMethods;
            var methods = httpMethods != null ? string.Join(", ", httpMethods) : "(any)";
            logger.LogInformation($"Registered route: {methods} {routePattern}");
        }
    }
});

app.MapFallbackToFile("index.html");

app.Run();
