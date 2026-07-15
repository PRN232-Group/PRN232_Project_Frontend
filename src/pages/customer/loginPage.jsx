import React, { useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "../../styles/customer/authPage.css";
import UserContext from "../../contexts/UserContext";
import { login as loginUseCase } from "../../application/services/authService";
import { ROLES } from "../../domain/roles";
import { isMockEnabled } from "../../infrastructure/mock/installMockApi";

/** Mock accounts — khớp src/infrastructure/mock/data.js users */
const MOCK_ACCOUNTS = [
  {
    role: ROLES.CUSTOMER,
    label: "Khách hàng",
    email: "an@example.com",
    password: "123456",
    hint: "Nguyễn Văn An",
  },
  {
    role: ROLES.SALES,
    label: "Sales",
    email: "sales@interior.studio",
    password: "123456",
    hint: "Sales Minh",
  },
  {
    role: ROLES.MANAGER,
    label: "Quản lý",
    email: "manager@interior.studio",
    password: "123456",
    hint: "Manager Lan",
  },
  {
    role: ROLES.ADMIN,
    label: "Admin",
    email: "admin@interior.studio",
    password: "123456",
    hint: "Admin IS",
  },
];

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useContext(UserContext);

  const [form, setForm] = useState({
    email: MOCK_ACCOUNTS[0].email,
    password: MOCK_ACCOUNTS[0].password,
    role: MOCK_ACCOUNTS[0].role,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setError("");
  };

  const applyMockAccount = (acc) => {
    setForm({
      email: acc.email,
      password: acc.password,
      role: acc.role,
    });
    setError("");
  };

  const loginWithAccount = async (acc) => {
    setError("");
    setLoading(true);
    const payload = {
      email: acc.email,
      password: acc.password,
      role: acc.role,
    };
    setForm(payload);
    try {
      const { user, landing } = await loginUseCase(payload);
      setUser(user);
      const redirect = location.state?.from;
      const go =
        redirect &&
        (user.role === "Customer" || user.role === "customer") &&
        typeof redirect === "string"
          ? redirect
          : landing;
      navigate(go, { replace: true });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Đăng nhập thất bại!"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { user, landing } = await loginUseCase(form);
      setUser(user);
      const redirect = location.state?.from;
      const go =
        redirect &&
        (user.role === "Customer" || user.role === "customer") &&
        typeof redirect === "string"
          ? redirect
          : landing;
      navigate(go, { replace: true });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Đăng nhập thất bại!"
      );
    } finally {
      setLoading(false);
    }
  };

  const showMockPanel = isMockEnabled();

  return (
    <div className="login-bg">
      <div className="login-container">
        <div className="login-left">
          <img
            src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&q=80"
            alt="Interior Studio"
            className="login-img"
          />
          <div className="login-brand">Interior Studio</div>
          <div className="login-copyright">
            © {new Date().getFullYear()} Interior Studio. All rights reserved.
          </div>
        </div>

        <div className="login-right">
          <div className="login-form-box">
            <h2>Đăng nhập</h2>
            <p className="login-subtitle">Chào mừng trở lại Interior Studio</p>

            {showMockPanel && (
            <div className="mock-login-panel">
              <p className="mock-login-title">Mock verify — chọn role để vào ngay</p>
              <div className="mock-login-chips">
                {MOCK_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.role}
                    type="button"
                    className={
                      form.role === acc.role
                        ? "mock-chip is-active"
                        : "mock-chip"
                    }
                    disabled={loading}
                    title={`${acc.hint} · ${acc.email}`}
                    onClick={() => loginWithAccount(acc)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      applyMockAccount(acc);
                    }}
                  >
                    {acc.label}
                  </button>
                ))}
              </div>
              <p className="mock-login-hint">
                Mật khẩu chung: <code>123456</code> · click = đăng nhập · chuột
                phải = chỉ điền form
              </p>
            </div>
            )}

            <form className="login-form" onSubmit={handleSubmit}>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />

              <div className="password-field">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Mật khẩu"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((p) => !p)}
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  <i
                    className={
                      showPassword
                        ? "fa-regular fa-eye-slash"
                        : "fa-regular fa-eye"
                    }
                  />
                </button>
              </div>

              <select
                name="role"
                value={form.role}
                onChange={(e) => {
                  handleChange(e);
                  const acc = MOCK_ACCOUNTS.find(
                    (a) => a.role === e.target.value
                  );
                  if (acc) applyMockAccount(acc);
                }}
                aria-label="Vai trò đăng nhập"
              >
                <option value={ROLES.CUSTOMER}>Khách hàng</option>
                <option value={ROLES.SALES}>Nhân viên Kinh doanh</option>
                <option value={ROLES.MANAGER}>Quản lý</option>
                <option value={ROLES.ADMIN}>Quản trị viên</option>
              </select>

              {error && <div className="form-error">{error}</div>}

              <button className="login-btn" disabled={loading}>
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>

              <div className="login-link">
                Chưa có tài khoản?{" "}
                <span onClick={() => navigate("/register")}>Đăng ký ngay</span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
