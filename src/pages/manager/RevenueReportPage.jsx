import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/manager/revenueReportPage.css";

const RevenueReportPage = () => {
  const [revenues, setRevenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    fetchRevenue();
  }, []);

  const fetchRevenue = async () => {
    try {
      setLoading(true);

      // TODO: đổi API theo backend của bạn
      const res = await axios.get(
        "http://localhost:5000/api/revenue/report"
      );

      const data = res.data || [];
      setRevenues(data);

      // tính tổng doanh thu
      const total = data.reduce((sum, item) => sum + (item.amount || 0), 0);
      setTotalRevenue(total);
    } catch (error) {
      console.error("Error fetching revenue:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="revenue-loading">Loading revenue report...</div>;
  }

  return (
    <div className="revenue-report-container">
      <h2 className="title">Revenue Report</h2>

      <div className="summary-box">
        <h3>Total Revenue</h3>
        <p className="total">{totalRevenue.toLocaleString()} VND</p>
      </div>

      <table className="revenue-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Date</th>
            <th>Order Code</th>
            <th>Amount</th>
          </tr>
        </thead>

        <tbody>
          {revenues.length > 0 ? (
            revenues.map((item, index) => (
              <tr key={index}>
                <td>{item.id}</td>
                <td>{item.date}</td>
                <td>{item.orderCode}</td>
                <td>{item.amount?.toLocaleString()} VND</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">No revenue data</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RevenueReportPage;