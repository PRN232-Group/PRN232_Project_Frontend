import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/sales/salesOrderManagementPage.css";

const SalesOrderManagementPage = () => {
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/sales/orders");
      setOrders(res.data || []);
    } catch (err) {
      console.error("Load orders error:", err);
    } finally {
      setLoading(false);
    }
  };

  const selectOrder = (o) => {
    setSelected(o);
    setStatus(o.status);
  };

  const updateStatus = async (newStatus) => {
    if (!selected) return;

    try {
      await axios.put(`/api/sales/orders/${selected.id}`, {
        status: newStatus,
      });

      alert("Order updated!");
      fetchOrders();
      setSelected(null);
    } catch (err) {
      console.error("Update order error:", err);
    }
  };

  return (
    <div className="order-container">
      {/* LEFT LIST */}
      <div className="order-list">
        <h2>Orders</h2>

        {loading ? (
          <p>Loading...</p>
        ) : (
          orders.map((o) => (
            <div
              key={o.id}
              className={`order-item ${
                selected?.id === o.id ? "active" : ""
              }`}
              onClick={() => selectOrder(o)}
            >
              <div className="title">Order #{o.id}</div>
              <div className="meta">
                <span>{o.customerName}</span>
                <span className={`status ${o.status.toLowerCase()}`}>
                  {o.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* RIGHT DETAIL */}
      <div className="order-detail">
        {selected ? (
          <>
            <h2>Order Detail</h2>

            <div className="info-box">
              <p><b>Customer:</b> {selected.customerName}</p>
              <p><b>Email:</b> {selected.customerEmail}</p>
              <p><b>Phone:</b> {selected.customerPhone}</p>
              <p><b>Total:</b> ${selected.totalPrice}</p>
              <p><b>Created:</b> {new Date(selected.createdAt).toLocaleString()}</p>
            </div>

            <h3>Items</h3>
            <table className="item-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {selected.items?.map((i, index) => (
                  <tr key={index}>
                    <td>{i.productName}</td>
                    <td>{i.quantity}</td>
                    <td>${i.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h3>Update Status</h3>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="PENDING">PENDING</option>
              <option value="PROCESSING">PROCESSING</option>
              <option value="SHIPPED">SHIPPED</option>
              <option value="DONE">DONE</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>

            <button
              className="update-btn"
              onClick={() => updateStatus(status)}
            >
              Update Order
            </button>
          </>
        ) : (
          <div className="empty">
            Select an order to view detail
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesOrderManagementPage;