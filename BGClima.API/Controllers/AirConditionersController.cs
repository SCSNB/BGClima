using BGClima.API.Data;
using BGClima.Domain.Entities;
using BGClima.Infrastructure;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BGClima.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AirConditionersController : ControllerBase
    {
        private readonly AppDbContext _context;
        public AirConditionersController(AppDbContext context) { _context = context; }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<AirConditioner>>> GetAll() => await _context.AirConditioners.ToListAsync();

        [HttpGet("{id}")]
        public async Task<ActionResult<AirConditioner>> Get(int id)
        {
            var item = await _context.AirConditioners.FindAsync(id);
            return item == null ? NotFound() : item;
        }

        [HttpPost]
        public async Task<ActionResult<AirConditioner>> Create(AirConditioner obj)
        {
            _context.AirConditioners.Add(obj);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = obj.Id }, obj);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, AirConditioner obj)
        {
            if (id != obj.Id) return BadRequest();
            _context.Entry(obj).State = EntityState.Modified;
            try { await _context.SaveChangesAsync(); }
            catch (DbUpdateConcurrencyException) { if (!_context.AirConditioners.Any(e => e.Id == id)) return NotFound(); else throw; }
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var item = await _context.AirConditioners.FindAsync(id);
            if (item == null) return NotFound();
            _context.AirConditioners.Remove(item);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
