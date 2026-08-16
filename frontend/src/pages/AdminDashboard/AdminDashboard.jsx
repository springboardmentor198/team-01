import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LuBadgeCheck,
  LuCircleX,
  LuClipboardList,
  LuUsers,
  LuChevronDown,
  LuCheck,
} from "react-icons/lu";
import Layout from "../../components/Layout/Layout";
import { api } from "../../services/api";
import "../Dashboard/Dashboard.css";
import "./AdminDashboard.css";

const roleLabels = {
  BUYER: "Buyer",
  AGENT: "Property Agent",
  LEGAL_REVIEWER: "Legal Professional",
  BANK: "Financial Institution",
};

const statusOptions = [
  { value: "", label: "All statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "ACTIVE", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];

const roleOptions = [
  { value: "", label: "All roles" },
  { value: "BUYER", label: "Buyer" },
  { value: "AGENT", label: "Property Agent" },
  { value: "LEGAL_REVIEWER", label: "Legal Professional" },
  { value: "BANK", label: "Financial Institution" },
];

// Small local dropdown, defined right here so no new files are needed.
// Native <select> option lists can't be restyled (rendered by the browser/OS),
// so this re-implements the same behavior with fully CSS-controllable markup.
function InlineDropdown({ options, value, onChange }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = options.find((opt) => opt.value === value);

  return (
    <div className="inline-dropdown" ref={containerRef}>
      <button
        type="button"
        className={`inline-dropdown-trigger ${open ? "open" : ""}`}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span>{selected ? selected.label : "Select..."}</span>
        <LuChevronDown className="inline-dropdown-arrow" size={16} />
      </button>

      {open && (
        <div className="inline-dropdown-list" role="listbox">
          {options.map((option) => (
            <div
              key={option.value}
              role="option"
              aria-selected={option.value === value}
              className={`inline-dropdown-option ${option.value === value ? "selected" : ""}`}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              <span>{option.label}</span>
              {option.value === value && <LuCheck size={15} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminDashboard() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [status, setStatus] = useState("PENDING");
  const [requestedRole, setRequestedRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("verifications");
  const [pendingProperties, setPendingProperties] = useState([]);
  const [propertiesLoading, setPropertiesLoading] = useState(true);

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

  const loadPendingProperties = useCallback(async () => {
    setPropertiesLoading(true);
    try {
      const response = await api.getAdminProperties({ status: "UNDER_REVIEW" });
      setPendingProperties(response);
    } catch (err) {
      console.warn("Failed to load pending properties:", err);
    } finally {
      setPropertiesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!api.isAuthenticated()) {
      navigate("/login", { replace: true });
      return;
    }

    if (api.getCurrentUser().role !== "ADMIN") {
      navigate("/dashboard", { replace: true });
      return;
    }

    Promise.resolve().then(() => {
      loadRequests();
      loadPendingProperties();
    });
  }, [loadRequests, loadPendingProperties, navigate]);

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

  const handleApproveProperty = async (propertyId) => {
    setActionId(propertyId);
    setError("");
    try {
      await api.approveAdminProperty(propertyId);
      await loadPendingProperties();
    } catch (err) {
      setError(err.message || "Failed to approve property");
    } finally {
      setActionId(null);
    }
  };

  const handleRejectProperty = async (propertyId) => {
    setActionId(propertyId);
    setError("");
    try {
      await api.rejectAdminProperty(propertyId);
      await loadPendingProperties();
    } catch (err) {
      setError(err.message || "Failed to reject property");
    } finally {
      setActionId(null);
    }
  };

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
              <h2 className="stat-value">{pendingProperties.length}</h2>
            </div>
          </div>
        </section>

        <div className="admin-tabs">
          <button
            className={`admin-tab-btn ${tab === "verifications" ? "active" : ""}`}
            onClick={() => setTab("verifications")}
          >
            Professional Verifications
          </button>
          <button
            className={`admin-tab-btn ${tab === "properties" ? "active" : ""}`}
            onClick={() => setTab("properties")}
          >
            Property Reviews ({pendingProperties.length})
          </button>
        </div>

        {tab === "verifications" && (
          <section className="dashboard-card recent-search-card">
            <h3 className="card-title">Professional Verification Requests</h3>
            {error && <div className="demo-data-notice" role="alert">{error}</div>}

            <div className="verification-filters">
              <InlineDropdown
                options={statusOptions}
                value={status}
                onChange={setStatus}
              />
              <InlineDropdown
                options={roleOptions}
                value={requestedRole}
                onChange={setRequestedRole}
              />
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
        )}

        {tab === "properties" && (
          <section className="dashboard-card recent-search-card">
            <h3 className="card-title">Properties Pending Review</h3>
            {error && <div className="demo-data-notice" role="alert">{error}</div>}

            <div className="table-wrapper">
              <table className="recent-table">
                <thead>
                  <tr>
                    <th>Property</th>
                    <th>Address</th>
                    <th>Owner</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {propertiesLoading && (
                    <tr><td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>Loading properties...</td></tr>
                  )}
                  {!propertiesLoading && pendingProperties.length === 0 && (
                    <tr><td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>No properties pending review.</td></tr>
                  )}
                  {!propertiesLoading && pendingProperties.map((p) => (
                    <tr key={p.propertyId}>
                      <td>
                        <strong>{p.propertyCode}</strong><br />
                        <span>{p.propertyType || "—"}</span>
                      </td>
                      <td>{p.address}</td>
                      <td>{p.ownerName || "—"}</td>
                      <td><span className="risk-badge pending">Under Review</span></td>
                      <td>
                        <div className="admin-request-actions">
                          <button
                            type="button"
                            className="admin-action-btn approve"
                            disabled={actionId === p.propertyId}
                            onClick={() => handleApproveProperty(p.propertyId)}
                          >
                            <LuBadgeCheck size={16} /> Approve
                          </button>
                          <button
                            type="button"
                            className="admin-action-btn reject"
                            disabled={actionId === p.propertyId}
                            onClick={() => handleRejectProperty(p.propertyId)}
                          >
                            <LuCircleX size={16} /> Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}

export default AdminDashboard;
