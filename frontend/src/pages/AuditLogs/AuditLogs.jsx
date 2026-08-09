import { useEffect, useState } from "react";
import Layout from "../../components/Layout/Layout";
import { api } from "../../services/api";
import "./AuditLogs.css";

import { LuActivity } from "react-icons/lu";

function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    api.getAuditLogs()
      .then((data) => {
        setLogs(data || []);
        setError("");
      })
      .catch((err) => {
        setError(err.message || "Failed to load audit logs");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const getActionClass = (type) => {
    if (!type) return "sys";
    const t = type.toLowerCase();
    if (t.includes("login")) return "login";
    if (t.includes("download") || t.includes("upload")) return "view";
    if (t.includes("create") || t.includes("update") || t.includes("delete")) return "db";
    return "sys";
  };

  const getResourceTable = (type) => {
    if (!type) return "system";
    const t = type.toLowerCase();
    if (t.includes("user")) return "users";
    if (t.includes("property")) return "properties";
    if (t.includes("document")) return "documents";
    if (t.includes("risk")) return "risk_summary";
    return "system";
  };

  const formatLogTime = (dateStr) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <Layout title="Audit Logs">
      <div className="audit-page">
        <div className="audit-header">
          <h2>Security Audit Logs</h2>
          <span>{logs.length} Records Logged</span>
        </div>

        {error && <div className="error-message" style={{ marginBottom: "20px" }}>{error}</div>}

        <div className="audit-card">
          <div className="audit-table-wrapper">
            {loading ? (
              <p style={{ textAlign: "center", padding: "20px", color: "#64748B" }}>Loading audit logs...</p>
            ) : logs.length > 0 ? (
              <table className="audit-table">
                <thead>
                  <tr>
                    <th>Log ID</th>
                    <th>User / Operator</th>
                    <th>Action</th>
                    <th>Resource Table</th>
                    <th>Timestamp</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td style={{ fontWeight: "700", color: "#64748b" }}>LOG-{log.id}</td>
                      <td>{log.performedBy || "System"}</td>
                      <td>
                        <span className={`action-badge ${getActionClass(log.activityType)}`}>
                          {log.activityType}
                        </span>
                      </td>
                      <td style={{ fontFamily: "monospace", color: "#475569" }}>
                        {getResourceTable(log.activityType)}
                      </td>
                      <td>{formatLogTime(log.createdAt)}</td>
                      <td>
                        <span className="status-indicator">SUCCESS</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ textAlign: "center", padding: "20px", color: "#64748B" }}>No audit logs found.</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default AuditLogs;