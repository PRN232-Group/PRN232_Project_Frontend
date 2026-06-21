import React, { useState } from "react";
import axios from "axios";
import "../../styles/customer/forgotPasswordPage.css";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError("Vui lòng nhập email");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      await axios.post(
        "https://localhost:5001/api/auth/forgot-password",
        { email }
      );

      setMessage("Vui lòng kiểm tra email để đặt lại mật khẩu");
      setEmail("");
    } catch (err) {
      console.error(err);
      setError("Không thể gửi yêu cầu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-box">
        <h2>Quên mật khẩu</h2>
        <p>Nhập email để nhận link đặt lại mật khẩu</p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email của bạn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {error && <p className="error">{error}</p>}
          {message && <p className="success">{message}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Đang gửi..." : "Gửi yêu cầu"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;