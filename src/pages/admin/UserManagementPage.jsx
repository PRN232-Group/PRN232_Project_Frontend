import React, { useEffect, useState } from "react";
import { userService } from "../../application/services";
import { notifySuccess, notifyError } from "../../application/services/notify";
import { ROLES } from "../../domain/roles";

const isUserLocked = (u) => u.isLocked === true || u.status === "Locked";

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [busyId, setBusyId] = useState(null);

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

  const toggleLock = async (u) => {
    const nextLocked = !isUserLocked(u);
    const name = u.name || u.fullName || u.email;
    const ok = window.confirm(
      nextLocked
        ? `Khóa tài khoản “${name}”? User sẽ không đăng nhập được.`
        : `Mở khóa tài khoản “${name}”?`
    );
    if (!ok) return;

    try {
      setBusyId(u.id);
      const res = await userService.setLocked(u.id, nextLocked);
      const updated = res.data || {
        ...u,
        isLocked: nextLocked,
        status: nextLocked ? "Locked" : "Active",
      };
      setUsers((prev) =>
        prev.map((x) => (x.id === u.id ? { ...x, ...updated } : x))
      );
      notifySuccess(nextLocked ? "Đã khóa tài khoản" : "Đã mở khóa tài khoản");
    } catch (err) {
      notifyError(
        err?.response?.data?.message || err?.message || "Thao tác thất bại"
      );
    } finally {
      setBusyId(null);
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
        Không xóa user — chỉ khóa / mở khóa tài khoản. Tài khoản khóa không đăng
        nhập được.
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
              {filtered.map((u) => {
                const locked = isUserLocked(u);
                return (
                  <tr key={u.id}>
                    <td>#{u.id}</td>
                    <td>{u.name || u.fullName}</td>
                    <td>{u.email}</td>
                    <td>{u.phone || "—"}</td>
                    <td>
                      <span className="staff-badge is-active">{u.role}</span>
                    </td>
                    <td>
                      {locked ? (
                        <span className="staff-badge is-stock-out">Đã khóa</span>
                      ) : (
                        <span className="staff-badge is-done">Đang mở</span>
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        className={
                          locked
                            ? "staff-btn staff-btn-primary"
                            : "staff-btn staff-btn-danger"
                        }
                        disabled={busyId === u.id}
                        onClick={() => toggleLock(u)}
                      >
                        {busyId === u.id
                          ? "…"
                          : locked
                            ? "Mở khóa"
                            : "Khóa"}
                      </button>
                    </td>
                  </tr>
                );
              })}
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
