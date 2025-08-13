using System.Collections.Generic;
using System.Threading.Tasks;
using BGClima.API.DTOs;
using BGClima.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BGClima.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EnergyClassController : ControllerBase
    {
        private readonly BGClimaContext _context;

        public EnergyClassController(BGClimaContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<EnergyClassDto>>> GetEnergyClasses()
        {
            try
            {
                Console.WriteLine("Fetching energy classes from database...");
                var energyClasses = await _context.EnergyClasses
                    .Select(ec => new EnergyClassDto
                    {
                        Id = ec.Id,
                        Class = ec.Class
                    })
                    .ToListAsync();

                Console.WriteLine($"Found {energyClasses.Count} energy classes");
                return Ok(energyClasses);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching energy classes: {ex.Message}");
                Console.WriteLine(ex.StackTrace);
                throw;
            }
        }
    }
}
