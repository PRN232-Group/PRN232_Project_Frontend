import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { analyticsService } from "../../application/services";
import { notifyError } from "../../application/services/notify";

const SalesDashboardPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    pendingOrders: 0,
    quotations: 0,
    designRequests: 0,
    chats: 0,
    pendingQuotationRequests: 0,
    processingOrders: 0,
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const [recentQuotations, setRecentQuotations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await analyticsService.getSalesDashboard();
      const d = res.data || {};
      const s = d.stats || {};
      setStats({
        pendingOrders: d.pendingOrders ?? 0,
        quotations: d.quotations ?? 0,
        designRequests: d.designRequests ?? 0,
        chats: d.chats ?? 0,
        pendingQuotationRequests: s.pendingQuotationRequests ?? 0,
        processingOrders: s.processingOrders ?? 0,
      });
      setRecentRequests(d.recentRequests || []);
      setRecentQuotations(d.recentQuotations || []);
    } catch (err) {
      console.error(err);
      notifyError("Không tải được tổng quan Sales");
      setRecentRequests([]);
      setRecentQuotations([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="staff-page">
      <h2>Kinh doanh — Tổng quan</h2>
      <p className="staff-page-sub">
        Báo giá, yêu cầu thiết kế và đơn hàng — dữ liệu khớp catalog khách
        hàng.
      </p>

      {loading && <p className="staff-status">Đang tải...</p>}

      <div className="staff-kpi-grid">
        <div className="staff-kpi">
          <span>Đơn chờ xử lý</span>
          <strong className="is-clay">{stats.pendingOrders}</strong>
        </div>
        <div className="staff-kpi">
          <span>Yêu cầu BG chờ</span>
          <strong>{stats.pendingQuotationRequests}</strong>
        </div>
        <div className="staff-kpi">
          <span>Báo giá</span>
          <strong>{stats.quotations}</strong>
        </div>
        <div className="staff-kpi">
          <span>Yêu cầu thiết kế</span>
          <strong>{stats.designRequests}</strong>
        </div>
      </div>

      <div className="staff-toolbar">
        <button
          type="button"
          className="staff-btn staff-btn-primary"
          onClick={() => navigate("/sales/quotations")}
        >
          Báo giá (inbox)
        </button>
        <button
          type="button"
          className="staff-btn staff-btn-ghost"
          onClick={() => navigate("/sales/quotations?tab=quotes")}
        >
          Duyệt nội bộ
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
            <h3>Yêu cầu báo giá gần đây</h3>
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
                  <b>{r.title || `Yêu cầu #${r.id}`}</b>
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
                  <b>{q.title || q.notes || `Báo giá #${q.id}`}</b>
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
