import React, { useContext, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  designRequestService,
  interiorDesignService,
} from "../../application/services";
import UserContext from "../../contexts/UserContext";
import { formatVnd } from "../../domain/roles";
import { notifyError, notifySuccess } from "../../application/services/notify";
import "../../styles/customer/profilePage.css";
import "../../styles/customer/designRequestPage.css";

const FLOW = ["New", "InReview", "Quoted", "Done"];

const STATUS_VI = {
  New: "Mới gửi",
  InReview: "Sales đang xem xét",
  Quoted: "Đã có hướng xử lý",
  Done: "Hoàn tất",
};

const STEP_SHORT = {
  New: "Mới",
  InReview: "Sales",
  Quoted: "Xử lý",
  Done: "Xong",
};

const emptyForm = {
  title: "",
  style: "",
  budget: "",
  notes: "",
  interiorDesignId: "",
};

function StatusTimeline({ status }) {
  const idx = FLOW.indexOf(status);
  return (
    <ol className="design-req-timeline" aria-label="Tiến độ yêu cầu">
      {FLOW.map((step, i) => {
        const done = idx >= 0 && i <= idx;
        const current = i === idx;
        return (
          <li
            key={step}
            className={`design-req-step${done ? " is-done" : ""}${
              current ? " is-current" : ""
            }`}
            title={STATUS_VI[step]}
          >
            {STEP_SHORT[step]}
          </li>
        );
      })}
    </ol>
  );
}

function badgeClass(status) {
  if (status === "Done") return "design-req-badge is-done";
  if (status === "New") return "design-req-badge";
  return "design-req-badge is-active";
}

