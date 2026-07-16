import Layout from "../../components/Layout/Layout";
import { api } from "../../services/api";
import "./AuditLogs.css";

import { LuActivity } from "react-icons/lu";

function AuditLogs() {
  const currentUser = api.getCurrentUser();

  const mockLogs = [
    {
      id: "LOG-9824",
      user: currentUser.email,
      action: "USER_LOGIN",
      actionClass: "login",
      table: "users",
      time: "Just now",
      status: "SUCCESS"
    },
    {
      id: "LOG-9823",
      user: currentUser.email,
      action: "VIEW_DASHBOARD",
      actionClass: "view",
      table: "properties",
      time: "2 mins ago",
      status: "SUCCESS"
    },
    {
      id: "LOG-9819",
      user: "postgres",
      action: "CONNECT_DATABASE",
      actionClass: "db",
      table: "postgres_db",
      time: "15 mins ago",
      status: "SUCCESS"
    },
    {
      id: "LOG-9818",
      user: "system",
      action: "RUN_MIGRATIONS",
      actionClass: "sys",
      table: "schema_version",
      time: "16 mins ago",
      status: "SUCCESS"
    },
    {
      id: "LOG-9812",
      user: "mithun@gmail.com",
      action: "REPLACE_BACKEND",
      actionClass: "sys",
      table: "spring_boot_api",
      time: "Yesterday",
      status: "SUCCESS"
    }
  ];

  return (
    <Layout title="Audit Logs">
      <div className="audit-page">
        <div className="audit-header">
          <h2>Security Audit Logs</h2>
          <span>{mockLogs.length} Records Logged</span>
        </div>

        <div className="audit-card">
          <div className="audit-table-wrapper">
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
                {mockLogs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontWeight: "700", color: "#64748b" }}>{log.id}</td>
                    <td>{log.user}</td>
                    <td>
                      <span className={`action-badge ${log.actionClass}`}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ fontFamily: "monospace", color: "#475569" }}>
                      {log.table}
                    </td>
                    <td>{log.time}</td>
                    <td>
                      <span className="status-indicator">{log.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default AuditLogs;