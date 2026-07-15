import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { productService, cartService } from "../../application/services";
import { addLocalCartItem } from "../../utils/cartLocal";
import { notifySuccess, notifyError } from "../../application/services/notify";

const ProductListPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const idFilter = (searchParams.get("ids") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map(Number)
    .filter((n) => !Number.isNaN(n));

  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const categories = ["All", "Sofa", "Bàn", "Ghế", "Kệ", "Đèn", "Giường"];

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterData();
  }, [search, category, products, searchParams]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await productService.getAll();
      const list = (res.data || []).map((p) => ({
        ...p,
        image: p.image || p.imageUrl,
        category: p.categoryName || p.category || "",
      }));
      setProducts(list);
    } catch (err) {
      console.error(err);
      setProducts([]);
      notifyError("Không tải được sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    let data = [...products];
    if (idFilter.length > 0) {
      data = data.filter((p) => idFilter.includes(Number(p.id)));
    }
    if (category !== "All") {
      data = data.filter(
        (p) => (p.category || "").includes(category) || p.category === category
      );
    }
    if (search) {
      const q = search.toLowerCase();
      data = data.filter((p) => (p.name || "").toLowerCase().includes(q));
    }
    setFiltered(data);
    setCurrentPage(1);
  };

  const clearIdFilter = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("ids");
    setSearchParams(next);
  };

  const addToCart = async (product) => {
    addLocalCartItem(product, 1);
    cartService
      .add({ productId: product.id, quantity: 1 })
      .catch(() => {});
    notifySuccess(`Đã thêm "${product.name}" vào giỏ`);
  };

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const currentProducts = filtered.slice(startIndex, startIndex + pageSize);

  return (
    <div className="product-list-page page">
      <h2>Sản phẩm</h2>

      {idFilter.length > 0 && (
        <div className="product-design-filter">
          <span>
            Đang lọc {idFilter.length} sản phẩm từ concept thiết kế
          </span>
          <button type="button" className="btn-ghost" onClick={clearIdFilter}>
            Xóa bộ lọc
          </button>
        </div>
      )}

      <div className="toolbar">
        <input
          type="text"
          placeholder="Tìm sản phẩm..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c === "All" ? "Tất cả" : c}
            </option>
          ))}
        </select>
        <button type="button" onClick={fetchProducts}>
          Tải lại
        </button>
      </div>

      {loading && <p>Đang tải sản phẩm...</p>}

      <div className="grid">
        {!loading &&
          currentProducts.map((p) => (
            <div key={p.id} className="card">
              <img
                src={p.image}
                alt={p.name}
                onClick={() => navigate(`/products/${p.id}`)}
                onError={(e) => {
                  e.currentTarget.src =
                    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=60";
                }}
              />
              <h3>{p.name}</h3>
              <p className="price">
                {Number(p.price || 0).toLocaleString("vi-VN")} ₫
              </p>
              <div className="actions">
                <button type="button" onClick={() => addToCart(p)}>
                  Thêm giỏ
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/products/${p.id}`)}
                >
                  Xem
                </button>
              </div>
            </div>
          ))}
      </div>

      {!loading && currentProducts.length === 0 && (
        <p style={{ textAlign: "center", color: "var(--muted)" }}>
          Không tìm thấy sản phẩm
        </p>
      )}

      <div className="pagination">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => setCurrentPage((p) => p - 1)}
        >
          Trước
        </button>
        <span>
          Trang {currentPage} / {totalPages}
        </span>
        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
        >
          Sau
        </button>
      </div>
    </div>
  );
};

export default ProductListPage;
