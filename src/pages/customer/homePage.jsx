import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/customer/homePage.css";
import "../../styles/customer/blogPage.css";
import DesignStoriesCarousel from "../../components/DesignStoriesCarousel";
import {
  contentService,
  interiorDesignService,
  productService,
} from "../../application/services";
import UserContext from "../../contexts/UserContext";
import { formatCountThreshold, normalizeRole } from "../../domain/roles";

const CATEGORY_LABELS = {
  Living: "Phòng khách",
  Bedroom: "Phòng ngủ",
  Workspace: "Làm việc",
  Kitchen: "Bếp",
};

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80";

const HERO_CTAS = {
  guest: [
    { label: "Khám phá bộ sưu tập", to: "/products", primary: true },
    { label: "Xem concept thiết kế", to: "/design", primary: false },
  ],
  customer: [
    { label: "Khám phá bộ sưu tập", to: "/products", primary: true },
    { label: "Xem concept thiết kế", to: "/design", primary: false },
  ],
  sales: [
    { label: "Quản lý đơn hàng", to: "/sales/orders", primary: true },
    { label: "Yêu cầu thiết kế", to: "/sales/design-requests", primary: false },
  ],
  manager: [
    { label: "Quản lý sản phẩm", to: "/manager/products", primary: true },
    { label: "Quản lý concept", to: "/manager/designs", primary: false },
  ],
  admin: [
    { label: "Quản trị hệ thống", to: "/admin", primary: true },
    { label: "Quản lý concept", to: "/manager/designs", primary: false },
  ],
};

const ABOUT_CTA = {
  guest: { label: "Khám phá thiết kế →", to: "/design" },
  customer: { label: "Khám phá thiết kế →", to: "/design" },
  sales: { label: "Xử lý yêu cầu thiết kế →", to: "/sales/design-requests" },
  manager: { label: "Quản lý concept →", to: "/manager/designs" },
  admin: { label: "Quản lý concept →", to: "/manager/designs" },
};

