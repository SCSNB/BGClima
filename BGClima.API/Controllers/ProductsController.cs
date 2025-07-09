// Developers: Create the Views/Products folder and add Index.cshtml, Details.cshtml, Create.cshtml, Edit.cshtml, and Delete.cshtml views for this controller.
// This controller has been converted from an API controller to an MVC controller with views.
using BGClima.Application.Services;
using BGClima.Domain.Entities;
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

        // GET: /Products
        // View: Views/Products/Index.cshtml
        public async Task<IActionResult> Index()
        {
            var products = await _productService.GetAllAsync();
            return View(products);
        }

        // GET: /Products/Details/5
        // View: Views/Products/Details.cshtml
        public async Task<IActionResult> Details(int id)
        {
            var product = await _productService.GetProductWithDetailsAsync(id);
            if (product == null) return NotFound();
            return View(product);
        }

        // GET: /Products/Create
        // View: Views/Products/Create.cshtml
        public IActionResult Create()
        {
            return View();
        }

        // POST: /Products/Create
        // View: Views/Products/Create.cshtml
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(Product product)
        {
            if (ModelState.IsValid)
            {
                var created = await _productService.CreateAsync(product);
                return RedirectToAction(nameof(Details), new { id = created.Id });
            }
            return View(product);
        }

        // GET: /Products/Edit/5
        // View: Views/Products/Edit.cshtml
        public async Task<IActionResult> Edit(int id)
        {
            var product = await _productService.GetProductWithDetailsAsync(id);
            if (product == null) return NotFound();
            return View(product);
        }

        // POST: /Products/Edit/5
        // View: Views/Products/Edit.cshtml
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, Product product)
        {
            if (id != product.Id) return BadRequest();
            if (ModelState.IsValid)
            {
                await _productService.UpdateAsync(product);
                return RedirectToAction(nameof(Details), new { id = product.Id });
            }
            return View(product);
        }

        // GET: /Products/Delete/5
        // View: Views/Products/Delete.cshtml
        public async Task<IActionResult> Delete(int id)
        {
            var product = await _productService.GetProductWithDetailsAsync(id);
            if (product == null) return NotFound();
            return View(product);
        }

        // POST: /Products/Delete/5
        // View: Views/Products/Delete.cshtml
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            await _productService.DeleteAsync(id);
            return RedirectToAction(nameof(Index));
        }

        // API: GET /api/products
        [HttpGet("/api/products")]
        [Produces("application/json")]
        public async Task<IActionResult> GetAllProductsApi()
        {
            var products = await _productService.GetAllAsync();
            return Ok(products);
        }
    }
} 