using AutoMapper;
using BGClima.API.DTOs;
using BGClima.Domain.Entities;
using BGClima.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BGClima.API.Controllers
{
    [Route("api/v2/products")]
    [ApiController]
    public class ProductsV2Controller : ControllerBase
    {
        private readonly BGClimaContext _context;
        private readonly IMapper _mapper;

        public ProductsV2Controller(BGClimaContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        // GET: api/v2/products
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductDto>>> GetProducts(
            [FromQuery] int? brandId = null,
            [FromQuery] int? productTypeId = null,
            [FromQuery] bool? isFeatured = null,
            [FromQuery] bool? isOnSale = null,
            [FromQuery] bool? isNew = null)
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

                // Филтриране
                if (brandId.HasValue)
                    query = query.Where(p => p.BrandId == brandId);

                if (productTypeId.HasValue)
                    query = query.Where(p => p.ProductTypeId == productTypeId);

                if (isFeatured.HasValue)
                    query = query.Where(p => p.IsFeatured == isFeatured);

                if (isOnSale.HasValue)
                    query = query.Where(p => p.IsOnSale == isOnSale);

                if (isNew.HasValue)
                    query = query.Where(p => p.IsNew == isNew);

                var products = await query.ToListAsync();
                return Ok(_mapper.Map<List<ProductDto>>(products));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Възникна грешка при извличане на продуктите.", Error = ex.Message });
            }
        }

        // GET: api/v2/products/5
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

        // POST: api/v2/products
        [HttpPost]
        public async Task<ActionResult<ProductDto>> CreateProduct([FromBody] CreateProductDto createProductDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var product = _mapper.Map<Product>(createProductDto);
                product.CreatedAt = DateTime.UtcNow;
                product.UpdatedAt = DateTime.UtcNow;

                // Ensure collections
                product.Attributes ??= new List<ProductAttribute>();
                product.Images ??= new List<ProductImage>();

                // Attach back-references and add to context
                foreach (var attr in product.Attributes)
                {
                    attr.Product = product;
                    attr.CreatedAt = DateTime.UtcNow;
                    attr.UpdatedAt = DateTime.UtcNow;
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

        // PUT: api/v2/products/5
        [HttpPut("{id}")]
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
                existingProduct.IsOnSale = updateProductDto.IsOnSale;
                existingProduct.IsNew = updateProductDto.IsNew;
                existingProduct.IsFeatured = updateProductDto.IsFeatured;
                existingProduct.Sku = updateProductDto.Sku;
                existingProduct.ImageUrl = updateProductDto.ImageUrl;
                existingProduct.BrandId = updateProductDto.BrandId;
                existingProduct.ProductTypeId = updateProductDto.ProductTypeId;
                existingProduct.BTUId = updateProductDto.BTUId;
                existingProduct.EnergyClassId = updateProductDto.EnergyClassId;
                existingProduct.UpdatedAt = DateTime.UtcNow;

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
                            IsVisible = attrDto.IsVisible,
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
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

        // DELETE: api/v2/products/5
        [HttpDelete("{id}")]
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

        // GET: api/v2/products/brands
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

        // GET: api/v2/products/types
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

        // GET: api/v2/products/btu
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
    }
}