const MyDesignRequestsPage = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [items, setItems] = useState([]);
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [lastRefresh, setLastRefresh] = useState(null);
  const prevStatuses = useRef({});

  useEffect(() => {
    if (!user) {
      navigate("/login", {
        replace: true,
        state: { from: "/my-design-requests" },
      });
      return;
    }
    load(true);
  }, [user, navigate]);

  useEffect(() => {
    const presetId = location.state?.interiorDesignId;
    if (presetId != null) {
      setForm((f) => ({
        ...f,
        interiorDesignId: String(presetId),
        title: f.title || `Yêu cầu theo concept #${presetId}`,
      }));
    }
  }, [location.state?.interiorDesignId]);

  useEffect(() => {
    if (!user) return undefined;
    const hasOpen = items.some((r) => r.status !== "Done");
    if (!hasOpen) return undefined;
    const t = setInterval(() => load(false), 25000);
    return () => clearInterval(t);
  }, [user, items]);

  const load = async (showSpinner = true) => {
    try {
      if (showSpinner) setLoading(true);
      const [mineRes, designRes] = await Promise.all([
        designRequestService.getMine(),
        interiorDesignService.getAll().catch(() => ({ data: [] })),
      ]);
      const list = mineRes.data || [];

      for (const r of list) {
        const prev = prevStatuses.current[r.id];
        if (prev && prev !== r.status) {
          notifySuccess(
            `#${r.id} · ${STATUS_VI[prev] || prev} → ${STATUS_VI[r.status] || r.status}`
          );
        }
      }
      prevStatuses.current = Object.fromEntries(
        list.map((r) => [r.id, r.status])
      );

      setItems(list);
      setDesigns(
        (designRes.data || []).filter((d) => d.isPublished !== false)
      );
      setLastRefresh(new Date());
    } catch {
      if (showSpinner) notifyError("Không tải được yêu cầu thiết kế");
      if (showSpinner) setItems([]);
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      notifyError("Nhập tiêu đề yêu cầu");
      return;
    }
    try {
      setSubmitting(true);
      const body = {
        title: form.title.trim(),
        style: form.style.trim() || null,
        notes: form.notes.trim() || null,
        budget: form.budget ? Number(form.budget) : null,
        interiorDesignId: form.interiorDesignId
          ? Number(form.interiorDesignId)
          : null,
      };
      await designRequestService.create(body);
      notifySuccess("Đã gửi yêu cầu — theo dõi trạng thái bên cạnh");
      setForm(emptyForm);
      load(true);
    } catch (err) {
      notifyError(err.response?.data?.message || "Gửi yêu cầu thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  const refreshLabel = lastRefresh
    ? lastRefresh.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="design-req-page profile-page page">
      <h2>Yêu cầu thiết kế của tôi</h2>
      <p className="design-req-lead">
        Gửi brief cho Sales. Khi trạng thái được cập nhật, danh sách bên cạnh
        tự làm mới khoảng mỗi 25 giây.
      </p>

      <div className="design-req-layout">
        <form className="design-req-form card-like" onSubmit={onSubmit}>
          <h3>Gửi yêu cầu mới</h3>
          <p className="design-req-form-hint">
            Mô tả không gian và phong cách mong muốn — càng rõ Sales xử lý càng
            nhanh.
          </p>

          <div className="design-req-field">
            <label htmlFor="dr-title">
              Tiêu đề <span className="req">*</span>
            </label>
            <input
              id="dr-title"
              name="title"
              value={form.title}
              onChange={onChange}
              required
              placeholder="VD: Căn hộ 2PN — Japandi"
            />
          </div>

          <div className="design-req-row">
            <div className="design-req-field">
              <label htmlFor="dr-style">Phong cách</label>
              <input
                id="dr-style"
                name="style"
                value={form.style}
                onChange={onChange}
                placeholder="Japandi / Scandinavian / …"
              />
            </div>
            <div className="design-req-field">
              <label htmlFor="dr-budget">Ngân sách (₫)</label>
              <input
                id="dr-budget"
                name="budget"
                type="number"
                min="0"
                value={form.budget}
                onChange={onChange}
                placeholder="VD: 80000000"
              />
            </div>
          </div>

          <div className="design-req-field">
            <label htmlFor="dr-concept">Concept tham chiếu</label>
            <select
              id="dr-concept"
              name="interiorDesignId"
              value={form.interiorDesignId}
              onChange={onChange}
            >
              <option value="">— Không chọn —</option>
              {designs.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title}
                </option>
              ))}
            </select>
          </div>

          <div className="design-req-field">
            <label htmlFor="dr-notes">Ghi chú</label>
            <textarea
              id="dr-notes"
              name="notes"
              value={form.notes}
              onChange={onChange}
              rows={4}
              placeholder="Diện tích, yêu cầu đặc biệt, thời gian mong muốn…"
            />
          </div>

          <div className="design-req-actions">
            <button
              type="submit"
              className="design-req-submit"
              disabled={submitting}
            >
              {submitting ? "Đang gửi…" : "Gửi yêu cầu"}
            </button>
            <p className="design-req-links">
              <Link to="/design">Gallery concept</Link>
              {" · "}
              <Link to="/chat">Chat với Sales</Link>
            </p>
          </div>
        </form>

        <section className="design-req-panel" aria-live="polite">
          <div className="design-req-panel-head">
            <div>
              <h3>Tiến độ yêu cầu</h3>
              <p className="design-req-panel-sub">
                {items.length
                  ? `${items.length} yêu cầu`
                  : "Chưa có yêu cầu nào"}
              </p>
            </div>
            <button
              type="button"
              className="design-req-refresh"
              onClick={() => load(true)}
            >
              Làm mới{refreshLabel ? ` · ${refreshLabel}` : ""}
            </button>
          </div>

          {loading && <p className="design-req-panel-sub">Đang tải…</p>}

          {!loading && items.length === 0 && (
            <div className="design-req-empty">
              <p>Bạn chưa gửi yêu cầu nào. Điền form bên trái để bắt đầu.</p>
            </div>
          )}

          {!loading && items.length > 0 && (
            <div className="design-req-list">
              {items.map((r) => (
                <article key={r.id} className="design-req-card">
                  <div className="design-req-card-top">
                    <span className={badgeClass(r.status)}>
                      {STATUS_VI[r.status] || r.status}
                    </span>
                    <span className="design-req-id">#{r.id}</span>
                  </div>
                  <h4>{r.title}</h4>
                  <p className="design-req-meta">
                    {r.style || "Chưa chọn phong cách"} · NS{" "}
                    {formatVnd(r.budget)}
                  </p>
                  <StatusTimeline status={r.status} />
                  {r.notes && <p className="design-req-notes">{r.notes}</p>}
                  <p className="design-req-time">
                    Gửi:{" "}
                    {r.createdAt
                      ? new Date(r.createdAt).toLocaleString("vi-VN")
                      : "—"}
                    {r.updatedAt
                      ? ` · Cập nhật: ${new Date(r.updatedAt).toLocaleString(
                          "vi-VN"
                        )}`
                      : null}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default MyDesignRequestsPage;
