/**
 * Domain: unified order lifecycle (shared across Customer / Sales / Manager / Production).
 */

export const ORDER_STATUS = Object.freeze({
  PENDING: "Pending",
  PROCESSING: "Processing",
  SHIPPING: "Shipping",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
});

/** Happy-path order (không gồm Cancelled) */
export const ORDER_STATUS_FLOW = Object.freeze([
  ORDER_STATUS.PENDING,
  ORDER_STATUS.PROCESSING,
  ORDER_STATUS.SHIPPING,
  ORDER_STATUS.COMPLETED,
]);

export const ORDER_STATUS_OPTIONS = Object.freeze([
  ...ORDER_STATUS_FLOW,
  ORDER_STATUS.CANCELLED,
]);

export const ORDER_STATUS_LABEL_VI = Object.freeze({
  Pending: "Chờ xử lý",
  PROCESSING: "Đang xử lý",
  Processing: "Đang xử lý",
  Shipping: "Đang giao",
  SHIPPED: "Đang giao",
  Completed: "Hoàn tất",
  DONE: "Hoàn tất",
  Cancelled: "Đã hủy",
  CANCELLED: "Đã hủy",
  PENDING: "Chờ xử lý",
});

/** Normalize legacy / mixed-case API values → canonical status */
export function normalizeOrderStatus(raw) {
  const s = (raw || "").toString().trim().toUpperCase();
  if (["PENDING"].includes(s)) return ORDER_STATUS.PENDING;
  if (["PROCESSING", "PROCESS"].includes(s)) return ORDER_STATUS.PROCESSING;
  if (["SHIPPING", "SHIPPED"].includes(s)) return ORDER_STATUS.SHIPPING;
  if (["COMPLETED", "DONE", "COMPLETE"].includes(s)) return ORDER_STATUS.COMPLETED;
  if (["CANCELLED", "CANCELED"].includes(s)) return ORDER_STATUS.CANCELLED;
  const hit = ORDER_STATUS_OPTIONS.find(
    (o) => o.toUpperCase() === s || o === raw
  );
  return hit || ORDER_STATUS.PENDING;
}

export function orderStatusCssClass(raw) {
  const n = normalizeOrderStatus(raw);
  return n.toLowerCase();
}

export function orderStatusLabel(raw) {
  const n = normalizeOrderStatus(raw);
  return ORDER_STATUS_LABEL_VI[n] || n;
}

/** Hoàn tất / Đã hủy — không cho sửa nữa */
export function isTerminalOrderStatus(raw) {
  const n = normalizeOrderStatus(raw);
  return n === ORDER_STATUS.COMPLETED || n === ORDER_STATUS.CANCELLED;
}

/**
 * Chỉ hiện trạng thái hiện tại + các bước phía trước (+ Hủy nếu chưa kết thúc).
 * VD đang Processing → không còn Pending trong dropdown.
 */
export function allowedOrderStatusOptions(raw) {
  const current = normalizeOrderStatus(raw);
  if (isTerminalOrderStatus(current)) return [current];

  const idx = ORDER_STATUS_FLOW.indexOf(current);
  const forward =
    idx >= 0 ? ORDER_STATUS_FLOW.slice(idx) : [...ORDER_STATUS_FLOW];

  return [...forward, ORDER_STATUS.CANCELLED];
}
