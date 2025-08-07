using BGClima.API.Data;
using BGClima.Domain.Entities;
using BGClima.Infrastructure;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BGClima.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PerformancesController : ControllerBase
    {
        private readonly AppDbContext _context;
        public PerformancesController(AppDbContext context) { _context = context; }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Performance>>> GetAll() => await _context.Performances.ToListAsync();

        [HttpGet("{id}")]
        public async Task<ActionResult<Performance>> Get(int id)
        {
            var item = await _context.Performances.FindAsync(id);
            return item == null ? NotFound() : item;
        }

        [HttpPost]
        public async Task<ActionResult<Performance>> Create(Performance obj)
        {
            _context.Performances.Add(obj);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = obj.Id }, obj);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Performance obj)
        {
            if (id != obj.Id) return BadRequest();
            _context.Entry(obj).State = EntityState.Modified;
            try { await _context.SaveChangesAsync(); }
            catch (DbUpdateConcurrencyException) { if (!_context.Performances.Any(e => e.Id == id)) return NotFound(); else throw; }
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var item = await _context.Performances.FindAsync(id);
            if (item == null) return NotFound();
            _context.Performances.Remove(item);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
