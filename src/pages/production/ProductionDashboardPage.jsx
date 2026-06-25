import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/production/productionDashboardPage.css";

const ProductionDashboardPage = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pending: 0,
    preparing: 0,
    shipping: 0,
    delivered: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      // TODO: đổi API backend của bạn
      const res = await axios.get(
        "http://localhost:5000/api/production/dashboard"
      );

      // fallback nếu API chưa có
      const data = res.data || {};

      setStats({
        totalOrders: data.totalOrders || 0,
        pending: data.pending || 0,
        preparing: data.preparing || 0,
        shipping: data.shipping || 0,
        delivered: data.delivered || 0,
      });
    } catch (error) {
      console.error("Error loading dashboard:", error);

      // fallback demo nếu API lỗi
      setStats({
        totalOrders: 120,
        pending: 20,
        preparing: 35,
        shipping: 40,
        delivered: 25,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  return (
    <div className="production-dashboard">
      <h2>Production Dashboard</h2>

      <div className="stats-grid">
        <div className="card total">
          <h3>Total Orders</h3>
          <p>{stats.totalOrders}</p>
        </div>

        <div className="card pending">
          <h3>Pending</h3>
          <p>{stats.pending}</p>
        </div>

        <div className="card preparing">
          <h3>Preparing</h3>
          <p>{stats.preparing}</p>
        </div>

        <div className="card shipping">
          <h3>Shipping</h3>
          <p>{stats.shipping}</p>
        </div>

        <div className="card delivered">
          <h3>Delivered</h3>
          <p>{stats.delivered}</p>
        </div>
      </div>
    </div>
  );
};

export default ProductionDashboardPage;