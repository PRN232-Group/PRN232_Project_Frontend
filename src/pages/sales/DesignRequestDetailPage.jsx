import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  designRequestService,
  interiorDesignService,
  productService,
} from "../../application/services";
import { notifySuccess, notifyError } from "../../application/services/notify";
import { formatVnd, discountPct } from "../../domain/roles";

const DesignRequestDetailPage = () => {
  const { id } = useParams();
  const [list, setList] = useState([]);
  const [request, setRequest] = useState(null);
  const [concept, setConcept] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("");

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
      setStatus(req.status);
      setNote(req.note || req.notes || "");

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
      }
    } catch (err) {
      console.error(err);
      setRequest(null);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      await designRequestService.update(id, {
        status,
        note,
        notes: note,
      });
      notifySuccess("Đã cập nhật yêu cầu thiết kế");
      fetchDetail();
    } catch {
      notifyError("Cập nhật thất bại");
    }
  };

  if (loading) {
    return <div className="staff-page"><p className="staff-status">Đang tải...</p></div>;
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
                    {r.customerName} · {r.style}
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

  return (
    <div className="staff-page">
      <div className="staff-toolbar">
        <div style={{ flex: 1 }}>
          <h2 style={{ marginBottom: 4 }}>{request.title}</h2>
          <p className="staff-page-sub" style={{ margin: 0 }}>
            #{request.id} · {request.customerName} · {request.style}
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
            {concept.priceCompare && (
              <p>
                Studio{" "}
                <span className="staff-price">
                  {formatVnd(concept.priceCompare.studio)}
                </span>{" "}
                · TT{" "}
                <span className="staff-price-market">
                  {formatVnd(concept.priceCompare.marketAvg)}
                </span>
              </p>
            )}
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
                <th>Thông số</th>
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
                    <td>
                      <ul className="staff-specs-mini">
                        {p.specs?.material && <li>{p.specs.material}</li>}
                        {p.specs?.origin && <li>XQ: {p.specs.origin}</li>}
                      </ul>
                    </td>
                  </tr>
                );
              })}
              {related.length === 0 && (
                <tr>
                  <td colSpan={5} className="staff-empty">
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
          <h3>Cập nhật xử lý</h3>
        </div>
        <div style={{ padding: 16 }}>
          <div className="staff-form-grid">
            <div className="staff-field">
              <label>Trạng thái</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="New">New</option>
                <option value="InReview">InReview</option>
                <option value="Quoted">Quoted</option>
                <option value="Done">Done</option>
              </select>
            </div>
            <div className="staff-field full">
              <label>Ghi chú</label>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
          </div>
          <button
            type="button"
            className="staff-btn staff-btn-primary"
            style={{ marginTop: 12 }}
            onClick={handleUpdate}
          >
            Lưu cập nhật
          </button>
        </div>
      </div>
    </div>
  );
};

export default DesignRequestDetailPage;
