using AutoMapper;
using BGClima.API.DTOs;
using BGClima.Application.Services;
using BGClima.Domain.Entities;
using BGClima.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;

namespace BGClima.API.Controllers
{
    [Route("api/products")]
    [ApiController]
    public class ProductController : ControllerBase
    {
        private readonly BGClimaContext _context;
        private readonly IMapper _mapper;
        private readonly IProductService _productService;

        public ProductController(BGClimaContext context, IMapper mapper, IProductService productService)
        {
            _context = context;
            _mapper = mapper;
            _productService = productService;
        }

        // GET: api/products
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductDto>>> GetProducts(
            [FromQuery] int[]? brandIds = null,
            [FromQuery] int? productTypeId = null,
            [FromQuery] int[]? energyClassIds = null,
            [FromQuery] int[]? btuIds = null,
            [FromQuery] bool? isFeatured = null,
            [FromQuery] bool? isOnSale = null,
            [FromQuery] bool? isNew = null,
            [FromQuery] decimal? minPrice = null,
            [FromQuery] decimal? maxPrice = null,
            [FromQuery] double[]? MaxHatingPowers = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 18,
            [FromQuery] string? sortBy = "name",
            [FromQuery] string? sortOrder = "asc")
        {
            try
            {
                var query = _context.Products
                    .Where(p => p.IsActive)
                    .Include(p => p.BTU)
                    .Include(p => p.EnergyClass)
                    .Include(p => p.Brand)
                    .Include(p => p.Attributes.Where(a => a.AttributeKey.Contains("мощност") || a.AttributeKey.Contains("Енергиен") || a.AttributeKey.Contains("Wi-Fi")))
                    .AsQueryable();

                // Филтриране
                if (brandIds != null && brandIds.Any())
                    query = query.Where(p => brandIds.Contains(p.BrandId));

                if (productTypeId.HasValue)
                    query = query.Where(p => p.ProductTypeId == productTypeId);

                if (isFeatured.HasValue)
                    query = query.Where(p => p.IsFeatured == isFeatured);

                if (isOnSale.HasValue)
                    query = query.Where(p => p.IsOnSale == isOnSale);

                if (isNew.HasValue)
                    query = query.Where(p => p.IsNew == isNew);

                // Филтриране по енергиен клас
                if (energyClassIds != null && energyClassIds.Any())
                {
                    query = query.Where(p => p.EnergyClassId.HasValue && energyClassIds.Contains(p.EnergyClassId.Value));
                }

                // Филтриране по BTU ID-та
                if (btuIds != null && btuIds.Any())
                {
                    query = query.Where(p => p.BTUId.HasValue && btuIds.Contains(p.BTUId.Value));
                }

                // Филтриране по цена
                if (minPrice.HasValue && minPrice >= 0)
                    query = query.Where(p => p.Price >= minPrice.Value);

                if (maxPrice.HasValue && maxPrice > 0)
                    query = query.Where(p => p.Price <= maxPrice.Value);

                // Сортиране
                query = sortBy?.ToLower() switch
                {
                    "price" => sortOrder?.ToLower() == "desc" ?
                        query.OrderByDescending(p => p.Price) :
                        query.OrderBy(p => p.Price),
                    _ => sortOrder?.ToLower() == "desc" ?
                        query.OrderByDescending(p => p.Name) :
                        query.OrderBy(p => p.Name),
                };

                if (MaxHatingPowers != null && MaxHatingPowers.Any())
                {
                    query = query.Where(p =>
                        p.Attributes.Any(a =>
                            a.AttributeKey.Contains("Отдавана мощност на отопление") &&
                            MaxHatingPowers.Any(m =>
                                BGClimaContext.GetMaxHeatingPowerSql(a.AttributeValue).GetValueOrDefault() >= m
                            )
                        )
                    );
                }

                // Брой на всички продукти след филтрирането
                var totalCount = await query.CountAsync();

                // Прилагане на пагинация
                var products = await query
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                // Връщаме заедно с метаданни за пагинацията
                var result = new
                {
                    TotalCount = totalCount,
                    PageSize = pageSize,
                    CurrentPage = page,
                    TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize),
                    Items = _mapper.Map<List<ProductDto>>(products)
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Възникна грешка при извличане на продуктите.", Error = ex.Message });
            }
        }

        // Add this new endpoint to ProductController.cs
        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<ProductDto>>> SearchProducts([FromQuery] string searchTerm)
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
            {
                return BadRequest("Search term is required.");
            }

