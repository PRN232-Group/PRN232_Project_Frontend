import React, { useEffect, useState } from "react";
import { orderService } from "../../application/services";
import {
  ORDER_STATUS_OPTIONS,
  normalizeOrderStatus,
  orderStatusCssClass,
  orderStatusLabel,
} from "../../domain/orderStatus";
import { notifySuccess, notifyError } from "../../application/services/notify";
import { formatVnd } from "../../domain/roles";

const OrderManagementPage = () => {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await orderService.getAll();
      const list = (res.data || []).map((o) => ({
        ...o,
        status: normalizeOrderStatus(o.status),
      }));
      setOrders(list);
    } catch {
      notifyError("Không tải được đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    const matchQ =
      String(o.id).includes(search) ||
      (o.customerName || "").toLowerCase().includes(q);
    const matchS =
      status === "All" || normalizeOrderStatus(o.status) === status;
    return matchQ && matchS;
  });

  const updateStatus = async (id, newStatus) => {
    const next = normalizeOrderStatus(newStatus);
    try {
      await orderService.updateStatus(id, next);
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: next } : o))
      );
      if (selected?.id === id) setSelected((s) => ({ ...s, status: next }));
      notifySuccess("Đã cập nhật trạng thái");
    } catch {
      notifyError("Cập nhật thất bại");
    }
  };

  return (
    <div className="staff-page">
      <h2>Quản lý đơn hàng</h2>
      <p className="staff-page-sub">
        Đơn từ storefront — chi tiết dòng hàng, địa chỉ giao, tổng tiền.
      </p>

      <div className="staff-toolbar">
        <input
          placeholder="Tìm mã đơn hoặc khách..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="All">Tất cả trạng thái</option>
          {ORDER_STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {orderStatusLabel(s)}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="staff-btn staff-btn-ghost"
          onClick={fetchOrders}
        >
          Tải lại
        </button>
      </div>

      {loading && <p className="staff-status">Đang tải...</p>}

      <div className="staff-split">
        <div className="staff-panel">
          <div className="staff-panel-head">
            <h3>Danh sách ({filtered.length})</h3>
          </div>
          {filtered.map((o) => (
            <button
              key={o.id}
              type="button"
              className={
                selected?.id === o.id
                  ? "staff-list-item is-active"
                  : "staff-list-item"
              }
              onClick={() => setSelected(o)}
            >
              <strong>Đơn #{o.id}</strong>
              <div className="staff-list-meta">
                <span>{o.customerName}</span>
                <span className={`status ${orderStatusCssClass(o.status)}`}>
                  {orderStatusLabel(o.status)}
                </span>
              </div>
              <div className="staff-price" style={{ marginTop: 4 }}>
                {formatVnd(o.totalPrice)}
              </div>
            </button>
          ))}
          {!loading && filtered.length === 0 && (
            <p className="staff-empty">Không có đơn</p>
          )}
        </div>

        <div className="staff-panel">
          {!selected ? (
            <p className="staff-empty">Chọn đơn để xem chi tiết</p>
          ) : (
            <>
              <div className="staff-panel-head">
                <h3>Chi tiết #{selected.id}</h3>
              </div>
              <div style={{ padding: 16 }}>
                <p>
                  <b>Khách:</b> {selected.customerName}
                </p>
                <p>
                  <b>Email:</b> {selected.customerEmail || "—"}
                </p>
                <p>
                  <b>SĐT:</b> {selected.customerPhone || selected.phone || "—"}
                </p>
                <p>
                  <b>Địa chỉ:</b>{" "}
                  {selected.shippingAddress || selected.address || "—"}
                </p>
                <p>
                  <b>Tổng:</b>{" "}
                  <span className="staff-price">
                    {formatVnd(selected.totalPrice)}
                  </span>
                </p>

                <h4 style={{ marginTop: 16 }}>Sản phẩm</h4>
                <table className="staff-table">
                  <thead>
                    <tr>
                      <th>Tên</th>
                      <th>SL</th>
                      <th>Giá</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selected.items || []).map((i, idx) => (
                      <tr key={idx}>
                        <td>{i.productName}</td>
                        <td>{i.quantity}</td>
                        <td className="staff-price">{formatVnd(i.price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="staff-field" style={{ marginTop: 14 }}>
                  <label>Cập nhật trạng thái</label>
                  <select
                    value={normalizeOrderStatus(selected.status)}
                    onChange={(e) => updateStatus(selected.id, e.target.value)}
                  >
                    {ORDER_STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {orderStatusLabel(s)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderManagementPage;
