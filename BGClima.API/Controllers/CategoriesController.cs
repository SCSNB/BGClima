using BGClima.API.Data;
using BGClima.Domain.Entities;
using BGClima.Infrastructure;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BGClima.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriesController : ControllerBase
    {
        private readonly AppDbContext _context;
        public CategoriesController(AppDbContext context) { _context = context; }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Category>>> GetAll() => await _context.Categories.ToListAsync();

        [HttpGet("{id}")]
        public async Task<ActionResult<Category>> Get(int id)
        {
            var item = await _context.Categories.FindAsync(id);
            return item == null ? NotFound() : item;
        }

        [HttpPost]
        public async Task<ActionResult<Category>> Create(Category obj)
        {
            _context.Categories.Add(obj);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = obj.Id }, obj);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Category obj)
        {
            if (id != obj.Id) return BadRequest();
            _context.Entry(obj).State = EntityState.Modified;
            try { await _context.SaveChangesAsync(); }
            catch (DbUpdateConcurrencyException) { if (!_context.Categories.Any(e => e.Id == id)) return NotFound(); else throw; }
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var item = await _context.Categories.FindAsync(id);
            if (item == null) return NotFound();
            _context.Categories.Remove(item);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
