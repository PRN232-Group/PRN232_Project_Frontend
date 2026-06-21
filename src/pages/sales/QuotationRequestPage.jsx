import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/sales/quotationRequestPage.css";

const QuotationRequestPage = () => {
  const [requests, setRequests] = useState([]);
  const [selected, setSelected] = useState(null);
  const [replyNote, setReplyNote] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/quotation-requests");
      setRequests(res.data || []);
    } catch (err) {
      console.error("Load requests error:", err);
    } finally {
      setLoading(false);
    }
  };

  const selectRequest = (req) => {
    setSelected(req);
    setReplyNote(req.replyNote || "");
  };

  const handleReply = async () => {
    if (!selected) return;

    try {
      await axios.put(`/api/quotation-requests/${selected.id}/reply`, {
        replyNote,
        status: "PROCESSING",
      });

      alert("Replied successfully!");
      fetchRequests();
      setSelected(null);
      setReplyNote("");
    } catch (err) {
      console.error("Reply error:", err);
    }
  };

  const markDone = async () => {
    if (!selected) return;

    try {
      await axios.put(`/api/quotation-requests/${selected.id}`, {
        status: "DONE",
      });

      alert("Marked as DONE!");
      fetchRequests();
      setSelected(null);
    } catch (err) {
      console.error("Update status error:", err);
    }
  };

  return (
    <div className="quotation-request-container">
      {/* LEFT LIST */}
      <div className="request-list">
        <h2>Quotation Requests</h2>

        {loading ? (
          <p>Loading...</p>
        ) : (
          requests.map((r) => (
            <div
              key={r.id}
              className={`request-item ${
                selected?.id === r.id ? "active" : ""
              }`}
              onClick={() => selectRequest(r)}
            >
              <div className="title">{r.title}</div>
              <div className="meta">
                <span>{r.customerName}</span>
                <span className={`status ${r.status.toLowerCase()}`}>
                  {r.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* RIGHT DETAIL */}
      <div className="request-detail">
        {selected ? (
          <>
            <h2>Request Detail</h2>

            <div className="info-box">
              <p><b>Customer:</b> {selected.customerName}</p>
              <p><b>Email:</b> {selected.customerEmail}</p>
              <p><b>Title:</b> {selected.title}</p>
              <p><b>Description:</b></p>
              <p>{selected.description}</p>
              <p><b>Created:</b> {new Date(selected.createdAt).toLocaleString()}</p>
            </div>

            <h3>Attachments</h3>
            <div className="image-list">
              {selected.images?.length > 0 ? (
                selected.images.map((img, index) => (
                  <img key={index} src={img} alt="request" />
                ))
              ) : (
                <p>No images</p>
              )}
            </div>

            <h3>Reply Note</h3>
            <textarea
              value={replyNote}
              onChange={(e) => setReplyNote(e.target.value)}
              placeholder="Write reply to customer..."
            />

            <div className="actions">
              <button className="reply" onClick={handleReply}>
                Send Reply
              </button>

              <button className="done" onClick={markDone}>
                Mark Done
              </button>
            </div>
          </>
        ) : (
          <div className="empty">
            Select a request to view detail
          </div>
        )}
      </div>
    </div>
  );
};

export default QuotationRequestPage;