            try
            {
                var products = await _context.Products
                    .Include(p => p.Brand)
                    .Where(p => p.IsActive && p.Name.ToLower().Contains(searchTerm))
                    .OrderBy(p => p.Name)
                    .ToListAsync();

               var productDTOs = _mapper.Map<List<ProductDto>>(products);

                return Ok(productDTOs);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "An error occurred while searching for products.", Error = ex.Message });
            }
        }

        // GET: api/products/admin
        [HttpGet("admin")]
        public async Task<ActionResult<IEnumerable<ProductDto>>> GetProductsForAdmin(
            [FromQuery] string? searchTerm = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 18)
        {
            try
            {
                var query = _context.Products
                    .Include(p => p.Brand)
                    .Include(p => p.BTU)
                    .Include(p => p.EnergyClass)
                    .Include(p => p.ProductType)
                    .Include(p => p.Attributes)
                    .Include(p => p.Images)
                    .AsQueryable();

                if (!string.IsNullOrWhiteSpace(searchTerm))
                {
                    searchTerm = searchTerm.Trim().ToLower();
                    query = query.Where(p =>
                        p.Name.ToLower().Contains(searchTerm) ||
                        (p.Description != null && p.Description.ToLower().Contains(searchTerm)) ||
                        (p.Sku != null && p.Sku.ToLower().Contains(searchTerm))
                    );
                }

                var totalCount = await query.CountAsync();

                var products = await query
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                var result = new
                {
                    TotalCount = totalCount,
                    PageSize = pageSize,
                    CurrentPage = page,
                    TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize),
                    Items = _mapper.Map<List<ProductDto>>(products)
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Възникна грешка при извличане на продуктите за администрация.", Error = ex.Message });
            }
        }

        [HttpGet("category/{categoryName}")]
        public async Task<IActionResult> GetProductsByCategory(string categoryName)
        {
            var products = await _productService.GetProductsByCategoryAsync(categoryName);
            var productDtos = _mapper.Map<IEnumerable<ProductDto>>(products);
            return Ok(productDtos);
        }

        // GET: api/products/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ProductDto>> GetProduct(int id)
        {
            try
            {
                var product = await _context.Products
                    .Include(p => p.Brand)
                    .Include(p => p.BTU)
                    .Include(p => p.EnergyClass)
                    .Include(p => p.ProductType)
                    .Include(p => p.Attributes)
                    .Include(p => p.Images)
                    .FirstOrDefaultAsync(p => p.Id == id);

                if (product == null)
                {
                    return NotFound(new { Message = $"Продукт с ID {id} не е намерен." });
                }

                return Ok(_mapper.Map<ProductDto>(product));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = $"Грешка при извличане на продукт с ID {id}.", Error = ex.Message });
            }
        }

        // POST: api/products
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<ProductDto>> CreateProduct([FromBody] CreateProductDto createProductDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var product = _mapper.Map<Product>(createProductDto);
                // Автоматично определяне на активност по наличност
                product.IsActive = product.StockQuantity > 0;

                // Ensure collections
                product.Attributes ??= new List<ProductAttribute>();
                product.Images ??= new List<ProductImage>();

                // Attach back-references and add to context
                foreach (var attr in product.Attributes)
                {
                    attr.Product = product;
                }
                foreach (var img in product.Images)
                {
                    img.Product = product;
                }

                _context.Products.Add(product);
                await _context.SaveChangesAsync();

                var productDto = _mapper.Map<ProductDto>(product);
                return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, productDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Грешка при създаване на продукт.", Error = ex.Message });
            }
        }

        // PUT: api/products/5
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateProduct(int id, [FromBody] CreateProductDto updateProductDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var existingProduct = await _context.Products
                    .Include(p => p.Attributes)
                    .Include(p => p.Images)
                    .FirstOrDefaultAsync(p => p.Id == id);

                if (existingProduct == null)
                {
                    return NotFound(new { Message = $"Продукт с ID {id} не е намерен." });
                }

                // Мапване на основните данни от DTO към съществуващия продукт (без колекции)
                existingProduct.Name = updateProductDto.Name;
                existingProduct.Description = updateProductDto.Description;
                existingProduct.Price = updateProductDto.Price;
                existingProduct.OldPrice = updateProductDto.OldPrice;
                existingProduct.StockQuantity = updateProductDto.StockQuantity;
                // Автоматично определяне на активност по наличност
                existingProduct.IsActive = existingProduct.StockQuantity > 0;
                // Явно маркираме полето като променено, за да се изпише в UPDATE
                _context.Entry(existingProduct).Property(p => p.IsActive).IsModified = true;
                existingProduct.IsOnSale = updateProductDto.IsOnSale;
                existingProduct.IsNew = updateProductDto.IsNew;
                existingProduct.IsFeatured = updateProductDto.IsFeatured;
                existingProduct.Sku = updateProductDto.Sku;
                existingProduct.ImageUrl = updateProductDto.ImageUrl;
                existingProduct.BrandId = updateProductDto.BrandId;
                existingProduct.ProductTypeId = updateProductDto.ProductTypeId;
                existingProduct.BTUId = updateProductDto.BTUId;
                existingProduct.EnergyClassId = updateProductDto.EnergyClassId;

                // Обновяване на атрибутите
                if (updateProductDto.Attributes != null)
                {
                    // Изтриваме старите атрибути
                    _context.ProductAttributes.RemoveRange(existingProduct.Attributes);

                    // Създаваме нови атрибути ръчно
                    var newAttributes = new List<ProductAttribute>();
                    foreach (var attrDto in updateProductDto.Attributes)
                    {
                        var newAttr = new ProductAttribute
                        {
                            ProductId = existingProduct.Id,
                            Product = existingProduct,
                            AttributeKey = attrDto.AttributeKey,
                            AttributeValue = attrDto.AttributeValue,
                            GroupName = attrDto.GroupName,
                            DisplayOrder = attrDto.DisplayOrder,
                            IsVisible = attrDto.IsVisible
                        };

                        _context.ProductAttributes.Add(newAttr);
                        newAttributes.Add(newAttr);
                    }
                    existingProduct.Attributes = newAttributes;
                }

                // Обновяване на изображенията
                if (updateProductDto.Images != null)
                {
                    // Изтриваме старите изображения
                    _context.ProductImages.RemoveRange(existingProduct.Images);

                    // Създаваме нови изображения
                    var newImages = _mapper.Map<List<ProductImage>>(updateProductDto.Images);
                    foreach (var img in newImages)
                    {
                        img.ProductId = existingProduct.Id;
                        img.Product = existingProduct;
                        _context.ProductImages.Add(img);
                    }
                    existingProduct.Images = newImages;
                }

                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = $"Грешка при актуализиране на продукт с ID {id}.", Error = ex.Message });
            }
        }

        // DELETE: api/products/5
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            try
            {
                var product = await _context.Products.FindAsync(id);
                if (product == null)
                {
                    return NotFound(new { Message = $"Продукт с ID {id} не е намерен." });
                }

                _context.Products.Remove(product);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = $"Грешка при изтриване на продукт с ID {id}.", Error = ex.Message });
            }
        }

        // GET: api/products/brands
        [HttpGet("brands")]
        public async Task<ActionResult<IEnumerable<BrandDto>>> GetBrands()
        {
            try
            {
                var brands = await _context.Brands.ToListAsync();
                return Ok(_mapper.Map<List<BrandDto>>(brands));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Грешка при извличане на марките.", Error = ex.Message });
            }
        }

        // GET: api/products/types
        [HttpGet("types")]
        public async Task<ActionResult<IEnumerable<ProductTypeDto>>> GetProductTypes()
        {
            try
            {
                var types = await _context.ProductTypes.ToListAsync();
                return Ok(_mapper.Map<List<ProductTypeDto>>(types));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Грешка при извличане на типовете продукти.", Error = ex.Message });
            }
        }

        // GET: api/products/btu
        [HttpGet("btu")]
        public async Task<ActionResult<IEnumerable<BTUInfoDto>>> GetBTU()
        {
            try
            {
                var btu = await _context.BTUs.ToListAsync();
                return Ok(_mapper.Map<List<BTUInfoDto>>(btu));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Грешка при извличане на BTU стойностите.", Error = ex.Message });
            }
        }

        // GET: api/products/admin/stats
        [HttpGet("admin/stats")]
        public async Task<ActionResult<object>> GetAdminStats()
        {
            try
            {
                var totalProducts = await _context.Products.CountAsync();
                var activeProducts = await _context.Products.CountAsync(p => p.IsActive);
                var featuredProducts = await _context.Products.CountAsync(p => p.IsFeatured);
                var onSaleProducts = await _context.Products.CountAsync(p => p.IsOnSale);
                var newProducts = await _context.Products.CountAsync(p => p.IsNew);
                var lowStockProducts = await _context.Products.CountAsync(p => p.StockQuantity <= 5 && p.StockQuantity > 0);
                var outOfStockProducts = await _context.Products.CountAsync(p => p.StockQuantity == 0);

                var stats = new
                {
                    totalProducts,
                    activeProducts,
                    featuredProducts,
                    onSaleProducts,
                    newProducts,
                    lowStockProducts,
                    outOfStockProducts,
                    totalBrands = await _context.Brands.CountAsync(),
                    totalProductTypes = await _context.ProductTypes.CountAsync()
                };

                return Ok(stats);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Грешка при извличане на статистиката.", Error = ex.Message });
            }
        }
    }
}
