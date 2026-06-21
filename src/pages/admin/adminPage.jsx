import { Layout } from "antd";
import React from "react";
import { Outlet } from "react-router-dom";
import SideBar from "../../components/admin/sideBar";

const { Content } = Layout;

const AdminPage = () => {
  return (
    <Layout
      style={{
        minHeight: "100vh",
        background: "#f8f6f3",
      }}
    >
      <SideBar />

      <Layout
        style={{
          marginLeft: 250,
          transition: "all 0.3s ease",
          background: "#f8f6f3",
          minHeight: "100vh",
        }}
      >
        <Content
          style={{
            margin: 24,
            padding: 24,
            background: "#ffffff",
            borderRadius: 16,
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            overflow: "auto",
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminPage;