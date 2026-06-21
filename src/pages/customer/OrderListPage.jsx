import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../styles/customer/orderListPage.css";

const OrderListPage = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(
        "https://localhost:5001/api/orders"
      );

      setOrders(res.data || []);
    } catch (err) {
      console.error(err);
      setError("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((o) =>
    String(o.id).includes(search) ||
    (o.status || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredOrders.length / pageSize);

  const startIndex = (currentPage - 1) * pageSize;
  const currentOrders = filteredOrders.slice(
    startIndex,
    startIndex + pageSize
  );

  const changePage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
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

  return (
    <div className="order-list-page">
      <h2>My Orders</h2>

      {/* SEARCH */}
      <div className="toolbar">
        <input
          type="text"
          placeholder="Search by order ID or status..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />

        <button onClick={fetchOrders}>Reload</button>
      </div>

      {/* CONTENT */}
      {loading && <p>Loading orders...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <>
          <table className="order-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Total Items</th>
                <th>Status</th>
                <th>Total Price</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {currentOrders.length > 0 ? (
                currentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>

                    <td>{order.items?.length || 0}</td>

                    <td>
                      <span
                        className={`status ${getStatusClass(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </td>

                    <td>
                      {order.totalPrice
                        ? order.totalPrice.toLocaleString()
                        : 0}{" "}
                      đ
                    </td>

                    <td>
                      <button
                        className="view-btn"
                        onClick={() =>
                          navigate(`/orders/${order.id}`)
                        }
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No orders found</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* PAGINATION */}
          <div className="pagination">
            <button onClick={() => changePage(currentPage - 1)}>
              Prev
            </button>

            <span>
              Page {currentPage} / {totalPages || 1}
            </span>

            <button onClick={() => changePage(currentPage + 1)}>
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default OrderListPage;