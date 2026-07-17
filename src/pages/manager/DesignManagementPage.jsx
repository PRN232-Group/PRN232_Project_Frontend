import React, { useEffect, useState } from "react";
import {
  interiorDesignService,
  productService,
} from "../../application/services";
import { notifySuccess, notifyError } from "../../application/services/notify";
import { formatVnd, discountPct } from "../../domain/roles";
import StaffModalPortal from "../../components/StaffModalPortal";

const CATEGORY_OPTIONS = [
  { value: "Living", label: "Phòng khách" },
  { value: "Bedroom", label: "Phòng ngủ" },
  { value: "Workspace", label: "Làm việc" },
  { value: "Kitchen", label: "Bếp" },
];

const emptyForm = {
  title: "",
  category: "Living",
  style: "",
  imageUrl: "",
  galleryText: "",
  description: "",
  areaSqm: "",
  budgetFrom: 0,
  budgetTo: 0,
  timelineWeeks: 4,
  studioPrice: 0,
  marketAvg: 0,
  relatedProductIds: [],
  highlightsText: "",
  specsText: "",
  materialsText: "",
  packagesText: "",
  isPublished: true,
};

const lines = (text) =>
  String(text || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

const parseSpecs = (text) =>
  lines(text).map((row) => {
    const i = row.indexOf(":");
    if (i < 0) return { label: row, value: "" };
    return {
      label: row.slice(0, i).trim(),
      value: row.slice(i + 1).trim(),
    };
  });

const parseMaterials = (text) =>
  lines(text).map((row) => {
    const [name = "", origin = "", finish = "", care = ""] = row
      .split("|")
      .map((s) => s.trim());
    return { name, origin, finish, care };
  });

const parsePackages = (text) =>
  lines(text).map((row) => {
    const [name = "", price = "0", includes = ""] = row
      .split("|")
      .map((s) => s.trim());
    return { name, price: Number(price) || 0, includes };
  });

const toForm = (d) => ({
  title: d.title || "",
  category: d.category || "Living",
  style: d.style || "",
  imageUrl: d.imageUrl || d.image || "",
  galleryText: (d.gallery || []).join("\n"),
  description: d.description || "",
  areaSqm: d.areaSqm ?? "",
  budgetFrom: d.budgetFrom || 0,
  budgetTo: d.budgetTo || 0,
  timelineWeeks: d.timelineWeeks || 4,
  studioPrice: d.priceCompare?.studio || 0,
  marketAvg: d.priceCompare?.marketAvg || 0,
  relatedProductIds: [...(d.relatedProductIds || [])],
  highlightsText: (d.highlights || []).join("\n"),
  specsText: (d.specs || [])
    .map((s) => `${s.label}: ${s.value}`)
    .join("\n"),
  materialsText: (d.materials || [])
    .map((m) =>
      [m.name, m.origin, m.finish, m.care].filter(Boolean).join(" | ")
    )
    .join("\n"),
  packagesText: (d.packages || [])
    .map((p) => `${p.name} | ${p.price} | ${p.includes || ""}`)
    .join("\n"),
  isPublished: d.isPublished !== false,
});

const buildBody = (form) => {
  const gallery = lines(form.galleryText);
  const imageUrl = form.imageUrl || gallery[0] || "";
  return {
    title: form.title.trim(),
    category: form.category,
    style: form.style.trim(),
    imageUrl,
    gallery: gallery.length ? gallery : imageUrl ? [imageUrl] : [],
    description: form.description.trim(),
    areaSqm: form.areaSqm === "" ? null : Number(form.areaSqm),
    budgetFrom: Number(form.budgetFrom) || 0,
    budgetTo: Number(form.budgetTo) || 0,
    timelineWeeks: Number(form.timelineWeeks) || 0,
    priceCompare: {
      studio: Number(form.studioPrice) || 0,
      marketAvg: Number(form.marketAvg) || 0,
    },
    relatedProductIds: form.relatedProductIds.map(Number),
    highlights: lines(form.highlightsText),
    specs: parseSpecs(form.specsText),
    materials: parseMaterials(form.materialsText),
    packages: parsePackages(form.packagesText),
    isPublished: form.isPublished,
  };
};

const FORM_TABS = [
  { id: "basic", label: "Cơ bản" },
  { id: "media", label: "Hình & mô tả" },
  { id: "budget", label: "Ngân sách" },
  { id: "detail", label: "Chi tiết" },
  { id: "related", label: "Sản phẩm" },
];

const DesignManagementPage = () => {
  const [designs, setDesigns] = useState([]);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [previewOk, setPreviewOk] = useState(true);
  const [formTab, setFormTab] = useState("basic");
  const [tabAnimKey, setTabAnimKey] = useState(0);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    setPreviewOk(true);
  }, [form.imageUrl]);

  const load = async () => {
    try {
      setLoading(true);
      const [dRes, pRes] = await Promise.all([
        interiorDesignService.getAll(),
        productService.getAll(),
      ]);
      setDesigns(dRes.data || []);
      setProducts(pRes.data || []);
    } catch (err) {
      notifyError(
        err?.response?.data?.message || "Không tải được concept thiết kế"
      );
    } finally {
      setLoading(false);
    }
  };

  const filtered = designs.filter((d) => {
    const q = search.toLowerCase();
    return (
      (d.title || "").toLowerCase().includes(q) ||
      (d.style || "").toLowerCase().includes(q) ||
      (d.category || "").toLowerCase().includes(q)
    );
  });

  const switchTab = (id) => {
    setFormTab(id);
    setTabAnimKey((k) => k + 1);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setFormTab("basic");
    setTabAnimKey((k) => k + 1);
    setIsOpen(true);
  };

  const openEdit = async (d) => {
    setEditing(d);
    setForm(toForm(d));
    setFormTab("basic");
    setTabAnimKey((k) => k + 1);
    setIsOpen(true);
    try {
      const res = await interiorDesignService.getById(d.id);
      if (res.data) setForm(toForm(res.data));
    } catch {
      /* giữ data từ list */
    }
  };

  const onField = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const toggleProduct = (id) => {
    setForm((f) => {
      const has = f.relatedProductIds.includes(id);
      return {
        ...f,
        relatedProductIds: has
          ? f.relatedProductIds.filter((x) => x !== id)
          : [...f.relatedProductIds, id],
      };
    });
  };

  const save = async () => {
    if (!form.title.trim()) {
      notifyError("Nhập tên concept");
      switchTab("basic");
      return;
    }
    const body = buildBody(form);
    setSaving(true);
    try {
      if (editing) {
        await interiorDesignService.update(editing.id, body);
        notifySuccess("Đã cập nhật concept");
      } else {
        await interiorDesignService.create(body);
        notifySuccess("Đã thêm concept thiết kế");
      }
      setIsOpen(false);
      await load();
    } catch (err) {
      notifyError(
        err?.response?.data?.message || err?.message || "Lưu thất bại"
      );
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Xóa concept này khỏi storefront?")) return;
    try {
      await interiorDesignService.remove(id);
      notifySuccess("Đã xóa");
      await load();
    } catch (err) {
      notifyError(
        err?.response?.data?.message || err?.message || "Xóa thất bại"
      );
    }
  };

  const catLabel = (c) =>
    CATEGORY_OPTIONS.find((o) => o.value === c)?.label || c;

  const tabIndex = FORM_TABS.findIndex((t) => t.id === formTab);
  const goNext = () => {
    if (tabIndex < FORM_TABS.length - 1) switchTab(FORM_TABS[tabIndex + 1].id);
  };
  const goPrev = () => {
    if (tabIndex > 0) switchTab(FORM_TABS[tabIndex - 1].id);
  };

  return (
    <div className="staff-page">
      <h2>Concept thiết kế</h2>
      <p className="staff-page-sub">
        Quản lý nội dung chi tiết giống trang khách — gallery, ngân sách, thông
        số, vật liệu, gói giá và sản phẩm liên quan.
      </p>

      <div className="staff-toolbar">
        <input
          placeholder="Tìm tên, phong cách, danh mục..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="button" className="staff-btn staff-btn-ghost" onClick={load}>
          Tải lại
        </button>
        <button
          type="button"
          className="staff-btn staff-btn-primary"
          onClick={openCreate}
        >
          + Thêm concept
        </button>
      </div>

      {loading && <p className="staff-status">Đang tải...</p>}

      <div className="staff-panel">
        <div className="staff-table-wrap">
          <table className="staff-table">
            <thead>
              <tr>
                <th>Concept</th>
                <th>Danh mục</th>
                <th>Diện tích</th>
                <th>Giá studio / TT</th>
                <th>SP liên quan</th>
                <th>TT</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => {
                const studio = d.priceCompare?.studio;
                const market = d.priceCompare?.marketAvg;
                const pct = discountPct(studio, market);
                return (
                  <tr key={d.id}>
                    <td>
                      <div className="staff-product-cell">
                        <img src={d.imageUrl || d.image} alt="" />
                        <div>
                          <h4>{d.title}</h4>
                          <p>
                            {d.style}
                            {d.gallery?.length
                              ? ` · ${d.gallery.length} ảnh`
                              : ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>{catLabel(d.category)}</td>
                    <td>{d.areaSqm ? `${d.areaSqm} m²` : "—"}</td>
                    <td>
                      <span className="staff-price">{formatVnd(studio)}</span>
                      {market > studio && (
                        <span className="staff-price-market">
                          {formatVnd(market)}
                        </span>
                      )}
                      {pct > 0 && (
                        <div>
                          <span className="staff-badge is-save">−{pct}%</span>
                        </div>
                      )}
                    </td>
                    <td>{(d.relatedProductIds || []).length}</td>
                    <td>
                      {d.isPublished !== false ? (
                        <span className="staff-badge is-active">Hiện</span>
                      ) : (
                        <span className="staff-badge is-off">Ẩn</span>
                      )}
                    </td>
                    <td>
                      <div className="staff-actions">
                        <button
                          type="button"
                          className="staff-btn staff-btn-ghost"
                          onClick={() => openEdit(d)}
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          className="staff-btn staff-btn-danger"
                          onClick={() => remove(d.id)}
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="staff-empty">
                    Chưa có concept
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <StaffModalPortal open={isOpen} onClose={() => setIsOpen(false)}>
          <div
            className="staff-modal staff-modal-lg staff-modal-tabs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="staff-modal-head">
              <h3>{editing ? "Sửa concept" : "Thêm concept thiết kế"}</h3>
              <button
                type="button"
                className="staff-btn staff-btn-ghost"
                onClick={() => setIsOpen(false)}
              >
                Đóng
              </button>
            </div>

            <div className="staff-form-tabs" role="tablist">
              {FORM_TABS.map((t, i) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={formTab === t.id}
                  className={
                    formTab === t.id
                      ? "staff-form-tab is-active"
                      : "staff-form-tab"
                  }
                  onClick={() => switchTab(t.id)}
                >
                  <span className="staff-form-tab-n">{i + 1}</span>
                  {t.label}
                </button>
              ))}
            </div>

            <div className="staff-modal-body">
              <div
                key={tabAnimKey}
                className="staff-form-pane staff-form-grid"
                role="tabpanel"
              >
                {formTab === "basic" && (
                  <>
                    <div className="staff-field full">
                      <label htmlFor="dm-title">Tên concept</label>
                      <input
                        id="dm-title"
                        name="title"
                        value={form.title}
                        onChange={onField}
                        placeholder="VD: Phòng khách Japandi"
                        autoFocus
                      />
                    </div>
                    <div className="staff-field">
                      <label htmlFor="dm-cat">Danh mục không gian</label>
                      <select
                        id="dm-cat"
                        name="category"
                        value={form.category}
                        onChange={onField}
                      >
                        {CATEGORY_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="staff-field">
                      <label htmlFor="dm-style">Phong cách</label>
                      <input
                        id="dm-style"
                        name="style"
                        value={form.style}
                        onChange={onField}
                        placeholder="Japandi, Minimal..."
                      />
                    </div>
                    <div className="staff-field">
                      <label htmlFor="dm-area">Diện tích (m²)</label>
                      <input
                        id="dm-area"
                        name="areaSqm"
                        type="number"
                        min="0"
                        value={form.areaSqm}
                        onChange={onField}
                      />
                    </div>
                    <div className="staff-field">
                      <label htmlFor="dm-weeks">Thời gian (tuần)</label>
                      <input
                        id="dm-weeks"
                        name="timelineWeeks"
                        type="number"
                        min="0"
                        value={form.timelineWeeks}
                        onChange={onField}
                      />
                    </div>
                  </>
                )}

                {formTab === "media" && (
                  <>
                    <div className="staff-field full">
                      <label htmlFor="dm-image">Ảnh cover (URL)</label>
                      <div className="staff-image-row">
                        {form.imageUrl && previewOk ? (
                          <img
                            className="staff-image-preview"
                            src={form.imageUrl}
                            alt=""
                            onError={() => setPreviewOk(false)}
                          />
                        ) : (
                          <div className="staff-image-preview is-empty">
                            {form.imageUrl ? "Ảnh lỗi" : "Chưa có ảnh"}
                          </div>
                        )}
                        <div>
                          <input
                            id="dm-image"
                            name="imageUrl"
                            value={form.imageUrl}
                            onChange={onField}
                            placeholder="https://…"
                          />
                          <p className="staff-field-hint">
                            Cover hiện trên carousel &amp; thẻ concept.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="staff-field full">
                      <label htmlFor="dm-gallery">Gallery (1 URL / dòng)</label>
                      <textarea
                        id="dm-gallery"
                        name="galleryText"
                        value={form.galleryText}
                        onChange={onField}
                        rows={4}
                        placeholder={"https://…\nhttps://…"}
                      />
                    </div>
                    <div className="staff-field full">
                      <label htmlFor="dm-desc">Mô tả chi tiết</label>
                      <textarea
                        id="dm-desc"
                        name="description"
                        value={form.description}
                        onChange={onField}
                        rows={5}
                        placeholder="Mô tả concept cho khách như trên storefront…"
                      />
                    </div>
                  </>
                )}

                {formTab === "budget" && (
                  <>
                    <div className="staff-field">
                      <label htmlFor="dm-bf">Ngân sách từ (₫)</label>
                      <input
                        id="dm-bf"
                        name="budgetFrom"
                        type="number"
                        min="0"
                        value={form.budgetFrom}
                        onChange={onField}
                      />
                    </div>
                    <div className="staff-field">
                      <label htmlFor="dm-bt">Ngân sách đến (₫)</label>
                      <input
                        id="dm-bt"
                        name="budgetTo"
                        type="number"
                        min="0"
                        value={form.budgetTo}
                        onChange={onField}
                      />
                    </div>
                    <div className="staff-field">
                      <label htmlFor="dm-studio">Giá studio (₫)</label>
                      <input
                        id="dm-studio"
                        name="studioPrice"
                        type="number"
                        min="0"
                        value={form.studioPrice}
                        onChange={onField}
                      />
                    </div>
                    <div className="staff-field">
                      <label htmlFor="dm-market">Giá thị trường TB (₫)</label>
                      <input
                        id="dm-market"
                        name="marketAvg"
                        type="number"
                        min="0"
                        value={form.marketAvg}
                        onChange={onField}
                      />
                      {discountPct(form.studioPrice, form.marketAvg) > 0 && (
                        <p className="staff-field-hint">
                          Khách thấy tiết kiệm −
                          {discountPct(form.studioPrice, form.marketAvg)}%
                        </p>
                      )}
                    </div>
                  </>
                )}

                {formTab === "detail" && (
                  <>
                    <div className="staff-field full">
                      <label>Điểm nổi bật (1 dòng / ý)</label>
                      <textarea
                        name="highlightsText"
                        value={form.highlightsText}
                        onChange={onField}
                        rows={3}
                        placeholder="Tường accent màu đất nhạt…"
                      />
                    </div>
                    <div className="staff-field full">
                      <label>Thông số (Nhãn: Giá trị)</label>
                      <textarea
                        name="specsText"
                        value={form.specsText}
                        onChange={onField}
                        rows={4}
                        placeholder="Sàn: Gỗ sồi lát xương cá"
                      />
                    </div>
                    <div className="staff-field full">
                      <label>Vật liệu (Tên | Xuất xứ | Hoàn thiện | Bảo quản)</label>
                      <textarea
                        name="materialsText"
                        value={form.materialsText}
                        onChange={onField}
                        rows={3}
                      />
                    </div>
                    <div className="staff-field full">
                      <label>Gói giá (Tên | Giá | Bao gồm)</label>
                      <textarea
                        name="packagesText"
                        value={form.packagesText}
                        onChange={onField}
                        rows={3}
                        placeholder="Concept 3D | 8500000 | Moodboard + 3 view"
                      />
                    </div>
                  </>
                )}

                {formTab === "related" && (
                  <>
                    <div className="staff-field full">
                      <label>
                        Sản phẩm liên quan · đã chọn{" "}
                        {form.relatedProductIds.length}
                      </label>
                      <div className="staff-product-pick">
                        {products.map((p) => {
                          const on = form.relatedProductIds.includes(p.id);
                          return (
                            <button
                              key={p.id}
                              type="button"
                              className={
                                on
                                  ? "staff-pick-chip is-on"
                                  : "staff-pick-chip"
                              }
                              onClick={() => toggleProduct(p.id)}
                            >
                              {p.imageUrl && <img src={p.imageUrl} alt="" />}
                              <span>{p.name}</span>
                            </button>
                          );
                        })}
                        {products.length === 0 && (
                          <p className="staff-field-hint">Chưa có sản phẩm</p>
                        )}
                      </div>
                    </div>
                    <div className="staff-field full">
                      <div className="staff-switch">
                        <div className="staff-switch-copy">
                          <strong>Hiển thị trên storefront</strong>
                          <span>
                            Khách thấy concept trong /design và carousel
                          </span>
                        </div>
                        <input
                          type="checkbox"
                          name="isPublished"
                          checked={form.isPublished}
                          onChange={onField}
                          aria-label="Hiển thị trên storefront"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="staff-modal-foot staff-modal-foot-split">
              <div className="staff-modal-foot-nav">
                <button
                  type="button"
                  className="staff-btn staff-btn-ghost"
                  onClick={goPrev}
                  disabled={tabIndex === 0}
                >
                  ← Trước
                </button>
                <button
                  type="button"
                  className="staff-btn staff-btn-ghost"
                  onClick={goNext}
                  disabled={tabIndex === FORM_TABS.length - 1}
                >
                  Tiếp →
                </button>
              </div>
              <div className="staff-modal-foot-actions">
                <button
                  type="button"
                  className="staff-btn staff-btn-ghost"
                  onClick={() => setIsOpen(false)}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="staff-btn staff-btn-primary"
                  onClick={save}
                  disabled={saving}
                >
                  {saving ? "Đang lưu…" : "Lưu"}
                </button>
              </div>
            </div>
          </div>
        </StaffModalPortal>
    </div>
  );
};

export default DesignManagementPage;
