import { useEffect, useMemo, useState } from "react";
import Layout from "../../components/Layout/Layout";
import { api } from "../../services/api";
import "./AuditLogs.css";

import {
  LuActivity,
  LuSearch,
  LuFilter,
  LuRefreshCw,
  LuShieldCheck,
  LuClock3,
  LuUser,
  LuFileText,
} from "react-icons/lu";

function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [error, setError] = useState(null);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    setError(null);

    try {
      // TODO: Replace propertyId when dynamic selection is added
      const data = await api.getActivityLogs(1);

      setLogs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load audit logs", error);
      setError(error.message || "Failed to load audit logs");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const actions = useMemo(() => {
    return [
      "ALL",
      ...new Set(logs.map((log) => log.action).filter(Boolean)),
    ];
  }, [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const searchable = JSON.stringify(log).toLowerCase();

      const matchesQuery = searchable.includes(query.toLowerCase());

      const matchesAction =
        actionFilter === "ALL" ||
        log.action === actionFilter;

      return matchesQuery && matchesAction;
    });
  }, [logs, query, actionFilter]); 
  return (
    <Layout title="Audit Logs">
      <div className="audit-page">

        <div className="audit-header">

          <div className="audit-title">
            <div className="audit-icon">
              <LuActivity />
            </div>

            <div>
              <h2>Security Audit Logs</h2>
              <p>
                Track property activities, document updates,
                ownership changes and system actions.
              </p>
            </div>
          </div>

          <button className="refresh-btn" onClick={loadLogs}>
            <LuRefreshCw />
            Refresh
          </button>

        </div>

        <div className="audit-toolbar">

          <div className="audit-search">
            <LuSearch />

            <input
              type="text"
              placeholder="Search logs, users or actions..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="audit-filter">
            <LuFilter />

            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
            >
              {actions.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>
          </div>

        </div>

        <div className="audit-meta">
          <span>{filteredLogs.length} Records Logged</span>
        </div>

        {error && <div className="error-message" style={{ marginBottom: "20px" }}>{error}</div>}

        {loading ? (
          <div className="audit-loading">
            Loading activity logs...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="audit-empty">

            <LuFileText />

            <h3>No activity found</h3>

            <p>
              There are no audit records matching your filters.
            </p>

          </div>
        ) : (
          <div className="audit-card">

            <div className="audit-table-wrapper">

              <table className="audit-table">

                <thead>
                  <tr>
                    <th>Action</th>
                    <th>User</th>
                    <th>Property</th>
                    <th>Timestamp</th>
                    <th>Details</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredLogs.map((log, index) => (
                    <tr key={log.id || index}>

                      <td>
                        <div className="cell-action">
                          <LuShieldCheck />

                          <span className="action-badge">
                            {log.action || "N/A"}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className="cell-user">
                          <LuUser />
                          <span>{log.userName || "System"}</span>
                        </div>
                      </td>

                      <td>
                        {log.propertyName ||
                          log.propertyId ||
                          "N/A"}
                      </td>

                      <td>
                        <div className="cell-time">
                          <LuClock3 />

                          <span>
                            {log.createdAt
                              ? new Date(log.createdAt).toLocaleString("en-IN")
                              : "N/A"}
                          </span>
                        </div>
                      </td>

                      <td className="details-cell">
                        {log.details ||
                          log.description ||
                          "—"}
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>

            </div>

          </div>
        )}
      </div>
    </Layout>
  );
}

export default AuditLogs;