import React, { useEffect, useState } from "react";
import { analyticsService } from "../../application/services";
import { formatVnd } from "../../domain/roles";
import { notifyError } from "../../application/services/notify";

const RevenueReportPage = () => {
  const [revenues, setRevenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    fetchRevenue();
  }, []);

  const fetchRevenue = async (override = null) => {
    try {
      setLoading(true);
      const from = override && "fromDate" in override ? override.fromDate : fromDate;
      const to = override && "toDate" in override ? override.toDate : toDate;
      const params = {};
      if (from) params.from = from;
      if (to) params.to = to;
      const res = await analyticsService.getRevenueReport(params);
      const data = Array.isArray(res.data) ? res.data : [];
      setRevenues(data);
    } catch (error) {
      console.error(error);
      notifyError("Không tải được báo cáo doanh thu");
      setRevenues([]);
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = revenues.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  return (
    <div className="staff-page">
      <h2>Báo cáo doanh thu</h2>
      <p className="staff-page-sub">
        Theo từng đơn hàng (không gồm đơn đã hủy). Lọc theo khoảng ngày tạo đơn.
      </p>

      <div className="staff-toolbar" style={{ flexWrap: "wrap", gap: 8 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
          Từ
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
          Đến
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </label>
        <button
          type="button"
          className="staff-btn staff-btn-primary"
          onClick={fetchRevenue}
        >
          Áp dụng
        </button>
        <button
          type="button"
          className="staff-btn staff-btn-ghost"
          onClick={() => {
            setFromDate("");
            setToDate("");
            fetchRevenue({ fromDate: "", toDate: "" });
          }}
        >
          Xóa lọc
        </button>
      </div>

      <div className="staff-kpi-grid">
        <div className="staff-kpi">
          <span>Tổng doanh thu</span>
          <strong className="is-clay">{formatVnd(totalRevenue)}</strong>
        </div>
        <div className="staff-kpi">
          <span>Số đơn</span>
          <strong>{revenues.length}</strong>
        </div>
      </div>

      {loading && <p className="staff-status">Đang tải...</p>}

      <div className="staff-panel">
        <table className="staff-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Ngày</th>
              <th>Mã đơn</th>
              <th>Số tiền</th>
            </tr>
          </thead>
          <tbody>
            {revenues.map((item) => (
              <tr key={item.id}>
                <td>#{item.id}</td>
                <td>
                  {item.date
                    ? new Date(item.date).toLocaleDateString("vi-VN")
                    : "—"}
                </td>
                <td>{item.orderCode}</td>
                <td className="staff-price">{formatVnd(item.amount)}</td>
              </tr>
            ))}
            {!loading && revenues.length === 0 && (
              <tr>
                <td colSpan={4} className="staff-empty">
                  Chưa có doanh thu trong khoảng đã chọn
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RevenueReportPage;
