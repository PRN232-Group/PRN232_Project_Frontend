import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../../styles/sales/designRequestDetailPage.css";

const DesignRequestDetailPage = () => {
  const { id } = useParams();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/design-requests/${id}`);
      setRequest(res.data);
      setStatus(res.data.status);
      setNote(res.data.note || "");
    } catch (err) {
      console.error("Load design request error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`/api/design-requests/${id}`, {
        status,
        note,
      });

      alert("Updated successfully!");
      fetchDetail();
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  if (loading) {
    return <div className="design-detail-loading">Loading...</div>;
  }

  if (!request) {
    return <div className="design-detail-error">Not found</div>;
  }

  return (
    <div className="design-detail-container">
      {/* HEADER */}
      <div className="design-header">
        <h2>Design Request Detail</h2>
        <span className={`status ${status.toLowerCase()}`}>
          {status}
        </span>
      </div>

      {/* CONTENT */}
      <div className="design-content">
        {/* LEFT INFO */}
        <div className="design-info">
          <h3>Customer Information</h3>
          <p><b>Name:</b> {request.customerName}</p>
          <p><b>Email:</b> {request.customerEmail}</p>
          <p><b>Phone:</b> {request.customerPhone}</p>

          <h3>Request Detail</h3>
          <p><b>Title:</b> {request.title}</p>
          <p><b>Description:</b></p>
          <p>{request.description}</p>

          <p><b>Created At:</b> {new Date(request.createdAt).toLocaleString()}</p>
        </div>

        {/* RIGHT ACTION */}
        <div className="design-action">
          <h3>Attachments</h3>

          <div className="image-list">
            {request.images?.length > 0 ? (
              request.images.map((img, index) => (
                <img key={index} src={img} alt="design" />
              ))
            ) : (
              <p>No images</p>
            )}
          </div>

          <h3>Update Status</h3>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="PENDING">PENDING</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="DONE">DONE</option>
            <option value="REJECTED">REJECTED</option>
          </select>

          <h3>Note</h3>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Write internal note..."
          />

          <button className="update-btn" onClick={handleUpdate}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default DesignRequestDetailPage;