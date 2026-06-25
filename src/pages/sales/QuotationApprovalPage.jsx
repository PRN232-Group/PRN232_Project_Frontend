import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/sales/quotationApprovalPage.css";

const QuotationApprovalPage = () => {
  const [quotations, setQuotations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/quotations");
      setQuotations(res.data || []);
    } catch (err) {
      console.error("Load quotations error:", err);
    } finally {
      setLoading(false);
    }
  };

  const selectQuotation = (q) => {
    setSelected(q);
    setStatus(q.status);
    setNote(q.note || "");
  };

  const handleUpdate = async (newStatus) => {
    if (!selected) return;

    try {
      await axios.put(`/api/quotations/${selected.id}`, {
        status: newStatus,
        note,
      });

      alert("Updated successfully!");
      fetchQuotations();
      setSelected(null);
    } catch (err) {
      console.error("Update quotation error:", err);
    }
  };

  return (
    <div className="quotation-container">
      {/* LEFT LIST */}
      <div className="quotation-list">
        <h2>Quotations</h2>

        {loading ? (
          <p>Loading...</p>
        ) : (
          quotations.map((q) => (
            <div
              key={q.id}
              className={`quotation-item ${
                selected?.id === q.id ? "active" : ""
              }`}
              onClick={() => selectQuotation(q)}
            >
              <div className="title">{q.title}</div>
              <div className="meta">
                <span>{q.customerName}</span>
                <span className={`status ${q.status.toLowerCase()}`}>
                  {q.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* RIGHT DETAIL */}
      <div className="quotation-detail">
        {selected ? (
          <>
            <h2>Quotation Detail</h2>

            <div className="info-box">
              <p><b>Customer:</b> {selected.customerName}</p>
              <p><b>Email:</b> {selected.customerEmail}</p>
              <p><b>Title:</b> {selected.title}</p>
              <p><b>Total Price:</b> ${selected.totalPrice}</p>
              <p><b>Created:</b> {new Date(selected.createdAt).toLocaleString()}</p>
            </div>

            <h3>Items</h3>
            <table className="item-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {selected.items?.map((i, index) => (
                  <tr key={index}>
                    <td>{i.productName}</td>
                    <td>{i.quantity}</td>
                    <td>${i.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h3>Note</h3>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Write internal note..."
            />

            <div className="actions">
              <button
                className="approve"
                onClick={() => handleUpdate("APPROVED")}
              >
                Approve
              </button>

              <button
                className="reject"
                onClick={() => handleUpdate("REJECTED")}
              >
                Reject
              </button>
            </div>
          </>
        ) : (
          <div className="empty">
            Select a quotation to view detail
          </div>
        )}
      </div>
    </div>
  );
};

export default QuotationApprovalPage;