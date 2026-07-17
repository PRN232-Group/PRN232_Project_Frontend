import React, { useCallback, useEffect, useMemo, useState } from "react";
import { message } from "antd";
import { permissionService } from "../../application/services";
import { notifySuccess, notifyError } from "../../application/services/notify";

const SECTION_LABEL = {
  admin: "Hệ thống",
  manager: "Catalog",
  sales: "Kinh doanh",
};

const SECTION_ORDER = ["admin", "manager", "sales"];

/** Chỉ cho sửa quyền các role này — Admin khóa cứng full quyền */
const EDITABLE_ROLES = new Set(["Sales", "Manager"]);

const RoleManagementPage = () => {
  const [roles, setRoles] = useState([]);
  const [pages, setPages] = useState([]);
  const [grants, setGrants] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingRoleId, setSavingRoleId] = useState(null);
  const [activeRoleId, setActiveRoleId] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await permissionService.getMatrix();
      const data = res.data || {};
      const roleList = (data.roles || []).filter((r) =>
        EDITABLE_ROLES.has(r.name)
      );
      setRoles(roleList);
      setPages(data.pages || []);
      const g = {};
      for (const r of data.roles || []) {
        g[r.id] = new Set(data.grants?.[r.id] || []);
      }
      setGrants(g);
      setActiveRoleId((prev) => {
        if (prev && roleList.some((r) => r.id === prev)) return prev;
        return roleList[0]?.id ?? null;
      });
    } catch {
      message.error("Không tải được bảng phân quyền");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const pagesBySection = useMemo(() => {
    const map = {};
    for (const p of pages) {
      if (!map[p.section]) map[p.section] = [];
      map[p.section].push(p);
    }
    return map;
  }, [pages]);

  const activeRole = roles.find((r) => r.id === activeRoleId) || null;
  const activeSet = grants[activeRoleId] || new Set();
  const grantedCount = activeSet.size;
  const canEdit = activeRole && EDITABLE_ROLES.has(activeRole.name);

  const toggle = (pageKey) => {
    if (!activeRoleId || !canEdit) return;
    setGrants((prev) => {
      const next = { ...prev };
      const set = new Set(next[activeRoleId] || []);
      if (set.has(pageKey)) set.delete(pageKey);
      else set.add(pageKey);
      next[activeRoleId] = set;
      return next;
    });
  };

  const toggleSection = (section, on) => {
    if (!activeRoleId || !canEdit) return;
    const sectionPages = pagesBySection[section] || [];
    setGrants((prev) => {
      const next = { ...prev };
      const set = new Set(next[activeRoleId] || []);
      for (const p of sectionPages) {
        if (on) set.add(p.pageKey);
        else set.delete(p.pageKey);
      }
      next[activeRoleId] = set;
      return next;
    });
  };

  const saveActive = async () => {
    if (!activeRoleId || !canEdit) return;
    setSavingRoleId(activeRoleId);
    try {
      const pageKeys = [...(grants[activeRoleId] || [])];
      await permissionService.setRolePermissions(activeRoleId, pageKeys);
      notifySuccess(`Đã lưu quyền · ${activeRole?.name || "role"}`);
      await load();
    } catch (err) {
      notifyError(
        err?.response?.data?.message || err?.message || "Lưu quyền thất bại"
      );
    } finally {
      setSavingRoleId(null);
    }
  };

  return (
    <div className="staff-page staff-perm-page">
      <header className="staff-perm-top">
        <div>
          <h2>Phân quyền trang</h2>
          <p className="staff-page-sub">
            Chỉ cấu hình Sales &amp; Manager. Admin luôn full quyền — không sửa
            được. Trang chủ &amp; Tổng quan luôn mở.
          </p>
        </div>
        <div className="staff-perm-actions">
          <button
            type="button"
            className="staff-btn staff-btn-ghost"
            onClick={load}
            disabled={loading}
          >
            Tải lại
          </button>
          <button
            type="button"
            className="staff-btn staff-btn-primary"
            disabled={
              !canEdit || !activeRoleId || savingRoleId === activeRoleId
            }
            onClick={saveActive}
          >
            {savingRoleId === activeRoleId ? "Đang lưu…" : "Lưu quyền"}
          </button>
        </div>
      </header>

      <div className="staff-perm-shell">
        <aside className="staff-perm-side">
          <div className="staff-perm-side-label">Role</div>
          {loading ? (
            <p className="staff-perm-side-empty">Đang tải…</p>
          ) : roles.length === 0 ? (
            <p className="staff-perm-side-empty">Không có role chỉnh được</p>
          ) : (
            <nav className="staff-perm-nav">
              {roles.map((r) => {
                const n = (grants[r.id] || new Set()).size;
                return (
                  <button
                    key={r.id}
                    type="button"
                    className={
                      r.id === activeRoleId
                        ? "staff-perm-nav-item is-on"
                        : "staff-perm-nav-item"
                    }
                    onClick={() => setActiveRoleId(r.id)}
                  >
                    <span className="staff-perm-nav-name">{r.name}</span>
                    <span className="staff-perm-nav-meta">{n} trang</span>
                  </button>
                );
              })}
            </nav>
          )}
          <p className="staff-perm-side-note">
            Admin · khóa cứng
            <br />
            Customer · không back-office
          </p>
        </aside>

        <div className="staff-perm-main">
          {!activeRole ? (
            <p className="staff-empty">Chọn role bên trái</p>
          ) : (
            <>
              <div className="staff-perm-main-head">
                <div>
                  <h3>
                    {activeRole.name}
                    <span className="staff-perm-badge">{grantedCount} trang</span>
                  </h3>
                  {activeRole.description && <p>{activeRole.description}</p>}
                </div>
              </div>

              <div className="staff-perm-scroll">
                {SECTION_ORDER.filter((s) => pagesBySection[s]?.length).map(
                  (section) => {
                    const list = pagesBySection[section];
                    const allOn = list.every((p) => activeSet.has(p.pageKey));
                    const onCount = list.filter((p) =>
                      activeSet.has(p.pageKey)
                    ).length;
                    return (
                      <section key={section} className="staff-perm-block">
                        <div className="staff-perm-block-head">
                          <div>
                            <strong>
                              {SECTION_LABEL[section] || section}
                            </strong>
                            <span>
                              {onCount}/{list.length}
                            </span>
                          </div>
                          {canEdit && (
                            <button
                              type="button"
                              className="staff-perm-link"
                              onClick={() => toggleSection(section, !allOn)}
                            >
                              {allOn ? "Bỏ hết" : "Chọn hết"}
                            </button>
                          )}
                        </div>
                        <ul className="staff-perm-rows">
                          {list.map((p) => {
                            const on = activeSet.has(p.pageKey);
                            return (
                              <li key={p.pageKey}>
                                <label
                                  className={
                                    on
                                      ? "staff-perm-row is-on"
                                      : "staff-perm-row"
                                  }
                                >
                                  <input
                                    type="checkbox"
                                    checked={on}
                                    disabled={!canEdit}
                                    onChange={() => toggle(p.pageKey)}
                                  />
                                  <span className="staff-perm-row-text">
                                    <strong>{p.name}</strong>
                                    <code>{p.pageKey}</code>
                                  </span>
                                  <span
                                    className={
                                      on
                                        ? "staff-perm-pill is-on"
                                        : "staff-perm-pill"
                                    }
                                  >
                                    {on ? "Cho phép" : "Chặn"}
                                  </span>
                                </label>
                              </li>
                            );
                          })}
                        </ul>
                      </section>
                    );
                  }
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoleManagementPage;
