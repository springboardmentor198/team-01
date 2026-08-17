import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  LuShieldCheck,
  LuClipboardList,
  LuCircleX,
  LuChevronDown,
  LuCheck,
  LuBuilding2,
  LuUsers,
  LuBadgeCheck,
} from "react-icons/lu";
import Layout from "../../components/Layout/Layout";
import { api } from "../../services/api";
import "../Dashboard/Dashboard.css";
import "./AdminDashboard.css";

import AdminStatCard from "./AdminStatCard";
import PlatformActivityChart from "./PlatformActivityChart";
import VerificationSummary from "./VerificationSummary";
import RecentActivity from "./RecentActivity";
import ProfessionalDistribution from "./ProfessionalDistribution";
import SupportOverview from "./SupportOverview";
import SystemMetrics from "./SystemMetrics";

const roleLabels = {
  BUYER: "Buyer",
  AGENT: "Property Agent",
  LEGAL_REVIEWER: "Legal Professional",
  BANK: "Financial Institution",
};

const statusOptions = [
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
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
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
  const [dashboard, setDashboard] = useState(null);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.getAdminRoleRequests({
        status,
        requestedRole,
      });
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
      navigate("/login", {
        replace: true,
      });

      return;
    }

    const currentUser = api.getCurrentUser();

    if (!currentUser || currentUser.role !== "ADMIN") {
      navigate("/dashboard", {
        replace: true,
      });
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

  useEffect(() => {
    let active = true;
    Promise.all([
      api.getAdminDashboard(),
      api.getNotificationCount().catch(() => 0),
    ])
      .then(([data, notificationCount]) => {
        if (active)
          setDashboard({
            ...data,
            notificationCount: Number(notificationCount) || 0,
          });
      })
      .catch(
        (loadError) =>
          active &&
          setError(loadError.message || "Unable to load dashboard data."),
      );
    return () => {
      active = false;
    };
  }, []);

  const stats = dashboard
    ? [
        [
          "total-users",
          "Total Users",
          dashboard.stats.totalUsers,
          LuUsers,
          "purple",
        ],
        [
          "verified-professionals",
          "Verified Professionals",
          dashboard.stats.verifiedProfessionals,
          LuBadgeCheck,
          "green",
        ],
        [
          "pending-approvals",
          "Pending Approvals",
          dashboard.stats.pendingApprovals,
          LuClipboardList,
          "orange",
        ],
        [
          "total-properties",
          "Total Properties",
          dashboard.stats.totalProperties,
          LuBuilding2,
          "blue",
        ],
        [
          "pending-properties",
          "Pending Properties",
          dashboard.stats.pendingProperties,
          LuClipboardList,
          "red",
        ],
      ]
    : [];

  const displayStats = stats.map(([id, title, value, icon, iconClass]) => {
    if (id === "pending-approvals") {
      const pendingCount =
        requests.filter((r) => r.status === "PENDING").length +
        pendingProperties.length;

      return {
        id,
        title,
        value: String(pendingCount),
        icon,
        iconClass,
      };
    }

    return {
      id,
      title,
      value,
      icon,
      iconClass,
    };
  });

  return (
    <Layout title="Admin Dashboard" variant="admin">
      <main className="admin-dashboard">
        {error && (
          <div className="admin-dashboard-empty" role="alert">
            {error}
          </div>
        )}
        {!dashboard && !error && (
          <div className="admin-dashboard-loading">Loading dashboard data…</div>
        )}

        {dashboard && (
          <>
            {/* ===================================================
            STATISTICS
        ==================================================== */}
            <section
              className="admin-stats-grid"
              aria-label="Platform statistics"
            >
              {displayStats.map(({ id, title, value, icon, iconClass }) => (
                <AdminStatCard
                  key={id}
                  title={title}
                  value={Number(value).toLocaleString()}
                  icon={icon}
                  iconClass={iconClass}
                />
              ))}
            </section>

            {/* ===================================================
            MAIN DASHBOARD GRID
        ==================================================== */}
            <section className="admin-dashboard-grid">
              {/* Platform activity */}
              <PlatformActivityChart activity={dashboard.activity} />

              {/* Verification summary */}
              <VerificationSummary data={dashboard.verification} />
            </section>

            {/* ===================================================
            ACTIVITY + PROFESSIONAL DISTRIBUTION
        ==================================================== */}
            <section className="admin-dashboard-grid">
              {/* Recent activity */}
              <RecentActivity activities={dashboard.recentActivity} />

              {/* Professional distribution */}
              <ProfessionalDistribution
                professionals={dashboard.professionals}
              />
            </section>

            {/* ===================================================
            PROPERTY APPROVALS + SUPPORT
        ==================================================== */}
            <section className="admin-dashboard-grid">
              {/* Functional Verification & Property Reviews Tabs */}
              <article className="admin-dashboard-card">
                <div className="admin-tabs">
                  <button
                    className={`admin-tab-btn ${tab === "verifications" ? "active" : ""}`}
                    onClick={() => setTab("verifications")}
                  >
                    Verifications
                  </button>
                  <button
                    className={`admin-tab-btn ${tab === "properties" ? "active" : ""}`}
                    onClick={() => setTab("properties")}
                  >
                    Property Reviews ({pendingProperties.length})
                  </button>
                </div>

                {error && (
                  <div className="demo-data-notice" role="alert">
                    {error}
                  </div>
                )}

                {tab === "verifications" && (
                  <div>
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
                      <button
                        type="button"
                        className="admin-apply-btn"
                        onClick={loadRequests}
                      >
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
                            <tr>
                              <td
                                colSpan="6"
                                style={{ textAlign: "center", padding: "20px" }}
                              >
                                Loading requests...
                              </td>
                            </tr>
                          )}
                          {!loading && requests.length === 0 && (
                            <tr>
                              <td
                                colSpan="6"
                                style={{ textAlign: "center", padding: "20px" }}
                              >
                                No verification requests found.
                              </td>
                            </tr>
                          )}
                          {!loading &&
                            requests.map((request) => (
                              <tr key={request.requestId}>
                                <td>
                                  <strong>{request.userName}</strong>
                                  <br />
                                  <span>{request.email}</span>
                                </td>
                                <td>
                                  {roleLabels[request.requestedRole] ||
                                    request.requestedRole}
                                </td>
                                <td>{request.companyName}</td>
                                <td>
                                  {request.createdAt
                                    ? new Date(
                                        request.createdAt,
                                      ).toLocaleDateString()
                                    : "—"}
                                </td>
                                <td>
                                  <span
                                    className={`risk-badge ${request.status.toLowerCase()}`}
                                  >
                                    {request.status}
                                  </span>
                                </td>
                                <td>
                                  {request.status === "PENDING" ? (
                                    <div className="admin-request-actions">
                                      <button
                                        type="button"
                                        className="admin-action-btn approve"
                                        disabled={
                                          actionId === request.requestId
                                        }
                                        onClick={() =>
                                          updateRequest(
                                            request.requestId,
                                            "approve",
                                          )
                                        }
                                      >
                                        <LuBadgeCheck size={16} /> Approve
                                      </button>
                                      <button
                                        type="button"
                                        className="admin-action-btn reject"
                                        disabled={
                                          actionId === request.requestId
                                        }
                                        onClick={() =>
                                          updateRequest(
                                            request.requestId,
                                            "reject",
                                          )
                                        }
                                      >
                                        <LuCircleX size={16} /> Reject
                                      </button>
                                    </div>
                                  ) : (
                                    "—"
                                  )}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {tab === "properties" && (
                  <div>
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
                            <tr>
                              <td
                                colSpan="5"
                                style={{ textAlign: "center", padding: "20px" }}
                              >
                                Loading properties...
                              </td>
                            </tr>
                          )}
                          {!propertiesLoading &&
                            pendingProperties.length === 0 && (
                              <tr>
                                <td
                                  colSpan="5"
                                  style={{
                                    textAlign: "center",
                                    padding: "20px",
                                  }}
                                >
                                  No properties pending review.
                                </td>
                              </tr>
                            )}
                          {!propertiesLoading &&
                            pendingProperties.map((p) => (
                              <tr key={p.propertyId}>
                                <td>
                                  <strong>{p.propertyCode}</strong>
                                  <br />
                                  <span>{p.propertyType || "—"}</span>
                                </td>
                                <td>{p.address}</td>
                                <td>{p.ownerName || "—"}</td>
                                <td>
                                  <span className="risk-badge pending">
                                    Under Review
                                  </span>
                                </td>
                                <td>
                                  <div className="admin-request-actions">
                                    <button
                                      type="button"
                                      className="admin-action-btn approve"
                                      disabled={actionId === p.propertyId}
                                      onClick={() =>
                                        handleApproveProperty(p.propertyId)
                                      }
                                    >
                                      <LuBadgeCheck size={16} /> Approve
                                    </button>
                                    <button
                                      type="button"
                                      className="admin-action-btn reject"
                                      disabled={actionId === p.propertyId}
                                      onClick={() =>
                                        handleRejectProperty(p.propertyId)
                                      }
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
                  </div>
                )}
              </article>

              {/* Support overview */}
              <SupportOverview data={dashboard.support} />
            </section>

            {/* ===================================================
            SYSTEM METRICS
        ==================================================== */}
            <section
              className="admin-dashboard-card"
              style={{
                marginBottom: "20px",
              }}
            >
              <div className="admin-dashboard-card-header">
                <div>
                  <h2 className="admin-dashboard-card-title">
                    System Overview
                  </h2>

                  <p className="admin-dashboard-card-subtitle">
                    Current platform infrastructure and security status
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    color: "#16A34A",
                    fontSize: "11px",
                    fontWeight: 600,
                  }}
                >
                  <LuShieldCheck size={15} />
                  Live system metrics
                </div>
              </div>

              <SystemMetrics />
            </section>
          </>
        )}
      </main>
    </Layout>
  );
}

export default AdminDashboard;
