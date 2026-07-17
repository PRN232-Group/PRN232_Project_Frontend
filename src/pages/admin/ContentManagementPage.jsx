import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Select, Switch, message } from "antd";
import { contentService } from "../../application/services";

const ContentManagementPage = () => {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const fetchContents = async () => {
    try {
      setLoading(true);
      const res = await contentService.getAll();
      setContents(res.data || []);
    } catch {
      message.error("Không tải được nội dung");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContents();
  }, []);

  const openModal = (content = null) => {
    setEditing(content);
    setIsModalOpen(true);
    if (content) {
      form.setFieldsValue({
        title: content.title,
        slug: content.slug,
        type: content.type || "Blog",
        body: content.body,
        coverUrl: content.coverUrl,
        isPublished: content.isPublished !== false,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ type: "Blog", isPublished: true });
    }
  };

  const handleSubmit = async (values) => {
    try {
      const body = {
        ...values,
        publishedAt: values.isPublished
          ? new Date().toISOString()
          : null,
      };
      if (editing) {
        await contentService.update(editing.id, body);
        message.success("Đã cập nhật bài viết");
      } else {
        await contentService.create(body);
        message.success("Đã thêm nội dung");
      }
      setIsModalOpen(false);
      fetchContents();
    } catch {
      message.error("Thao tác thất bại");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa nội dung này?")) return;
    try {
      await contentService.remove(id);
      message.success("Đã xóa");
      fetchContents();
    } catch {
      message.error("Xóa thất bại");
    }
  };

  return (
    <div className="staff-page">
      <h2>Nội dung / Blog</h2>
      <p className="staff-page-sub">
        Bài viết Blog / Guide / News — hiện ở trang chủ (Góc cảm hứng) và{" "}
        <code>/blog</code> cho khách.
      </p>

      <div className="staff-toolbar">
        <button
          type="button"
          className="staff-btn staff-btn-primary"
          onClick={() => openModal()}
        >
          + Thêm bài
        </button>
        <button
          type="button"
          className="staff-btn staff-btn-ghost"
          onClick={fetchContents}
        >
          Tải lại
        </button>
      </div>

      <div className="staff-panel">
        <table className="staff-table">
          <thead>
            <tr>
              <th>Bài viết</th>
              <th>Loại</th>
              <th>Slug</th>
              <th>Xuất bản</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="staff-empty">
                  Đang tải...
                </td>
              </tr>
            ) : (
              contents.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div className="staff-product-cell">
                      {c.coverUrl && <img src={c.coverUrl} alt="" />}
                      <div>
                        <h4>{c.title}</h4>
                        <p>
                          {(c.body || "")
                            .replace(/<[^>]+>/g, "")
                            .slice(0, 60)}
                          …
                        </p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="staff-badge is-active">{c.type}</span>
                  </td>
                  <td style={{ color: "var(--muted)", fontSize: 13 }}>
                    {c.slug}
                  </td>
                  <td>
                    {c.isPublished ? (
                      <span className="staff-badge is-done">Đã xuất bản</span>
                    ) : (
                      <span className="staff-badge is-off">Nháp</span>
                    )}
                  </td>
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
            {!loading && contents.length === 0 && (
              <tr>
                <td colSpan={5} className="staff-empty">
                  Chưa có nội dung
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        title={editing ? "Sửa nội dung" : "Thêm nội dung"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText="Lưu"
        cancelText="Hủy"
        width={720}
        zIndex={4100}
        getContainer={() => document.body}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Tiêu đề"
            name="title"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Slug" name="slug">
            <Input placeholder="xu-huong-2026" />
          </Form.Item>
          <Form.Item label="Loại" name="type">
            <Select
              options={[
                { value: "Blog", label: "Blog" },
                { value: "Guide", label: "Guide" },
                { value: "News", label: "News" },
              ]}
            />
          </Form.Item>
          <Form.Item label="Cover URL" name="coverUrl">
            <Input />
          </Form.Item>
          <Form.Item
            label="Nội dung"
            name="body"
            rules={[{ required: true }]}
          >
            <Input.TextArea rows={6} />
          </Form.Item>
          <Form.Item
            label="Xuất bản"
            name="isPublished"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ContentManagementPage;
