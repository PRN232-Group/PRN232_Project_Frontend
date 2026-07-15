import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { productionService } from "../../application/services";

/**
 * Danh sách lệnh sản xuất — đồng bộ visual với các trang back-office khác.
 */
const ProductionOrderListPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await productionService.getOrders();
      setOrders(res.data || []);
    } catch (err) {
      console.error(err);
      setError("Không thể tải lệnh sản xuất");
      setOrders([
        {
          id: 20,
          orderId: 101,
          customerName: "Nguyễn Văn A",
          status: "InProgress",
          progressPercent: 45,
          deadline: "2026-07-25",
        },
        {
          id: 21,
          orderId: 102,
          customerName: "Trần Thị B",
          status: "Queued",
          progressPercent: 0,
          deadline: "2026-07-30",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = orders.filter((o) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      String(o.id).includes(q) ||
      String(o.orderId || "").includes(q) ||
      (o.customerName || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="production-order-list-page page">
      <h2>Lệnh sản xuất</h2>

      <div className="toolbar">
        <input
          type="text"
          placeholder="Tìm theo mã lệnh / đơn / khách..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="button" onClick={fetchOrders}>
          Tải lại
        </button>
      </div>

      {loading && <p>Đang tải...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && (
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã lệnh</th>
                <th>Đơn hàng</th>
                <th>Khách hàng</th>
                <th>Trạng thái</th>
                <th>Tiến độ</th>
                <th>Deadline</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7">Không có lệnh sản xuất</td>
                </tr>
              ) : (
                filtered.map((o) => (
                  <tr key={o.id}>
                    <td>#{o.id}</td>
                    <td>#{o.orderId ?? o.id}</td>
                    <td>{o.customerName || "—"}</td>
                    <td>
                      <span className={`status ${(o.status || "").toLowerCase()}`}>
                        {o.status}
                      </span>
                    </td>
                    <td>{o.progressPercent ?? 0}%</td>
                    <td>{o.deadline || "—"}</td>
                    <td>
                      <Link
                        to={`/production/orders/${o.id}`}
                        className="btn-ghost"
                        style={{ padding: "8px 16px", display: "inline-flex" }}
                      >
                        Chi tiết
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProductionOrderListPage;
