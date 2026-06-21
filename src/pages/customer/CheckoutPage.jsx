import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/customer/checkoutPage.css";

const CheckoutPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    note: "",
    paymentMethod: "COD",
  });

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get("https://localhost:5001/api/cart");
      setCartItems(res.data || []);
    } catch (err) {
      console.error(err);
      setError("Không thể tải giỏ hàng");

      const localCart = JSON.parse(localStorage.getItem("cart")) || [];
      setCartItems(localCart);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const getTotal = () => {
    return cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  };

  const validateForm = () => {
    if (!form.fullName || !form.phone || !form.address) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return false;
    }
    return true;
  };

  const handleCheckout = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const orderData = {
        customerInfo: form,
        items: cartItems,
        totalPrice: getTotal(),
      };

      await axios.post(
        "https://localhost:5001/api/orders/checkout",
        orderData
      );

      alert("Đặt hàng thành công!");

      setCartItems([]);
      localStorage.removeItem("cart");
    } catch (err) {
      console.error(err);
      alert("Thanh toán thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page">
      <h2>Checkout</h2>

      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <div className="checkout-container">
          {/* LEFT - FORM */}
          <div className="checkout-form">
            <h3>Thông tin giao hàng</h3>

            <input
              type="text"
              name="fullName"
              placeholder="Họ tên"
              value={form.fullName}
              onChange={handleChange}
            />

            <input
              type="text"
              name="phone"
              placeholder="Số điện thoại"
              value={form.phone}
              onChange={handleChange}
            />

            <textarea
              name="address"
              placeholder="Địa chỉ"
              value={form.address}
              onChange={handleChange}
            />

            <textarea
              name="note"
              placeholder="Ghi chú (tuỳ chọn)"
              value={form.note}
              onChange={handleChange}
            />

            <select
              name="paymentMethod"
              value={form.paymentMethod}
              onChange={handleChange}
            >
              <option value="COD">Thanh toán khi nhận hàng</option>
              <option value="BANK">Chuyển khoản ngân hàng</option>
            </select>
          </div>

          {/* RIGHT - ORDER SUMMARY */}
          <div className="checkout-summary">
            <h3>Đơn hàng</h3>

            {cartItems.map((item) => (
              <div key={item.id} className="summary-item">
                <span>
                  {item.name} x {item.quantity}
                </span>
                <span>
                  {(item.price * item.quantity).toLocaleString()} đ
                </span>
              </div>
            ))}

            <hr />

            <h3>Total: {getTotal().toLocaleString()} đ</h3>

            <button
              className="checkout-btn"
              onClick={handleCheckout}
              disabled={loading}
            >
              Place Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;