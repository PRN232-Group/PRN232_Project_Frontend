import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/admin/systemLogPage.css";

const SystemLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get("https://localhost:5001/api/systemlogs");

      setLogs(res.data || []);
    } catch (err) {
      console.error(err);
      setError("Không thể tải dữ liệu system logs");
    } finally {
      setLoading(false);
    }
  };

  // filter logs
  const filteredLogs = logs.filter((log) =>
    (log.message || "").toLowerCase().includes(search.toLowerCase()) ||
    (log.level || "").toLowerCase().includes(search.toLowerCase()) ||
    (log.userName || "").toLowerCase().includes(search.toLowerCase())
  );

  // pagination logic
  const totalPages = Math.ceil(filteredLogs.length / pageSize);

  const startIndex = (currentPage - 1) * pageSize;
  const currentLogs = filteredLogs.slice(startIndex, startIndex + pageSize);

  const changePage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="system-log-page">
      <h2>System Logs</h2>

      {/* Search */}
      <div className="log-toolbar">
        <input
          type="text"
          placeholder="Search logs..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />
        <button onClick={fetchLogs}>Reload</button>
      </div>

      {/* Content */}
      {loading && <p>Loading logs...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <>
          <table className="log-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Level</th>
                <th>Message</th>
                <th>User</th>
                <th>Time</th>
              </tr>
            </thead>

            <tbody>
              {currentLogs.length > 0 ? (
                currentLogs.map((log) => (
                  <tr key={log.id}>
                    <td>{log.id}</td>
                    <td>
                      <span className={`level ${log.level?.toLowerCase()}`}>
                        {log.level}
                      </span>
                    </td>
                    <td>{log.message}</td>
                    <td>{log.userName || "System"}</td>
                    <td>
                      {log.createdAt
                        ? new Date(log.createdAt).toLocaleString()
                        : ""}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No logs found</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="pagination">
            <button onClick={() => changePage(currentPage - 1)}>
              Prev
            </button>

            <span>
              Page {currentPage} / {totalPages || 1}
            </span>

            <button onClick={() => changePage(currentPage + 1)}>
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default SystemLogPage;