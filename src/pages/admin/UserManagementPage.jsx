import React, { useEffect, useState } from "react";
import { userService } from "../../application/services";
import { notifySuccess, notifyError } from "../../application/services/notify";
import { ROLES } from "../../domain/roles";

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await userService.getAll();
      setUsers((res.data || []).filter((u) => u.role !== "Production"));
    } catch (err) {
      console.error(err);
      notifyError("Không tải được người dùng");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa người dùng này?")) return;
    try {
      await userService.remove(id);
      notifySuccess("Đã xóa");
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch {
      notifyError("Xóa thất bại");
    }
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchQ =
      (u.name || u.fullName || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.phone || "").includes(q);
    const matchRole = roleFilter === "All" || u.role === roleFilter;
    return matchQ && matchRole;
  });

  return (
    <div className="staff-page">
      <h2>Người dùng</h2>
      <p className="staff-page-sub">
        Vai trò: Khách hàng · Sales · Quản lý · Admin (đã bỏ Sản xuất).
      </p>

      <div className="staff-toolbar">
        <input
          placeholder="Tìm tên, email, SĐT..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="All">Tất cả role</option>
          {Object.values(ROLES).map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="staff-btn staff-btn-ghost"
          onClick={fetchUsers}
        >
          Tải lại
        </button>
      </div>

      {loading && <p className="staff-status">Đang tải...</p>}

      <div className="staff-panel">
        <div className="staff-table-wrap">
          <table className="staff-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Họ tên</th>
                <th>Email</th>
                <th>SĐT</th>
                <th>Role</th>
                <th>Trạng thái</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td>#{u.id}</td>
                  <td>{u.name || u.fullName}</td>
                  <td>{u.email}</td>
                  <td>{u.phone || "—"}</td>
                  <td>
                    <span className="staff-badge is-active">{u.role}</span>
                  </td>
                  <td>
                    {u.status === "Active" || !u.status ? (
                      <span className="staff-badge is-done">Active</span>
                    ) : (
                      <span className="staff-badge is-off">{u.status}</span>
                    )}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="staff-btn staff-btn-danger"
                      onClick={() => handleDelete(u.id)}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="staff-empty">
                    Không có người dùng
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagementPage;
