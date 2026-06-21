import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/production/deliveryUpdatePage.css";

const DeliveryUpdatePage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      // TODO: đổi API theo backend
      const res = await axios.get(
        "http://localhost:5000/api/delivery/orders"
      );

      setOrders(res.data || []);
    } catch (error) {
      console.error("Error fetching delivery orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);

      await axios.put(
        `http://localhost:5000/api/delivery/orders/${orderId}`,
        {
          status: newStatus,
        }
      );

      // update UI local
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status: newStatus } : o
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return <div className="delivery-loading">Loading deliveries...</div>;
  }

  return (
    <div className="delivery-container">
      <h2>Delivery Management</h2>

      <table className="delivery-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Address</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {orders.length > 0 ? (
            orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.customerName}</td>
                <td>{order.address}</td>
                <td>
                  <span className={`status ${order.status}`}>
                    {order.status}
                  </span>
                </td>

                <td>
                  <select
                    value={order.status}
                    disabled={updatingId === order.id}
                    onChange={(e) =>
                      updateStatus(order.id, e.target.value)
                    }
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="PREPARING">PREPARING</option>
                    <option value="SHIPPING">SHIPPING</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No delivery orders found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DeliveryUpdatePage;