const TYPE_LABEL = {
  Blog: "Blog",
  Guide: "Hướng dẫn",
  News: "Tin tức",
};

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const roleKey = user ? normalizeRole(user.role) : "guest";
  const isStaff =
    roleKey === "sales" || roleKey === "manager" || roleKey === "admin";
  const heroBtns = HERO_CTAS[roleKey] || HERO_CTAS.guest;
  const aboutCta = ABOUT_CTA[roleKey] || ABOUT_CTA.guest;

  const [stories, setStories] = useState([]);
  const [articles, setArticles] = useState([]);
  const [productCount, setProductCount] = useState(0);
  const [designCount, setDesignCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const [dRes, pRes, cRes] = await Promise.all([
          interiorDesignService.getAll(),
          productService.getAll(),
          contentService.getAll().catch(() => ({ data: [] })),
        ]);
        const designs = (dRes?.data || []).filter(
          (d) => d.isPublished !== false
        );
        setDesignCount(designs.length);
        setProductCount((pRes?.data || []).length);
        setArticles(
          (cRes?.data || [])
            .filter((c) => c.isPublished !== false)
            .slice(0, 3)
        );
        setStories(
          designs.map((d) => ({
            id: d.id,
            designId: d.id,
            title: d.title,
            category: CATEGORY_LABELS[d.category] || d.category,
            excerpt: d.description
              ? `${d.description.slice(0, 88)}${d.description.length > 88 ? "…" : ""}`
              : isStaff
                ? "Mở khu vực quản lý →"
                : "Khám phá concept & sản phẩm",
            imageUrl: d.imageUrl || d.image || FALLBACK_IMG,
          }))
        );
      } catch {
        setStories([]);
        setArticles([]);
        setProductCount(0);
        setDesignCount(0);
      }
    };
    load();
  }, [isStaff]);

  const onStoryClick = (item) => {
    if (roleKey === "manager" || roleKey === "admin") {
      navigate("/manager/designs");
      return;
    }
    if (roleKey === "sales") {
      navigate("/sales/design-requests");
      return;
    }
    navigate("/design", { state: { openId: item.designId ?? item.id } });
  };

  return (
    <div className="interior">
      <section className="hero-interior">
        <div className="hero-text">
          <span className="tag">Interior Concept Studio</span>
          <h1>
            Không gian <br />
            <span>của sự sống & nghệ thuật</span>
          </h1>
          <p>
            Nội thất hiện đại, tinh tế và ấm áp — thiết kế riêng cho tổ ấm của
            bạn với vật liệu tự nhiên và cảm hứng đương đại.
          </p>

          <div className="hero-btns">
            {heroBtns.map((btn) => (
              <button
                key={btn.to + btn.label}
                type="button"
                className={btn.primary ? undefined : "ghost"}
                onClick={() => navigate(btn.to)}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        <div className="hero-gallery">
          <img
            src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80"
            alt="Showroom living"
          />
          <img
            src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80"
            alt="Showroom workspace"
          />
        </div>
      </section>

      <section className="features">
        <div className="feature-card">
          <h3>Thiết kế tối giản</h3>
          <p>Không gian sạch, tinh giản, tập trung trải nghiệm sống.</p>
        </div>
        <div className="feature-card">
          <h3>Vật liệu ấm</h3>
          <p>Gam gỗ – be – trắng tạo cảm giác an toàn, gần gũi.</p>
        </div>
        <div className="feature-card">
          <h3>Lấy người dùng làm trung tâm</h3>
          <p>Bố cục xoay quanh thói quen và cảm xúc hàng ngày.</p>
        </div>
      </section>

      <section className="gallery gallery-carousel">
        <h2>
          Concept <span>nổi bật</span>
        </h2>
        <p className="gallery-sub">
          {isStaff
            ? "Nhấn concept để mở khu vực quản lý tương ứng"
            : "Tự động lướt — nhấn để xem chi tiết concept & sản phẩm liên quan"}
        </p>
        {stories.length > 0 ? (
          <DesignStoriesCarousel
            items={stories}
            autoPlayMs={5500}
            onStoryClick={onStoryClick}
          />
        ) : (
          <p className="home-empty-note">
            Hiện chưa có concept đang hiển thị. Vui lòng quay lại sau.
          </p>
        )}
      </section>

      {articles.length > 0 && (
        <section className="home-blog">
          <div className="home-blog-head">
            <div>
              <h2>
                Góc <span>cảm hứng</span>
              </h2>
              <p>Bài viết &amp; hướng dẫn từ Interior Studio</p>
            </div>
            <Link to="/blog" className="home-blog-more">
              Xem tất cả →
            </Link>
          </div>
          <div className="home-blog-grid">
            {articles.map((a) => (
              <Link
                key={a.id}
                to={`/blog/${a.slug}`}
                className="home-blog-card"
              >
                <img
                  src={a.coverUrl || FALLBACK_IMG}
                  alt=""
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK_IMG;
                  }}
                />
                <div>
                  <span>{TYPE_LABEL[a.type] || a.type}</span>
                  <h3>{a.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="about">
        <div className="about-img">
          <img
            src="https://images.unsplash.com/photo-1600607686527-6fb886090705?w=1000&q=80"
            alt="Interior Studio showroom"
          />
        </div>
        <div className="about-text">
          <h2>
            Không gian thiết kế <span>cảm xúc</span>
          </h2>
          <p>
            Mỗi concept gắn với sản phẩm catalog thật — vật liệu, xuất xứ, giá
            studio và so sánh thị trường — sẵn sàng đặt hàng hoặc yêu cầu tư
            vấn.
          </p>
          <ul>
            <li>Ánh sáng tự nhiên &amp; dịu nhẹ</li>
            <li>Bố cục mở, thoáng</li>
            <li>Liên kết trực tiếp sản phẩm trong concept</li>
          </ul>
          <button
            type="button"
            className="about-cta"
            onClick={() => navigate(aboutCta.to)}
          >
            {aboutCta.label}
          </button>
        </div>
      </section>

      <section className="stats">
        <div>
          <strong>{formatCountThreshold(productCount)}</strong>
          <span>Dòng sản phẩm</span>
        </div>
        <div>
          <strong>{designCount}</strong>
          <span>Concept thiết kế</span>
        </div>
        <div>
          <strong>100%</strong>
          <span>Vật liệu có xuất xứ</span>
        </div>
        <div>
          <strong>24h</strong>
          <span>Phản hồi tư vấn</span>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
