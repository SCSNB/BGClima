using BGClima.Domain.DTOs;
using BGClima.Application.Services;
using BGClima.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.ComponentModel.DataAnnotations;
using System.Text.Json;

namespace BGClima.API.Controllers
{
    [Route("api/products")]
    [ApiController]
    public class ProductsController : Controller
    {
        private readonly IProductService _productService;

        public ProductsController(IProductService productService)
        {
            _productService = productService;
        }


        [HttpGet("")]
        [Produces("application/json")]
        public async Task<IActionResult> GetAllProductsApi()
        {
            var products = await _productService.GetAllAsync();
            return Ok(products);
        }

        [HttpGet("klimatiks")]
        [Produces("application/json")]
        public async Task<IActionResult> GetAllKlimatikProducts()
        {
            try
            {
                var products = await _productService.GetAllKlimatikProductsAsync();
                return Ok(products);
            }
            catch (Exception ex)
            {
                // Log the error (in a real app, you'd want to use ILogger)
                Console.WriteLine($"Error getting klimatik products: {ex}");
                
                return StatusCode(500, new 
                { 
                    Message = "An error occurred while retrieving klimatik products.",
                    Error = ex.Message
                });
            }
        }
        [HttpPost("add-to-all-categories")]
        [Produces("application/json")]
        public async Task<IActionResult> AddProductToAllCategories([FromBody] CreateProductDto productDto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState
                    .Where(e => e.Value.Errors.Count > 0)
                    .Select(e => new 
                    {
                        Field = e.Key,
                        Errors = e.Value.Errors.Select(er => er.ErrorMessage).ToArray()
                    });
                
                return BadRequest(new 
                { 
                    Message = "Validation failed",
                    Errors = errors 
                });
            }
            
            // Map DTO to entity
            var product = new Product
            {
                Name = productDto.Name,
                Description = productDto.Description,
                BrandId = productDto.BrandId,
                Images = productDto.Images?.Select(i => new ProductImage { Url = i.Url }).ToList(),
                Features = productDto.Features?.Select(f => new ProductFeature 
                { 
                    Name = f.Name, 
                    Value = f.Value 
                }).ToList(),
                Stock = productDto.Stock != null ? new Stock { Quantity = productDto.Stock.Quantity } : null,
                Price = productDto.Price != null ? new Price 
                { 
                    Amount = productDto.Price.Amount,
                    Currency = productDto.Price.Currency,
                    IsPromo = productDto.Price.IsPromo,
                    OldPrice = productDto.Price.OldPrice
                } : null
            };
            try
            {
                // Get all categories
                var categories = await _productService.GetAllCategoriesAsync();
                if (!categories.Any())
                {
                    return BadRequest(new { Message = "No categories found. Please create categories first." });
                }

                var createdProducts = new List<Product>();
                
                foreach (var category in categories)
                {
                    // Create a new product for each category with a deep copy of the data
                    var newProduct = new Product
                    {
                        Name = product.Name,
                        Description = product.Description,
                        BrandId = product.BrandId,
                        CategoryId = category.Id,
                        // Create new collections to avoid reference issues
                        Images = product.Images?.Select(i => new ProductImage { Url = i.Url }).ToList(),
                        Features = product.Features?.Select(f => new ProductFeature 
                        { 
                            Name = f.Name, 
                            Value = f.Value 
                        }).ToList(),
                        // Create new instances to avoid reference issues
                        Stock = product.Stock != null ? new Stock { Quantity = product.Stock.Quantity } : null,
                        Price = product.Price != null ? new Price 
                        { 
                            Amount = product.Price.Amount,
                            Currency = product.Price.Currency,
                            IsPromo = product.Price.IsPromo,
                            OldPrice = product.Price.OldPrice
                        } : null
                    };

                    var created = await _productService.CreateAsync(newProduct);
                    createdProducts.Add(created);
                }

                return Ok(createdProducts);
            }
            catch (Exception ex)
            {
                // Log the error (in a real app, you'd want to use ILogger)
                Console.WriteLine($"Error creating products: {ex}");
                
                return StatusCode(500, new 
                { 
                    Message = "An error occurred while creating the products.",
                    Error = ex.Message
                });
            }
        }
    }
} 