import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/customer/cartPage.css";

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError("");

      // 👉 Nếu bạn có API cart
      const res = await axios.get("https://localhost:5001/api/cart");

      setCartItems(res.data || []);
    } catch (err) {
      console.error(err);

      // fallback localStorage
      const localCart = JSON.parse(localStorage.getItem("cart")) || [];
      setCartItems(localCart);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (id, newQty) => {
    if (newQty < 1) return;

    try {
      const updated = cartItems.map((item) =>
        item.id === id ? { ...item, quantity: newQty } : item
      );

      setCartItems(updated);

      // optional API sync
      await axios.put(`https://localhost:5001/api/cart/${id}`, {
        quantity: newQty,
      });

      localStorage.setItem("cart", JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
  };

  const removeItem = async (id) => {
    try {
      const updated = cartItems.filter((item) => item.id !== id);
      setCartItems(updated);

      await axios.delete(`https://localhost:5001/api/cart/${id}`);

      localStorage.setItem("cart", JSON.stringify(updated));
    } catch (err) {
      console.error(err);
      alert("Xóa sản phẩm thất bại");
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  };

  const handleCheckout = async () => {
    try {
      await axios.post("https://localhost:5001/api/orders/checkout", {
        items: cartItems,
      });

      alert("Thanh toán thành công!");
      setCartItems([]);
      localStorage.removeItem("cart");
    } catch (err) {
      console.error(err);
      alert("Thanh toán thất bại");
    }
  };

  return (
    <div className="cart-page">
      <h2>Your Cart</h2>

      {loading && <p>Loading cart...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <>
          {cartItems.length === 0 ? (
            <p>Giỏ hàng trống</p>
          ) : (
            <>
              <table className="cart-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {cartItems.map((item) => (
                    <tr key={item.id}>
                      <td className="product-info">
                        {item.name}
                      </td>

                      <td>{item.price.toLocaleString()} đ</td>

                      <td>
                        <div className="qty-control">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                          >
                            -
                          </button>

                          <span>{item.quantity}</span>

                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                          >
                            +
                          </button>
                        </div>
                      </td>

                      <td>
                        {(item.price * item.quantity).toLocaleString()} đ
                      </td>

                      <td>
                        <button
                          className="remove-btn"
                          onClick={() => removeItem(item.id)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Summary */}
              <div className="cart-summary">
                <h3>Total: {getTotalPrice().toLocaleString()} đ</h3>

                <button className="checkout-btn" onClick={handleCheckout}>
                  Checkout
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default CartPage;
