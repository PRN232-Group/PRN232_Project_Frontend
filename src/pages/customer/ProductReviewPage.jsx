import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "../../styles/customer/productReviewPage.css";

const ProductReviewPage = () => {
  const { id } = useParams(); // productId

  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchReviews();
  }, [id]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(
        `https://localhost:5001/api/products/${id}/reviews`
      );

      setReviews(res.data || []);
    } catch (err) {
      console.error(err);

      // fallback demo
      setReviews([
        {
          id: 1,
          userName: "Nguyen A",
          rating: 5,
          comment: "Sản phẩm rất tốt!",
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async () => {
    if (!comment.trim()) {
      alert("Vui lòng nhập nội dung review");
      return;
    }

    try {
      const newReview = {
        productId: id,
        rating,
        comment,
      };

      await axios.post(
        `https://localhost:5001/api/products/${id}/reviews`,
        newReview
      );

      setComment("");
      setRating(5);

      fetchReviews();
    } catch (err) {
      console.error(err);
      alert("Gửi đánh giá thất bại");
    }
  };

  return (
    <div className="review-page">
      <h2>Product Reviews</h2>

      {/* FORM */}
      <div className="review-form">
        <h3>Write a review</h3>

        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
        >
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={r}>
              {r} ⭐
            </option>
          ))}
        </select>

        <textarea
          placeholder="Write your comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <button onClick={submitReview}>Submit Review</button>
      </div>

      {/* LIST */}
      {loading && <p>Loading reviews...</p>}
      {error && <p className="error">{error}</p>}

      <div className="review-list">
        {reviews.map((r) => (
          <div key={r.id} className="review-card">
            <div className="header">
              <b>{r.userName}</b>
              <span className="stars">
                {"⭐".repeat(r.rating)}
              </span>
            </div>

            <p>{r.comment}</p>

            <small>
              {new Date(r.createdAt).toLocaleString()}
            </small>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductReviewPage;
