using BGClima.API.Data;
using BGClima.Domain.Entities;
using BGClima.Infrastructure;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BGClima.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AirFlowsController : ControllerBase
    {
        private readonly AppDbContext _context;
        public AirFlowsController(AppDbContext context) { _context = context; }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<AirFlow>>> GetAll() => await _context.AirFlows.ToListAsync();

        [HttpGet("{id}")]
        public async Task<ActionResult<AirFlow>> Get(int id)
        {
            var item = await _context.AirFlows.FindAsync(id);
            return item == null ? NotFound() : item;
        }

        [HttpPost]
        public async Task<ActionResult<AirFlow>> Create(AirFlow obj)
        {
            _context.AirFlows.Add(obj);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = obj.Id }, obj);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, AirFlow obj)
        {
            if (id != obj.Id) return BadRequest();
            _context.Entry(obj).State = EntityState.Modified;
            try { await _context.SaveChangesAsync(); }
            catch (DbUpdateConcurrencyException) { if (!_context.AirFlows.Any(e => e.Id == id)) return NotFound(); else throw; }
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var item = await _context.AirFlows.FindAsync(id);
            if (item == null) return NotFound();
            _context.AirFlows.Remove(item);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
