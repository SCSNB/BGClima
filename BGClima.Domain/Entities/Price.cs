namespace BGClima.Domain.Entities
{
    public class Price
    {
        public int Id { get; set; }
        public int? ProductId { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "EUR";
        public Product? Product { get; set; }
public decimal PriceValue { get; set; }
public decimal? OldPrice { get; set; }
public bool IsPromo { get; set; }
public DateTime? ValidFrom { get; set; }
public DateTime? ValidTo { get; set; }
    }
} 