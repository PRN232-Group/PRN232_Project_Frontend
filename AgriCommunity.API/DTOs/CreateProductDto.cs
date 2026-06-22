namespace AgriCommunity.API.DTOs
{
    public class CreateProductDto
    {
        public string Name { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public double Quantity { get; set; }
        public decimal Price { get; set; }
        public string Region { get; set; } = string.Empty;
        public string Season { get; set; } = string.Empty;
        public string ProductType { get; set; } = string.Empty;
    }
}