using BGClima.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace BGClima.API.Controllers
{
    public class ProductsController : Controller
    {
        private readonly IProductService _productService;

        public ProductsController(IProductService productService)
        {
            _productService = productService;
        }


        [HttpGet("/api/products")]
        [Produces("application/json")]
        public async Task<IActionResult> GetAllProductsApi()
        {
            var products = await _productService.GetAllAsync();
            return Ok(products);
        }
    }
} 