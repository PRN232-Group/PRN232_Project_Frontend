import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/manager/priceManagementPage.css";

const PriceManagementPage = () => {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterData();
  }, [search, products]);

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
      setError("Không thể tải danh sách sản phẩm");

      // fallback demo
      const demo = [
        {
          id: 1,
          name: "Modern Sofa",
          price: 5000000,
        },
        {
          id: 2,
          name: "Wood Table",
          price: 2000000,
        },
      ];

      setProducts(demo);
      setFiltered(demo);
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    const data = products.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );

    setFiltered(data);
    setCurrentPage(1);
  };

  const updatePrice = (id, newPrice) => {
    setFiltered((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, price: newPrice } : p
      )
    );

    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, price: newPrice } : p
      )
    );
  };

  const savePrice = async (product) => {
    try {
      await axios.put(
        `https://localhost:5001/api/products/${product.id}/price`,
        {
          price: product.price,
        }
      );

      alert("Cập nhật giá thành công!");
    } catch (err) {
      console.error(err);
      alert("Cập nhật giá thất bại");
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
    <div className="price-management-page">
      <h2>Price Management</h2>

      {/* TOOLBAR */}
      <div className="toolbar">
        <input
          type="text"
          placeholder="Search product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button onClick={fetchProducts}>Reload</button>
      </div>

      {/* CONTENT */}
      {loading && <p>Loading products...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Product</th>
                <th>Price</th>
                <th>Update</th>
              </tr>
            </thead>

            <tbody>
              {currentProducts.length > 0 ? (
                currentProducts.map((p) => (
                  <tr key={p.id}>
                    <td>#{p.id}</td>

                    <td>{p.name}</td>

                    <td>
                      <input
                        type="number"
                        value={p.price}
                        onChange={(e) =>
                          updatePrice(
                            p.id,
                            Number(e.target.value)
                          )
                        }
                      />
                    </td>

                    <td>
                      <button
                        onClick={() => savePrice(p)}
                      >
                        Save
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">No products found</td>
                </tr>
              )}
            </tbody>
          </table>

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
        </>
      )}
    </div>
  );
};

export default PriceManagementPage;