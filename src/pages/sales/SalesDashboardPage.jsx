import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/sales/salesDashboardPage.css";

const SalesDashboardPage = () => {
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    totalQuotations: 0,
    approvedQuotations: 0,
  });

  const [recentRequests, setRecentRequests] = useState([]);
  const [recentQuotations, setRecentQuotations] = useState([]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await axios.get("/api/sales/dashboard");

      setStats(res.data.stats || stats);
      setRecentRequests(res.data.recentRequests || []);
      setRecentQuotations(res.data.recentQuotations || []);
    } catch (err) {
      console.error("Load dashboard error:", err);
    }
  };

  return (
    <div className="sales-dashboard-container">
      <h2>Sales Dashboard</h2>

      {/* KPI CARDS */}
      <div className="kpi-grid">
        <div className="kpi-card blue">
          <h3>Total Requests</h3>
          <p>{stats.totalRequests}</p>
        </div>

        <div className="kpi-card orange">
          <h3>Pending Requests</h3>
          <p>{stats.pendingRequests}</p>
        </div>

        <div className="kpi-card green">
          <h3>Quotations</h3>
          <p>{stats.totalQuotations}</p>
        </div>

        <div className="kpi-card purple">
          <h3>Approved</h3>
          <p>{stats.approvedQuotations}</p>
        </div>
      </div>

      {/* CONTENT GRID */}
      <div className="dashboard-content">
        {/* REQUESTS */}
        <div className="box">
          <h3>Recent Requests</h3>

          {recentRequests.length === 0 ? (
            <p>No data</p>
          ) : (
            recentRequests.map((r) => (
              <div key={r.id} className="item">
                <div>
                  <b>{r.title}</b>
                  <p>{r.customerName}</p>
                </div>
                <span className={`status ${r.status.toLowerCase()}`}>
                  {r.status}
                </span>
              </div>
            ))
          )}
        </div>

        {/* QUOTATIONS */}
        <div className="box">
          <h3>Recent Quotations</h3>

          {recentQuotations.length === 0 ? (
            <p>No data</p>
          ) : (
            recentQuotations.map((q) => (
              <div key={q.id} className="item">
                <div>
                  <b>{q.title}</b>
                  <p>{q.customerName}</p>
                </div>
                <span className={`status ${q.status.toLowerCase()}`}>
                  {q.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="quick-actions">
        <button onClick={() => window.location.href = "/sales/quotation-requests"}>
          Manage Requests
        </button>

        <button onClick={() => window.location.href = "/sales/quotations"}>
          Manage Quotations
        </button>

        <button onClick={() => window.location.href = "/sales/chat"}>
          Customer Chat
        </button>
      </div>
    </div>
  );
};

export default SalesDashboardPage;