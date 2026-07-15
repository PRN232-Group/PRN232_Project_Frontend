import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { quotationService } from "../../application/services";
import { notifySuccess, notifyError } from "../../application/services/notify";
import { formatVnd, discountPct } from "../../domain/roles";

const statusVi = {
  PendingApproval: "Chờ duyệt",
  Approved: "Đã duyệt",
  Rejected: "Từ chối",
  Pending: "Chờ",
};

const QuotationApprovalPage = () => {
  const [quotations, setQuotations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const res = await quotationService.getQuotations();
      setQuotations(res.data || []);
    } catch (err) {
      console.error(err);
      notifyError("Không tải được báo giá");
    } finally {
      setLoading(false);
    }
  };

  const selectQuotation = (q) => {
    setSelected(q);
    setNote(q.notes || q.note || "");
  };

  const handleUpdate = async (newStatus) => {
    if (!selected) return;
    try {
      await quotationService.updateQuotation(selected.id, {
        status: newStatus,
        notes: note,
        note,
      });
      notifySuccess(
        newStatus === "Approved" ? "Đã duyệt báo giá" : "Đã từ chối báo giá"
      );
      setSelected(null);
      fetchQuotations();
    } catch {
      notifyError("Cập nhật thất bại");
    }
  };

  return (
    <div className="staff-page">
      <h2>Duyệt báo giá</h2>
      <p className="staff-page-sub">
        Xem chi tiết sản phẩm catalog (giá, kho, % giảm) trước khi duyệt cho
        khách.
      </p>

      <div className="staff-split">
        <div className="staff-panel">
          <div className="staff-panel-head">
            <h3>Danh sách báo giá</h3>
          </div>
          {loading && <p className="staff-empty">Đang tải...</p>}
          {!loading &&
            quotations.map((q) => (
              <button
                key={q.id}
                type="button"
                className={
                  selected?.id === q.id
                    ? "staff-list-item is-active"
                    : "staff-list-item"
                }
                onClick={() => selectQuotation(q)}
              >
                <strong>{q.title || `Báo giá #${q.id}`}</strong>
                <div className="staff-list-meta">
                  <span>{q.customerName}</span>
                  <span className="staff-badge is-pending">
                    {statusVi[q.status] || q.status}
                  </span>
                </div>
                <div className="staff-price" style={{ marginTop: 4 }}>
                  {formatVnd(q.totalPrice || q.amount)}
                </div>
              </button>
            ))}
          {!loading && quotations.length === 0 && (
            <p className="staff-empty">Chưa có báo giá</p>
          )}
        </div>

        <div className="staff-panel">
          {!selected ? (
            <p className="staff-empty">Chọn một báo giá để xem chi tiết</p>
          ) : (
            <>
              <div className="staff-panel-head">
                <h3>{selected.title || `Báo giá #${selected.id}`}</h3>
              </div>
              <div style={{ padding: 16 }}>
                <p>
                  <b>Khách:</b> {selected.customerName}
                  {selected.customerEmail ? ` · ${selected.customerEmail}` : ""}
                </p>
                <p>
                  <b>Tổng báo giá:</b>{" "}
                  <span className="staff-price">
                    {formatVnd(selected.totalPrice || selected.amount)}
                  </span>
                </p>
                {selected.marketTotal > 0 && (
                  <p>
                    <b>TB thị trường:</b>{" "}
                    <span className="staff-price-market">
                      {formatVnd(selected.marketTotal)}
                    </span>
                    {selected.savings > 0 && (
                      <span className="staff-badge is-save" style={{ marginLeft: 8 }}>
                        Tiết kiệm {formatVnd(selected.savings)}
                      </span>
                    )}
                  </p>
                )}
                <p style={{ color: "var(--muted)", fontSize: 13 }}>
                  Tạo:{" "}
                  {selected.createdAt
                    ? new Date(selected.createdAt).toLocaleString("vi-VN")
                    : "—"}
                </p>

                <h4 style={{ marginTop: 16 }}>Sản phẩm trong báo giá</h4>
                <div className="staff-table-wrap">
                  <table className="staff-table">
                    <thead>
                      <tr>
                        <th>Sản phẩm</th>
                        <th>Kho</th>
                        <th>Giá / TT</th>
                        <th>Giảm</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selected.items || []).map((i) => {
                        const pct = discountPct(i.price, i.marketPrice);
                        return (
                          <tr key={i.productId}>
                            <td>
                              <div className="staff-product-cell">
                                <img src={i.imageUrl} alt="" />
                                <div>
                                  <h4>{i.productName}</h4>
                                  <p>
                                    <Link to={`/products/${i.productId}`}>
                                      Xem storefront →
                                    </Link>
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td>{i.stock}</td>
                            <td>
                              <span className="staff-price">
                                {formatVnd(i.price)}
                              </span>
                              {i.marketPrice > i.price && (
                                <span className="staff-price-market">
                                  {formatVnd(i.marketPrice)}
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
                </div>

                <div className="staff-field" style={{ marginTop: 14 }}>
                  <label>Ghi chú nội bộ</label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Ghi chú khi duyệt / từ chối..."
                  />
                </div>

                <div className="staff-actions" style={{ marginTop: 14 }}>
                  <button
                    type="button"
                    className="staff-btn staff-btn-primary"
                    onClick={() => handleUpdate("Approved")}
                  >
                    Duyệt
                  </button>
                  <button
                    type="button"
                    className="staff-btn staff-btn-danger"
                    onClick={() => handleUpdate("Rejected")}
                  >
                    Từ chối
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuotationApprovalPage;
