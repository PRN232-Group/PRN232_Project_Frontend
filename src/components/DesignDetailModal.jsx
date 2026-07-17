import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";

const fmt = (n) =>
  Number(n || 0).toLocaleString("vi-VN", { maximumFractionDigits: 0 });

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=60";

const CATEGORY_LABELS = {
  Living: "Phòng khách",
  Bedroom: "Phòng ngủ",
  Workspace: "Làm việc",
  Kitchen: "Bếp",
};

const EXIT_MS = 300;

export default function DesignDetailModal({
  open = true,
  design: designProp,
  loading: loadingProp,
  onClose,
}) {
  const [heroSrc, setHeroSrc] = useState("");
  const scrollRef = useRef(null);
  const productsRef = useRef(null);
  const [mounted, setMounted] = useState(!!open);
  const [visible, setVisible] = useState(false);
  const cached = useRef({ design: designProp, loading: loadingProp });

  if (open) cached.current = { design: designProp, loading: loadingProp };
  const design = open ? designProp : cached.current.design;
  const loading = open ? loadingProp : cached.current.loading;

  useEffect(() => {
    if (open) {
      setMounted(true);
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
      return () => cancelAnimationFrame(id);
    }
    setVisible(false);
    const t = setTimeout(() => setMounted(false), EXIT_MS);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!mounted) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mounted]);

  useEffect(() => {
    if (design) {
      setHeroSrc(design.image || design.imageUrl || FALLBACK_IMG);
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
    }
  }, [design]);

  if (typeof document === "undefined" || !mounted) return null;
  if (!design && !loading) return null;

  const categoryLabel =
    CATEGORY_LABELS[design?.category] || design?.category || "";

  const savings =
    design?.priceCompare?.marketAvg && design?.priceCompare?.studio
      ? design.priceCompare.marketAvg - design.priceCompare.studio
      : 0;

  const gallery = design?.gallery?.length
    ? design.gallery
    : design?.image || design?.imageUrl
      ? [design.image || design.imageUrl]
      : [];

  const relatedIds = (design?.relatedProducts || []).map((p) => p.id);
  const relatedListPath =
    relatedIds.length > 0
      ? `/products?ids=${relatedIds.join(",")}`
      : "/products";

  const scrollToProducts = () => {
    productsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return createPortal(
    <div
      className={`design-modal-overlay ${visible ? "is-open" : "is-closing"}`}
      onClick={onClose}
      role="presentation"
    >
      <div
        className="design-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="design-modal-title"
      >
        <button
          type="button"
          className="design-modal-close"
          onClick={onClose}
          aria-label="Đóng"
        >
          ×
        </button>

        {loading || !design ? (
          <div className="design-modal-loading">Đang tải chi tiết thiết kế…</div>
        ) : (
          <>
            {/* Một vùng scroll duy nhất — không bị header ăn hết viewport */}
            <div
              ref={scrollRef}
              className="design-modal-scroll design-detail-scroll"
            >
              <div className="design-modal-hero-wrap">
                <img
                  className="design-modal-hero-img"
                  src={heroSrc}
                  alt={design.title}
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK_IMG;
                  }}
                />
                {gallery.length > 1 && (
                  <div className="design-modal-thumbs">
                    {gallery.map((src) => (
                      <button
                        key={src}
                        type="button"
                        className={heroSrc === src ? "is-active" : ""}
                        onClick={() => setHeroSrc(src)}
                      >
                        <img
                          src={src}
                          alt=""
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.src = FALLBACK_IMG;
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="design-modal-summary">
                <div className="design-modal-tags">
                  <span className="design-modal-badge">{categoryLabel}</span>
                  {design.style && (
                    <span className="design-modal-badge is-soft">
                      {design.style}
                    </span>
                  )}
                </div>
                <h2 id="design-modal-title">{design.title}</h2>
                <p className="design-modal-lead">{design.description}</p>

                <div className="design-modal-metrics">
                  {design.areaSqm != null && (
                    <div className="design-metric-chip">
                      <span>Diện tích</span>
                      <strong>{design.areaSqm} m²</strong>
                    </div>
                  )}
                  {design.budgetFrom != null && (
                    <div className="design-metric-chip">
                      <span>Ngân sách</span>
                      <strong>
                        {fmt(design.budgetFrom)} – {fmt(design.budgetTo)} ₫
                      </strong>
                    </div>
                  )}
                  {design.timelineWeeks != null && (
                    <div className="design-metric-chip">
                      <span>Thi công</span>
                      <strong>{design.timelineWeeks} tuần</strong>
                    </div>
                  )}
                </div>

                {design.priceCompare && (
                  <div className="design-modal-compare">
                    <div>
                      <span>Giá IS Studio</span>
                      <strong className="is-good">
                        {fmt(design.priceCompare.studio)} ₫
                      </strong>
                    </div>
                    <div>
                      <span>TB thị trường</span>
                      <strong className="is-muted">
                        {fmt(design.priceCompare.marketAvg)} ₫
                      </strong>
                    </div>
                    {savings > 0 && (
                      <p className="design-modal-save">
                        Tiết kiệm ~{fmt(savings)} ₫ so với báo giá trung bình
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="design-modal-body">
                <div className="design-modal-sections">
                  {design.highlights?.length > 0 && (
                    <section>
                      <h3>Điểm nhấn thiết kế</h3>
                      <ul className="design-modal-highlights">
                        {design.highlights.map((h) => (
                          <li key={h}>{h}</li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {design.specs?.length > 0 && (
                    <section>
                      <h3>Thông số kỹ thuật</h3>
                      <table className="design-modal-table">
                        <tbody>
                          {design.specs.map((row) => (
                            <tr key={row.label}>
                              <th>{row.label}</th>
                              <td>{row.value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </section>
                  )}

                  {design.materials?.length > 0 && (
                    <section>
                      <h3>Vật liệu & xuất xứ</h3>
                      <div className="design-modal-materials">
                        {design.materials.map((m) => (
                          <article key={m.name}>
                            <h4>{m.name}</h4>
                            <p>
                              <span>Xuất xứ:</span> {m.origin}
                            </p>
                            {m.finish && (
                              <p>
                                <span>Hoàn thiện:</span> {m.finish}
                              </p>
                            )}
                            {m.care && (
                              <p>
                                <span>Bảo quản:</span> {m.care}
                              </p>
                            )}
                          </article>
                        ))}
                      </div>
                    </section>
                  )}

                  {design.packages?.length > 0 && (
                    <section>
                      <h3>Gói thi công</h3>
                      <div className="design-modal-packages">
                        {design.packages.map((pkg) => (
                          <article key={pkg.name}>
                            <div className="pkg-head">
                              <h4>{pkg.name}</h4>
                              <strong>{fmt(pkg.price)} ₫</strong>
                            </div>
                            <p>{pkg.includes}</p>
                          </article>
                        ))}
                      </div>
                    </section>
                  )}

                  {design.relatedProducts?.length > 0 && (
                    <section
                      ref={productsRef}
                      id="design-related-products"
                      className="design-modal-products-section"
                    >
                      <h3>
                        Sản phẩm trong concept ({design.relatedProducts.length})
                      </h3>
                      <p className="design-modal-note">
                        Các món nội thất được chọn sẵn — nhấn từng món để xem chi
                        tiết, hoặc mở danh sách lọc theo concept.
                      </p>
                      <div className="design-modal-products">
                        {design.relatedProducts.map((p) => (
                          <Link
                            key={p.id}
                            to={`/products/${p.id}`}
                            className="design-product-card"
                            onClick={onClose}
                          >
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.src = FALLBACK_IMG;
                              }}
                            />
                            <div>
                              <h4>{p.name}</h4>
                              <p className="design-product-price">
                                {fmt(p.price)} ₫
                                {p.marketPrice > p.price && (
                                  <span className="design-product-market">
                                    {fmt(p.marketPrice)} ₫
                                  </span>
                                )}
                              </p>
                              {p.specs?.material && (
                                <p className="design-product-spec">
                                  {p.specs.material}
                                  {p.specs.origin
                                    ? ` · ${p.specs.origin}`
                                    : ""}
                                </p>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                      <Link
                        to={relatedListPath}
                        className="design-modal-link-all"
                        onClick={onClose}
                      >
                        Xem {relatedIds.length} sản phẩm trên danh sách →
                      </Link>
                    </section>
                  )}
                </div>
              </div>
            </div>

            <footer className="design-modal-footer">
              <button
                type="button"
                className="dm-btn dm-btn-ghost"
                onClick={onClose}
              >
                Đóng
              </button>
              <div className="design-modal-footer-actions">
                <Link
                  to="/chat"
                  className="dm-btn dm-btn-primary"
                  onClick={onClose}
                >
                  Yêu cầu tư vấn
                </Link>
                {design.relatedProducts?.length > 0 && (
                  <>
                    <button
                      type="button"
                      className="dm-btn dm-btn-secondary"
                      onClick={scrollToProducts}
                    >
                      Sản phẩm liên quan ({design.relatedProducts.length})
                    </button>
                    <Link
                      to={relatedListPath}
                      className="dm-btn dm-btn-outline"
                      onClick={onClose}
                    >
                      Mở danh sách
                    </Link>
                  </>
                )}
              </div>
            </footer>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
