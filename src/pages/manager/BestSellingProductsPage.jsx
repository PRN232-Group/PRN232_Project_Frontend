import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/manager/bestSellingProductsPage.css";

const BestSellingProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBestSelling();
  }, []);

  useEffect(() => {
    filterData();
  }, [search, products]);

  const fetchBestSelling = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(
        "https://localhost:5001/api/analytics/best-selling-products"
      );

      setProducts(res.data || []);
      setFiltered(res.data || []);
    } catch (err) {
      console.error(err);
      setError("Không thể tải dữ liệu sản phẩm bán chạy");

      // fallback demo data
      const demo = [
        {
          id: 1,
          name: "Modern Sofa",
          soldQuantity: 120,
          revenue: 600000000,
        },
        {
          id: 2,
          name: "Wood Table",
          soldQuantity: 95,
          revenue: 190000000,
        },
        {
          id: 3,
          name: "Office Chair",
          soldQuantity: 80,
          revenue: 120000000,
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
  };

  return (
    <div className="best-selling-page">
      <h2>Best Selling Products</h2>

      {/* TOOLBAR */}
      <div className="toolbar">
        <input
          type="text"
          placeholder="Search product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button onClick={fetchBestSelling}>Reload</button>
      </div>

      {/* CONTENT */}
      {loading && <p>Loading data...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <table className="table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Product Name</th>
              <th>Sold Quantity</th>
              <th>Revenue</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length > 0 ? (
              filtered
                .sort((a, b) => b.soldQuantity - a.soldQuantity)
                .map((p, index) => (
                  <tr key={p.id}>
                    <td>#{index + 1}</td>
                    <td>{p.name}</td>
                    <td>{p.soldQuantity}</td>
                    <td>
                      {p.revenue?.toLocaleString()} đ
                    </td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan="4">No data found</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default BestSellingProductsPage;