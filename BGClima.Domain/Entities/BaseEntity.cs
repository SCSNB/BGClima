using System;

namespace BGClima.Domain.Entities
{
    /// <summary>
    /// Базов клас за всички модели, който съдържа общи полета
    /// </summary>
    public abstract class BaseEntity
    {
        /// <summary>
        /// Уникален идентификатор на обекта
        /// </summary>
        public int Id { get; set; }
        
        /// <summary>
        /// Дата и час на създаване на записа
        /// </summary>
        public DateTime? CreatedAt { get; set; }
        
        /// <summary>
        /// Дата и час на последна промяна на записа
        /// </summary>
        public DateTime? UpdatedAt { get; set; }
    }
}
