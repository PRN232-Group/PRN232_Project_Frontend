import React, { useContext, useEffect, useState } from "react";
import { userService } from "../../application/services";
import { notifySuccess, notifyError } from "../../application/services/notify";
import {
  ROLES,
  assignableRoles,
  canManageUser,
} from "../../domain/roles";
import UserContext from "../../contexts/UserContext";

const isUserLocked = (u) => u.isLocked === true || u.status === "Locked";

const emptyCreate = {
  name: "",
  email: "",
  phone: "",
  role: ROLES.CUSTOMER,
};

const UserManagementPage = () => {
  const { user: me } = useContext(UserContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [busyId, setBusyId] = useState(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(emptyCreate);
  const [createBusy, setCreateBusy] = useState(false);

  const [roleEdit, setRoleEdit] = useState(null); // user being edited
  const [nextRole, setNextRole] = useState("");
  const [roleBusy, setRoleBusy] = useState(false);

  const allowedCreateRoles = assignableRoles(me?.role);
  const allowedEditRoles = assignableRoles(me?.role);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!createOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [createOpen, roleEdit]);

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

  const openCreate = () => {
    setCreateForm({
      ...emptyCreate,
      role: allowedCreateRoles[0] || ROLES.CUSTOMER,
    });
    setCreateOpen(true);
  };

  const submitCreate = async (e) => {
    e?.preventDefault?.();
    if (!createForm.name.trim() || !createForm.email.trim()) {
      notifyError("Nhập họ tên và email");
      return;
    }
    try {
      setCreateBusy(true);
      const res = await userService.create({
        name: createForm.name.trim(),
        email: createForm.email.trim(),
        phone: createForm.phone.trim(),
        role: createForm.role,
      });
      setUsers((prev) => [res.data, ...prev]);
      notifySuccess("Đã thêm người dùng");
      setCreateOpen(false);
    } catch (err) {
      notifyError(
        err?.response?.data?.message || err?.message || "Thêm thất bại"
      );
    } finally {
      setCreateBusy(false);
    }
  };

  const openRoleEdit = (u) => {
    if (!canManageUser(me, u)) {
      notifyError("Không thể đổi role của chính mình hoặc role ngang/cao hơn");
      return;
    }
    setRoleEdit(u);
    setNextRole(
      allowedEditRoles.includes(u.role)
        ? u.role
        : allowedEditRoles[0] || ROLES.CUSTOMER
    );
  };

  const submitRole = async () => {
    if (!roleEdit) return;
    try {
      setRoleBusy(true);
      const res = await userService.updateRole(roleEdit.id, nextRole);
      setUsers((prev) =>
        prev.map((x) =>
          x.id === roleEdit.id ? { ...x, ...(res.data || { role: nextRole }) } : x
        )
      );
      notifySuccess("Đã cập nhật role");
      setRoleEdit(null);
    } catch (err) {
      notifyError(
        err?.response?.data?.message || err?.message || "Cập nhật thất bại"
      );
    } finally {
      setRoleBusy(false);
    }
  };

  const toggleLock = async (u) => {
    if (!canManageUser(me, u)) {
      notifyError("Không thể khóa chính mình hoặc tài khoản role ngang/cao hơn");
      return;
    }
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
        Thêm user · đổi role (không sửa chính mình / role ngang trở lên) ·
        khóa/mở khóa.
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
        <button
          type="button"
          className="staff-btn staff-btn-primary"
          onClick={openCreate}
          disabled={!allowedCreateRoles.length}
        >
          + Thêm user
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
                const manageable = canManageUser(me, u);
                const isMe = me && Number(me.id) === Number(u.id);
                return (
                  <tr key={u.id}>
                    <td>#{u.id}</td>
                    <td>
                      {u.name || u.fullName}
                      {isMe && (
                        <span
                          className="staff-badge is-active"
                          style={{ marginLeft: 8 }}
                        >
                          Bạn
                        </span>
                      )}
                    </td>
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
                      <div className="staff-actions">
                        <button
                          type="button"
                          className="staff-btn staff-btn-ghost"
                          disabled={!manageable}
                          title={
                            manageable
                              ? "Đổi role"
                              : "Không thể đổi role của mình / role ngang+"
                          }
                          onClick={() => openRoleEdit(u)}
                        >
                          Đổi role
                        </button>
                        <button
                          type="button"
                          className={
                            locked
                              ? "staff-btn staff-btn-primary"
                              : "staff-btn staff-btn-danger"
                          }
                          disabled={!manageable || busyId === u.id}
                          title={
                            manageable
                              ? locked
                                ? "Mở khóa"
                                : "Khóa"
                              : "Không thể khóa mình / role ngang+"
                          }
                          onClick={() => toggleLock(u)}
                        >
                          {busyId === u.id
                            ? "…"
                            : locked
                              ? "Mở khóa"
                              : "Khóa"}
                        </button>
                      </div>
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

      {createOpen && (
        <div
          className="staff-modal-backdrop"
          onClick={() => setCreateOpen(false)}
        >
          <div
            className="staff-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="staff-modal-head">
              <h3>Thêm người dùng</h3>
              <button
                type="button"
                className="staff-btn staff-btn-ghost"
                onClick={() => setCreateOpen(false)}
              >
                Đóng
              </button>
            </div>
            <form onSubmit={submitCreate}>
              <div className="staff-modal-body">
                <div className="staff-form-grid">
                  <div className="staff-field full">
                    <label htmlFor="nu-name">Họ tên</label>
                    <input
                      id="nu-name"
                      value={createForm.name}
                      onChange={(e) =>
                        setCreateForm((f) => ({ ...f, name: e.target.value }))
                      }
                      placeholder="Nguyễn Văn A"
                      required
                    />
                  </div>
                  <div className="staff-field full">
                    <label htmlFor="nu-email">Email</label>
                    <input
                      id="nu-email"
                      type="email"
                      value={createForm.email}
                      onChange={(e) =>
                        setCreateForm((f) => ({ ...f, email: e.target.value }))
                      }
                      placeholder="user@example.com"
                      required
                    />
                  </div>
                  <div className="staff-field">
                    <label htmlFor="nu-phone">SĐT</label>
                    <input
                      id="nu-phone"
                      value={createForm.phone}
                      onChange={(e) =>
                        setCreateForm((f) => ({ ...f, phone: e.target.value }))
                      }
                    />
                  </div>
                  <div className="staff-field">
                    <label htmlFor="nu-role">Role</label>
                    <select
                      id="nu-role"
                      value={createForm.role}
                      onChange={(e) =>
                        setCreateForm((f) => ({ ...f, role: e.target.value }))
                      }
                    >
                      {allowedCreateRoles.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                    <p className="staff-field-hint">
                      Chỉ gán role thấp hơn role của bạn.
                    </p>
                  </div>
                </div>
              </div>
              <div className="staff-modal-foot">
                <button
                  type="button"
                  className="staff-btn staff-btn-ghost"
                  onClick={() => setCreateOpen(false)}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="staff-btn staff-btn-primary"
                  disabled={createBusy}
                >
                  {createBusy ? "Đang lưu…" : "Thêm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {roleEdit && (
        <div
          className="staff-modal-backdrop"
          onClick={() => setRoleEdit(null)}
        >
          <div
            className="staff-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="staff-modal-head">
              <h3>Đổi role</h3>
              <button
                type="button"
                className="staff-btn staff-btn-ghost"
                onClick={() => setRoleEdit(null)}
              >
                Đóng
              </button>
            </div>
            <div className="staff-modal-body">
              <p className="staff-field-hint" style={{ marginBottom: 12 }}>
                {roleEdit.name || roleEdit.email} · hiện tại{" "}
                <strong>{roleEdit.role}</strong>
              </p>
              <div className="staff-field">
                <label htmlFor="ur-role">Role mới</label>
                <select
                  id="ur-role"
                  value={nextRole}
                  onChange={(e) => setNextRole(e.target.value)}
                >
                  {allowedEditRoles.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <p className="staff-field-hint">
                  Chỉ được cập nhật role — không sửa thông tin cá nhân tại đây.
                </p>
              </div>
            </div>
            <div className="staff-modal-foot">
              <button
                type="button"
                className="staff-btn staff-btn-ghost"
                onClick={() => setRoleEdit(null)}
              >
                Hủy
              </button>
              <button
                type="button"
                className="staff-btn staff-btn-primary"
                disabled={roleBusy || nextRole === roleEdit.role}
                onClick={submitRole}
              >
                {roleBusy ? "Đang lưu…" : "Lưu role"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;
