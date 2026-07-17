import React, { useEffect, useState } from "react";
import { productService, categoryService } from "../../application/services";
import { notifySuccess, notifyError } from "../../application/services/notify";
import { formatVnd, discountPct } from "../../domain/roles";
import StaffModalPortal from "../../components/StaffModalPortal";

const emptyForm = {
  name: "",
  description: "",
  price: 0,
  marketPrice: 0,
  stock: 0,
  categoryId: 1,
  categoryName: "Sofa",
  imageUrl: "",
  isActive: true,
  specs: {
    dimensions: "",
    material: "",
    origin: "",
    finish: "",
    weightKg: "",
    warrantyMonths: 12,
  },
};

const stockBadge = (stock) => {
  if (stock <= 0) return <span className="staff-badge is-stock-out">Hết hàng</span>;
  if (stock <= 10) return <span className="staff-badge is-stock-low">Sắp hết · {stock}</span>;
  return <span className="staff-badge is-stock-ok">Kho · {stock}</span>;
};

const ProductManagementPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [previewOk, setPreviewOk] = useState(true);

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    setPreviewOk(true);
  }, [form.imageUrl]);

  const load = async () => {
    try {
      setLoading(true);
      const [pRes, cRes] = await Promise.all([
        productService.getAll(),
        categoryService.getAll(),
      ]);
      setProducts(pRes.data || []);
      setCategories(cRes.data || []);
    } catch (e) {
      console.error(e);
      notifyError("Không tải được sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const filtered = products.filter((p) =>
    (p.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditing(null);
    const first = categories[0];
    setForm({
      ...emptyForm,
      categoryId: first?.id || 1,
      categoryName: first?.name || "Sofa",
    });
    setIsOpen(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name || "",
      description: p.description || "",
      price: p.price || 0,
      marketPrice: p.marketPrice || 0,
      stock: p.stock ?? 0,
      categoryId: p.categoryId || 1,
      categoryName: p.categoryName || "",
      imageUrl: p.imageUrl || p.image || "",
      isActive: p.isActive !== false,
      specs: {
        dimensions: p.specs?.dimensions || "",
        material: p.specs?.material || "",
        origin: p.specs?.origin || "",
        finish: p.specs?.finish || "",
        weightKg: p.specs?.weightKg ?? "",
        warrantyMonths: p.specs?.warrantyMonths ?? 12,
      },
    });
    setIsOpen(true);
  };

  const onField = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith("specs.")) {
      const key = name.replace("specs.", "");
      setForm((f) => ({
        ...f,
        specs: { ...f.specs, [key]: value },
      }));
      return;
    }
    if (name === "categoryId") {
      const cat = categories.find((c) => String(c.id) === value);
      setForm((f) => ({
        ...f,
        categoryId: Number(value),
        categoryName: cat?.name || f.categoryName,
      }));
      return;
    }
    setForm((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const save = async () => {
    if (!form.name.trim()) {
      notifyError("Nhập tên sản phẩm");
      return;
    }
    const body = {
      ...form,
      price: Number(form.price) || 0,
      marketPrice: Number(form.marketPrice) || 0,
      stock: Number(form.stock) || 0,
      imageUrl: form.imageUrl,
      specs: {
        ...form.specs,
        weightKg: form.specs.weightKg === "" ? null : Number(form.specs.weightKg),
        warrantyMonths: Number(form.specs.warrantyMonths) || 0,
      },
    };
    try {
      if (editing) {
        await productService.update(editing.id, body);
        notifySuccess("Đã cập nhật sản phẩm");
      } else {
        await productService.create(body);
        notifySuccess("Đã thêm sản phẩm");
      }
      setIsOpen(false);
      load();
    } catch (e) {
      notifyError("Lưu thất bại");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Xóa sản phẩm này?")) return;
    try {
      await productService.remove(id);
      notifySuccess("Đã xóa");
      load();
    } catch {
      notifyError("Xóa thất bại");
    }
  };

  return (
    <div className="staff-page">
      <h2>Quản lý sản phẩm</h2>
      <p className="staff-page-sub">
        Đầy đủ giá studio, giá thị trường, % giảm cho khách, tồn kho và thông số
        kỹ thuật — đồng bộ với trang khách hàng.
      </p>

      <div className="staff-toolbar">
        <input
          placeholder="Tìm sản phẩm..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="button" className="staff-btn staff-btn-ghost" onClick={load}>
          Tải lại
        </button>
        <button type="button" className="staff-btn staff-btn-primary" onClick={openCreate}>
          + Thêm sản phẩm
        </button>
      </div>

      {loading && <p className="staff-status">Đang tải...</p>}

      <div className="staff-panel">
        <div className="staff-table-wrap">
          <table className="staff-table">
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Danh mục</th>
                <th>Giá / Thị trường</th>
                <th>Giảm</th>
                <th>Kho</th>
                <th>TT</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const pct = discountPct(p.price, p.marketPrice);
                return (
                  <tr key={p.id}>
                    <td>
                      <div className="staff-product-cell">
                        <img src={p.imageUrl || p.image} alt="" />
                        <div>
                          <h4>{p.name}</h4>
                          <p>
                            {p.specs?.material
                              ? p.specs.material.slice(0, 42) + "…"
                              : p.description?.slice(0, 42)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>{p.categoryName}</td>
                    <td>
                      <span className="staff-price">{formatVnd(p.price)}</span>
                      {p.marketPrice > p.price && (
                        <span className="staff-price-market">
                          {formatVnd(p.marketPrice)}
                        </span>
                      )}
                    </td>
                    <td>
                      {pct > 0 ? (
                        <span className="staff-badge is-save">−{pct}%</span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>{stockBadge(p.stock)}</td>
                    <td>
                      {p.isActive !== false ? (
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
                          onClick={() => openEdit(p)}
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          className="staff-btn staff-btn-danger"
                          onClick={() => remove(p.id)}
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
                    Không có sản phẩm
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <StaffModalPortal open={isOpen} onClose={() => setIsOpen(false)}>
          <div
            className="staff-modal staff-modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="staff-modal-head">
              <h3>{editing ? "Sửa sản phẩm" : "Thêm sản phẩm"}</h3>
              <button
                type="button"
                className="staff-btn staff-btn-ghost"
                onClick={() => setIsOpen(false)}
              >
                Đóng
              </button>
            </div>
            <div className="staff-modal-body">
              <div className="staff-form-grid">
                <p className="staff-form-section">Thông tin cơ bản</p>
                <div className="staff-field full">
                  <label htmlFor="pm-name">Tên sản phẩm</label>
                  <input
                    id="pm-name"
                    name="name"
                    value={form.name}
                    onChange={onField}
                    placeholder="VD: Sofa vải bouclé 3 chỗ"
                  />
                </div>

                <p className="staff-form-section">Giá & tồn kho</p>
                <div className="staff-field">
                  <label htmlFor="pm-price">Giá studio (₫)</label>
                  <input
                    id="pm-price"
                    name="price"
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={onField}
                  />
                </div>
                <div className="staff-field">
                  <label htmlFor="pm-market">Giá thị trường (₫)</label>
                  <input
                    id="pm-market"
                    name="marketPrice"
                    type="number"
                    min="0"
                    value={form.marketPrice}
                    onChange={onField}
                  />
                  {discountPct(form.price, form.marketPrice) > 0 && (
                    <p className="staff-field-hint">
                      Khách thấy giảm −{discountPct(form.price, form.marketPrice)}%
                    </p>
                  )}
                </div>
                <div className="staff-field">
                  <label htmlFor="pm-stock">Tồn kho</label>
                  <input
                    id="pm-stock"
                    name="stock"
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={onField}
                  />
                </div>
                <div className="staff-field">
                  <label htmlFor="pm-cat">Danh mục</label>
                  <select
                    id="pm-cat"
                    name="categoryId"
                    value={form.categoryId}
                    onChange={onField}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <p className="staff-form-section">Hình ảnh & mô tả</p>
                <div className="staff-field full">
                  <label htmlFor="pm-image">Ảnh sản phẩm (URL)</label>
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
                        id="pm-image"
                        name="imageUrl"
                        value={form.imageUrl}
                        onChange={onField}
                        placeholder="https://images.unsplash.com/photo-…"
                      />
                      <p className="staff-field-hint">
                        Dán URL Unsplash/CDN. Gợi ý mock: sofa{" "}
                        <button
                          type="button"
                          className="staff-linkish"
                          onClick={() =>
                            setForm((f) => ({
                              ...f,
                              imageUrl:
                                "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
                            }))
                          }
                        >
                          dán mẫu
                        </button>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="staff-field full">
                  <label htmlFor="pm-desc">Mô tả</label>
                  <textarea
                    id="pm-desc"
                    name="description"
                    value={form.description}
                    onChange={onField}
                    placeholder="Mô tả ngắn cho trang chi tiết sản phẩm"
                    rows={3}
                  />
                </div>

                <p className="staff-form-section">Thông số kỹ thuật</p>
                <div className="staff-field">
                  <label htmlFor="pm-dim">Kích thước</label>
                  <input
                    id="pm-dim"
                    name="specs.dimensions"
                    value={form.specs.dimensions}
                    onChange={onField}
                    placeholder="VD: 220 × 90 × 85 cm"
                  />
                </div>
                <div className="staff-field">
                  <label htmlFor="pm-mat">Vật liệu</label>
                  <input
                    id="pm-mat"
                    name="specs.material"
                    value={form.specs.material}
                    onChange={onField}
                    placeholder="VD: Gỗ sồi, vải linen"
                  />
                </div>
                <div className="staff-field">
                  <label htmlFor="pm-origin">Xuất xứ</label>
                  <input
                    id="pm-origin"
                    name="specs.origin"
                    value={form.specs.origin}
                    onChange={onField}
                  />
                </div>
                <div className="staff-field">
                  <label htmlFor="pm-finish">Hoàn thiện</label>
                  <input
                    id="pm-finish"
                    name="specs.finish"
                    value={form.specs.finish}
                    onChange={onField}
                  />
                </div>
                <div className="staff-field">
                  <label htmlFor="pm-weight">Trọng lượng (kg)</label>
                  <input
                    id="pm-weight"
                    name="specs.weightKg"
                    type="number"
                    min="0"
                    value={form.specs.weightKg}
                    onChange={onField}
                  />
                </div>
                <div className="staff-field">
                  <label htmlFor="pm-warranty">Bảo hành (tháng)</label>
                  <input
                    id="pm-warranty"
                    name="specs.warrantyMonths"
                    type="number"
                    min="0"
                    value={form.specs.warrantyMonths}
                    onChange={onField}
                  />
                </div>

                <div className="staff-field full">
                  <div className="staff-switch">
                    <div className="staff-switch-copy">
                      <strong>Hiển thị trên storefront</strong>
                      <span>Khách xem được sản phẩm này trên catalog</span>
                    </div>
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={form.isActive}
                      onChange={onField}
                      aria-label="Hiển thị trên storefront"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="staff-modal-foot">
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
              >
                Lưu
              </button>
            </div>
          </div>
        </StaffModalPortal>
    </div>
  );
};

export default ProductManagementPage;
