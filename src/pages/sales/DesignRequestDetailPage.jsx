import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  designRequestService,
  interiorDesignService,
  productService,
} from "../../application/services";
import { notifySuccess, notifyError } from "../../application/services/notify";
import { formatVnd, discountPct } from "../../domain/roles";

/** Forward-only: New → InReview → Quoted → Done */
const NEXT_STATUS = {
  New: "InReview",
  InReview: "Quoted",
  Quoted: "Done",
};

const DesignRequestDetailPage = () => {
  const { id } = useParams();
  const [list, setList] = useState([]);
  const [request, setRequest] = useState(null);
  const [concept, setConcept] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) fetchDetail();
    else fetchList();
  }, [id]);

  const fetchList = async () => {
    try {
      setLoading(true);
      const res = await designRequestService.getAll();
      setList(res.data || []);
    } catch (err) {
      console.error(err);
      notifyError("Không tải được danh sách yêu cầu thiết kế");
    } finally {
      setLoading(false);
    }
  };

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await designRequestService.getById(id);
      const req = res.data;
      setRequest(req);

      if (req.interiorDesignId) {
        try {
          const dRes = await interiorDesignService.getById(req.interiorDesignId);
          setConcept(dRes.data);
          setRelated(dRes.data?.relatedProducts || []);
        } catch {
          setConcept(null);
        }
      } else if (req.relatedProductIds?.length) {
        const pRes = await productService.getAll();
        setRelated(
          (pRes.data || []).filter((p) =>
            req.relatedProductIds.includes(p.id)
          )
        );
      } else {
        setRelated([]);
      }
    } catch (err) {
      console.error(err);
      setRequest(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAdvanceStatus = async () => {
    if (!request) return;
    const next = NEXT_STATUS[request.status];
    if (!next) {
      notifyError("Yêu cầu đã hoàn tất");
      return;
    }
    try {
      setSaving(true);
      await designRequestService.updateStatus(id, next);
      notifySuccess(`Đã chuyển trạng thái → ${next}`);
      fetchDetail();
    } catch (err) {
      notifyError(
        err.response?.data?.message || "Cập nhật trạng thái thất bại"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="staff-page">
        <p className="staff-status">Đang tải...</p>
      </div>
    );
  }

  if (!id) {
    return (
      <div className="staff-page">
        <h2>Yêu cầu thiết kế</h2>
        <p className="staff-page-sub">
          Liên kết concept storefront, ngân sách và sản phẩm catalog.
        </p>
        <div className="staff-panel">
          {list.length === 0 ? (
            <p className="staff-empty">Chưa có yêu cầu</p>
          ) : (
            list.map((r) => (
              <Link
                key={r.id}
                to={`/sales/design-requests/${r.id}`}
                style={{
                  display: "block",
                  padding: "14px 16px",
                  borderBottom: "1px solid var(--line)",
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <strong>{r.title}</strong>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: 6,
                    fontSize: 13,
                    color: "var(--muted)",
                  }}
                >
                  <span>
                    {r.customerName} · {r.style || "—"}
                  </span>
                  <span className="staff-badge is-pending">{r.status}</span>
                </div>
                <div className="staff-price" style={{ marginTop: 4 }}>
                  Ngân sách {formatVnd(r.budget)}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="staff-page">
        <p className="error">Không tìm thấy yêu cầu</p>
        <Link to="/sales/design-requests">← Quay lại</Link>
      </div>
    );
  }

  const nextStatus = NEXT_STATUS[request.status];

  return (
    <div className="staff-page">
      <div className="staff-toolbar">
        <div style={{ flex: 1 }}>
          <h2 style={{ marginBottom: 4 }}>{request.title}</h2>
          <p className="staff-page-sub" style={{ margin: 0 }}>
            #{request.id} · {request.customerName} · {request.style || "—"}
          </p>
        </div>
        <Link to="/sales/design-requests" className="staff-btn staff-btn-ghost">
          ← Danh sách
        </Link>
      </div>

      <div className="staff-kpi-grid">
        <div className="staff-kpi">
          <span>Ngân sách khách</span>
          <strong className="is-clay">{formatVnd(request.budget)}</strong>
        </div>
        <div className="staff-kpi">
          <span>Trạng thái</span>
          <strong>{request.status}</strong>
        </div>
        {concept?.priceCompare && (
          <div className="staff-kpi">
            <span>Giá concept IS</span>
            <strong className="is-clay">
              {formatVnd(concept.priceCompare.studio)}
            </strong>
          </div>
        )}
        {concept?.areaSqm != null && (
          <div className="staff-kpi">
            <span>Diện tích concept</span>
            <strong>{concept.areaSqm} m²</strong>
          </div>
        )}
      </div>

      {request.notes && (
        <div className="staff-panel" style={{ marginBottom: 16, padding: 16 }}>
          <h3 style={{ marginTop: 0 }}>Ghi chú khách</h3>
          <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{request.notes}</p>
        </div>
      )}

      {concept && (
        <div className="staff-panel" style={{ marginBottom: 16 }}>
          <div className="staff-panel-head">
            <h3>Concept tham chiếu: {concept.title}</h3>
            <Link to="/design" className="staff-btn staff-btn-ghost">
              Mở gallery khách
            </Link>
          </div>
          <div style={{ padding: 16 }}>
            <img
              src={concept.imageUrl}
              alt={concept.title}
              style={{
                width: "100%",
                maxHeight: 220,
                objectFit: "cover",
                borderRadius: 12,
                marginBottom: 12,
              }}
            />
            <p>{concept.description}</p>
          </div>
        </div>
      )}

      <div className="staff-panel" style={{ marginBottom: 16 }}>
        <div className="staff-panel-head">
          <h3>Sản phẩm gợi ý ({related.length})</h3>
        </div>
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
              {related.map((p) => {
                const pct = discountPct(p.price, p.marketPrice);
                return (
                  <tr key={p.id}>
                    <td>
                      <div className="staff-product-cell">
                        <img src={p.imageUrl} alt="" />
                        <div>
                          <h4>{p.name}</h4>
                          <p>
                            <Link to={`/products/${p.id}`}>Storefront →</Link>
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>{p.stock}</td>
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
                  </tr>
                );
              })}
              {related.length === 0 && (
                <tr>
                  <td colSpan={4} className="staff-empty">
                    Chưa có sản phẩm liên quan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="staff-panel">
        <div className="staff-panel-head">
          <h3>Cập nhật trạng thái</h3>
        </div>
        <div style={{ padding: 16 }}>
          <p className="staff-page-sub" style={{ marginTop: 0 }}>
            Forward-only: New → InReview → Quoted → Done. Khách theo dõi tại{" "}
            <code>/my-design-requests</code> (tự làm mới).
          </p>
          {nextStatus ? (
            <button
              type="button"
              className="staff-btn staff-btn-primary"
              disabled={saving}
              onClick={handleAdvanceStatus}
            >
              {saving ? "Đang lưu..." : `Chuyển → ${nextStatus}`}
            </button>
          ) : (
            <span className="staff-badge is-active">Đã hoàn tất (Done)</span>
          )}
          {request.updatedAt && (
            <p className="staff-page-sub" style={{ marginTop: 12 }}>
              Cập nhật lần cuối:{" "}
              {new Date(request.updatedAt).toLocaleString("vi-VN")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DesignRequestDetailPage;
