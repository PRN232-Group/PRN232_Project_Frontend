import React, { useEffect, useState } from "react";
import { analyticsService } from "../../application/services";
import { formatVnd } from "../../domain/roles";

const RevenueReportPage = () => {
  const [revenues, setRevenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    fetchRevenue();
  }, []);

  const fetchRevenue = async () => {
    try {
      setLoading(true);
      const res = await analyticsService.getRevenueReport();
      const data = Array.isArray(res.data) ? res.data : [];
      setRevenues(data);
      setTotalRevenue(data.reduce((sum, item) => sum + (item.amount || 0), 0));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="staff-page">
      <h2>Báo cáo doanh thu</h2>
      <p className="staff-page-sub">Theo từng đơn hàng trong catalog mock.</p>

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
                <td>{item.date}</td>
                <td>{item.orderCode}</td>
                <td className="staff-price">{formatVnd(item.amount)}</td>
              </tr>
            ))}
            {!loading && revenues.length === 0 && (
              <tr>
                <td colSpan={4} className="staff-empty">
                  Chưa có doanh thu
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
