using BGClima.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BGClima.Domain.Interfaces
{
    public interface IBannerRepository
    {
        Task<IEnumerable<Banner>> GetAllBannersAsync();
        Task<IEnumerable<Banner>> GetActiveBannersByTypeAsync(BannerType type);
        Task<Banner> GetBannerByIdAsync(int id);
        Task AddBannerAsync(Banner banner);
        Task UpdateBannerAsync(Banner banner);
        Task DeleteBannerAsync(int id);
    }
}
