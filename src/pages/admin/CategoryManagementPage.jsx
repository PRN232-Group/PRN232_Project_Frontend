import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Space, message } from "antd";
import axios from "axios";

const CategoryManagementPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [form] = Form.useForm();

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/categories");
      setCategories(res.data);
    } catch (err) {
      message.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Open modal
  const openModal = (category = null) => {
    setEditingCategory(category);
    setIsModalOpen(true);

    if (category) {
      form.setFieldsValue({
        name: category.name,
        description: category.description,
      });
    } else {
      form.resetFields();
    }
  };

  // Close modal
  const handleClose = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    form.resetFields();
  };

  // Submit form (create/update)
  const handleSubmit = async (values) => {
    try {
      if (editingCategory) {
        await axios.put(`/api/categories/${editingCategory.id}`, values);
        message.success("Category updated successfully");
      } else {
        await axios.post("/api/categories", values);
        message.success("Category created successfully");
      }

      handleClose();
      fetchCategories();
    } catch (err) {
      message.error("Operation failed");
    }
  };

  // Delete category
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/categories/${id}`);
      message.success("Category deleted");
      fetchCategories();
    } catch (err) {
      message.error("Delete failed");
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
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
      <h2>Category Management</h2>

      <Button type="primary" onClick={() => openModal()}>
        + Add Category
      </Button>

      <Table
        style={{ marginTop: 16 }}
        columns={columns}
        dataSource={categories}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title={editingCategory ? "Edit Category" : "Add Category"}
        open={isModalOpen}
        onCancel={handleClose}
        onOk={() => form.submit()}
        okText="Save"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Please enter category name" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
          >
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoryManagementPage;