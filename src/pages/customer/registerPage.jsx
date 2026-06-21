import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "../../styles/loginPage.css";

const RegisterPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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
      if (
        !form.name ||
        !form.email ||
        !form.password ||
        !form.confirmPassword
      ) {
        setError("Vui lòng nhập đầy đủ thông tin.");
        setLoading(false);
        return;
      }

      if (form.name.trim().length < 5) {
        setError("Họ tên phải có ít nhất 5 ký tự.");
        setLoading(false);
        return;
      }

      const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
      if (!gmailRegex.test(form.email)) {
        setError("Email phải là Gmail (@gmail.com).");
        setLoading(false);
        return;
      }

      const passwordRegex =
        /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])(?=.*\d).{8,}$/;

      if (!passwordRegex.test(form.password)) {
        setError(
          "Mật khẩu phải ≥ 8 ký tự, có chữ in hoa, số và ký tự đặc biệt."
        );
        setLoading(false);
        return;
      }

      if (form.password !== form.confirmPassword) {
        setError("Mật khẩu xác nhận không khớp.");
        setLoading(false);
        return;
      }

      // MOCK REGISTER
      await new Promise((res) => setTimeout(res, 800));

      const mockUser = {
        name: form.name,
        email: form.email,
        role: "User",
      };

      localStorage.setItem("user", JSON.stringify(mockUser));

      alert("Register success!");

      navigate("/login");
    } catch (err) {
      setError("Đăng ký thất bại!");
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
            alt="Register"
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
            <h2 style={{ marginBottom: 24, color: "#1976d2" }}>
              Register
            </h2>

            <form className="login-form" onSubmit={handleSubmit}>
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

              {/* PASSWORD */}
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

              {/* CONFIRM PASSWORD */}
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
                  onClick={() =>
                    setShowConfirmPassword((p) => !p)
                  }
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
                      showConfirmPassword
                        ? "fa-regular fa-eye-slash"
                        : "fa-regular fa-eye"
                    }
                  />
                </span>
              </div>

              {error && (
                <div style={{ color: "red", marginBottom: 10 }}>
                  {error}
                </div>
              )}

              <button className="login-btn" disabled={loading}>
                {loading ? "Loading..." : "Register"}
              </button>

              <div className="login-link">
                Already have an account?{" "}
                <span onClick={() => navigate("/login")}>
                  Login
                </span>
              </div>
            </form>

            {/* SOCIAL */}
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
};

export default RegisterPage;