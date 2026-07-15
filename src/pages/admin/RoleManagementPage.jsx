import React, { useEffect, useState } from "react";
import { Modal, Form, Input, message } from "antd";
import { roleService } from "../../application/services";

const RoleManagementPage = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [form] = Form.useForm();

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res = await roleService.getAll();
      setRoles((res.data || []).filter((r) => r.name !== "Production"));
    } catch {
      message.error("Không tải được vai trò");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const openModal = (role = null) => {
    setEditingRole(role);
    setIsModalOpen(true);
    if (role) form.setFieldsValue(role);
    else form.resetFields();
  };

  const handleSubmit = async (values) => {
    try {
      if (editingRole) {
        await roleService.update(editingRole.id, values);
        message.success("Đã cập nhật");
      } else {
        await roleService.create(values);
        message.success("Đã tạo vai trò");
      }
      setIsModalOpen(false);
      fetchRoles();
    } catch {
      message.error("Thao tác thất bại");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa vai trò này?")) return;
    try {
      await roleService.remove(id);
      message.success("Đã xóa");
      fetchRoles();
    } catch {
      message.error("Xóa thất bại");
    }
  };

  return (
    <div className="staff-page">
      <h2>Phân quyền</h2>
      <p className="staff-page-sub">
        Customer · Sales · Manager · Admin — khớp login mock & guard.
      </p>

      <div className="staff-toolbar">
        <button
          type="button"
          className="staff-btn staff-btn-primary"
          onClick={() => openModal()}
        >
          + Thêm role
        </button>
        <button
          type="button"
          className="staff-btn staff-btn-ghost"
          onClick={fetchRoles}
        >
          Tải lại
        </button>
      </div>

      <div className="staff-panel">
        <table className="staff-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên</th>
              <th>Mô tả</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="staff-empty">
                  Đang tải...
                </td>
              </tr>
            ) : (
              roles.map((r) => (
                <tr key={r.id}>
                  <td>#{r.id}</td>
                  <td>
                    <strong>{r.name}</strong>
                  </td>
                  <td style={{ color: "var(--muted)" }}>{r.description}</td>
                  <td>
                    <div className="staff-actions">
                      <button
                        type="button"
                        className="staff-btn staff-btn-ghost"
                        onClick={() => openModal(r)}
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        className="staff-btn staff-btn-danger"
                        onClick={() => handleDelete(r.id)}
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
            {!loading && roles.length === 0 && (
              <tr>
                <td colSpan={4} className="staff-empty">
                  Chưa có role
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        title={editingRole ? "Sửa role" : "Thêm role"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Tên"
            rules={[{ required: true, message: "Nhập tên" }]}
          >
            <Input placeholder="Sales / Manager / ..." />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RoleManagementPage;
