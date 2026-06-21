import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/customer/interiorDesignPage.css";

const InteriorDesignPage = () => {
  const [designs, setDesigns] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const categories = ["All", "Living Room", "Bedroom", "Kitchen", "Office"];

  useEffect(() => {
    fetchDesigns();
  }, []);

  useEffect(() => {
    filterData();
  }, [category, designs]);

  const fetchDesigns = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(
        "https://localhost:5001/api/interior-designs"
      );

      setDesigns(res.data || []);
      setFiltered(res.data || []);
    } catch (err) {
      console.error(err);
      setError("Không thể tải dữ liệu thiết kế");

      // fallback demo data
      const demo = [
        {
          id: 1,
          title: "Modern Living Room",
          category: "Living Room",
          image:
            "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85",
          description: "Phong cách phòng khách hiện đại, tối giản.",
        },
        {
          id: 2,
          title: "Luxury Bedroom",
          category: "Bedroom",
          image:
            "https://images.unsplash.com/photo-1505693314120-0d443867891c",
          description: "Phòng ngủ sang trọng, ấm cúng.",
        },
        {
          id: 3,
          title: "Modern Kitchen",
          category: "Kitchen",
          image:
            "https://images.unsplash.com/photo-1556911220-e15b29be8c8f",
          description: "Nhà bếp hiện đại, tiện nghi.",
        },
      ];

      setDesigns(demo);
      setFiltered(demo);
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    if (category === "All") {
      setFiltered(designs);
    } else {
      setFiltered(
        designs.filter((d) => d.category === category)
      );
    }
  };

  return (
    <div className="interior-page">
      {/* HERO */}
      <div className="hero">
        <h1>Interior Design Inspiration</h1>
        <p>Khám phá các mẫu thiết kế nội thất đẹp & hiện đại</p>
      </div>

      {/* FILTER */}
      <div className="filter-bar">
        {categories.map((c) => (
          <button
            key={c}
            className={category === c ? "active" : ""}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      {loading && <p>Loading designs...</p>}
      {error && <p className="error">{error}</p>}

      <div className="grid">
        {!loading &&
          filtered.map((item) => (
            <div
              key={item.id}
              className="card"
              onClick={() => setSelected(item)}
            >
              <img src={item.image} alt={item.title} />
              <h3>{item.title}</h3>
              <p>{item.category}</p>
            </div>
          ))}
      </div>

      {/* MODAL */}
      {selected && (
        <div
          className="modal-overlay"
          onClick={() => setSelected(null)}
        >
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={selected.image} alt={selected.title} />
            <h2>{selected.title}</h2>
            <p>{selected.description}</p>

            <button onClick={() => setSelected(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteriorDesignPage;