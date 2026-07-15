import React, { useEffect, useState } from "react";
import { systemLogService, userService } from "../../application/services";

const SystemLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const [lRes, uRes] = await Promise.all([
        systemLogService.getAll(),
        userService.getAll(),
      ]);
      setLogs(lRes.data || []);
      setUsers(uRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const actorName = (id) =>
    users.find((u) => u.id === id)?.name || `User #${id}` || "Hệ thống";

  const filtered = logs.filter((log) => {
    const q = search.toLowerCase();
    return (
      (log.action || "").toLowerCase().includes(q) ||
      (log.detail || "").toLowerCase().includes(q) ||
      (log.entity || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="staff-page">
      <h2>Nhật ký hệ thống</h2>
      <p className="staff-page-sub">Theo dõi thao tác quản trị trên catalog & đơn hàng.</p>

      <div className="staff-toolbar">
        <input
          placeholder="Tìm theo action / chi tiết..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="button" className="staff-btn staff-btn-ghost" onClick={load}>
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
                <th>Hành động</th>
                <th>Đối tượng</th>
                <th>Chi tiết</th>
                <th>Người thực hiện</th>
                <th>Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => (
                <tr key={log.id}>
                  <td>#{log.id}</td>
                  <td>
                    <span className="staff-badge is-active">{log.action}</span>
                  </td>
                  <td>
                    {log.entity}
                    {log.entityId ? ` #${log.entityId}` : ""}
                  </td>
                  <td>{log.detail}</td>
                  <td>{actorName(log.actorUserId)}</td>
                  <td>
                    {log.createdAt
                      ? new Date(log.createdAt).toLocaleString("vi-VN")
                      : "—"}
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="staff-empty">
                    Không có nhật ký
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

export default SystemLogPage;
