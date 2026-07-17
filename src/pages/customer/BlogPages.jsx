import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { contentService } from "../../application/services";
import "../../styles/customer/blogPage.css";

const FALLBACK =
  "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=900&q=80";

const TYPE_LABEL = {
  Blog: "Blog",
  Guide: "Hướng dẫn",
  News: "Tin tức",
};

export function BlogListPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await contentService.getAll();
        setItems((res.data || []).filter((c) => c.isPublished !== false));
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="blog-page page">
      <header className="blog-hero">
        <h1>Góc cảm hứng</h1>
        <p>Xu hướng, hướng dẫn chọn đồ và mẹo bài trí từ Interior Studio.</p>
      </header>

      {loading && <p className="blog-status">Đang tải bài viết…</p>}
      {!loading && items.length === 0 && (
        <p className="blog-status">Chưa có bài viết xuất bản.</p>
      )}

      <div className="blog-grid">
        {items.map((a) => (
          <Link key={a.id} to={`/blog/${a.slug}`} className="blog-card">
            <img
              src={a.coverUrl || FALLBACK}
              alt=""
              loading="lazy"
              onError={(e) => {
                e.currentTarget.src = FALLBACK;
              }}
            />
            <div className="blog-card-body">
              <span>{TYPE_LABEL[a.type] || a.type}</span>
              <h2>{a.title}</h2>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function BlogDetailPage() {
  const { slug } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await contentService.getBySlug(slug);
        setItem(res.data);
      } catch {
        setItem(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  if (loading) {
    return (
      <div className="blog-page page">
        <p className="blog-status">Đang tải…</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="blog-page page">
        <p className="blog-status">Không tìm thấy bài viết.</p>
        <Link to="/blog" className="blog-back">
          ← Về góc cảm hứng
        </Link>
      </div>
    );
  }

  return (
    <article className="blog-page page blog-detail">
      <div className="blog-detail-top">
        <Link to="/blog" className="blog-back">
          ← Góc cảm hứng
        </Link>
        <span className="blog-type">{TYPE_LABEL[item.type] || item.type}</span>
      </div>
      <h1>{item.title}</h1>
      <img
        className="blog-cover"
        src={item.coverUrl || FALLBACK}
        alt=""
        onError={(e) => {
          e.currentTarget.src = FALLBACK;
        }}
      />
      <div
        className="blog-body"
        dangerouslySetInnerHTML={{ __html: item.body || "" }}
      />
    </article>
  );
}
