using AgriCommunity.API.Models;
using Microsoft.EntityFrameworkCore;

namespace AgriCommunity.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // Bảng Products trong Database
        public DbSet<Product> Products { get; set; }
    }
}