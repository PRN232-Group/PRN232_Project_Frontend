import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Space, message } from "antd";
import axios from "axios";

const ContentManagementPage = () => {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContent, setEditingContent] = useState(null);

  const [form] = Form.useForm();

  // GET all content
  const fetchContents = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/contents");
      setContents(res.data);
    } catch (err) {
      message.error("Failed to load content");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContents();
  }, []);

  // Open modal
  const openModal = (content = null) => {
    setEditingContent(content);
    setIsModalOpen(true);

    if (content) {
      form.setFieldsValue({
        title: content.title,
        description: content.description,
        body: content.body,
      });
    } else {
      form.resetFields();
    }
  };

  // Close modal
  const handleClose = () => {
    setIsModalOpen(false);
    setEditingContent(null);
    form.resetFields();
  };

  // Submit create/update
  const handleSubmit = async (values) => {
    try {
      if (editingContent) {
        await axios.put(`/api/contents/${editingContent.id}`, values);
        message.success("Content updated successfully");
      } else {
        await axios.post("/api/contents", values);
        message.success("Content created successfully");
      }

      handleClose();
      fetchContents();
    } catch (err) {
      message.error("Operation failed");
    }
  };

  // Delete content
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/contents/${id}`);
      message.success("Content deleted");
      fetchContents();
    } catch (err) {
      message.error("Delete failed");
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button type="primary" onClick={() => openModal(record)}>
            Edit
          </Button>
          <Button danger onClick={() => handleDelete(record.id)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <h2>Content Management</h2>

      <Button type="primary" onClick={() => openModal()}>
        + Add Content
      </Button>

      <Table
        style={{ marginTop: 16 }}
        columns={columns}
        dataSource={contents}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title={editingContent ? "Edit Content" : "Add Content"}
        open={isModalOpen}
        onCancel={handleClose}
        onOk={() => form.submit()}
        okText="Save"
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: "Please enter title" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
          >
            <Input.TextArea rows={2} />
          </Form.Item>

          <Form.Item
            label="Body"
            name="body"
            rules={[{ required: true, message: "Please enter content body" }]}
          >
            <Input.TextArea rows={6} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ContentManagementPage;