import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { productionService } from "../../application/services";

const STATUS_OPTIONS = [
  "Queued",
  "InProgress",
  "Done",
  "Blocked",
];

const STATUS_LABEL = {
  Queued: "Chờ xếp hàng",
  InProgress: "Đang sản xuất",
  Done: "Hoàn tất",
  Blocked: "Tạm dừng",
};

const ProductionOrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await productionService.getOrder(id);
      setOrder(res.data || null);
    } catch (err) {
      console.error(err);
      setError("Không thể tải chi tiết lệnh");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus) => {
    try {
      setUpdating(true);
      await productionService.updateStatus(id, newStatus);
      setOrder((prev) => (prev ? { ...prev, status: newStatus } : prev));
    } catch (err) {
      console.error(err);
      setError("Cập nhật trạng thái thất bại");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="page">Đang tải lệnh sản xuất...</div>;
  }

  if (!order) {
    return (
      <div className="page">
        <p className="error">{error || "Không tìm thấy lệnh sản xuất"}</p>
        <Link to="/production/orders">← Quay lại danh sách</Link>
      </div>
    );
  }

  return (
    <div className="production-order-detail page">
      <div className="toolbar">
        <h2 style={{ margin: 0, flex: 1 }}>Chi tiết lệnh #{order.id}</h2>
        <Link to="/production/orders" className="btn-ghost">
          ← Danh sách
        </Link>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="info-box" style={{ marginTop: 16 }}>
        <p>
          <b>Đơn hàng:</b> #{order.orderId ?? order.id}
        </p>
        <p>
          <b>Khách hàng:</b> {order.customerName || "—"}
        </p>
        <p>
          <b>Địa chỉ:</b> {order.address || order.shippingAddress || "—"}
        </p>
        <p>
          <b>Tiến độ:</b> {order.progressPercent ?? 0}%
        </p>
        <p>
          <b>Trạng thái:</b>{" "}
          <span className={`status ${(order.status || "").toLowerCase()}`}>
            {STATUS_LABEL[order.status] || order.status}
          </span>
        </p>
        <p>
          <b>Ngày tạo:</b>{" "}
          {order.createdAt || order.createdDate
            ? new Date(order.createdAt || order.createdDate).toLocaleString(
                "vi-VN"
              )
            : "—"}
        </p>
      </div>

      <div className="status-update toolbar" style={{ marginTop: 20 }}>
        <label htmlFor="prod-status">Cập nhật trạng thái</label>
        <select
          id="prod-status"
          value={order.status}
          disabled={updating}
          onChange={(e) => updateStatus(e.target.value)}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
      </div>

      <h3 style={{ marginTop: 28 }}>Sản phẩm</h3>
      <div style={{ overflowX: "auto" }}>
        {(order.items || []).length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>SL</th>
                <th>Đơn giá</th>
                <th>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                <tr key={index}>
                  <td>{item.productName}</td>
                  <td>{item.quantity}</td>
                  <td>{Number(item.price || 0).toLocaleString("vi-VN")} ₫</td>
                  <td>
                    {Number(
                      (item.quantity || 0) * (item.price || 0)
                    ).toLocaleString("vi-VN")}{" "}
                    ₫
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Chưa có sản phẩm trong lệnh</p>
        )}
      </div>
    </div>
  );
};

export default ProductionOrderDetailPage;
