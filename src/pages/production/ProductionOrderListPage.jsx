import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../../styles/production/productionOrderDetailPage.css";

const ProductionOrderDetailPage = () => {
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrderDetail();
  }, [orderId]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);

      // TODO: đổi API backend
      const res = await axios.get(
        `http://localhost:5000/api/production/orders/${orderId}`
      );

      setOrder(res.data || null);
    } catch (error) {
      console.error("Error fetching order detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus) => {
    try {
      setUpdating(true);

      await axios.put(
        `http://localhost:5000/api/production/orders/${orderId}/status`,
        {
          status: newStatus,
        }
      );

      setOrder((prev) => ({
        ...prev,
        status: newStatus,
      }));
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="order-detail-loading">Loading order...</div>;
  }

  if (!order) {
    return <div className="order-detail-empty">Order not found</div>;
  }

  return (
    <div className="production-order-detail">
      <h2>Production Order Detail</h2>

      {/* ORDER INFO */}
      <div className="order-info">
        <div><b>Order ID:</b> {order.id}</div>
        <div><b>Customer:</b> {order.customerName}</div>
        <div><b>Address:</b> {order.address}</div>
        <div>
          <b>Status:</b>{" "}
          <span className={`status ${order.status}`}>
            {order.status}
          </span>
        </div>
        <div><b>Created Date:</b> {order.createdDate}</div>
      </div>

      {/* STATUS UPDATE */}
      <div className="status-update">
        <label>Update Status:</label>

        <select
          value={order.status}
          disabled={updating}
          onChange={(e) => updateStatus(e.target.value)}
        >
          <option value="PENDING">PENDING</option>
          <option value="PREPARING">PREPARING</option>
          <option value="PACKING">PACKING</option>
          <option value="SHIPPING">SHIPPING</option>
          <option value="DELIVERED">DELIVERED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      </div>

      {/* PRODUCT LIST */}
      <div className="order-items">
        <h3>Products</h3>

        {order.items && order.items.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>

            <tbody>
              {order.items.map((item, index) => (
                <tr key={index}>
                  <td>{item.productName}</td>
                  <td>{item.quantity}</td>
                  <td>{item.price?.toLocaleString()} VND</td>
                  <td>
                    {(item.quantity * item.price)?.toLocaleString()} VND
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No products in this order</p>
        )}
      </div>
    </div>
  );
};

export default ProductionOrderDetailPage;