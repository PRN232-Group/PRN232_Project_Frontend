import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/design-carousel.css";

/**
 * Auto-sliding design stories carousel — homepage & reusable.
 */
export default function DesignStoriesCarousel({
  items = [],
  autoPlayMs = 5500,
  onStoryClick,
}) {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = items.length;

  const go = useCallback(
    (next) => {
      if (!count) return;
      setIndex(((next % count) + count) % count);
    },
    [count]
  );

  useEffect(() => {
    if (!count || paused) return;
    const t = setInterval(() => go(index + 1), autoPlayMs);
    return () => clearInterval(t);
  }, [index, count, paused, autoPlayMs, go]);

  if (!count) return null;

  const handleClick = (item) => {
    if (onStoryClick) onStoryClick(item);
    else navigate("/design", { state: { openId: item.designId ?? item.id } });
  };

  return (
    <section
      className="design-carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Design stories"
    >
      <div className="design-carousel-viewport">
        <div
          className="design-carousel-track"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {items.map((item) => (
            <article
              key={item.id ?? item.title}
              className="design-carousel-slide"
            >
              <button
                type="button"
                className="design-carousel-card"
                onClick={() => handleClick(item)}
              >
                <img
                  src={item.imageUrl || item.image}
                  alt={item.title}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src =
                      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80";
                  }}
                />
                <div className="design-carousel-overlay">
                  <span className="design-carousel-tag">
                    {item.category || "Interior Story"}
                  </span>
                  <h3>{item.title}</h3>
                  <p>{item.excerpt || item.subtitle || "Khám phá concept →"}</p>
                </div>
              </button>
            </article>
          ))}
        </div>
      </div>

      <div className="design-carousel-controls">
        <button
          type="button"
          className="design-carousel-arrow"
          onClick={() => go(index - 1)}
          aria-label="Trước"
        >
          ‹
        </button>
        <div className="design-carousel-dots" role="tablist">
          {items.map((item, i) => (
            <button
              key={item.id ?? i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Slide ${i + 1}`}
              className={i === index ? "is-active" : ""}
              onClick={() => go(i)}
            />
          ))}
        </div>
        <button
          type="button"
          className="design-carousel-arrow"
          onClick={() => go(index + 1)}
          aria-label="Sau"
        >
          ›
        </button>
      </div>
    </section>
  );
}
