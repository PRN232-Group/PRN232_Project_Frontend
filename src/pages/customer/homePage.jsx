import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/customer/homePage.css";
import DesignStoriesCarousel from "../../components/DesignStoriesCarousel";
import { interiorDesignService } from "../../application/services";

const CATEGORY_LABELS = {
  Living: "Phòng khách",
  Bedroom: "Phòng ngủ",
  Workspace: "Làm việc",
  Kitchen: "Bếp",
};

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80";

const HomePage = () => {
  const navigate = useNavigate();
  const [stories, setStories] = useState([]);

  useEffect(() => {
    const loadStories = async () => {
      try {
        const res = await interiorDesignService.getAll();
        const designs = (res?.data || []).filter((d) => d.isPublished !== false);
        if (designs.length) {
          setStories(
            designs.map((d) => ({
              id: d.id,
              designId: d.id,
              title: d.title,
              category: CATEGORY_LABELS[d.category] || d.category,
              excerpt: d.description
                ? `${d.description.slice(0, 88)}${d.description.length > 88 ? "…" : ""}`
                : "Khám phá concept & sản phẩm",
              imageUrl: d.imageUrl || d.image || FALLBACK_IMG,
            }))
          );
          return;
        }
      } catch {
        /* use fallback below */
      }

      setStories([
        {
          id: 1,
          designId: 1,
          title: "Phòng khách Japandi",
          category: "Phòng khách",
          excerpt: "Tone sáng, gỗ ấm — concept đầy đủ vật liệu & sản phẩm",
          imageUrl:
            "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80",
        },
        {
          id: 2,
          designId: 2,
          title: "Phòng ngủ tối giản",
          category: "Phòng ngủ",
          excerpt: "Giường thấp, ánh sáng gián tiếp cho giấc ngủ sâu",
          imageUrl:
            "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80",
        },
        {
          id: 3,
          designId: 3,
          title: "Góc làm việc tại nhà",
          category: "Làm việc",
          excerpt: "Bàn gỗ + ghế ergonomic, setup WFH chuyên nghiệp",
          imageUrl:
            "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
        },
        {
          id: 4,
          designId: 4,
          title: "Bếp mở Scandinavian",
          category: "Bếp",
          excerpt: "Tủ matte, mặt đá quartz, quy trình bếp chuẩn",
          imageUrl:
            "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&q=80",
        },
        {
          id: 5,
          designId: 5,
          title: "Phòng khách ấm áp",
          category: "Phòng khách",
          excerpt: "Kệ walnut, sofa linen & đèn brass",
          imageUrl:
            "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80",
        },
      ]);
    };
    loadStories();
  }, []);

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
            <button type="button" onClick={() => navigate("/products")}>
              Khám phá bộ sưu tập
            </button>
            <button
              type="button"
              className="ghost"
              onClick={() => navigate("/design")}
            >
              Xem concept thiết kế
            </button>
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
          Latest <span>Design Stories</span>
        </h2>
        <p className="gallery-sub">
          Tự động lướt mỗi vài giây — nhấn để xem chi tiết concept &amp; sản
          phẩm
        </p>
        <DesignStoriesCarousel items={stories} autoPlayMs={5500} />
      </section>

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
            onClick={() => navigate("/design")}
          >
            Khám phá thiết kế →
          </button>
        </div>
      </section>

      <section className="stats">
        <div>
          <strong>6+</strong>
          <span>Dòng sản phẩm</span>
        </div>
        <div>
          <strong>5</strong>
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
