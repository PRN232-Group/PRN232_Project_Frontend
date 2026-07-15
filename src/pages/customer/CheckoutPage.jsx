import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cartService, orderService } from "../../application/services";
import UserContext from "../../contexts/UserContext";
import { getLocalCart, setLocalCart } from "../../utils/cartLocal";
import { notifySuccess, notifyError, notifyInfo, notifyWarn } from "../../application/services/notify";

const CheckoutPage = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    note: "",
    paymentMethod: "COD",
  });

  useEffect(() => {
    if (!user) {
      notifyInfo("Vui lòng đăng nhập để thanh toán");
      navigate("/login", { state: { from: "/checkout" }, replace: true });
      return;
    }
    setForm((f) => ({
      ...f,
      fullName: user.name || f.fullName,
      phone: user.phone || f.phone,
    }));
    fetchCart();
  }, [user]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      try {
        const res = await cartService.get();
        const items = (res.data || []).map((i) => ({
          ...i,
          name: i.name || i.productName,
          price: i.price ?? i.unitPrice ?? 0,
        }));
        if (items.length) {
          setCartItems(items);
          return;
        }
      } catch {
        /* local */
      }
      setCartItems(getLocalCart());
    } finally {
      setLoading(false);
    }
  };

  const getTotal = () =>
    cartItems.reduce(
      (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
      0
    );

  const handleCheckout = async () => {
    if (!form.fullName || !form.phone || !form.address) {
      notifyWarn("Vui lòng nhập đầy đủ thông tin giao hàng");
      return;
    }
    if (!cartItems.length) {
      notifyWarn("Giỏ hàng trống");
      return;
    }
    try {
      setSubmitting(true);
      await orderService.checkout({
        shippingAddress: form.address,
        phone: form.phone,
        note: form.note,
        customerInfo: form,
        items: cartItems,
        totalPrice: getTotal(),
      });
      setLocalCart([]);
      setCartItems([]);
      notifySuccess("Đặt hàng thành công! Giỏ hàng đã được làm trống.");
      navigate("/orders", { replace: true });
    } catch (err) {
      console.error(err);
      notifyError("Thanh toán thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="checkout-page page">
      <h2>Thanh toán</h2>

      {loading && <p>Đang tải...</p>}

      {!loading && cartItems.length === 0 && (
        <div className="empty-cart-panel">
          <p className="empty-cart-title">Không có sản phẩm để thanh toán</p>
          <Link to="/products" className="checkout-btn">
            Quay lại mua sắm
          </Link>
        </div>
      )}

      {!loading && cartItems.length > 0 && (
        <div className="checkout-container">
          <div className="checkout-form field">
            <h3>Thông tin giao hàng</h3>
            <label>Họ tên</label>
            <input
              name="fullName"
              value={form.fullName}
              onChange={(e) =>
                setForm({ ...form, fullName: e.target.value })
              }
            />
            <label>Số điện thoại</label>
            <input
              name="phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <label>Địa chỉ</label>
            <textarea
              name="address"
              rows={3}
              value={form.address}
              onChange={(e) =>
                setForm({ ...form, address: e.target.value })
              }
            />
            <label>Ghi chú</label>
            <textarea
              name="note"
              rows={2}
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
            />
          </div>

          <div className="checkout-summary">
            <h3>Đơn hàng</h3>
            <ul className="checkout-items">
              {cartItems.map((item) => (
                <li key={item.id}>
                  <span>
                    {item.name || item.productName} × {item.quantity}
                  </span>
                  <strong>
                    {(
                      Number(item.price || 0) * Number(item.quantity || 0)
                    ).toLocaleString("vi-VN")}{" "}
                    ₫
                  </strong>
                </li>
              ))}
            </ul>
            <p className="checkout-total">
              Tổng: <b>{getTotal().toLocaleString("vi-VN")} ₫</b>
            </p>
            <p className="checkout-hint">
              Sau khi đặt thành công, giỏ hàng sẽ trống — xem đơn tại mục Đơn
              hàng.
            </p>
            <button
              type="button"
              className="checkout-btn"
              disabled={submitting}
              onClick={handleCheckout}
            >
              {submitting ? "Đang xử lý..." : "Xác nhận đặt hàng"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
