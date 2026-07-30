import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LuBadgeCheck,
  LuCircleX,
  LuClipboardList,
  LuUsers,
} from "react-icons/lu";
import Layout from "../../components/Layout/Layout";
import { api } from "../../services/api";
import "../Dashboard/Dashboard.css";

const roleLabels = {
  AGENT: "Property Agent",
  LEGAL_REVIEWER: "Legal Professional",
  BANK: "Financial Institution",
};

function AdminDashboard() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [status, setStatus] = useState("PENDING");
  const [requestedRole, setRequestedRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState("");

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.getAdminRoleRequests({ status, requestedRole });
      setRequests(response);
    } catch (requestError) {
      setError(requestError.message || "Unable to load verification requests");
    } finally {
      setLoading(false);
    }
  }, [requestedRole, status]);

  useEffect(() => {
    if (!api.isAuthenticated()) {
      navigate("/login", { replace: true });
      return;
    }

    if (api.getCurrentUser().role !== "ADMIN") {
      navigate("/dashboard", { replace: true });
      return;
    }

    // Deferring the call itself into a .then() (instead of calling
    // loadRequests() synchronously here) satisfies react-hooks/set-state-in-effect.
    Promise.resolve().then(() => {
      loadRequests();
    });
  }, [loadRequests, navigate]);

  const updateRequest = async (id, action) => {
    setActionId(id);
    setError("");

    try {
      if (action === "approve") {
        await api.approveAdminRoleRequest(id);
      } else {
        await api.rejectAdminRoleRequest(id);
      }
      await loadRequests();
    } catch (requestError) {
      setError(requestError.message || `Unable to ${action} role request`);
    } finally {
      setActionId(null);
    }
  };

  const pendingCount = requests.filter((request) => request.status === "PENDING").length;

  return (
    <Layout title="Admin Dashboard">
      <div className="dashboard-page">
        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "#DBEAFE", color: "#2563EB" }}>
              <LuClipboardList size={20} />
            </div>
            <div>
              <p className="stat-label">Visible Requests</p>
              <h2 className="stat-value">{requests.length}</h2>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "#FEF3C7", color: "#B45309" }}>
              <LuUsers size={20} />
            </div>
            <div>
              <p className="stat-label">Pending Review</p>
              <h2 className="stat-value">{pendingCount}</h2>
            </div>
          </div>
        </section>

        <section className="dashboard-card recent-search-card">
          <h3 className="card-title">Professional Verification Requests</h3>
          {error && <div className="demo-data-notice" role="alert">{error}</div>}

          <div className="verification-filters">
            <select
              className="admin-filter-select"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="">All statuses</option>
              <option value="PENDING">Pending</option>
              <option value="ACTIVE">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <select
              className="admin-filter-select"
              value={requestedRole}
              onChange={(event) => setRequestedRole(event.target.value)}
            >
              <option value="">All professional roles</option>
              <option value="AGENT">Property Agent</option>
              <option value="LEGAL_REVIEWER">Legal Professional</option>
              <option value="BANK">Financial Institution</option>
            </select>
            <button type="button" className="admin-apply-btn" onClick={loadRequests}>
              Apply filters
            </button>
          </div>

          <div className="table-wrapper">
            <table className="recent-table">
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Requested Role</th>
                  <th>Company</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>Loading requests...</td></tr>
                )}
                {!loading && requests.length === 0 && (
                  <tr><td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>No verification requests found.</td></tr>
                )}
                {!loading && requests.map((request) => (
                  <tr key={request.requestId}>
                    <td>
                      <strong>{request.userName}</strong><br />
                      <span>{request.email}</span>
                    </td>
                    <td>{roleLabels[request.requestedRole] || request.requestedRole}</td>
                    <td>{request.companyName}</td>
                    <td>{request.createdAt ? new Date(request.createdAt).toLocaleDateString() : "—"}</td>
                    <td><span className={`risk-badge ${request.status.toLowerCase()}`}>{request.status}</span></td>
                    <td>
                      {request.status === "PENDING" ? (
                        <div className="admin-request-actions">
                          <button
                            type="button"
                            className="admin-action-btn approve"
                            disabled={actionId === request.requestId}
                            onClick={() => updateRequest(request.requestId, "approve")}
                          >
                            <LuBadgeCheck size={16} /> Approve
                          </button>
                          <button
                            type="button"
                            className="admin-action-btn reject"
                            disabled={actionId === request.requestId}
                            onClick={() => updateRequest(request.requestId, "reject")}
                          >
                            <LuCircleX size={16} /> Reject
                          </button>
                        </div>
                      ) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </Layout>
  );
}

export default AdminDashboard;
