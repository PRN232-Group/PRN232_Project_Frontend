import React, { useEffect, useState } from "react";
import { productService } from "../../application/services";
import { notifySuccess, notifyError } from "../../application/services/notify";
import { formatVnd, discountPct } from "../../domain/roles";

const PriceManagementPage = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState({});

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const res = await productService.getAll();
      const list = res.data || [];
      setProducts(list);
      const d = {};
      list.forEach((p) => {
        d[p.id] = { price: p.price, marketPrice: p.marketPrice || 0 };
      });
      setDrafts(d);
    } catch {
      notifyError("Không tải được bảng giá");
    } finally {
      setLoading(false);
    }
  };

  const filtered = products.filter((p) =>
    (p.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const setDraft = (id, field, value) => {
    setDrafts((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: Number(value) || 0 },
    }));
  };

  const applyDiscount = (id, pct) => {
    const p = products.find((x) => x.id === id);
    if (!p) return;
    const market = drafts[id]?.marketPrice || p.marketPrice || p.price;
    const price = Math.round(market * (1 - pct / 100));
    setDraft(id, "price", price);
  };

  const save = async (p) => {
    const d = drafts[p.id] || { price: p.price, marketPrice: p.marketPrice };
    try {
      await productService.update(p.id, {
        ...p,
        price: d.price,
        marketPrice: d.marketPrice,
      });
      notifySuccess(`Đã áp giá mới cho "${p.name}"`);
      load();
    } catch {
      notifyError("Cập nhật giá thất bại");
    }
  };

  return (
    <div className="staff-page">
      <h2>Bảng giá &amp; giảm giá</h2>
      <p className="staff-page-sub">
        Chỉnh giá studio so với giá thị trường — % giảm hiển thị cho khách trên
        storefront.
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
      </div>

      {loading && <p className="staff-status">Đang tải...</p>}

      <div className="staff-panel">
        <div className="staff-table-wrap">
          <table className="staff-table">
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Giá thị trường</th>
                <th>Giá studio</th>
                <th>% giảm khách</th>
                <th>Áp nhanh</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const d = drafts[p.id] || {
                  price: p.price,
                  marketPrice: p.marketPrice,
                };
                const pct = discountPct(d.price, d.marketPrice);
                return (
                  <tr key={p.id}>
                    <td>
                      <div className="staff-product-cell">
                        <img src={p.imageUrl} alt="" />
                        <div>
                          <h4>{p.name}</h4>
                          <p>Kho: {p.stock}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <input
                        type="number"
                        value={d.marketPrice}
                        onChange={(e) =>
                          setDraft(p.id, "marketPrice", e.target.value)
                        }
                        style={{ width: 120 }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={d.price}
                        onChange={(e) => setDraft(p.id, "price", e.target.value)}
                        style={{ width: 120 }}
                      />
                    </td>
                    <td>
                      {pct > 0 ? (
                        <span className="staff-badge is-save">−{pct}%</span>
                      ) : (
                        <span className="staff-badge is-off">0%</span>
                      )}
                      <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
                        Tiết kiệm {formatVnd(Math.max(0, d.marketPrice - d.price))}
                      </div>
                    </td>
                    <td>
                      <div className="staff-actions">
                        {[5, 10, 15].map((n) => (
                          <button
                            key={n}
                            type="button"
                            className="staff-btn staff-btn-ghost"
                            onClick={() => applyDiscount(p.id, n)}
                          >
                            −{n}%
                          </button>
                        ))}
                      </div>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="staff-btn staff-btn-primary"
                        onClick={() => save(p)}
                      >
                        Lưu
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PriceManagementPage;
