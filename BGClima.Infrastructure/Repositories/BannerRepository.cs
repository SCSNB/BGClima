using Microsoft.EntityFrameworkCore;
using BGClima.Domain.Entities;
using BGClima.Domain.Interfaces;
using BGClima.Infrastructure.Data;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BGClima.Infrastructure.Repositories
{
    public class BannerRepository : IBannerRepository
    {
        private readonly BGClimaContext _context;

        public BannerRepository(BGClimaContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Banner>> GetAllBannersAsync()
        {
            return await _context.Banners
                .OrderBy(b => b.DisplayOrder)
                .ToListAsync();
        }

        public async Task<IEnumerable<Banner>> GetActiveBannersByTypeAsync(BannerType type)
        {
            return await _context.Banners
                .Where(b => b.Type == type && b.IsActive)
                .OrderBy(b => b.DisplayOrder)
                .ToListAsync();
        }

        public async Task<Banner> GetBannerByIdAsync(int id)
        {
            return await _context.Banners.FindAsync(id);
        }

        public async Task AddBannerAsync(Banner banner)
        {
            await _context.Banners.AddAsync(banner);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateBannerAsync(Banner banner)
        {
            _context.Banners.Update(banner);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteBannerAsync(int id)
        {
            var banner = await _context.Banners.FindAsync(id);
            if (banner != null)
            {
                _context.Banners.Remove(banner);
                await _context.SaveChangesAsync();
            }
        }
    }
}
