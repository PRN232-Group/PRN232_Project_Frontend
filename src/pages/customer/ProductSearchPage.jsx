import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { productService, cartService } from "../../application/services";
import { notifySuccess, notifyError, notifyInfo, notifyWarn } from "../../application/services/notify";

const ProductSearchPage = () => {
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    const delay = setTimeout(() => {
      if (keyword.trim()) {
        searchProducts();
      } else {
        setProducts([]);
      }
    }, 400); // debounce

    return () => clearTimeout(delay);
  }, [keyword]);

  const searchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await productService.search(keyword);

      setProducts(res.data || []);
      setCurrentPage(1);
    } catch (err) {
      console.error(err);

      // fallback demo
      setProducts([
        {
          id: 1,
          name: "Modern Sofa",
          price: 5000000,
          image:
            "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product) => {
    try {
      await cartService.add({
        productId: product.id,
        quantity: 1,
      });

      notifySuccess("Đã thêm vào giỏ hàng!");
    } catch (err) {
      console.error(err);
      notifyError("Thêm vào giỏ hàng thất bại");
    }
  };

  // pagination
  const totalPages = Math.ceil(products.length / pageSize);

  const startIndex = (currentPage - 1) * pageSize;
  const currentProducts = products.slice(
    startIndex,
    startIndex + pageSize
  );

  const changePage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="product-search-page">
      <h2>Search Products</h2>

      {/* SEARCH BAR */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search products..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      {/* STATUS */}
      {loading && <p>Searching...</p>}
      {error && <p className="error">{error}</p>}

      {/* RESULTS */}
      <div className="grid">
        {currentProducts.map((p) => (
          <div key={p.id} className="card">
            <img
              src={p.image}
              alt={p.name}
              onClick={() => navigate(`/products/${p.id}`)}
            />

            <h3>{p.name}</h3>

            <p className="price">
              {p.price?.toLocaleString()} đ
            </p>

            <div className="actions">
              <button onClick={() => addToCart(p)}>
                Add to Cart
              </button>

              <button
                onClick={() => navigate(`/products/${p.id}`)}
              >
                View
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* EMPTY STATE */}
      {!loading && keyword && products.length === 0 && (
        <p>No products found</p>
      )}

      {/* PAGINATION */}
      {products.length > 0 && (
        <div className="pagination">
          <button onClick={() => changePage(currentPage - 1)}>
            Prev
          </button>

          <span>
            Page {currentPage} / {totalPages || 1}
          </span>

          <button onClick={() => changePage(currentPage + 1)}>
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductSearchPage;
