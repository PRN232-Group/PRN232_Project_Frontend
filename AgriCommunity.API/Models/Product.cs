namespace AgriCommunity.API.Models
{
    public class Product
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty; // Tạm thời dùng link ảnh cho đơn giản
        public double Quantity { get; set; }
        public decimal Price { get; set; }
        public string Region { get; set; } = string.Empty; // Khu vực
        public string Season { get; set; } = string.Empty; // Mùa vụ
        public string ProductType { get; set; } = string.Empty; // Loại sản phẩm
    }
}