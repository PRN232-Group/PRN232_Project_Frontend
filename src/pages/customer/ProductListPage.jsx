import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  productService,
  cartService,
  categoryService,
} from "../../application/services";
import { addLocalCartItem } from "../../utils/cartLocal";
import { notifySuccess, notifyError } from "../../application/services/notify";
import { isProductInStock } from "../../domain/roles";
import UserContext from "../../contexts/UserContext";

const ProductListPage = () => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [searchParams, setSearchParams] = useSearchParams();

  const idFilter = (searchParams.get("ids") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map(Number)
    .filter((n) => !Number.isNaN(n));

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("All");
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const categoryOptions = useMemo(
    () => [{ id: "All", name: "Tất cả" }, ...categories],
    [categories]
  );

  useEffect(() => {
    loadPage();
  }, []);

  useEffect(() => {
    filterData();
  }, [search, categoryId, products, searchParams]);

  useEffect(() => {
    if (
      categoryId !== "All" &&
      categories.length > 0 &&
      !categories.some((c) => String(c.id) === String(categoryId))
    ) {
      setCategoryId("All");
    }
  }, [categories, categoryId]);

  const loadPage = async () => {
    try {
      setLoading(true);
      const [pRes, cRes] = await Promise.all([
        productService.getAll(),
        categoryService.getAll().catch(() => ({ data: [] })),
      ]);
      const list = (pRes.data || []).map((p) => ({
        ...p,
        image: p.image || p.imageUrl,
        category: p.categoryName || p.category || "",
        inStock: isProductInStock(p),
      }));
      setProducts(list);
      setCategories(
        (cRes.data || []).map((c) => ({
          id: c.id,
          name: c.name,
        }))
      );
    } catch {
      setProducts([]);
      setCategories([]);
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
    if (categoryId !== "All") {
      const selected = categories.find(
        (c) => String(c.id) === String(categoryId)
      );
      data = data.filter((p) => {
        if (p.categoryId != null && String(p.categoryId) === String(categoryId))
          return true;
        if (selected?.name && (p.category || "") === selected.name) return true;
        return false;
      });
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

  const markOutOfStock = (productId) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, inStock: false, stock: 0 } : p
      )
    );
  };

  const addToCart = async (product) => {
    if (!isProductInStock(product)) {
      notifyError(`«${product.name}» đã hết hàng`);
      return;
    }
    if (!user) {
      notifyError("Vui lòng đăng nhập để thêm vào giỏ (kiểm tra tồn kho)");
      navigate("/login", { state: { from: "/products" } });
      return;
    }

    setAddingId(product.id);
    try {
      await cartService.add({ productId: product.id, quantity: 1 });
      addLocalCartItem(product, 1);
      notifySuccess(`Đã thêm «${product.name}» vào giỏ`);
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Không thêm được vào giỏ";
      notifyError(msg);
      if (/hết hàng/i.test(msg) && !/chỉ còn đủ/i.test(msg)) {
        markOutOfStock(product.id);
      }
      await loadPage();
    } finally {
      setAddingId(null);
    }
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
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          {categoryOptions.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button type="button" onClick={loadPage}>
          Tải lại
        </button>
      </div>

      {loading && <p>Đang tải sản phẩm...</p>}

      <div className="grid">
        {!loading &&
          currentProducts.map((p) => {
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
                    disabled={!inStock || addingId === p.id}
                    onClick={() => addToCart(p)}
                  >
                    {!inStock
                      ? "Hết hàng"
                      : addingId === p.id
                        ? "Đang thêm…"
                        : "Thêm giỏ"}
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
