import React, { useEffect, useState } from "react";
import { analyticsService, productService } from "../../application/services";
import { formatVnd, discountPct } from "../../domain/roles";
import { notifyError } from "../../application/services/notify";

const BestSellingProductsPage = () => {
  const [rows, setRows] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const [bRes, pRes] = await Promise.all([
        analyticsService.getBestSelling(),
        productService.getAll(),
      ]);
      setRows(Array.isArray(bRes.data) ? bRes.data : []);
      setCatalog(Array.isArray(pRes.data) ? pRes.data : []);
    } catch (e) {
      console.error(e);
      notifyError("Không tải được sản phẩm bán chạy");
      setRows([]);
      setCatalog([]);
    } finally {
      setLoading(false);
    }
  };

  const enriched = rows
    .map((r) => {
      const pid = r.productId ?? r.id;
      const p = catalog.find((x) => Number(x.id) === Number(pid));
      return {
        ...r,
        productId: pid,
        name: r.name || p?.name || `SP #${pid}`,
        imageUrl: p?.imageUrl,
        marketPrice: p?.marketPrice,
        stock: p?.stock,
        price: p?.price ?? r.price,
      };
    })
    .filter((r) =>
      (r.name || "").toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="staff-page">
      <h2>Sản phẩm bán chạy</h2>
      <p className="staff-page-sub">
        Tổng hợp từ đơn hàng thực tế (trừ đơn đã hủy) — kèm tồn kho và % giảm so
        thị trường.
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
        <table className="staff-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Sản phẩm</th>
              <th>Đã bán</th>
              <th>Doanh thu</th>
              <th>Kho</th>
              <th>Giảm khách</th>
            </tr>
          </thead>
          <tbody>
            {enriched.map((p, i) => {
              const pct = discountPct(p.price, p.marketPrice);
              return (
                <tr key={p.productId || i}>
                  <td>{i + 1}</td>
                  <td>
                    <div className="staff-product-cell">
                      {p.imageUrl && <img src={p.imageUrl} alt="" />}
                      <div>
                        <h4>{p.name}</h4>
                      </div>
                    </div>
                  </td>
                  <td>{p.soldQuantity ?? p.sold ?? 0}</td>
                  <td className="staff-price">{formatVnd(p.revenue)}</td>
                  <td>{p.stock ?? "—"}</td>
                  <td>
                    {pct > 0 ? (
                      <span className="staff-badge is-save">−{pct}%</span>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              );
            })}
            {!loading && enriched.length === 0 && (
              <tr>
                <td colSpan={6} className="staff-empty">
                  Chưa có dữ liệu bán chạy — cần có đơn hàng chưa hủy.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BestSellingProductsPage;
