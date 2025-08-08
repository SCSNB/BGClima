using AutoMapper;
using BGClima.API.Data;
using BGClima.API.DTOs;
using BGClima.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BGClima.API.Controllers
{
    [Route("api/v2/[controller]")]
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

                // Мапване на данните от DTO към съществуващия продукт
                _mapper.Map(updateProductDto, existingProduct);
                existingProduct.UpdatedAt = DateTime.UtcNow;

                // Обновяване на атрибутите
                if (updateProductDto.Attributes != null)
                {
                    _context.ProductAttributes.RemoveRange(existingProduct.Attributes);
                    existingProduct.Attributes = _mapper.Map<List<ProductAttribute>>(updateProductDto.Attributes);
                }

                // Обновяване на изображенията
                if (updateProductDto.Images != null)
                {
                    _context.ProductImages.RemoveRange(existingProduct.Images);
                    existingProduct.Images = _mapper.Map<List<ProductImage>>(updateProductDto.Images);
                }

                _context.Entry(existingProduct).State = EntityState.Modified;
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
    }
}
