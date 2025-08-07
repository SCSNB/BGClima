using BGClima.API.Data;
using BGClima.Domain.Entities;
using BGClima.Infrastructure;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BGClima.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SpecificationsController : ControllerBase
    {
        private readonly AppDbContext _context;
        public SpecificationsController(AppDbContext context) { _context = context; }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Specification>>> GetAll() => await _context.Specifications.ToListAsync();

        [HttpGet("{id}")]
        public async Task<ActionResult<Specification>> Get(int id)
        {
            var item = await _context.Specifications.FindAsync(id);
            return item == null ? NotFound() : item;
        }

        [HttpPost]
        public async Task<ActionResult<Specification>> Create(Specification obj)
        {
            _context.Specifications.Add(obj);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = obj.Id }, obj);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Specification obj)
        {
            if (id != obj.Id) return BadRequest();
            _context.Entry(obj).State = EntityState.Modified;
            try { await _context.SaveChangesAsync(); }
            catch (DbUpdateConcurrencyException) { if (!_context.Specifications.Any(e => e.Id == id)) return NotFound(); else throw; }
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var item = await _context.Specifications.FindAsync(id);
            if (item == null) return NotFound();
            _context.Specifications.Remove(item);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
