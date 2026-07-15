import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/customer/profilePage.css";

const ProfilePage = () => {
  const [user, setUser] = useState(null);

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
  });

  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(
        "https://localhost:5001/api/users/profile"
      );

      setUser(res.data);
      setForm({
        fullName: res.data.fullName || "",
        phone: res.data.phone || "",
        address: res.data.address || "",
      });

      setPreview(res.data.avatar || "");
    } catch (err) {
      console.error(err);
      // fallback to the logged-in user stored locally
      let stored = null;
      try {
        stored = JSON.parse(localStorage.getItem("user"));
      } catch {
        stored = null;
      }
      const demo = {
        fullName: stored?.name || "Khách hàng Interior Studio",
        email: stored?.email || "guest@interiorstudio.com",
        phone: "0900 000 000",
        address: "TP. Hồ Chí Minh, Việt Nam",
        avatar: "",
      };
      setUser(demo);
      setForm({
        fullName: demo.fullName,
        phone: demo.phone,
        address: demo.address,
      });
      setPreview("");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    setAvatar(file);

    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdate = async () => {
    try {
      const formData = new FormData();
      formData.append("fullName", form.fullName);
      formData.append("phone", form.phone);
      formData.append("address", form.address);

      if (avatar) {
        formData.append("avatar", avatar);
      }

      await axios.put(
        "https://localhost:5001/api/users/profile",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("Cập nhật thành công!");
      fetchProfile();
    } catch (err) {
      console.error(err);
      alert("Cập nhật thất bại");
    }
  };

  return (
    <div className="profile-page">
      <h2>My Profile</h2>

      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && user && (
        <div className="profile-container">
          {/* AVATAR */}
          <div className="avatar-section">
            <img
              src={
                preview ||
                "https://via.placeholder.com/150"
              }
              alt="avatar"
            />

            <input
              type="file"
              onChange={handleAvatarChange}
            />
          </div>

          {/* FORM */}
          <div className="form-section">
            <label>Full Name</label>
            <input
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
            />

            <label>Phone</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
            />

            <label>Address</label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
            />

            <button onClick={handleUpdate}>
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
