import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import "../../styles/customer/interiorDesignPage.css";
import DesignDetailModal from "../../components/DesignDetailModal";
import { interiorDesignService } from "../../application/services";
import UserContext from "../../contexts/UserContext";
import { normalizeRole } from "../../domain/roles";

const CATEGORIES = [
  { key: "All", label: "Tất cả" },
  { key: "Living", label: "Phòng khách" },
  { key: "Bedroom", label: "Phòng ngủ" },
  { key: "Workspace", label: "Làm việc" },
  { key: "Kitchen", label: "Bếp" },
];

const CATEGORY_LABELS = {
  Living: "Phòng khách",
  Bedroom: "Phòng ngủ",
  Workspace: "Làm việc",
  Kitchen: "Bếp",
};

const STAFF_DESIGN_REDIRECT = {
  sales: "/sales/design-requests",
  manager: "/manager/designs",
  admin: "/manager/designs",
};

const normalizeDesign = (d) => ({
  ...d,
  image: d.image || d.imageUrl || "",
  category: d.category || "Living",
});

const excerpt = (text, max = 72) =>
  !text
    ? ""
    : text.length <= max
      ? text
      : `${text.slice(0, max).trim()}…`;

const InteriorDesignPage = () => {
  const location = useLocation();
  const { user } = useContext(UserContext);
  const roleKey = user ? normalizeRole(user.role) : "guest";
  const staffRedirect = STAFF_DESIGN_REDIRECT[roleKey];

  const [designs, setDesigns] = useState([]);
  const [category, setCategory] = useState("All");
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const filtered = useMemo(() => {
    if (category === "All") return designs;
    return designs.filter((d) => d.category === category);
  }, [category, designs]);

  useEffect(() => {
    fetchDesigns();
  }, []);

  useEffect(() => {
    const openId = location.state?.openId;
    if (openId != null) openDetail(openId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state?.openId]);

  const fetchDesigns = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await interiorDesignService.getAll();
      const list = (res.data || [])
        .filter((d) => d.isPublished !== false)
        .map(normalizeDesign);
      setDesigns(list);
    } catch {
      setError("Không tải được mẫu thiết kế");
    } finally {
      setLoading(false);
    }
  };

  const openDetail = useCallback(async (id) => {
    setSelectedId(id);
    setDetail(null);
    setDetailLoading(true);
    try {
      const res = await interiorDesignService.getById(id);
      setDetail(normalizeDesign(res.data));
    } catch {
      const fallback = designs.find((d) => d.id === id);
      if (fallback) setDetail(fallback);
    } finally {
      setDetailLoading(false);
    }
  }, [designs]);

  const closeDetail = () => {
    setSelectedId(null);
    setDetail(null);
    setDetailLoading(false);
  };

  if (staffRedirect) {
    return <Navigate to={staffRedirect} replace />;
  }

  return (
    <div className="interior-page">
      <div className="hero">
        <h1>Cảm hứng thiết kế nội thất</h1>
        <p>
          Khám phá concept 3D với thông số vật liệu, ngân sách và sản phẩm
          liên quan — sẵn sàng đặt hàng từ Interior Studio.
        </p>
      </div>

      <div className="filter-bar">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            type="button"
            className={category === c.key ? "active" : ""}
            onClick={() => setCategory(c.key)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {loading && <p className="interior-status">Đang tải mẫu thiết kế...</p>}
      {error && <p className="error">{error}</p>}

      <div className="grid">
        {!loading &&
          filtered.map((item) => (
            <article
              key={item.id}
              className="card"
              onClick={() => openDetail(item.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && openDetail(item.id)}
            >
              <div className="card-media">
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=60";
                  }}
                />
                <span className="card-badge">
                  {CATEGORY_LABELS[item.category] || item.category}
                </span>
              </div>
              <div className="card-body">
                <h3>{item.title}</h3>
                <p>{excerpt(item.description)}</p>
              </div>
              <div className="card-footer">
                {item.areaSqm != null && (
                  <span className="card-meta">{item.areaSqm} m²</span>
                )}
                <span className="card-cta">Xem chi tiết</span>
              </div>
            </article>
          ))}
      </div>

      {!loading && filtered.length === 0 && (
        <p className="interior-status">
          {designs.length === 0
            ? "Hiện chưa có concept đang xuất bản."
            : "Không có mẫu trong danh mục này"}
        </p>
      )}

      <DesignDetailModal
        open={selectedId != null}
        design={detail}
        loading={detailLoading}
        onClose={closeDetail}
      />
    </div>
  );
};

export default InteriorDesignPage;
