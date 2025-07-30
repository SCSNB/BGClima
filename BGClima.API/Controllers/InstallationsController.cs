using BGClima.API.Data;
using BGClima.Domain.Entities;
using BGClima.Infrastructure;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BGClima.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InstallationsController : ControllerBase
    {
        private readonly AppDbContext _context;
        public InstallationsController(AppDbContext context) { _context = context; }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Installation>>> GetAll() => await _context.Installations.ToListAsync();

        [HttpGet("{id}")]
        public async Task<ActionResult<Installation>> Get(int id)
        {
            var item = await _context.Installations.FindAsync(id);
            return item == null ? NotFound() : item;
        }

        [HttpPost]
        public async Task<ActionResult<Installation>> Create(Installation obj)
        {
            _context.Installations.Add(obj);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = obj.Id }, obj);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Installation obj)
        {
            if (id != obj.Id) return BadRequest();
            _context.Entry(obj).State = EntityState.Modified;
            try { await _context.SaveChangesAsync(); }
            catch (DbUpdateConcurrencyException) { if (!_context.Installations.Any(e => e.Id == id)) return NotFound(); else throw; }
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var item = await _context.Installations.FindAsync(id);
            if (item == null) return NotFound();
            _context.Installations.Remove(item);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
