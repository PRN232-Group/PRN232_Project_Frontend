import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Space, message, Select } from "antd";
import axios from "axios";

const { Option } = Select;

const RoleManagementPage = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);

  const [form] = Form.useForm();

  // Fetch roles
  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/roles");
      setRoles(res.data);
    } catch (err) {
      message.error("Failed to load roles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // Open modal
  const openModal = (role = null) => {
    setEditingRole(role);
    setIsModalOpen(true);

    if (role) {
      form.setFieldsValue({
        name: role.name,
        description: role.description,
        status: role.status,
      });
    } else {
      form.resetFields();
    }
  };

  // Close modal
  const handleClose = () => {
    setIsModalOpen(false);
    setEditingRole(null);
    form.resetFields();
  };

  // Submit create/update
  const handleSubmit = async (values) => {
    try {
      if (editingRole) {
        await axios.put(`/api/roles/${editingRole.id}`, values);
        message.success("Role updated successfully");
      } else {
        await axios.post("/api/roles", values);
        message.success("Role created successfully");
      }

      handleClose();
      fetchRoles();
    } catch (err) {
      message.error("Operation failed");
    }
  };

  // Delete role
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/roles/${id}`);
      message.success("Role deleted");
      fetchRoles();
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
      title: "Role Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) =>
        status === "ACTIVE" ? (
          <span style={{ color: "green" }}>ACTIVE</span>
        ) : (
          <span style={{ color: "red" }}>INACTIVE</span>
        ),
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
      <h2>Role Management</h2>

      <Button type="primary" onClick={() => openModal()}>
        + Add Role
      </Button>

      <Table
        style={{ marginTop: 16 }}
        columns={columns}
        dataSource={roles}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title={editingRole ? "Edit Role" : "Add Role"}
        open={isModalOpen}
        onCancel={handleClose}
        onOk={() => form.submit()}
        okText="Save"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Role Name"
            name="name"
            rules={[{ required: true, message: "Please enter role name" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            label="Status"
            name="status"
            rules={[{ required: true, message: "Please select status" }]}
          >
            <Select placeholder="Select status">
              <Option value="ACTIVE">ACTIVE</Option>
              <Option value="INACTIVE">INACTIVE</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RoleManagementPage;