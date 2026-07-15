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

  const [roleEdit, setRoleEdit] = useState(null);
  const [nextRole, setNextRole] = useState("");
  const [roleBusy, setRoleBusy] = useState(false);

  const [lockConfirm, setLockConfirm] = useState(null); // { user, nextLocked }

  const allowedCreateRoles = assignableRoles(me?.role);
  const allowedEditRoles = assignableRoles(me?.role);
  const anyModal = createOpen || roleEdit || lockConfirm;

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!anyModal) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [anyModal]);

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
    if (!canManageUser(me, u)) return;
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
          x.id === roleEdit.id
            ? { ...x, ...(res.data || { role: nextRole }) }
            : x
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

  const askToggleLock = (u) => {
    if (!canManageUser(me, u)) return;
    setLockConfirm({ user: u, nextLocked: !isUserLocked(u) });
  };

  const confirmToggleLock = async () => {
    if (!lockConfirm) return;
    const { user: u, nextLocked } = lockConfirm;
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
      setLockConfirm(null);
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
        Thêm user · đổi role · khóa/mở khóa. Nút mờ với tài khoản của bạn hoặc
        role ngang trở lên.
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
                <th className="staff-col-actions">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const locked = isUserLocked(u);
                const manageable = canManageUser(me, u);
                const isMe = me && Number(me.id) === Number(u.id);
                return (
                  <tr key={u.id} className={isMe ? "staff-row-self" : undefined}>
                    <td>#{u.id}</td>
                    <td>
                      <div className="staff-user-name">
                        <span>{u.name || u.fullName}</span>
                        {isMe && (
                          <span className="staff-badge is-active">Bạn</span>
                        )}
                      </div>
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
                      <div className="staff-actions staff-actions-soft">
                        <button
                          type="button"
                          className={
                            manageable
                              ? "staff-btn staff-btn-ghost"
                              : "staff-btn staff-btn-ghost is-faded"
                          }
                          disabled={!manageable}
                          aria-disabled={!manageable}
                          title={
                            manageable
                              ? "Đổi role"
                              : isMe
                                ? "Không đổi role của chính mình"
                                : "Không đổi role ngang / cao hơn"
                          }
                          onClick={() => openRoleEdit(u)}
                        >
                          Đổi role
                        </button>
                        <button
                          type="button"
                          className={
                            !manageable
                              ? "staff-btn staff-btn-ghost is-faded"
                              : locked
                                ? "staff-btn staff-btn-soft"
                                : "staff-btn staff-btn-warn"
                          }
                          disabled={!manageable || busyId === u.id}
                          title={
                            manageable
                              ? locked
                                ? "Mở khóa tài khoản"
                                : "Khóa tài khoản"
                              : isMe
                                ? "Không khóa chính mình"
                                : "Không khóa role ngang / cao hơn"
                          }
                          onClick={() => askToggleLock(u)}
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
          <div className="staff-modal" onClick={(e) => e.stopPropagation()}>
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
            className="staff-modal staff-modal-sm"
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
              <div className="staff-confirm-user">
                <span className="staff-confirm-avatar">
                  {(roleEdit.name || roleEdit.email || "?").charAt(0)}
                </span>
                <div>
                  <strong>{roleEdit.name || roleEdit.email}</strong>
                  <p>
                    Role hiện tại · <em>{roleEdit.role}</em>
                  </p>
                </div>
              </div>
              <div className="staff-field" style={{ marginTop: 16 }}>
                <label htmlFor="ur-role">Role mới</label>
                <div className="staff-role-pills">
                  {allowedEditRoles.map((r) => (
                    <button
                      key={r}
                      type="button"
                      className={
                        nextRole === r
                          ? "staff-role-pill is-on"
                          : "staff-role-pill"
                      }
                      onClick={() => setNextRole(r)}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <p className="staff-field-hint">
                  Chỉ cập nhật role — không sửa thông tin cá nhân.
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

      {lockConfirm && (
        <div
          className="staff-modal-backdrop"
          onClick={() => setLockConfirm(null)}
        >
          <div
            className="staff-modal staff-modal-sm staff-confirm-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="staff-modal-head">
              <h3>
                {lockConfirm.nextLocked ? "Khóa tài khoản?" : "Mở khóa?"}
              </h3>
              <button
                type="button"
                className="staff-btn staff-btn-ghost"
                onClick={() => setLockConfirm(null)}
              >
                Đóng
              </button>
            </div>
            <div className="staff-modal-body">
              <div className="staff-confirm-user">
                <span
                  className={
                    lockConfirm.nextLocked
                      ? "staff-confirm-avatar is-warn"
                      : "staff-confirm-avatar is-ok"
                  }
                >
                  {(
                    lockConfirm.user.name ||
                    lockConfirm.user.email ||
                    "?"
                  ).charAt(0)}
                </span>
                <div>
                  <strong>
                    {lockConfirm.user.name || lockConfirm.user.email}
                  </strong>
                  <p>{lockConfirm.user.email}</p>
                </div>
              </div>
              <p className="staff-confirm-copy">
                {lockConfirm.nextLocked
                  ? "User sẽ không đăng nhập được cho đến khi được mở khóa."
                  : "Tài khoản sẽ đăng nhập bình thường trở lại."}
              </p>
            </div>
            <div className="staff-modal-foot">
              <button
                type="button"
                className="staff-btn staff-btn-ghost"
                onClick={() => setLockConfirm(null)}
              >
                Hủy
              </button>
              <button
                type="button"
                className={
                  lockConfirm.nextLocked
                    ? "staff-btn staff-btn-warn"
                    : "staff-btn staff-btn-primary"
                }
                disabled={busyId === lockConfirm.user.id}
                onClick={confirmToggleLock}
              >
                {busyId === lockConfirm.user.id
                  ? "Đang xử lý…"
                  : lockConfirm.nextLocked
                    ? "Khóa tài khoản"
                    : "Mở khóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;
