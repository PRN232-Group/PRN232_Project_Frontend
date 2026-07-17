import React, { useEffect, useState } from "react";
import { Modal, Form, Input, message } from "antd";
import { categoryService } from "../../application/services";

const CategoryManagementPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await categoryService.getAll();
      setCategories(res.data || []);
    } catch {
      message.error("Không tải được danh mục");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openModal = (category = null) => {
    setEditing(category);
    setIsModalOpen(true);
    if (category) form.setFieldsValue(category);
    else form.resetFields();
  };

  const handleSubmit = async (values) => {
    try {
      if (editing) {
        await categoryService.update(editing.id, values);
        message.success("Đã cập nhật danh mục");
      } else {
        await categoryService.create(values);
        message.success("Đã thêm danh mục");
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch {
      message.error("Thao tác thất bại");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa danh mục này?")) return;
    try {
      await categoryService.remove(id);
      message.success("Đã xóa");
      fetchCategories();
    } catch {
      message.error("Xóa thất bại");
    }
  };

  return (
    <div className="staff-page">
      <h2>Danh mục sản phẩm</h2>
      <p className="staff-page-sub">
        Sofa, Bàn, Ghế… — dùng chung với bộ lọc storefront.
      </p>

      <div className="staff-toolbar">
        <button
          type="button"
          className="staff-btn staff-btn-primary"
          onClick={() => openModal()}
        >
          + Thêm danh mục
        </button>
        <button
          type="button"
          className="staff-btn staff-btn-ghost"
          onClick={fetchCategories}
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
              categories.map((c) => (
                <tr key={c.id}>
                  <td>#{c.id}</td>
                  <td>
                    <strong>{c.name}</strong>
                  </td>
                  <td style={{ color: "var(--muted)" }}>{c.description}</td>
                  <td>
                    <div className="staff-actions">
                      <button
                        type="button"
                        className="staff-btn staff-btn-ghost"
                        onClick={() => openModal(c)}
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        className="staff-btn staff-btn-danger"
                        onClick={() => handleDelete(c.id)}
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        title={editing ? "Sửa danh mục" : "Thêm danh mục"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText="Lưu"
        cancelText="Hủy"
        zIndex={4100}
        getContainer={() => document.body}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Tên"
            name="name"
            rules={[{ required: true, message: "Nhập tên danh mục" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Mô tả" name="description">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoryManagementPage;
