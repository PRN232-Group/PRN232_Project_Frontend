import React, { useCallback, useEffect, useState } from "react";
import { systemLogService } from "../../application/services";

const PAGE_SIZE = 20;

const ACTION_VI = {
  CREATE_USER: "Tạo người dùng",
  UPDATE_USER_ROLE: "Đổi vai trò",
  LOCK_USER: "Khóa / mở khóa",
  UPDATE_PERMISSIONS: "Cập nhật phân quyền",
  UPDATE_ORDER_STATUS: "Đổi trạng thái đơn",
  APPROVE_QUOTATION: "Duyệt báo giá",
  CREATE_DESIGN_REQUEST: "Tạo yêu cầu thiết kế",
  UPDATE_DESIGN_REQUEST_STATUS: "Cập nhật yêu cầu thiết kế",
  LOGIN: "Đăng nhập",
  LOGIN_FAILED: "Đăng nhập thất bại",
  REGISTER_REQUEST: "Yêu cầu đăng ký (OTP)",
  REGISTER: "Đăng ký thành công",
  FORGOT_PASSWORD: "Quên mật khẩu",
  RESET_PASSWORD: "Đặt lại mật khẩu",
};

const VERB_VI = {
  CREATE: "Tạo",
  UPDATE: "Cập nhật",
  DELETE: "Xóa",
};

const ENTITY_VI = {
  USER: "người dùng",
  PRODUCT: "sản phẩm",
  CATEGORY: "danh mục",
  ORDER: "đơn hàng",
  ORDER_ITEM: "chi tiết đơn",
  CART: "giỏ hàng",
  CART_ITEM: "mục giỏ hàng",
  QUOTATION: "báo giá",
  QUOTATION_REQUEST: "yêu cầu báo giá",
  QUOTATION_PRODUCT: "SP trong báo giá",
  QUOTATION_REQUEST_PRODUCT: "SP trong yêu cầu BG",
  CONTENT: "nội dung / blog",
  INTERIOR_DESIGN: "concept thiết kế",
  INTERIOR_DESIGN_IMAGE: "ảnh concept",
  INTERIOR_DESIGN_PRODUCT: "SP trong concept",
  INTERIOR_DESIGN_PACKAGE: "gói concept",
  INTERIOR_DESIGN_MATERIAL: "vật liệu concept",
  INTERIOR_DESIGN_SPEC: "thông số concept",
  INTERIOR_DESIGN_HIGHLIGHT: "highlight concept",
  DESIGN_REQUEST: "yêu cầu thiết kế",
  DESIGN_REQUEST_ATTACHMENT: "file đính kèm YCTK",
  CHAT_THREAD: "cuộc chat",
  CHAT_MESSAGE: "tin nhắn chat",
  PRODUCT_REVIEW: "đánh giá SP",
  PRODUCT_SPEC: "thông số SP",
  ROLE_PERMISSION: "phân quyền",
  ROLE: "vai trò",
};

const labelAction = (a) => {
  if (!a) return "—";
  if (ACTION_VI[a]) return ACTION_VI[a];
  const m = String(a).match(/^(CREATE|UPDATE|DELETE)_(.+)$/);
  if (m) {
    const verb = VERB_VI[m[1]] || m[1];
    const entity = ENTITY_VI[m[2]] || m[2].replaceAll("_", " ").toLowerCase();
    return `${verb} ${entity}`;
  }
  return a;
};

const SystemLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState("");
  const [entityFilter, setEntityFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const load = useCallback(async (pageNum = 1) => {
    try {
      setLoading(true);
      const params = {
        page: pageNum,
        pageSize: PAGE_SIZE,
      };
      if (actionFilter.trim()) params.action = actionFilter.trim();
      if (entityFilter.trim()) params.entity = entityFilter.trim();
      if (fromDate) params.from = new Date(fromDate).toISOString();
      if (toDate) {
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        params.to = end.toISOString();
      }
      const res = await systemLogService.getAll(params);
      const data = res.data;
      // Hỗ trợ cả response cũ (array) và mới (paged)
      if (Array.isArray(data)) {
        setLogs(data);
        setTotal(data.length);
      } else {
        setLogs(data?.items || []);
        setTotal(Number(data?.total) || 0);
      }
      setPage(pageNum);
    } catch (e) {
      console.error(e);
      setLogs([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [actionFilter, entityFilter, fromDate, toDate]);

  useEffect(() => {
    load(1);
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="staff-page">
      <h2>Nhật ký hệ thống</h2>
      <p className="staff-page-sub">
        Mọi thao tác ghi (tạo / sửa / xóa) và đăng nhập đều được ghi — phân trang server-side.
      </p>

      <div className="staff-toolbar" style={{ flexWrap: "wrap", gap: 8 }}>
        <input
          placeholder="Action (vd UPDATE_ORDER)"
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          style={{ maxWidth: 180 }}
        />
        <input
          placeholder="Entity (User/Order/...)"
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          style={{ maxWidth: 150 }}
        />
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          title="Từ ngày"
        />
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          title="Đến ngày"
        />
        <button
          type="button"
          className="staff-btn staff-btn-primary"
          onClick={() => load(1)}
        >
          Lọc
        </button>
        <button
          type="button"
          className="staff-btn staff-btn-ghost"
          onClick={() => {
            setActionFilter("");
            setEntityFilter("");
            setFromDate("");
            setToDate("");
          }}
        >
          Xóa lọc
        </button>
      </div>

      <p className="staff-status" style={{ marginBottom: 8 }}>
        {loading
          ? "Đang tải..."
          : `${total} bản ghi · trang ${page}/${totalPages}`}
      </p>

      <div className="staff-panel">
        <div className="staff-table-wrap">
          <table className="staff-table">
            <thead>
              <tr>
                <th style={{ width: 64 }}>ID</th>
                <th>Hành vi</th>
                <th>Đối tượng</th>
                <th>Chi tiết</th>
                <th>Người thực hiện</th>
                <th style={{ width: 160 }}>Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>#{log.id}</td>
                  <td>
                    <span className="staff-badge is-active" title={log.action}>
                      {labelAction(log.action)}
                    </span>
                  </td>
                  <td>
                    <strong>{log.entity}</strong>
                    {log.entityId ? ` #${log.entityId}` : ""}
                  </td>
                  <td
                    style={{
                      maxWidth: 280,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={log.detail || ""}
                  >
                    {log.detail || "—"}
                  </td>
                  <td>
                    {log.actorName ||
                      (log.actorUserId != null
                        ? `User #${log.actorUserId}`
                        : "Hệ thống")}
                  </td>
                  <td>
                    {log.createdAt
                      ? new Date(log.createdAt).toLocaleString("vi-VN")
                      : "—"}
                  </td>
                </tr>
              ))}
              {!loading && logs.length === 0 && (
                <tr>
                  <td colSpan={6} className="staff-empty">
                    Không có nhật ký
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div
        className="staff-toolbar"
        style={{ justifyContent: "center", marginTop: 12, gap: 12 }}
      >
        <button
          type="button"
          className="staff-btn staff-btn-ghost"
          disabled={page <= 1 || loading}
          onClick={() => load(page - 1)}
        >
          ← Trước
        </button>
        <span className="staff-status">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          className="staff-btn staff-btn-ghost"
          disabled={page >= totalPages || loading}
          onClick={() => load(page + 1)}
        >
          Sau →
        </button>
      </div>
    </div>
  );
};

export default SystemLogPage;
