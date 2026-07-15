import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "../../styles/customer/authPage.css";
import UserContext from "../../contexts/UserContext";

const ROLE_LANDING = {
  Customer: "/",
  Sales: "/sales",
  Production: "/production",
  Manager: "/manager",
  Admin: "/admin",
};

function LoginPage() {
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  const [form, setForm] = useState({ email: "", password: "", role: "Customer" });
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
        name: form.email.split("@")[0],
        email: form.email,
        role: form.role,
      };

      localStorage.setItem("user", JSON.stringify(mockUser));
      setUser(mockUser);

      navigate(ROLE_LANDING[form.role] || "/", { replace: true });
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
          <div className="login-brand">Interior Studio</div>
          <div className="login-copyright">
            © {new Date().getFullYear()} Interior Studio. All rights reserved.
          </div>
        </div>

        {/* RIGHT */}
        <div className="login-right">
          <div className="login-form-box">
            <h2>Đăng nhập</h2>
            <p style={{ color: "var(--muted)", marginBottom: 4, fontSize: 14 }}>
              Chào mừng trở lại Interior Studio
            </p>

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

              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                aria-label="Vai trò đăng nhập"
              >
                <option value="Customer">Khách hàng</option>
                <option value="Sales">Nhân viên Kinh doanh</option>
                <option value="Production">Nhân viên Sản xuất</option>
                <option value="Manager">Quản lý</option>
                <option value="Admin">Quản trị viên</option>
              </select>

              {error && (
                <div style={{ color: "red", marginBottom: 10 }}>{error}</div>
              )}

              <button className="login-btn" disabled={loading}>
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>

              <div className="login-link">
                Chưa có tài khoản?{" "}
                <span onClick={() => navigate("/register")}>Đăng ký ngay</span>
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
