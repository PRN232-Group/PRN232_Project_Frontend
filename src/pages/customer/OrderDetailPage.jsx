import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { orderService } from "../../application/services";

const OrderDetailPage = () => {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await orderService.getById(id);

      setOrder(res.data);
    } catch (err) {
      console.error(err);
      setError("Không thể tải chi tiết đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Pending":
        return "pending";
      case "Shipping":
        return "shipping";
      case "Completed":
        return "completed";
      case "Cancelled":
        return "cancelled";
      default:
        return "";
    }
  };

  const getTotal = () => {
    if (!order?.items) return 0;
    return order.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  };

  return (
    <div className="order-detail-page">
      <h2>Order Detail</h2>

      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && order && (
        <div className="order-container">
          {/* ORDER INFO */}
          <div className="order-info">
            <h3>Thông tin đơn hàng</h3>

            <p>
              <b>Mã đơn:</b> #{order.id}
            </p>

            <p>
              <b>Khách hàng:</b> {order.fullName}
            </p>

            <p>
              <b>Số điện thoại:</b> {order.phone}
            </p>

            <p>
              <b>Địa chỉ:</b> {order.address}
            </p>

            <p>
              <b>Trạng thái:</b>{" "}
              <span className={getStatusClass(order.status)}>
                {order.status}
              </span>
            </p>
          </div>

          {/* ITEMS */}
          <div className="order-items">
            <h3>Sản phẩm</h3>

            {order.items?.map((item) => (
              <div key={item.id} className="item">
                <div>
                  <p className="name">{item.name}</p>
                  <p className="qty">Qty: {item.quantity}</p>
                </div>

                <div className="price">
                  {(item.price * item.quantity).toLocaleString()} đ
                </div>
              </div>
            ))}

            <hr />

            <h3>Total: {getTotal().toLocaleString()} đ</h3>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailPage;