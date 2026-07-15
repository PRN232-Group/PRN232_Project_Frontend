import React, { useContext, useEffect, useState } from "react";
import { userService } from "../../application/services";
import UserContext from "../../contexts/UserContext";
import { ROLE_LABEL, normalizeRole } from "../../domain/roles";
import "../../styles/customer/profilePage.css";
import { notifySuccess, notifyError, notifyInfo, notifyWarn } from "../../application/services/notify";

const AVATAR_FALLBACK =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><rect fill="#f0e6da" width="160" height="160"/><text x="50%" y="54%" text-anchor="middle" font-family="Georgia,serif" font-size="48" fill="#b0784f">IS</text></svg>`
  );

const ProfilePage = () => {
  const { user: sessionUser, setUser: setSessionUser } = useContext(UserContext);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
  });
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await userService.getProfile();
      const d = res.data || {};
      setForm({
        fullName: d.fullName || d.name || sessionUser?.name || "",
        email: d.email || sessionUser?.email || "",
        phone: d.phone || "",
        address: d.address || "",
      });
      setPreview(d.avatar || d.avatarUrl || "");
    } catch {
      setForm({
        fullName: sessionUser?.name || "",
        email: sessionUser?.email || "",
        phone: sessionUser?.phone || "0901234567",
        address: "12 Nguyễn Huệ, Q1, HCM",
      });
      setPreview("");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleUpdate = async () => {
    try {
      setSaving(true);
      await userService.updateProfile({
        name: form.fullName,
        fullName: form.fullName,
        phone: form.phone,
        address: form.address,
      });
      if (sessionUser) {
        const next = { ...sessionUser, name: form.fullName, phone: form.phone };
        setSessionUser(next);
        localStorage.setItem("user", JSON.stringify(next));
      }
      notifySuccess("Đã lưu hồ sơ");
    } catch {
      notifyError("Cập nhật thất bại");
    } finally {
      setSaving(false);
    }
  };

  const roleKey = sessionUser ? normalizeRole(sessionUser.role) : "customer";

  return (
    <div className="profile-page page">
      <h2>Hồ sơ cá nhân</h2>

      {loading ? (
        <p>Đang tải hồ sơ...</p>
      ) : (
        <div className="profile-layout">
          <aside className="profile-aside">
            <div className="profile-avatar-wrap">
              <img
                src={preview || AVATAR_FALLBACK}
                alt="avatar"
                onError={(e) => {
                  e.currentTarget.src = AVATAR_FALLBACK;
                }}
              />
            </div>
            <label className="profile-upload-btn">
              Đổi ảnh
              <input type="file" accept="image/*" hidden onChange={handleAvatarChange} />
            </label>
            <div className="profile-role-pill">{ROLE_LABEL[roleKey]}</div>
            <p className="profile-email">{form.email}</p>
          </aside>

          <div className="profile-form card-like">
            <div className="profile-field">
              <label htmlFor="fullName">Họ và tên</label>
              <input
                id="fullName"
                value={form.fullName}
                onChange={(e) =>
                  setForm({ ...form, fullName: e.target.value })
                }
              />
            </div>
            <div className="profile-field">
              <label htmlFor="phone">Số điện thoại</label>
              <input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="profile-field">
              <label htmlFor="address">Địa chỉ</label>
              <textarea
                id="address"
                rows={3}
                value={form.address}
                onChange={(e) =>
                  setForm({ ...form, address: e.target.value })
                }
              />
            </div>
            <button
              type="button"
              className="profile-save"
              disabled={saving}
              onClick={handleUpdate}
            >
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
