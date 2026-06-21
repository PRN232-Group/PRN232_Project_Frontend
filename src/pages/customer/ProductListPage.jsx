import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../styles/customer/productListPage.css";

const ProductListPage = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const categories = ["All", "Sofa", "Table", "Chair", "Bed"];

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterData();
  }, [search, category, products]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(
        "https://localhost:5001/api/products"
      );

      setProducts(res.data || []);
      setFiltered(res.data || []);
    } catch (err) {
      console.error(err);
      setError("Không thể tải sản phẩm");

      // fallback demo data
      const demo = [
        {
          id: 1,
          name: "Modern Sofa",
          price: 5000000,
          category: "Sofa",
          image:
            "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85",
        },
        {
          id: 2,
          name: "Wood Table",
          price: 2000000,
          category: "Table",
          image:
            "https://images.unsplash.com/photo-1524758631624-e2822e304c36",
        },
        {
          id: 3,
          name: "Office Chair",
          price: 1500000,
          category: "Chair",
          image:
            "https://images.unsplash.com/photo-1503602642458-232111445657",
        },
      ];

      setProducts(demo);
      setFiltered(demo);
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    let data = [...products];

    if (category !== "All") {
      data = data.filter((p) => p.category === category);
    }

    if (search) {
      data = data.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFiltered(data);
    setCurrentPage(1);
  };

  const addToCart = async (product) => {
    try {
      await axios.post("https://localhost:5001/api/cart", {
        productId: product.id,
        quantity: 1,
      });

      alert("Đã thêm vào giỏ hàng!");
    } catch (err) {
      console.error(err);
      alert("Thêm giỏ hàng thất bại");
    }
  };

  // pagination
  const totalPages = Math.ceil(filtered.length / pageSize);

  const startIndex = (currentPage - 1) * pageSize;
  const currentProducts = filtered.slice(
    startIndex,
    startIndex + pageSize
  );

  const changePage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="product-list-page">
      <h2>Products</h2>

      {/* TOOLBAR */}
      <div className="toolbar">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <button onClick={fetchProducts}>Reload</button>
      </div>

      {/* CONTENT */}
      {loading && <p>Loading products...</p>}
      {error && <p className="error">{error}</p>}

      {/* GRID */}
      <div className="grid">
        {!loading &&
          currentProducts.map((p) => (
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
                <button
                  onClick={() => addToCart(p)}
                >
                  Add to Cart
                </button>

                <button
                  onClick={() =>
                    navigate(`/products/${p.id}`)
                  }
                >
                  View
                </button>
              </div>
            </div>
          ))}
      </div>

      {/* PAGINATION */}
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
    </div>
  );
};

export default ProductListPage;