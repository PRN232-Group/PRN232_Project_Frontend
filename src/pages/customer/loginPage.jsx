import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "../../styles/customer/loginPage.css";

function LoginPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!form.email || !form.password) {
        setError("Vui lòng nhập đầy đủ thông tin.");
        setLoading(false);
        return;
      }

      if (form.password.length < 6) {
        setError("Mật khẩu phải có ít nhất 6 ký tự.");
        setLoading(false);
        return;
      }

      // MOCK LOGIN (giả lập API)
      await new Promise((res) => setTimeout(res, 800));

      const mockUser = {
        email: form.email,
        role: "User",
      };

      localStorage.setItem("user", JSON.stringify(mockUser));

      alert("Login success!");
navigate("/", { replace: true });
    } catch (err) {
      setError("Đăng nhập thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg">
      <div className="login-container">
        {/* LEFT */}
        <div className="login-left">
          <img
            src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5"
            alt="Login"
            className="login-img"
          />
          <div className="login-brand">My App</div>
          <div className="login-copyright">
            © 2026 My App. All rights reserved.
          </div>
        </div>

        {/* RIGHT */}
        <div className="login-right">
          <div className="login-form-box">
            <h2 style={{ marginBottom: 24, color: "#1976d2" }}>Login</h2>

            <form className="login-form" onSubmit={handleSubmit}>
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
                    color: "#888",
                  }}
                >
                  <i
                    className={
                      showPassword
                        ? "fa-regular fa-eye-slash"
                        : "fa-regular fa-eye"
                    }
                  />
                </span>
              </div>

              {error && (
                <div style={{ color: "red", marginBottom: 10 }}>{error}</div>
              )}

              <button className="login-btn" disabled={loading}>
                {loading ? "Loading..." : "Login"}
              </button>

              <div className="login-link">
                Don’t have an account?{" "}
                <span onClick={() => navigate("/register")}>Register</span>
              </div>
            </form>

            <div className="login-socials">
              <a href="#">
                <i className="fa-brands fa-facebook-f"></i>
              </a>
              <a href="#">
                <i className="fa-brands fa-instagram"></i>
              </a>
              <a href="#">
                <i className="fa-brands fa-twitter"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;