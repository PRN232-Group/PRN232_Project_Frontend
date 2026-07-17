import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "../../styles/customer/authPage.css";
import { notifySuccess, notifyError } from "../../application/services/notify";
import {
  forgotPassword,
  verifyForgotOtp,
} from "../../application/services/authService";

const AUTH_IMG =
  "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&q=80";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 email · 2 otp
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOtp = async (e) => {
    e?.preventDefault?.();
    if (!email.trim()) {
      setError("Vui lòng nhập email");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await forgotPassword(email.trim());
      notifySuccess("Mã xác minh đã được gửi tới email của bạn.");
      setStep(2);
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Không gửi được OTP.";
      setError(msg);
      notifyError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      setError("Nhập OTP");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await verifyForgotOtp({
        email: email.trim(),
        otp: otp.trim(),
      });
      notifySuccess(res?.message || "OTP hợp lệ");
      navigate("/reset-password", {
        replace: true,
        state: { email: email.trim(), resetToken: res.resetToken },
      });
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "OTP không hợp lệ.";
      setError(msg);
      notifyError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
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
            <h2>{step === 1 ? "Quên mật khẩu" : "Xác minh OTP"}</h2>
            <p className="login-subtitle">
              {step === 1
                ? "Nhập email để nhận mã xác minh"
                : `Nhập OTP gửi tới ${email}`}
            </p>

            {step === 1 ? (
              <form className="login-form" onSubmit={handleSendOtp}>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  autoComplete="email"
                />
                {error && <div className="form-error">{error}</div>}
                <button className="login-btn" disabled={loading}>
                  {loading ? "Đang gửi..." : "Gửi mã xác minh"}
                </button>
                <div className="login-link">
                  <span onClick={() => navigate("/login")}>← Về đăng nhập</span>
                </div>
              </form>
            ) : (
              <form className="login-form" onSubmit={handleVerify}>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Mã OTP 6 số"
                  value={otp}
                  maxLength={6}
                  onChange={(e) => {
                    setOtp(e.target.value);
                    setError("");
                  }}
                />
                {error && <div className="form-error">{error}</div>}
                <button className="login-btn" disabled={loading}>
                  {loading ? "Đang xác minh..." : "Xác minh"}
                </button>
                <button
                  type="button"
                  className="login-btn"
                  style={{ marginTop: 8, opacity: 0.85 }}
                  disabled={loading}
                  onClick={handleSendOtp}
                >
                  Gửi lại mã
                </button>
                <div className="login-link">
                  <span onClick={() => setStep(1)}>← Đổi email</span>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
