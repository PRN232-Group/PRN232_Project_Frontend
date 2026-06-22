using AgriCommunity.API.Data;
using AgriCommunity.API.DTOs;
using AgriCommunity.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AgriCommunity.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly AppDbContext _context;

        // Tiêm (Inject) DbContext vào Controller
        public ProductsController(AppDbContext context)
        {
            _context = context;
        }

        // ==========================================
        // FR3: ĐĂNG BÁN NÔNG SẢN
        // POST: api/products
        // ==========================================
        [HttpPost]
        public async Task<IActionResult> CreateProduct([FromBody] CreateProductDto dto)
        {
            try
            {
                // Chuyển DTO thành Model
                var newProduct = new Product
                {
                    Name = dto.Name,
                    ImageUrl = dto.ImageUrl,
                    Quantity = dto.Quantity,
                    Price = dto.Price,
                    Region = dto.Region,
                    Season = dto.Season,
                    ProductType = dto.ProductType
                };

                // Thêm vào Database
                _context.Products.Add(newProduct);
                await _context.SaveChangesAsync();

                return Ok(new { Message = "Đăng bán nông sản thành công!", Product = newProduct });
            }
            catch (Exception ex)
            {
                // Handle lỗi khi rớt kết nối DB hoặc lỗi hệ thống bất ngờ
                return StatusCode(500, new
                {
                    Message = "Lỗi hệ thống hoặc mất kết nối cơ sở dữ liệu. Vui lòng thử lại sau.",
                    ErrorDetail = ex.Message
                });
            }
        }

        // ==========================================
        // FR4: TÌM KIẾM VÀ LỌC NÔNG SẢN
        // GET: api/products/search?region=Bắc&season=Hè&type=Trái cây
        // ==========================================
        [HttpGet("search")]
        public async Task<IActionResult> SearchProducts(
            [FromQuery] string? region,
            [FromQuery] string? season,
            [FromQuery] string? type)
        {
            try
            {
                // Lấy toàn bộ danh sách chuẩn bị lọc
                var query = _context.Products.AsQueryable();

                // Nếu người dùng có nhập khu vực -> Lọc theo khu vực
                if (!string.IsNullOrEmpty(region))
                {
                    query = query.Where(p => p.Region.Contains(region));
                }

                // Nếu có nhập mùa vụ -> Lọc theo mùa vụ
                if (!string.IsNullOrEmpty(season))
                {
                    query = query.Where(p => p.Season.Contains(season));
                }

                // Nếu có nhập loại sản phẩm -> Lọc theo loại
                if (!string.IsNullOrEmpty(type))
                {
                    query = query.Where(p => p.ProductType.Contains(type));
                }

                var result = await query.ToListAsync();

                if (!result.Any())
                {
                    return NotFound("Không tìm thấy nông sản nào phù hợp.");
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                // Handle lỗi khi rớt kết nối DB
                return StatusCode(500, new
                {
                    Message = "Lỗi hệ thống hoặc mất kết nối cơ sở dữ liệu. Vui lòng thử lại sau.",
                    ErrorDetail = ex.Message
                });
            }
        }
    }
}