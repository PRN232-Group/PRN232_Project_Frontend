import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { analyticsService } from "../../application/services";
import { formatVnd } from "../../domain/roles";

const ManagerDashboardPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    bestSellingProduct: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await analyticsService.getManagerDashboard();
      const d = res.data || {};
      const best = d.bestSellingProduct;
      setStats({
        totalUsers: d.totalUsers ?? d.totalCustomers ?? 0,
        totalOrders: d.totalOrders ?? 0,
        totalRevenue: d.totalRevenue ?? 0,
        bestSellingProduct:
          typeof best === "string"
            ? best
            : best?.name || "—",
      });
    } catch {
      setStats({
        totalUsers: 0,
        totalOrders: 0,
        totalRevenue: 0,
        bestSellingProduct: "—",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="staff-page">
      <h2>Quản lý — Tổng quan</h2>
      <p className="staff-page-sub">
        Catalog, danh mục, giá/giảm giá, tồn kho và doanh thu. Đơn hàng do Sales
        phụ trách.
      </p>

      {loading && <p className="staff-status">Đang tải...</p>}

      <div className="staff-kpi-grid">
        <div className="staff-kpi">
          <span>Người dùng</span>
          <strong>{stats.totalUsers}</strong>
        </div>
        <div className="staff-kpi">
          <span>Đơn hàng</span>
          <strong>{stats.totalOrders}</strong>
        </div>
        <div className="staff-kpi">
          <span>Doanh thu</span>
          <strong className="is-clay">{formatVnd(stats.totalRevenue)}</strong>
        </div>
        <div className="staff-kpi">
          <span>Bán chạy</span>
          <strong style={{ fontSize: "1rem" }}>{stats.bestSellingProduct}</strong>
        </div>
      </div>

      <div className="staff-toolbar">
        <button
          type="button"
          className="staff-btn staff-btn-primary"
          onClick={() => navigate("/manager/products")}
        >
          Sản phẩm &amp; thông số
        </button>
        <button
          type="button"
          className="staff-btn staff-btn-ghost"
          onClick={() => navigate("/manager/designs")}
        >
          Concept thiết kế
        </button>
        <button
          type="button"
          className="staff-btn staff-btn-ghost"
          onClick={() => navigate("/manager/categories")}
        >
          Danh mục
        </button>
        <button
          type="button"
          className="staff-btn staff-btn-ghost"
          onClick={() => navigate("/manager/prices")}
        >
          Bảng giá / giảm giá
        </button>
        <button
          type="button"
          className="staff-btn staff-btn-ghost"
          onClick={() => navigate("/manager/best-selling")}
        >
          Bán chạy
        </button>
        <button
          type="button"
          className="staff-btn staff-btn-ghost"
          onClick={() => navigate("/manager/revenue")}
        >
          Doanh thu
        </button>
      </div>
    </div>
  );
};

export default ManagerDashboardPage;
