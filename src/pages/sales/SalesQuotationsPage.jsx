import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { quotationService } from "../../application/services";
import { notifySuccess, notifyError } from "../../application/services/notify";
import { formatVnd, discountPct } from "../../domain/roles";

const REQ_STATUS = {
  Pending: "Chờ xử lý",
  Replied: "Đã trả lời",
};

const QUOTE_STATUS = {
  PendingApproval: "Chờ duyệt",
  Approved: "Đã duyệt",
  Rejected: "Từ chối",
};

function quoteBadgeClass(status) {
  if (status === "Approved") return "staff-badge is-done";
  if (status === "Rejected") return "staff-badge is-danger";
  return "staff-badge is-pending";
}

/**
 * Một hub Báo giá cho Sales — 2 việc khác nhau:
 * Tab 1 — Inbox: trả lời khách (không phải duyệt)
 * Tab 2 — Duyệt nội bộ: bản chính thức cần Duyệt / Từ chối trước khi chốt
 */
const SalesQuotationsPage = () => {
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") === "quotes" ? "quotes" : "requests";

  const [requests, setRequests] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [selectedReq, setSelectedReq] = useState(null);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [replyNote, setReplyNote] = useState("");
  const [quoteNote, setQuoteNote] = useState("");
  const [dealAmount, setDealAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const setTab = (next) => {
    const p = new URLSearchParams(params);
    if (next === "quotes") p.set("tab", "quotes");
    else p.delete("tab");
    setParams(p, { replace: true });
  };

  const quoteByRequestId = useMemo(() => {
    const map = new Map();
    for (const q of quotations) {
      const rid = q.quotationRequestId;
      if (rid == null) continue;
      const prev = map.get(Number(rid));
      // Prefer newest / terminal status
      if (!prev || Number(q.id) > Number(prev.id)) map.set(Number(rid), q);
    }
    return map;
  }, [quotations]);

  const linkedQuote = (req) =>
    req ? quoteByRequestId.get(Number(req.id)) || null : null;

  const inboxBadge = (req) => {
    const q = linkedQuote(req);
    if (q) return QUOTE_STATUS[q.status] || q.status;
    return REQ_STATUS[req.status] || req.status;
  };

  const load = async () => {
    try {
      setLoading(true);
      const [rRes, qRes] = await Promise.all([
        quotationService.getRequests(),
        quotationService.getQuotations(),
      ]);
      const reqs = rRes.data || [];
      const quotes = qRes.data || [];
      setRequests(reqs);
      setQuotations(quotes);
      setSelectedReq((prev) =>
        prev ? reqs.find((r) => r.id === prev.id) || null : null
      );
      setSelectedQuote((prev) =>
        prev ? quotes.find((q) => q.id === prev.id) || null : null
      );
    } catch {
      notifyError("Không tải được dữ liệu báo giá");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  /** Inbox badge: chỉ đếm yêu cầu chưa có bản chính thức */
  const pendingReqCount = useMemo(
    () =>
      requests.filter((r) => !quoteByRequestId.has(Number(r.id))).length,
    [requests, quoteByRequestId]
  );
  const pendingQuoteCount = useMemo(
    () => quotations.filter((q) => q.status === "PendingApproval").length,
    [quotations]
  );

  const selectRequest = (req) => {
    setSelectedReq(req);
    setReplyNote(req.replyNote || req.reply || "");
    setDealAmount(
      String(
        req.estimateTotal ||
          (req.lines || req.products || []).reduce(
            (s, p) => s + Number(p.price || 0) * Number(p.quantity || 1),
            0
          ) ||
          ""
      )
    );
  };

  const selectQuote = (q) => {
    setSelectedQuote(q);
    setQuoteNote(q.notes || q.note || "");
    setDealAmount(String(q.amount || q.totalPrice || ""));
  };

  const reqLines = (req) => {
    if (req?.lines?.length) return req.lines;
    return (req?.products || []).map((p) => ({
      productId: p.id,
      name: p.name,
      price: p.price,
      marketPrice: p.marketPrice,
      quantity: p.quantity || 1,
      stock: p.stock,
      imageUrl: p.imageUrl,
    }));
  };

  const handleReply = async () => {
    if (!selectedReq) return;
    try {
      await quotationService.reply(selectedReq.id, {
        replyNote,
        reply: replyNote,
        status: "Replied",
      });
      notifySuccess("Đã gửi phản hồi khách");
      setSelectedReq(null);
      await load();
    } catch (err) {
      notifyError(err?.response?.data?.message || "Gửi thất bại");
    }
  };

  const handleCreateQuote = async () => {
    if (!selectedReq) return;
    const amount = Number(String(dealAmount).replace(/[^\d.]/g, "")) || 0;
    if (amount <= 0) {
      notifyError("Nhập tổng báo giá (deal) hợp lệ — ghi chú không đổi giá thanh toán");
      return;
    }
    setCreating(true);
    try {
      const lines = reqLines(selectedReq);
      await quotationService.createQuotation({
        quotationRequestId: selectedReq.id,
        title: selectedReq.title,
        amount,
        productIds: selectedReq.productIds || lines.map((l) => l.productId),
        items: lines.map((l) => ({
          productId: l.productId || l.id,
          quantity: Number(l.quantity) || 1,
        })),
        notes:
          replyNote ||
          selectedReq.replyNote ||
          `Deal ${formatVnd(amount)} (catalog ${formatVnd(selectedReq.estimateTotal || 0)})`,
      });
      notifySuccess("Đã lập bản chính thức — chuyển sang tab Duyệt nội bộ");
      setTab("quotes");
      setSelectedReq(null);
      await load();
    } catch (err) {
      notifyError(
        err?.response?.data?.message ||
          "Chưa tạo được bản báo giá (BE có thể chưa sẵn)"
      );
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateQuote = async (newStatus) => {
    if (!selectedQuote) return;
    const amount = Number(String(dealAmount).replace(/[^\d.]/g, "")) || 0;
    if (amount <= 0) {
      notifyError("Nhập tổng báo giá (deal) trước khi duyệt — không dùng ghi chú để đổi giá");
      return;
    }
    try {
      await quotationService.updateQuotation(selectedQuote.id, {
        status: newStatus,
        amount,
        notes: quoteNote,
        note: quoteNote,
      });
      notifySuccess(
        newStatus === "Approved" ? "Đã duyệt báo giá" : "Đã từ chối báo giá"
      );
      setSelectedQuote(null);
      await load();
    } catch (err) {
      notifyError(err?.response?.data?.message || "Cập nhật thất bại");
    }
  };

  const handleSaveDealAmount = async () => {
    if (!selectedQuote) return;
    const amount = Number(String(dealAmount).replace(/[^\d.]/g, "")) || 0;
    if (amount <= 0) {
      notifyError("Nhập tổng báo giá (deal) hợp lệ");
      return;
    }
    try {
      await quotationService.updateQuotation(selectedQuote.id, {
        amount,
        notes: quoteNote,
        note: quoteNote,
      });
      notifySuccess("Đã cập nhật giá thanh toán (amount)");
      await load();
    } catch (err) {
      notifyError(err?.response?.data?.message || "Cập nhật thất bại");
    }
  };

  return (
    <div className="staff-page">
      <h2>Báo giá</h2>
      <p className="staff-page-sub">
        <b>Tab 1</b> = trả lời khách (chat/ước tính).{" "}
        <b>Tab 2</b> = bản chính thức cần duyệt nội bộ trước khi chốt deal.
        Không phải làm hai lần cùng một việc — phản hồi ≠ duyệt.
      </p>

      <div className="staff-seg" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "requests"}
          className={tab === "requests" ? "is-on" : ""}
          onClick={() => setTab("requests")}
        >
          1. Inbox yêu cầu
          {pendingReqCount > 0 && (
            <span className="staff-seg-count">{pendingReqCount}</span>
          )}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "quotes"}
          className={tab === "quotes" ? "is-on" : ""}
          onClick={() => setTab("quotes")}
        >
          2. Duyệt nội bộ
          {pendingQuoteCount > 0 && (
            <span className="staff-seg-count">{pendingQuoteCount}</span>
          )}
        </button>
        <button
          type="button"
          className="staff-btn staff-btn-ghost"
          style={{ marginLeft: "auto" }}
          onClick={load}
          disabled={loading}
        >
          Tải lại
        </button>
      </div>

      {tab === "requests" ? (
        <div className="staff-split">
          <div className="staff-panel staff-panel--list">
            <div className="staff-panel-head">
              <h3>Danh sách yêu cầu</h3>
            </div>
            <div className="staff-panel-scroll">
              {loading && <p className="staff-empty">Đang tải...</p>}
              {!loading && requests.length === 0 && (
                <p className="staff-empty">Chưa có yêu cầu từ khách</p>
              )}
              {requests.map((r) => {
                const q = linkedQuote(r);
                return (
                <button
                  key={r.id}
                  type="button"
                  className={
                    selectedReq?.id === r.id
                      ? "staff-list-item is-active"
                      : "staff-list-item"
                  }
                  onClick={() => selectRequest(r)}
                >
                  <strong>{r.title}</strong>
                  <div className="staff-list-meta">
                    <span>{r.customerName}</span>
                    <span className={quoteBadgeClass(q?.status || r.status)}>
                      {inboxBadge(r)}
                    </span>
                  </div>
                  {r.estimateTotal > 0 && (
                    <div className="staff-price" style={{ marginTop: 4 }}>
                      Ước tính {formatVnd(r.estimateTotal)}
                    </div>
                  )}
                </button>
                );
              })}
            </div>
          </div>

          <div className="staff-panel">
            {!selectedReq ? (
              <p className="staff-empty">Chọn yêu cầu để xem chi tiết</p>
            ) : (
              <>
                <div className="staff-panel-head">
                  <h3>{selectedReq.title}</h3>
                </div>
                <div style={{ padding: 16 }}>
                  {(() => {
                    const q = linkedQuote(selectedReq);
                    const decided =
                      q &&
                      (q.status === "Approved" || q.status === "Rejected");
                    const awaiting =
                      q && q.status === "PendingApproval";
                    return (
                      <>
                  <p>
                    <b>Khách:</b> {selectedReq.customerName}
                  </p>
                  <p>
                    <b>Mô tả:</b> {selectedReq.description || "—"}
                  </p>
                  <p style={{ fontSize: 13, color: "var(--muted)" }}>
                    {selectedReq.createdAt
                      ? new Date(selectedReq.createdAt).toLocaleString("vi-VN")
                      : ""}
                  </p>
                  {q && (
                    <p style={{ marginTop: 8 }}>
                      <b>Bản chính thức:</b>{" "}
                      <span className={quoteBadgeClass(q.status)}>
                        {QUOTE_STATUS[q.status] || q.status}
                      </span>
                      {" · "}
                      {formatVnd(q.totalPrice || q.amount)}
                    </p>
                  )}

                  <h4>Sản phẩm</h4>
                  {reqLines(selectedReq).length === 0 ? (
                    <p className="staff-empty">Chưa gắn sản phẩm</p>
                  ) : (
                    <div className="staff-table-wrap">
                      <table className="staff-table staff-table--quote">
                        <colgroup>
                          <col className="col-sp" />
                          <col className="col-kho" />
                          <col className="col-gia" />
                          <col className="col-giam" />
                        </colgroup>
                        <thead>
                          <tr>
                            <th>SP</th>
                            <th className="is-num">SL</th>
                            <th className="is-num">Đơn giá</th>
                            <th className="is-num">Giảm</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reqLines(selectedReq).map((p) => {
                            const pct = discountPct(p.price, p.marketPrice);
                            const qty = Number(p.quantity) || 1;
                            return (
                              <tr key={p.productId || p.id}>
                                <td>
                                  <div className="staff-product-cell">
                                    <img src={p.imageUrl} alt="" />
                                    <div>
                                      <h4 title={p.name}>{p.name}</h4>
                                    </div>
                                  </div>
                                </td>
                                <td className="is-num">{qty}</td>
                                <td className="is-num">
                                  <span className="staff-price">
                                    {formatVnd(p.price)}
                                  </span>
                                </td>
                                <td className="is-num">
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
                  )}

                  {selectedReq.estimateTotal > 0 && (
                    <p style={{ marginTop: 12 }}>
                      <b>Tổng catalog:</b>{" "}
                      <span className="staff-price">
                        {formatVnd(selectedReq.estimateTotal)}
                      </span>
                    </p>
                  )}

                  {decided ? (
                    <div className="staff-actions" style={{ marginTop: 16 }}>
                      <p className="staff-page-sub" style={{ margin: 0, flex: 1 }}>
                        Yêu cầu này đã{" "}
                        <b>{QUOTE_STATUS[q.status].toLowerCase()}</b> ở tab Duyệt
                        nội bộ — không lập / phản hồi lại từ Inbox.
                      </p>
                      <button
                        type="button"
                        className="staff-btn staff-btn-primary"
                        onClick={() => {
                          setTab("quotes");
                          selectQuote(q);
                        }}
                      >
                        Xem bản đã xử lý →
                      </button>
                    </div>
                  ) : awaiting ? (
                    <div className="staff-actions" style={{ marginTop: 16 }}>
                      <p className="staff-page-sub" style={{ margin: 0, flex: 1 }}>
                        Đã lập bản chính thức — đang chờ duyệt nội bộ.
                      </p>
                      <button
                        type="button"
                        className="staff-btn staff-btn-primary"
                        onClick={() => {
                          setTab("quotes");
                          selectQuote(q);
                        }}
                      >
                        Sang Duyệt nội bộ →
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="staff-field" style={{ marginTop: 14 }}>
                        <label>
                          Phản hồi khách (ước tính / điều kiện — chưa phải duyệt)
                        </label>
                        <textarea
                          value={replyNote}
                          onChange={(e) => setReplyNote(e.target.value)}
                          placeholder="Tổng ước tính, thời gian giao, điều kiện…"
                        />
                      </div>
                      <div className="staff-field" style={{ marginTop: 12 }}>
                        <label>
                          Tổng báo giá deal (₫) — bắt buộc khi lập bản chính thức
                        </label>
                        <input
                          type="number"
                          min={0}
                          step={1000}
                          value={dealAmount}
                          onChange={(e) => setDealAmount(e.target.value)}
                          placeholder="VD: 3000000"
                        />
                        <p className="staff-page-sub" style={{ marginTop: 6 }}>
                          Khách thanh toán theo số này, không theo ghi chú.
                        </p>
                      </div>
                      <div className="staff-actions" style={{ marginTop: 12 }}>
                        <button
                          type="button"
                          className="staff-btn staff-btn-primary"
                          onClick={handleReply}
                        >
                          Gửi phản hồi
                        </button>
                        <button
                          type="button"
                          className="staff-btn staff-btn-ghost"
                          disabled={creating}
                          onClick={handleCreateQuote}
                          title="Tạo bản chính thức rồi chuyển sang tab Duyệt nội bộ"
                        >
                          {creating
                            ? "Đang lập…"
                            : "Lập bản chính thức → Duyệt"}
                        </button>
                      </div>
                    </>
                  )}
                      </>
                    );
                  })()}
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="staff-split">
          <div className="staff-panel staff-panel--list">
            <div className="staff-panel-head">
              <h3>Chờ duyệt / đã xử lý</h3>
            </div>
            <div className="staff-panel-scroll">
              {loading && <p className="staff-empty">Đang tải...</p>}
              {!loading && quotations.length === 0 && (
                <p className="staff-empty">Chưa có bản báo giá</p>
              )}
              {quotations.map((q) => (
                <button
                  key={q.id}
                  type="button"
                  className={
                    selectedQuote?.id === q.id
                      ? "staff-list-item is-active"
                      : "staff-list-item"
                  }
                  onClick={() => selectQuote(q)}
                >
                  <strong>{q.title || `Báo giá #${q.id}`}</strong>
                  <div className="staff-list-meta">
                    <span>{q.customerName}</span>
                    <span className={quoteBadgeClass(q.status)}>
                      {QUOTE_STATUS[q.status] || q.status}
                    </span>
                  </div>
                  <div className="staff-price" style={{ marginTop: 4 }}>
                    {formatVnd(q.totalPrice || q.amount)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="staff-panel">
            {!selectedQuote ? (
              <p className="staff-empty">Chọn bản báo giá để duyệt</p>
            ) : (
              <>
                <div className="staff-panel-head">
                  <h3>{selectedQuote.title || `Báo giá #${selectedQuote.id}`}</h3>
                </div>
                <div style={{ padding: 16 }}>
                  <p>
                    <b>Khách:</b> {selectedQuote.customerName}
                  </p>
                  <p style={{ color: "var(--muted)", fontSize: 13 }}>
                    Tạo:{" "}
                    {selectedQuote.createdAt
                      ? new Date(selectedQuote.createdAt).toLocaleString("vi-VN")
                      : "—"}
                  </p>

                  <h4 style={{ marginTop: 16 }}>Sản phẩm</h4>
                  <div className="staff-table-wrap">
                    <table className="staff-table staff-table--quote">
                      <colgroup>
                        <col className="col-sp" />
                        <col className="col-kho" />
                        <col className="col-gia" />
                      </colgroup>
                      <thead>
                        <tr>
                          <th>Sản phẩm</th>
                          <th className="is-num">Số lượng</th>
                          <th className="is-num">Đơn giá</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(selectedQuote.items || []).map((i) => (
                          <tr key={i.productId}>
                            <td>
                              <div className="staff-product-cell">
                                <img src={i.imageUrl} alt="" />
                                <div>
                                  <h4 title={i.productName}>{i.productName}</h4>
                                </div>
                              </div>
                            </td>
                            <td className="is-num">{i.quantity || 1}</td>
                            <td className="is-num">
                              <span className="staff-price">
                                {formatVnd(i.price)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="staff-field" style={{ marginTop: 14 }}>
                    <label>Tổng báo giá deal (₫) — khách thanh toán theo số này</label>
                    <input
                      type="number"
                      min={0}
                      step={1000}
                      value={dealAmount}
                      onChange={(e) => setDealAmount(e.target.value)}
                    />
                  </div>

                  <div className="staff-field" style={{ marginTop: 14 }}>
                    <label>Ghi chú nội bộ (không đổi giá thanh toán)</label>
                    <textarea
                      value={quoteNote}
                      onChange={(e) => setQuoteNote(e.target.value)}
                      placeholder="Ghi chú khi duyệt / từ chối..."
                    />
                  </div>

                  {selectedQuote.status === "PendingApproval" && (
                    <div className="staff-actions" style={{ marginTop: 14 }}>
                      <button
                        type="button"
                        className="staff-btn staff-btn-primary"
                        onClick={() => handleUpdateQuote("Approved")}
                      >
                        Duyệt
                      </button>
                      <button
                        type="button"
                        className="staff-btn staff-btn-danger"
                        onClick={() => handleUpdateQuote("Rejected")}
                      >
                        Từ chối
                      </button>
                    </div>
                  )}
                  {selectedQuote.status !== "PendingApproval" && (
                    <div className="staff-actions" style={{ marginTop: 14 }}>
                      <button
                        type="button"
                        className="staff-btn staff-btn-primary"
                        onClick={handleSaveDealAmount}
                      >
                        Cập nhật giá deal
                      </button>
                      <p className="staff-page-sub" style={{ margin: 0, flex: 1 }}>
                        Tổng đã chốt:{" "}
                        <span className="staff-price">
                          {formatVnd(
                            selectedQuote.totalPrice || selectedQuote.amount
                          )}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesQuotationsPage;
