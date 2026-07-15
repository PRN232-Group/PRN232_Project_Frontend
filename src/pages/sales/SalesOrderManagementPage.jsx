import React, { useEffect, useState } from "react";
import { orderService } from "../../application/services";
import {
  ORDER_STATUS_OPTIONS,
  normalizeOrderStatus,
  orderStatusCssClass,
  orderStatusLabel,
} from "../../domain/orderStatus";
import { notifySuccess, notifyError } from "../../application/services/notify";
import { formatVnd, discountPct } from "../../domain/roles";
import { productService } from "../../application/services";

const SalesOrderManagementPage = () => {
  const [orders, setOrders] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
    productService
      .getAll()
      .then((r) => setCatalog(r.data || []))
      .catch(() => {});
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await orderService.getSalesOrders();
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

  const selectOrder = (o) => {
    setSelected(o);
    setStatus(normalizeOrderStatus(o.status));
  };

  const updateStatus = async () => {
    if (!selected) return;
    const next = normalizeOrderStatus(status);
    try {
      await orderService.updateSalesOrder(selected.id, { status: next });
      setOrders((prev) =>
        prev.map((o) => (o.id === selected.id ? { ...o, status: next } : o))
      );
      setSelected((s) => (s ? { ...s, status: next } : s));
      notifySuccess("Đã cập nhật trạng thái");
    } catch {
      notifyError("Cập nhật thất bại");
    }
  };

  const enrichItem = (i) => {
    const p = catalog.find((x) => x.id === i.productId);
    return {
      ...i,
      marketPrice: p?.marketPrice,
      stock: p?.stock,
      imageUrl: p?.imageUrl,
      specs: p?.specs,
    };
  };

  return (
    <div className="staff-page">
      <h2>Đơn hàng Sales</h2>
      <p className="staff-page-sub">
        Theo dõi đơn khách — kèm giá TT, kho và % giảm trên từng dòng.
      </p>

      <div className="staff-split">
        <div className="staff-panel">
          <div className="staff-panel-head">
            <h3>Danh sách</h3>
            <button
              type="button"
              className="staff-btn staff-btn-ghost"
              onClick={fetchOrders}
            >
              Tải lại
            </button>
          </div>
          {loading && <p className="staff-empty">Đang tải...</p>}
          {orders.map((o) => (
            <button
              key={o.id}
              type="button"
              className={
                selected?.id === o.id
                  ? "staff-list-item is-active"
                  : "staff-list-item"
              }
              onClick={() => selectOrder(o)}
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
          {!loading && orders.length === 0 && (
            <p className="staff-empty">Chưa có đơn</p>
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

                <h4 style={{ marginTop: 14 }}>Sản phẩm</h4>
                <table className="staff-table">
                  <thead>
                    <tr>
                      <th>SP</th>
                      <th>SL</th>
                      <th>Giá / TT</th>
                      <th>Giảm</th>
                      <th>Kho</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selected.items || []).map((raw, idx) => {
                      const i = enrichItem(raw);
                      const pct = discountPct(i.price, i.marketPrice);
                      return (
                        <tr key={idx}>
                          <td>
                            <div className="staff-product-cell">
                              {i.imageUrl && <img src={i.imageUrl} alt="" />}
                              <div>
                                <h4>{i.productName}</h4>
                                {i.specs?.material && (
                                  <p>{i.specs.material.slice(0, 40)}…</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>{i.quantity}</td>
                          <td>
                            <span className="staff-price">
                              {formatVnd(i.price)}
                            </span>
                            {i.marketPrice > i.price && (
                              <span className="staff-price-market">
                                {formatVnd(i.marketPrice)}
                              </span>
                            )}
                          </td>
                          <td>
                            {pct > 0 ? (
                              <span className="staff-badge is-save">
                                −{pct}%
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td>{i.stock ?? "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <div className="staff-field" style={{ marginTop: 14 }}>
                  <label>Trạng thái</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    {ORDER_STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {orderStatusLabel(s)}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  className="staff-btn staff-btn-primary"
                  style={{ marginTop: 10 }}
                  onClick={updateStatus}
                >
                  Lưu trạng thái
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesOrderManagementPage;
