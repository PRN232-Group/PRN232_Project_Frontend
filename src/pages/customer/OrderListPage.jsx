import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { orderService } from "../../application/services";

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

      const res = await orderService.getAll();

      setOrders(res.data || []);
    } catch (err) {
      console.error(err);
      setOrders([]);
      setError("Không tải được đơn hàng");
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
    <div className="order-list-page page">
      <h2>Đơn hàng của tôi</h2>

      <div className="toolbar">
        <input
          type="text"
          placeholder="Tìm theo mã đơn hoặc trạng thái..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />

        <button type="button" onClick={fetchOrders}>
          Tải lại
        </button>
      </div>

      {loading && <p>Đang tải đơn hàng...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <>
          <div style={{ overflowX: "auto" }}>
            <table className="order-table">
              <thead>
                <tr>
                  <th>Mã</th>
                  <th>Số SP</th>
                  <th>Trạng thái</th>
                  <th>Tổng tiền</th>
                  <th></th>
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
                          className={`status ${getStatusClass(order.status)}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td>
                        {Number(order.totalPrice || 0).toLocaleString("vi-VN")} ₫
                      </td>
                      <td>
                        <button
                          type="button"
                          className="view-btn btn-ghost"
                          onClick={() => navigate(`/orders/${order.id}`)}
                        >
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5">Chưa có đơn hàng</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button type="button" onClick={() => changePage(currentPage - 1)}>
              Trước
            </button>
            <span>
              Trang {currentPage} / {totalPages || 1}
            </span>
            <button type="button" onClick={() => changePage(currentPage + 1)}>
              Sau
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default OrderListPage;
