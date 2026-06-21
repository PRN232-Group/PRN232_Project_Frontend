import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/customer/homePage.css";

const HomePage = () => {
  const navigate = useNavigate();

  const [blogs, setBlogs] = useState([]);
  const [index, setIndex] = useState(0);
  const visible = 3;

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await axios.get("https://localhost:7293/api/Blog");
        setBlogs(res?.data?.data?.blogs || []);
      } catch (e) {
        setBlogs([]);
      }
    };
    fetchBlogs();
  }, []);

  const getVisible = () =>
    blogs.length
      ? Array.from({ length: visible }).map(
          (_, i) => blogs[(index + i) % blogs.length]
        )
      : [];

  return (
    <div className="interior">

      {/* HERO - SHOWROOM STYLE */}
      <section className="hero-interior">
        <div className="hero-text">
          <span className="tag">Interior Concept Studio</span>
          <h1>
            Không gian <br />
            <span>của sự sống & nghệ thuật</span>
          </h1>
          <p>
            Thiết kế trải nghiệm hiến máu như một không gian nội thất hiện đại,
            nhẹ nhàng và tinh tế.
          </p>

          <div className="hero-btns">
            <button onClick={() => navigate("/register")}>
              Đặt lịch trải nghiệm
            </button>
            <button className="ghost">Xem catalogue</button>
          </div>
        </div>

        <div className="hero-gallery">
          <img
            src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7"
            alt=""
          />
          <img
            src="https://images.unsplash.com/photo-1524758631624-e2822e304c36"
            alt=""
          />
        </div>
      </section>

      {/* FEATURE CARDS */}
      <section className="features">
        <div className="feature-card">
          <h3>Minimal Design</h3>
          <p>Không gian sạch, tinh giản, tập trung trải nghiệm.</p>
        </div>

        <div className="feature-card">
          <h3>Warm Material</h3>
          <p>Gam màu gỗ – be – trắng tạo cảm giác an toàn.</p>
        </div>

        <div className="feature-card">
          <h3>Human Centered</h3>
          <p>Thiết kế xoay quanh cảm xúc người dùng.</p>
        </div>
      </section>

      {/* BLOG GALLERY */}
      <section className="gallery">
        <h2>
          Latest <span>Design Stories</span>
        </h2>

        <div className="gallery-row">
          {getVisible().map((b, i) => (
            <div
              key={i}
              className="gallery-card"
              onClick={() => navigate(`/blog/${b.id}`)}
            >
              <img src={b?.imageUrl} alt="" />
              <div className="overlay">
                <h4>{b?.title}</h4>
                <p>Interior inspired storytelling</p>
              </div>
            </div>
          ))}
        </div>

        <div className="nav-btns">
          <button onClick={() => setIndex(index - 1)}>‹</button>
          <button onClick={() => setIndex(index + 1)}>›</button>
        </div>
      </section>

      {/* ABOUT / SHOWROOM */}
      <section className="about">
        <div className="about-img">
          <img
            src="https://images.unsplash.com/photo-1600607686527-6fb886090705"
            alt=""
          />
        </div>

        <div className="about-text">
          <h2>
            Không gian thiết kế <span>cảm xúc</span>
          </h2>
          <p>
            Chúng tôi tái định nghĩa trải nghiệm hiến máu thành một hành trình
            nhẹ nhàng như bước vào một showroom nội thất cao cấp.
          </p>

          <ul>
            <li>Ánh sáng tự nhiên & dịu nhẹ</li>
            <li>Bố cục mở, thoáng</li>
            <li>Thiết kế lấy con người làm trung tâm</li>
          </ul>
        </div>
      </section>

      {/* STATS */}
      <section className="stats">
        <div>10K+ Donors</div>
        <div>33K+ Lives Saved</div>
        <div>75+ Partners</div>
        <div>20+ Awards</div>
      </section>

    </div>
  );
};

export default HomePage;