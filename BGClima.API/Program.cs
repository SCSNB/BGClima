using BGClima.API.Data;
using BGClima.Domain.Entities;
using BGClima.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using BGClima.Infrastructure.Repositories;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.Extensions.DependencyInjection;

var builder = WebApplication.CreateBuilder(args);

// Configure Kestrel to listen on HTTP in development
if (builder.Environment.IsDevelopment())
{
    builder.WebHost.UseUrls("http://localhost:5000");
}

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddControllers();

// Register DbContext with PostgreSQL
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ??
                      "Host=localhost;Port=5432;Database=bgclima;Username=postgres;Password=;";

// Register BGClimaContext
builder.Services.AddDbContext<BGClimaContext>(options =>
    options.UseNpgsql(connectionString, npgsqlOptions =>
    {
        npgsqlOptions.EnableRetryOnFailure(
            maxRetryCount: 5,
            maxRetryDelay: TimeSpan.FromSeconds(30),
            errorCodesToAdd: null);
        npgsqlOptions.MigrationsAssembly("BGClima.Infrastructure");
    }));

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
                "http://localhost:4200" // Angular dev server (default port)
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
            //SeedTestData(db);
            await SeedData.SeedIdentityDataAsync(scope.ServiceProvider);
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
    
    // Don't use HTTPS redirection in development
    // app.UseHttpsRedirection();
}
else
{
    app.UseHttpsRedirection();
}

app.UseDefaultFiles();
app.UseStaticFiles();
app.UseRouting();
app.UseCors("AllowAngularDev");

// Add authentication and authorization middleware
app.UseAuthentication();
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

app.MapFallbackToFile("index.html");

app.Run();
