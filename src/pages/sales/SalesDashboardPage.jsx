import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { analyticsService } from "../../application/services";

const SalesDashboardPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    totalQuotations: 0,
    approvedQuotations: 0,
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const [recentQuotations, setRecentQuotations] = useState([]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await analyticsService.getSalesDashboard();
      setStats(res.data.stats || stats);
      setRecentRequests(res.data.recentRequests || []);
      setRecentQuotations(res.data.recentQuotations || []);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="staff-page">
      <h2>Kinh doanh — Tổng quan</h2>
      <p className="staff-page-sub">
        Báo giá, yêu cầu thiết kế và đơn hàng — dữ liệu khớp catalog khách
        hàng.
      </p>

      <div className="staff-kpi-grid">
        <div className="staff-kpi">
          <span>Tổng yêu cầu</span>
          <strong>{stats.totalRequests}</strong>
        </div>
        <div className="staff-kpi">
          <span>Đang chờ</span>
          <strong className="is-clay">{stats.pendingRequests}</strong>
        </div>
        <div className="staff-kpi">
          <span>Báo giá</span>
          <strong>{stats.totalQuotations}</strong>
        </div>
        <div className="staff-kpi">
          <span>Đã duyệt</span>
          <strong>{stats.approvedQuotations}</strong>
        </div>
      </div>

      <div className="staff-toolbar">
        <button
          type="button"
          className="staff-btn staff-btn-primary"
          onClick={() => navigate("/sales/quotations")}
        >
          Yêu cầu báo giá
        </button>
        <button
          type="button"
          className="staff-btn staff-btn-ghost"
          onClick={() => navigate("/sales/quotation-approval")}
        >
          Duyệt báo giá
        </button>
        <button
          type="button"
          className="staff-btn staff-btn-ghost"
          onClick={() => navigate("/sales/design-requests")}
        >
          Yêu cầu thiết kế
        </button>
        <button
          type="button"
          className="staff-btn staff-btn-ghost"
          onClick={() => navigate("/sales/orders")}
        >
          Đơn hàng
        </button>
      </div>

      <div className="staff-split">
        <div className="staff-panel">
          <div className="staff-panel-head">
            <h3>Yêu cầu gần đây</h3>
          </div>
          {recentRequests.length === 0 ? (
            <p className="staff-empty">Chưa có dữ liệu</p>
          ) : (
            recentRequests.map((r) => (
              <div
                key={r.id}
                style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid var(--line)",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 8,
                }}
              >
                <div>
                  <b>{r.title}</b>
                  <div style={{ fontSize: 13, color: "var(--muted)" }}>
                    {r.customerName}
                  </div>
                </div>
                <span className="staff-badge is-pending">{r.status}</span>
              </div>
            ))
          )}
        </div>
        <div className="staff-panel">
          <div className="staff-panel-head">
            <h3>Báo giá gần đây</h3>
          </div>
          {recentQuotations.length === 0 ? (
            <p className="staff-empty">Chưa có dữ liệu</p>
          ) : (
            recentQuotations.map((q) => (
              <div
                key={q.id}
                style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid var(--line)",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 8,
                }}
              >
                <div>
                  <b>{q.title}</b>
                  <div style={{ fontSize: 13, color: "var(--muted)" }}>
                    {q.customerName}
                  </div>
                </div>
                <span className="staff-badge is-done">{q.status}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesDashboardPage;
