import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../styles/manager/managerDashboardPage.css";

const ManagerDashboardPage = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    bestSellingProduct: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(
        "https://localhost:5001/api/analytics/dashboard"
      );

      setStats(res.data);
    } catch (err) {
      console.error(err);
      setError("Không thể tải dashboard dữ liệu");

      // fallback demo data
      setStats({
        totalUsers: 120,
        totalOrders: 58,
        totalRevenue: 125000000,
        bestSellingProduct: "Modern Sofa",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="manager-dashboard">
      <h2>Manager Dashboard</h2>

      {loading && <p>Loading dashboard...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && (
        <>
          {/* KPI CARDS */}
          <div className="grid">
            <div className="card">
              <h3>Users</h3>
              <p>{stats.totalUsers}</p>
            </div>

            <div className="card">
              <h3>Orders</h3>
              <p>{stats.totalOrders}</p>
            </div>

            <div className="card">
              <h3>Revenue</h3>
              <p>{stats.totalRevenue.toLocaleString()} đ</p>
            </div>

            <div className="card">
              <h3>Best Seller</h3>
              <p>{stats.bestSellingProduct}</p>
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div className="actions">
            <button onClick={() => navigate("/manager/products")}>
              Quản lý sản phẩm
            </button>

            <button onClick={() => navigate("/manager/orders")}>
              Quản lý đơn hàng
            </button>

            <button onClick={() => navigate("/manager/best-selling")}>
              Sản phẩm bán chạy
            </button>

            <button onClick={() => navigate("/manager/revenue")}>
              Báo cáo doanh thu
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ManagerDashboardPage;
