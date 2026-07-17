import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { quotationService } from "../../application/services";
import UserContext from "../../contexts/UserContext";
import { formatVnd } from "../../domain/roles";
import { notifyError, notifySuccess } from "../../application/services/notify";
import { quoteLinesToCart, buildQuoteCheckoutItems } from "../../domain/quotationCheckout";
import { setLocalCart } from "../../utils/cartLocal";
import "../../styles/customer/blogPage.css";

/** Trạng thái hiển thị phía khách (ẩn chi tiết duyệt nội bộ) */
const REQ_STATUS = {
  Pending: "Chờ Sales phản hồi",
  Replied: "Sales đã phản hồi",
};

const QUOTE_STATUS = {
  PendingApproval: "Sales đang hoàn tất báo giá",
  Approved: "Đã duyệt — có thể thanh toán",
  Rejected: "Báo giá bị từ chối",
};

const MyQuotationsPage = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        setLoading(true);
        const [rRes, qRes] = await Promise.all([
          quotationService.getMyRequests().catch(() =>
            quotationService.getRequests()
          ),
          quotationService.getMyQuotations().catch(() =>
            quotationService.getQuotations()
          ),
        ]);
        const uid = user.id;
        const reqs = (rRes.data || []).filter(
          (r) =>
            !uid ||
            r.customerId == null ||
            Number(r.customerId) === Number(uid)
        );
        const quotes = (qRes.data || []).filter(
          (q) =>
            !uid ||
            q.customerId == null ||
            Number(q.customerId) === Number(uid)
        );
        setRequests(reqs);
        setQuotations(quotes);
      } catch {
        notifyError("Không tải được báo giá của bạn");
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const applyToCart = (q) => {
    const lines = quoteLinesToCart(q);
    if (!lines.length) {
      notifyError("Báo giá chưa có sản phẩm");
      return;
    }
    setLocalCart(lines);
    notifySuccess(
      `Đã áp dụng giá báo giá #${q.id} vào giỏ — kiểm tra rồi thanh toán`
    );
    navigate("/cart");
  };

  const payQuote = (q) => {
    const items = buildQuoteCheckoutItems(q);
    if (!items.length) {
      notifyError("Báo giá chưa có sản phẩm");
      return;
    }
    navigate("/checkout", {
      state: {
        fromQuotation: {
          id: q.id,
          title: q.title,
          amount: q.amount || q.totalPrice,
          items,
        },
      },
    });
  };

  if (!user) {
    return (
      <div className="blog-page page">
        <h1>Báo giá của tôi</h1>
        <p className="blog-status">
          <Link to="/login">Đăng nhập</Link> để xem phản hồi báo giá.
        </p>
      </div>
    );
  }

  return (
    <div className="blog-page page">
      <header className="blog-hero">
        <h1>Báo giá của tôi</h1>
        <p>
          Đây là nơi nhận phản hồi từ Sales: trả lời nhanh trên yêu cầu, và bản
          báo giá chính thức (duyệt / từ chối). Giá đã duyệt có thể thanh toán
          ngay hoặc áp vào giỏ.
        </p>
        <p style={{ marginTop: 10, fontSize: "0.9rem" }}>
          <Link to="/cart">← Về giỏ hàng</Link>
          {" · "}
          Gửi yêu cầu mới từ giỏ (không gửi lẻ từng SP).
        </p>
      </header>

      {loading && <p className="blog-status">Đang tải…</p>}

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.35rem" }}>
          1. Yêu cầu & phản hồi Sales
        </h2>
        {!loading && requests.length === 0 && (
          <p className="blog-status">
            Chưa có yêu cầu. Thêm SP vào <Link to="/cart">giỏ</Link> rồi bấm
            “Gửi yêu cầu báo giá”.
          </p>
        )}
        <div className="blog-grid">
          {requests.map((r) => (
            <article
              key={r.id}
              className="blog-card"
              style={{ cursor: "default" }}
            >
              <div className="blog-card-body">
                <span>{REQ_STATUS[r.status] || r.status}</span>
                <h2>{r.title}</h2>
                <p
                  style={{
                    color: "var(--muted)",
                    fontSize: "0.88rem",
                    margin: "8px 0 0",
                  }}
                >
                  {r.description || "—"}
                </p>
                {r.replyNote || r.reply ? (
                  <p
                    style={{
                      marginTop: 12,
                      fontSize: "0.92rem",
                      padding: "10px 12px",
                      background: "var(--sand, #f3eee6)",
                      borderRadius: 8,
                    }}
                  >
                    <b>Phản hồi Sales:</b> {r.replyNote || r.reply}
                  </p>
                ) : (
                  <p
                    style={{
                      marginTop: 10,
                      fontSize: "0.85rem",
                      color: "var(--muted)",
                    }}
                  >
                    Chưa có phản hồi — Sales sẽ trả lời tại đây.
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.35rem" }}>
          2. Bản báo giá chính thức
        </h2>
        {!loading && quotations.length === 0 && (
          <p className="blog-status">
            Chưa có bản chính thức. Khi Sales lập & duyệt, sẽ hiện ở đây kèm giá
            chốt.
          </p>
        )}
        <div className="blog-grid">
          {quotations.map((q) => {
            const approved = q.status === "Approved";
            const rejected = q.status === "Rejected";
            return (
              <article
                key={q.id}
                className="blog-card"
                style={{ cursor: "default" }}
              >
                <div className="blog-card-body">
                  <span>{QUOTE_STATUS[q.status] || q.status}</span>
                  <h2>{q.title || `Báo giá #${q.id}`}</h2>
                  <p className="price" style={{ marginTop: 8 }}>
                    {formatVnd(q.totalPrice || q.amount)}
                  </p>
                  {(q.notes || q.note) && (
                    <p
                      style={{
                        marginTop: 8,
                        fontSize: "0.88rem",
                        color: "var(--muted)",
                      }}
                    >
                      Ghi chú: {q.notes || q.note}
                    </p>
                  )}
                  {rejected && (
                    <p style={{ marginTop: 10, fontSize: "0.88rem" }}>
                      Báo giá này không được duyệt. Bạn có thể gửi yêu cầu mới từ
                      giỏ hoặc liên hệ Sales qua chat.
                    </p>
                  )}
                  {approved && (
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 8,
                        marginTop: 14,
                      }}
                    >
                      <button
                        type="button"
                        className="checkout-btn"
                        style={{ minHeight: 40, padding: "0 16px", fontSize: "0.88rem" }}
                        onClick={() => payQuote(q)}
                      >
                        Thanh toán theo giá này
                      </button>
                      <button
                        type="button"
                        className="checkout-btn checkout-btn--ghost"
                        style={{ minHeight: 40, padding: "0 16px", fontSize: "0.88rem" }}
                        onClick={() => applyToCart(q)}
                      >
                        Áp vào giỏ (xem như hình giỏ)
                      </button>
                    </div>
                  )}
                  {!approved && !rejected && (
                    <p
                      style={{
                        marginTop: 10,
                        fontSize: "0.85rem",
                        color: "var(--muted)",
                      }}
                    >
                      Đợi Sales duyệt xong mới thanh toán được theo giá báo.
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default MyQuotationsPage;
