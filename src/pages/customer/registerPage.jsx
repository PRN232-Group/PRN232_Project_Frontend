import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "../../styles/customer/authPage.css";
import { notifySuccess, notifyError } from "../../application/services/notify";
import {
  requestRegister,
  verifyRegister,
} from "../../application/services/authService";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 form · 2 OTP
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setError("");
  };

  const validateForm = () => {
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      return "Vui lòng nhập đầy đủ thông tin.";
    }
    if (form.name.trim().length < 5) return "Họ tên phải có ít nhất 5 ký tự.";
    if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(form.email)) {
      return "Email phải là Gmail (@gmail.com).";
    }
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(form.password)) {
      return "Mật khẩu phải ≥ 8 ký tự, có chữ in hoa, số và ký tự đặc biệt.";
    }
    if (form.password !== form.confirmPassword) {
      return "Mật khẩu xác nhận không khớp.";
    }
    return null;
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    const v = validateForm();
    if (v) {
      setError(v);
      return;
    }
    setLoading(true);
    setError("");
    try {
      await requestRegister({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      notifySuccess("Mã xác minh đã được gửi tới email của bạn.");
      setStep(2);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Gửi OTP thất bại.";
      setError(msg);
      notifyError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      setError("Nhập mã OTP.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await verifyRegister({ email: form.email.trim(), otp: otp.trim() });
      notifySuccess("Đăng ký thành công! Vui lòng đăng nhập.");
      navigate("/login");
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "OTP không hợp lệ.";
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
          <img
            src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5"
            alt="Register"
            className="login-img"
          />
          <div className="login-brand">Interior Studio</div>
          <div className="login-copyright">
            © {new Date().getFullYear()} Interior Studio. All rights reserved.
          </div>
        </div>

        <div className="login-right">
          <div className="login-form-box">
            <h2>{step === 1 ? "Tạo tài khoản" : "Xác minh email"}</h2>
            <p style={{ color: "var(--muted)", marginBottom: 4, fontSize: 14 }}>
              {step === 1
                ? "Nhập thông tin — tài khoản chỉ tạo sau khi OTP thành công"
                : `Nhập OTP gửi tới ${form.email}`}
            </p>

            {step === 1 ? (
              <form className="login-form" onSubmit={handleRequestOtp}>
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={handleChange}
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleChange}
                />
                <div style={{ position: "relative", width: "100%" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    style={{ width: "100%", paddingRight: 36 }}
                  />
                  <span
                    onClick={() => setShowPassword((p) => !p)}
                    style={{
                      position: "absolute",
                      right: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      cursor: "pointer",
                    }}
                  >
                    <i className={showPassword ? "fa-regular fa-eye-slash" : "fa-regular fa-eye"} />
                  </span>
                </div>
                <div style={{ position: "relative", width: "100%" }}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    style={{ width: "100%", paddingRight: 36 }}
                  />
                  <span
                    onClick={() => setShowConfirmPassword((p) => !p)}
                    style={{
                      position: "absolute",
                      right: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      cursor: "pointer",
                    }}
                  >
                    <i
                      className={
                        showConfirmPassword ? "fa-regular fa-eye-slash" : "fa-regular fa-eye"
                      }
                    />
                  </span>
                </div>
                {error && <div className="form-error">{error}</div>}
                <button className="login-btn" disabled={loading}>
                  {loading ? "Đang xử lý..." : "Đăng ký"}
                </button>
                <div className="login-link">
                  Đã có tài khoản?{" "}
                  <span onClick={() => navigate("/login")}>Đăng nhập</span>
                </div>
              </form>
            ) : (
              <form className="login-form" onSubmit={handleVerifyOtp}>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Mã OTP 6 số"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value);
                    setError("");
                  }}
                  maxLength={6}
                />
                {error && <div className="form-error">{error}</div>}
                <button className="login-btn" disabled={loading}>
                  {loading ? "Đang xác minh..." : "Xác minh & tạo tài khoản"}
                </button>
                <button
                  type="button"
                  className="login-btn"
                  style={{ marginTop: 8, opacity: 0.85 }}
                  disabled={loading}
                  onClick={handleRequestOtp}
                >
                  Gửi lại OTP
                </button>
                <div className="login-link">
                  <span onClick={() => setStep(1)}>← Quay lại form</span>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
