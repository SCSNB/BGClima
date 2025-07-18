using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq.Expressions;

namespace BGClima.Domain.Entities
{
    public interface IRepository<T> where T : class
    {
        Task<T?> GetByIdAsync(int id);
        Task<IEnumerable<T>> GetAllAsync();
        Task AddAsync(T entity);
        void Update(T entity);
        void Delete(T entity);
        Task SaveChangesAsync();
    }
} 