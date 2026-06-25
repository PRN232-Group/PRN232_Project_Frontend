import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../styles/manager/orderManagementPage.css";

const OrderManagementPage = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const statusOptions = [
    "All",
    "Pending",
    "Shipping",
    "Completed",
    "Cancelled",
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterData();
  }, [search, status, orders]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(
        "https://localhost:5001/api/orders"
      );

      setOrders(res.data || []);
      setFiltered(res.data || []);
    } catch (err) {
      console.error(err);
      setError("Không thể tải danh sách đơn hàng");

      // fallback demo
      const demo = [
        {
          id: 101,
          customerName: "Nguyen Van A",
          status: "Pending",
          totalPrice: 5000000,
        },
        {
          id: 102,
          customerName: "Tran Thi B",
          status: "Shipping",
          totalPrice: 3000000,
        },
      ];

      setOrders(demo);
      setFiltered(demo);
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    let data = [...orders];

    if (status !== "All") {
      data = data.filter((o) => o.status === status);
    }

    if (search) {
      data = data.filter(
        (o) =>
          String(o.id).includes(search) ||
          (o.customerName || "")
            .toLowerCase()
            .includes(search.toLowerCase())
      );
    }

    setFiltered(data);
    setCurrentPage(1);
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.put(
        `https://localhost:5001/api/orders/${id}/status`,
        {
          status: newStatus,
        }
      );

      setOrders((prev) =>
        prev.map((o) =>
          o.id === id ? { ...o, status: newStatus } : o
        )
      );
    } catch (err) {
      console.error(err);
      alert("Cập nhật trạng thái thất bại");
    }
  };

  // pagination
  const totalPages = Math.ceil(filtered.length / pageSize);

  const startIndex = (currentPage - 1) * pageSize;
  const currentOrders = filtered.slice(
    startIndex,
    startIndex + pageSize
  );

  const changePage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="order-management-page">
      <h2>Order Management</h2>

      {/* TOOLBAR */}
      <div className="toolbar">
        <input
          type="text"
          placeholder="Search by ID or customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {statusOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <button onClick={fetchOrders}>Reload</button>
      </div>

      {/* CONTENT */}
      {loading && <p>Loading orders...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Total</th>
                <th>Update</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {currentOrders.length > 0 ? (
                currentOrders.map((o) => (
                  <tr key={o.id}>
                    <td>#{o.id}</td>
                    <td>{o.customerName}</td>

                    <td>
                      <span className={`status ${o.status}`}>
                        {o.status}
                      </span>
                    </td>

                    <td>
                      {o.totalPrice?.toLocaleString()} đ
                    </td>

                    <td>
                      <select
                        value={o.status}
                        onChange={(e) =>
                          updateStatus(o.id, e.target.value)
                        }
                      >
                        <option value="Pending">Pending</option>
                        <option value="Shipping">Shipping</option>
                        <option value="Completed">
                          Completed
                        </option>
                        <option value="Cancelled">
                          Cancelled
                        </option>
                      </select>
                    </td>

                    <td>
                      <button
                        onClick={() =>
                          navigate(`/orders/${o.id}`)
                        }
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">No orders found</td>
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

export default OrderManagementPage;