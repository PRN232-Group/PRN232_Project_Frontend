import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { productService, cartService } from "../../application/services";
import { notifySuccess, notifyError } from "../../application/services/notify";
import { isProductInStock } from "../../domain/roles";

const ProductSearchPage = () => {
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    const delay = setTimeout(() => {
      if (keyword.trim()) {
        searchProducts();
      } else {
        setProducts([]);
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [keyword]);

  const searchProducts = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await productService.search(keyword);
      const list = (res.data || []).map((p) => ({
        ...p,
        image: p.image || p.imageUrl,
        inStock: isProductInStock(p),
      }));
      setProducts(list);
      setCurrentPage(1);
    } catch {
      setProducts([]);
      setError("Không tìm được sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product) => {
    try {
      if (!isProductInStock(product)) {
        notifyError(`«${product.name}» đã hết hàng`);
        return;
      }
      await cartService.add({
        productId: product.id,
        quantity: 1,
      });
      notifySuccess("Đã thêm vào giỏ hàng!");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Thêm vào giỏ hàng thất bại";
      notifyError(msg);
      if (/hết hàng/i.test(msg) && !/chỉ còn đủ/i.test(msg)) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === product.id ? { ...p, inStock: false, stock: 0 } : p
          )
        );
      }
      await searchProducts();
    }
  };

  const totalPages = Math.ceil(products.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const currentProducts = products.slice(startIndex, startIndex + pageSize);

  const changePage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div className="product-search-page page">
      <h2>Tìm sản phẩm</h2>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Nhập tên sản phẩm..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      {loading && <p>Đang tìm...</p>}
      {error && <p className="error">{error}</p>}

      <div className="grid">
        {currentProducts.map((p) => {
          const inStock = isProductInStock(p);
          return (
            <div
              key={p.id}
              className={`card${inStock ? "" : " is-out-of-stock"}`}
            >
              <div className="card-media">
                <img
                  src={p.image}
                  alt={p.name}
                  onClick={() => navigate(`/products/${p.id}`)}
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=60";
                  }}
                />
                {!inStock ? (
                  <span className="stock-badge is-out">Hết hàng</span>
                ) : (
                  <span className="stock-badge is-ok">
                    Còn {Number(p.stock)}
                  </span>
                )}
              </div>
              <h3>{p.name}</h3>
              <p className="price">
                {Number(p.price || 0).toLocaleString("vi-VN")} ₫
              </p>
              <p className="stock-line">
                {inStock
                  ? `Còn ${Number(p.stock)} sản phẩm`
                  : "Tạm hết hàng"}
              </p>
              <div className="actions">
                <button
                  type="button"
                  disabled={!inStock}
                  onClick={() => addToCart(p)}
                >
                  {inStock ? "Thêm giỏ" : "Hết hàng"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/products/${p.id}`)}
                >
                  Xem
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {!loading && keyword && products.length === 0 && (
        <p>Không tìm thấy sản phẩm</p>
      )}

      {products.length > 0 && (
        <div className="pagination">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => changePage(currentPage - 1)}
          >
            Trước
          </button>
          <span>
            Trang {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => changePage(currentPage + 1)}
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductSearchPage;
