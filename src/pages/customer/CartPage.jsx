import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cartService } from "../../application/services";
import UserContext from "../../contexts/UserContext";
import { getLocalCart, setLocalCart } from "../../utils/cartLocal";
import { notifyInfo, notifyError } from "../../application/services/notify";
import QuoteRequestModal from "../../components/QuoteRequestModal";

const CartPage = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [justCheckedOut, setJustCheckedOut] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);

  useEffect(() => {
    fetchCart();
  }, [user]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      setJustCheckedOut(false);
      if (user) {
        try {
          const res = await cartService.get();
          const apiItems = (res.data || []).map((i) => ({
            ...i,
            name: i.name || i.productName,
            price: i.price ?? i.unitPrice ?? 0,
          }));
          if (apiItems.length) {
            setCartItems(apiItems);
            setLocalCart(apiItems);
            return;
          }
        } catch {
          /* fall through to local */
        }
      }
      setCartItems(getLocalCart());
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (id, newQty) => {
    if (newQty < 1) return;
    const prev = cartItems;
    const updated = cartItems.map((item) =>
      item.id === id ? { ...item, quantity: newQty } : item
    );
    setCartItems(updated);
    setLocalCart(updated);
    if (user) {
      try {
        await cartService.update(id, { quantity: newQty });
      } catch (err) {
        setCartItems(prev);
        setLocalCart(prev);
        notifyError(
          err?.response?.data?.message ||
            err?.message ||
            "Không cập nhật được số lượng — có thể đã hết hàng"
        );
      }
    }
  };

  const removeItem = async (id) => {
    const updated = cartItems.filter((item) => item.id !== id);
    setCartItems(updated);
    setLocalCart(updated);
    if (user) {
      try {
        await cartService.remove(id);
      } catch {
        /* ignore */
      }
    }
  };

  const getTotalPrice = () =>
    cartItems.reduce(
      (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
      0
    );

  const handleCheckout = () => {
    if (!cartItems.length) return;
    if (!user) {
      notifyInfo("Vui lòng đăng nhập để thanh toán");
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }
    navigate("/checkout");
  };

  const openQuote = () => {
    if (!cartItems.length) return;
    if (!user) {
      notifyInfo("Vui lòng đăng nhập để gửi yêu cầu báo giá");
      navigate("/login", { state: { from: "/cart" } });
      return;
    }
    setQuoteOpen(true);
  };

  const quoteItems = (() => {
    const map = new Map();
    for (const i of cartItems) {
      const pid = Number(i.productId || i.id);
      if (!Number.isFinite(pid) || pid <= 0) continue;
      const qty = Math.max(1, Number(i.quantity) || 1);
      map.set(pid, (map.get(pid) || 0) + qty);
    }
    return [...map.entries()].map(([productId, quantity]) => ({
      productId,
      quantity,
    }));
  })();

  const quoteProductIds = quoteItems.map((i) => i.productId);

  const quoteDesc = cartItems
    .map((i) => `${i.name || i.productName} × ${i.quantity}`)
    .join("; ");

  return (
    <div className="cart-page page">
      <h2>Giỏ hàng</h2>

      {loading && <p>Đang tải giỏ hàng...</p>}

      {!loading && justCheckedOut && (
        <div className="feedback-banner feedback-banner--success">
          Đặt hàng thành công! Giỏ đã được làm trống.{" "}
          <Link to="/orders">Xem đơn hàng →</Link>
        </div>
      )}

      {!loading && cartItems.length === 0 && !justCheckedOut && (
        <div className="empty-cart-panel">
          <p className="empty-cart-title">Giỏ hàng đang trống</p>
          <p className="empty-cart-desc">
            Thêm sản phẩm rồi thanh toán niêm yết, hoặc gửi yêu cầu báo giá cả
            giỏ. Phản hồi Sales xem tại{" "}
            <Link to="/my-quotations">Báo giá của tôi</Link>.
          </p>
          <Link to="/products" className="checkout-btn">
            Xem sản phẩm
          </Link>
        </div>
      )}

      {!loading && cartItems.length > 0 && (
        <>
          <div style={{ overflowX: "auto" }}>
            <table className="cart-table">
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Đơn giá</th>
                  <th>SL</th>
                  <th>Thành tiền</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
                  <tr key={item.id}>
                    <td className="product-info">
                      {item.name || item.productName}
                      {item.fromQuotationId ? (
                        <div
                          style={{
                            fontSize: "0.78rem",
                            color: "var(--muted)",
                            marginTop: 4,
                          }}
                        >
                          Giá theo báo giá #{item.fromQuotationId}
                        </div>
                      ) : null}
                    </td>
                    <td>
                      {Number(item.price || 0).toLocaleString("vi-VN")} ₫
                    </td>
                    <td>
                      <div className="qty-control">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                        >
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td>
                      {(
                        Number(item.price || 0) * Number(item.quantity || 0)
                      ).toLocaleString("vi-VN")}{" "}
                      ₫
                    </td>
                    <td>
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() => removeItem(item.id)}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="cart-summary">
            <h3>
              Tổng: {getTotalPrice().toLocaleString("vi-VN")} ₫
            </h3>
            <div className="cart-summary-actions">
              <button
                type="button"
                className="checkout-btn checkout-btn--ghost"
                onClick={openQuote}
              >
                Gửi yêu cầu báo giá
              </button>
              <button
                type="button"
                className="checkout-btn"
                onClick={handleCheckout}
              >
                {user ? "Thanh toán" : "Đăng nhập để thanh toán"}
              </button>
            </div>
          </div>
          <p style={{ marginTop: 12, color: "var(--muted)", fontSize: 14 }}>
            Giá trong giỏ là niêm yết. Sau khi Sales duyệt báo giá, vào{" "}
            <Link to="/my-quotations">Báo giá của tôi</Link> để xem phản hồi và
            thanh toán theo giá đã chốt (hoặc áp dụng vào giỏ).
          </p>
          {!user && (
            <p style={{ marginTop: 8, color: "var(--muted)", fontSize: 14 }}>
              Bạn đang mua với tư cách khách — giỏ lưu trên máy này. Thanh toán /
              báo giá cần đăng nhập tài khoản Khách hàng.
            </p>
          )}
        </>
      )}

      <QuoteRequestModal
        open={quoteOpen}
        onClose={() => setQuoteOpen(false)}
        productIds={quoteProductIds}
        items={quoteItems}
        defaultTitle="Báo giá theo giỏ hàng"
        defaultDescription={quoteDesc}
      />
    </div>
  );
};

export default CartPage;
