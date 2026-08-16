import { useEffect, useMemo, useState } from "react";
import { FiCheck, FiRefreshCw, FiSearch, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import { api } from "../../services/api";
import "./AdminRoleRequests.css";

const statuses = ["", "PENDING", "ACTIVE", "REJECTED"];
const roles = ["", "AGENT", "LEGAL_REVIEWER", "BANK"];
const label = (value) => value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (character) => character.toUpperCase());
const formatDate = (value) => value ? new Date(value).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : "—";

function AdminRoleRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [status, setStatus] = useState("PENDING");
  const [role, setRole] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (!api.isAuthenticated() || api.getCurrentUser()?.role !== "ADMIN") navigate("/dashboard", { replace: true }); }, [navigate]);
  const loadRequests = async () => {
    setLoading(true); setError("");
    try { const data = await api.getAdminRoleRequests({ status, requestedRole: role }); setRequests(Array.isArray(data) ? data : []); }
    catch (loadError) { setError(loadError.message || "Unable to load role requests."); }
    finally { setLoading(false); }
  };
  useEffect(() => { loadRequests(); }, [status, role]);
  const visibleRequests = useMemo(() => requests.filter((request) => [request.userName, request.email, request.companyName, request.requestedRole].filter(Boolean).join(" ").toLowerCase().includes(search.toLowerCase())), [requests, search]);
  const decide = async (decision) => {
    if (!selected) return;
    setSaving(true); setError("");
    try {
      const update = decision === "approve" ? api.approveAdminRoleRequest : api.rejectAdminRoleRequest;
      const updated = await update(selected.requestId);
      setSelected(updated); await loadRequests();
    } catch (saveError) { setError(saveError.message || "Unable to update role request."); }
    finally { setSaving(false); }
  };

  return <Layout title="Role Requests" variant="admin"><main className="role-requests-page">
    <header className="role-requests-header"><div><h1>Role Requests</h1><p>Review professional verification requests from agents, legal reviewers, and banks.</p></div><button type="button" onClick={loadRequests} disabled={loading}><FiRefreshCw /> Refresh</button></header>
    <section className="role-filters"><label><FiSearch /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search applicant or organisation" /></label><select value={status} onChange={(event) => setStatus(event.target.value)}>{statuses.map((item) => <option key={item || "all"} value={item}>{item ? label(item) : "All statuses"}</option>)}</select><select value={role} onChange={(event) => setRole(event.target.value)}>{roles.map((item) => <option key={item || "all-roles"} value={item}>{item ? label(item) : "All requested roles"}</option>)}</select></section>
    {error && <p className="role-error" role="alert">{error}</p>}
    <section className="role-request-card">{loading ? <p className="role-empty">Loading role requests…</p> : visibleRequests.length === 0 ? <p className="role-empty">No role requests found.</p> : <div className="role-table-wrap"><table><thead><tr><th>Applicant</th><th>Requested role</th><th>Organisation</th><th>License</th><th>Submitted</th><th>Status</th><th /></tr></thead><tbody>{visibleRequests.map((request) => <tr key={request.requestId}><td><strong>{request.userName}</strong><small>{request.email}</small></td><td>{label(request.requestedRole)}</td><td><strong>{request.companyName}</strong><small>{request.companyEmail}</small></td><td>{request.licenseNumber}</td><td>{formatDate(request.createdAt)}</td><td><span className={`role-status ${request.status.toLowerCase()}`}>{label(request.status)}</span></td><td><button className="role-view" type="button" onClick={() => setSelected(request)}>Review</button></td></tr>)}</tbody></table></div>}</section>
  </main>{selected && <RequestDialog request={selected} saving={saving} onClose={() => setSelected(null)} onDecide={decide} />}</Layout>;
}

function RequestDialog({ request, saving, onClose, onDecide }) { const pending = request.status === "PENDING"; return <div className="role-dialog-layer"><button className="role-dialog-backdrop" type="button" onClick={onClose} aria-label="Close request details" /><section className="role-dialog" role="dialog" aria-modal="true" aria-labelledby="role-request-title"><header><div><span>Request #{request.requestId}</span><h2 id="role-request-title">{request.userName}</h2><p>{label(request.requestedRole)} verification</p></div><button type="button" onClick={onClose} aria-label="Close"><FiX /></button></header><dl><div><dt>Email</dt><dd>{request.email}</dd></div><div><dt>Company</dt><dd>{request.companyName}</dd></div><div><dt>Company email</dt><dd>{request.companyEmail}</dd></div><div><dt>License number</dt><dd>{request.licenseNumber}</dd></div><div><dt>Experience</dt><dd>{request.yearsOfExperience} years</dd></div><div><dt>Document</dt><dd>{request.documentName || "Not provided"}</dd></div><div><dt>Submitted</dt><dd>{formatDate(request.createdAt)}</dd></div><div><dt>Status</dt><dd><span className={`role-status ${request.status.toLowerCase()}`}>{label(request.status)}</span></dd></div></dl>{request.remarks && <p className="role-remarks">{request.remarks}</p>}{pending && <footer><button className="reject-request" type="button" disabled={saving} onClick={() => onDecide("reject")}>Reject</button><button className="approve-request" type="button" disabled={saving} onClick={() => onDecide("approve")}><FiCheck /> {saving ? "Saving…" : "Approve request"}</button></footer>}</section></div>; }
export default AdminRoleRequests;
