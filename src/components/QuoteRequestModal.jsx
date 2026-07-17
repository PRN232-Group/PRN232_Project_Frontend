import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserContext from "../contexts/UserContext";
import { quotationService } from "../application/services";
import { notifySuccess, notifyError } from "../application/services/notify";
import StaffModalPortal from "./StaffModalPortal";

/**
 * Modal gửi yêu cầu báo giá — dùng từ giỏ (kèm số lượng).
 * `items`: [{ productId, quantity }] — ưu tiên hơn `productIds`.
 */
export default function QuoteRequestModal({
  open,
  onClose,
  productIds = [],
  items = [],
  defaultTitle = "",
  defaultDescription = "",
}) {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [title, setTitle] = useState(defaultTitle);
  const [description, setDescription] = useState(defaultDescription);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTitle(defaultTitle);
    setDescription(defaultDescription);
  }, [open, defaultTitle, defaultDescription]);

  const submit = async () => {
    if (!user) {
      notifyError("Vui lòng đăng nhập để gửi yêu cầu báo giá");
      navigate("/login", { state: { from: "/my-quotations" } });
      return;
    }
    if (!title.trim()) {
      notifyError("Nhập tiêu đề yêu cầu");
      return;
    }

    const lineMap = new Map();
    for (const it of items || []) {
      const pid = Number(it.productId ?? it.id);
      if (!Number.isFinite(pid) || pid <= 0) continue;
      const qty = Math.max(1, Number(it.quantity) || 1);
      lineMap.set(pid, (lineMap.get(pid) || 0) + qty);
    }
    if (!lineMap.size) {
      for (const raw of productIds || []) {
        const pid = Number(raw);
        if (!Number.isFinite(pid) || pid <= 0) continue;
        lineMap.set(pid, (lineMap.get(pid) || 0) + 1);
      }
    }
    if (!lineMap.size) {
      notifyError("Chọn ít nhất một sản phẩm");
      return;
    }

    const payloadItems = [...lineMap.entries()].map(([productId, quantity]) => ({
      productId,
      quantity,
    }));

    setSaving(true);
    try {
      await quotationService.createRequest({
        title: title.trim(),
        description: description.trim(),
        productIds: payloadItems.map((i) => i.productId),
        items: payloadItems,
      });
      notifySuccess("Đã gửi yêu cầu báo giá — Sales sẽ phản hồi sớm");
      onClose?.();
      navigate("/my-quotations");
    } catch (err) {
      notifyError(
        err?.response?.data?.message ||
          err?.message ||
          "Gửi thất bại (BE báo giá có thể chưa sẵn)"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <StaffModalPortal open={open} onClose={onClose}>
      <div
        className="staff-modal quote-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="staff-modal-head">
          <h3>Yêu cầu báo giá</h3>
          <button type="button" className="staff-modal-x" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="staff-modal-body">
          <p className="staff-page-sub" style={{ marginBottom: 14 }}>
            Giá trên sản phẩm là niêm yết. Gửi yêu cầu để Sales báo giá theo gói
            / số lượng / điều kiện của bạn (
            {items.length
              ? items.reduce((s, i) => s + (Number(i.quantity) || 1), 0)
              : productIds.length}{" "}
            dòng).
          </p>
          <div className="staff-field">
            <label htmlFor="qr-title">Tiêu đề</label>
            <input
              id="qr-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Báo giá phòng khách 20m²"
            />
          </div>
          <div className="staff-field">
            <label htmlFor="qr-desc">Ghi chú thêm</label>
            <textarea
              id="qr-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Số lượng, địa chỉ giao, thời gian mong muốn…"
              rows={4}
            />
          </div>
        </div>
        <div className="staff-modal-foot">
          <button
            type="button"
            className="staff-btn staff-btn-ghost"
            onClick={onClose}
          >
            Hủy
          </button>
          <button
            type="button"
            className="staff-btn staff-btn-primary"
            disabled={saving}
            onClick={submit}
          >
            {saving ? "Đang gửi…" : "Gửi yêu cầu"}
          </button>
        </div>
      </div>
    </StaffModalPortal>
  );
}
