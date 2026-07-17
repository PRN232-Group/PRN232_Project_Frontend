import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "../../styles/customer/authPage.css";
import { notifySuccess, notifyError } from "../../application/services/notify";
import { resetPassword } from "../../application/services/authService";

const AUTH_IMG =
  "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&q=80";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const resetToken = location.state?.resetToken || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const shell = (title, subtitle, children) => (
    <div className="login-bg">
      <div className="login-container">
        <div className="login-left">
          <img src={AUTH_IMG} alt="Interior Studio" className="login-img" />
          <div className="login-brand">Interior Studio</div>
          <div className="login-copyright">
            © {new Date().getFullYear()} Interior Studio. All rights reserved.
          </div>
        </div>
        <div className="login-right">
          <div className="login-form-box">
            <h2>{title}</h2>
            <p className="login-subtitle">{subtitle}</p>
            {children}
          </div>
        </div>
      </div>
    </div>
  );

  if (!email || !resetToken) {
    return shell(
      "Phiên không hợp lệ",
      "Vui lòng xác minh OTP lại từ bước quên mật khẩu.",
      <form className="login-form" onSubmit={(e) => e.preventDefault()}>
        <button
          type="button"
          className="login-btn"
          onClick={() => navigate("/forgot-password")}
        >
          Quên mật khẩu
        </button>
        <div className="login-link">
          <span onClick={() => navigate("/login")}>← Về đăng nhập</span>
        </div>
      </form>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setError("Nhập đầy đủ mật khẩu.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Xác nhận mật khẩu không khớp.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Mật khẩu tối thiểu 6 ký tự.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await resetPassword({
        email,
        resetToken,
        newPassword,
        confirmPassword,
      });
      notifySuccess("Đổi mật khẩu thành công. Vui lòng đăng nhập.");
      navigate("/login", { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Đổi mật khẩu thất bại.";
      setError(msg);
      notifyError(msg);
    } finally {
      setLoading(false);
    }
  };

  return shell(
    "Đặt mật khẩu mới",
    email,
    <form className="login-form" onSubmit={handleSubmit}>
      <div className="password-field">
        <input
          type={show ? "text" : "password"}
          placeholder="Mật khẩu mới"
          value={newPassword}
          onChange={(e) => {
            setNewPassword(e.target.value);
            setError("");
          }}
          autoComplete="new-password"
        />
        <button
          type="button"
          className="password-toggle"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        >
          <i
            className={show ? "fa-regular fa-eye-slash" : "fa-regular fa-eye"}
          />
        </button>
      </div>
      <input
        type={show ? "text" : "password"}
        placeholder="Xác nhận mật khẩu"
        value={confirmPassword}
        onChange={(e) => {
          setConfirmPassword(e.target.value);
          setError("");
        }}
        autoComplete="new-password"
      />
      {error && <div className="form-error">{error}</div>}
      <button className="login-btn" disabled={loading}>
        {loading ? "Đang lưu..." : "Đổi mật khẩu"}
      </button>
      <div className="login-link">
        <span onClick={() => navigate("/login")}>← Về đăng nhập</span>
      </div>
    </form>
  );
};

export default ResetPasswordPage;
