import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { quotationService } from "../../application/services";
import { notifySuccess, notifyError } from "../../application/services/notify";
import { formatVnd, discountPct } from "../../domain/roles";

const statusVi = {
  Pending: "Chờ xử lý",
  Replied: "Đã trả lời",
  PROCESSING: "Đang xử lý",
  DONE: "Hoàn tất",
};

const QuotationRequestPage = () => {
  const [requests, setRequests] = useState([]);
  const [selected, setSelected] = useState(null);
  const [replyNote, setReplyNote] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await quotationService.getRequests();
      setRequests(res.data || []);
    } catch (err) {
      console.error(err);
      notifyError("Không tải yêu cầu báo giá");
    } finally {
      setLoading(false);
    }
  };

  const selectRequest = (req) => {
    setSelected(req);
    setReplyNote(req.replyNote || req.reply || "");
  };

  const handleReply = async () => {
    if (!selected) return;
    try {
      await quotationService.reply(selected.id, {
        replyNote,
        reply: replyNote,
        status: "Replied",
      });
      notifySuccess("Đã gửi phản hồi khách");
      fetchRequests();
      setSelected(null);
    } catch {
      notifyError("Gửi thất bại");
    }
  };

  return (
    <div className="staff-page">
      <h2>Yêu cầu báo giá</h2>
      <p className="staff-page-sub">
        Khách chọn sản phẩm từ catalog — xem giá, kho, % giảm trước khi trả lời.
      </p>

      <div className="staff-split">
        <div className="staff-panel">
          <div className="staff-panel-head">
            <h3>Danh sách yêu cầu</h3>
          </div>
          {loading && <p className="staff-empty">Đang tải...</p>}
          {requests.map((r) => (
            <button
              key={r.id}
              type="button"
              className={
                selected?.id === r.id
                  ? "staff-list-item is-active"
                  : "staff-list-item"
              }
              onClick={() => selectRequest(r)}
            >
              <strong>{r.title}</strong>
              <div className="staff-list-meta">
                <span>{r.customerName}</span>
                <span className="staff-badge is-pending">
                  {statusVi[r.status] || r.status}
                </span>
              </div>
              {r.estimateTotal > 0 && (
                <div className="staff-price" style={{ marginTop: 4 }}>
                  Ước tính {formatVnd(r.estimateTotal)}
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="staff-panel">
          {!selected ? (
            <p className="staff-empty">Chọn yêu cầu để xem chi tiết</p>
          ) : (
            <>
              <div className="staff-panel-head">
                <h3>{selected.title}</h3>
              </div>
              <div style={{ padding: 16 }}>
                <p>
                  <b>Khách:</b> {selected.customerName}
                </p>
                <p>
                  <b>Mô tả:</b> {selected.description}
                </p>
                <p style={{ fontSize: 13, color: "var(--muted)" }}>
                  {selected.createdAt
                    ? new Date(selected.createdAt).toLocaleString("vi-VN")
                    : ""}
                </p>

                <h4>Sản phẩm liên quan</h4>
                {(selected.products || []).length === 0 ? (
                  <p className="staff-empty">Chưa gắn productIds</p>
                ) : (
                  <table className="staff-table">
                    <thead>
                      <tr>
                        <th>SP</th>
                        <th>Kho</th>
                        <th>Giá</th>
                        <th>Giảm</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selected.products.map((p) => {
                        const pct = discountPct(p.price, p.marketPrice);
                        return (
                          <tr key={p.id}>
                            <td>
                              <div className="staff-product-cell">
                                <img src={p.imageUrl} alt="" />
                                <div>
                                  <h4>{p.name}</h4>
                                  <p>
                                    <Link to={`/products/${p.id}`}>
                                      Xem phía khách →
                                    </Link>
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td>{p.stock}</td>
                            <td>
                              <span className="staff-price">
                                {formatVnd(p.price)}
                              </span>
                              {p.marketPrice > p.price && (
                                <span className="staff-price-market">
                                  {formatVnd(p.marketPrice)}
                                </span>
                              )}
                            </td>
                            <td>
                              {pct > 0 ? (
                                <span className="staff-badge is-save">
                                  −{pct}%
                                </span>
                              ) : (
                                "—"
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}

                {selected.estimateTotal > 0 && (
                  <p style={{ marginTop: 12 }}>
                    <b>Tổng catalog:</b>{" "}
                    <span className="staff-price">
                      {formatVnd(selected.estimateTotal)}
                    </span>
                    {selected.marketTotal > selected.estimateTotal && (
                      <>
                        {" "}
                        · TT{" "}
                        <span className="staff-price-market">
                          {formatVnd(selected.marketTotal)}
                        </span>
                      </>
                    )}
                  </p>
                )}

                <div className="staff-field" style={{ marginTop: 14 }}>
                  <label>Phản hồi khách</label>
                  <textarea
                    value={replyNote}
                    onChange={(e) => setReplyNote(e.target.value)}
                    placeholder="VD: Tổng theo catalog…, thời gian giao…"
                  />
                </div>
                <div className="staff-actions" style={{ marginTop: 12 }}>
                  <button
                    type="button"
                    className="staff-btn staff-btn-primary"
                    onClick={handleReply}
                  >
                    Gửi phản hồi
                  </button>
                  <Link
                    to="/sales/quotation-approval"
                    className="staff-btn staff-btn-ghost"
                  >
                    Sang duyệt báo giá →
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuotationRequestPage;
