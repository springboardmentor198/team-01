import { useEffect, useMemo, useState } from "react";
import { FiMessageSquare, FiRefreshCw, FiSearch, FiSend, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import { api } from "../../services/api";
import "./AdminSupportTickets.css";

const STATUS_OPTIONS = ["", "OPEN", "IN_PROGRESS", "WAITING_FOR_USER", "RESOLVED", "CLOSED"];
const PRIORITY_OPTIONS = ["", "LOW", "MEDIUM", "HIGH", "URGENT"];
const label = (value) => value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (character) => character.toUpperCase());
const displayDate = (value) => value ? new Date(value).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : "—";

function AdminSupportTickets() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [filters, setFilters] = useState({ search: "", status: "", priority: "" });
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reply, setReply] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!api.isAuthenticated() || api.getCurrentUser()?.role !== "ADMIN") navigate("/dashboard", { replace: true });
  }, [navigate]);

  const loadTickets = async () => {
    setLoading(true); setError("");
    try {
      const result = await api.getAdminSupportTickets(filters);
      setTickets(result.content || []);
    } catch (loadError) { setError(loadError.message || "Unable to load support tickets."); }
    finally { setLoading(false); }
  };

  useEffect(() => { const timer = setTimeout(loadTickets, 250); return () => clearTimeout(timer); }, [filters.search, filters.status, filters.priority]);

  const summary = useMemo(() => ({
    total: tickets.length,
    open: tickets.filter((ticket) => ["OPEN", "IN_PROGRESS", "WAITING_FOR_USER"].includes(ticket.status)).length,
    urgent: tickets.filter((ticket) => ticket.priority === "URGENT" || ticket.priority === "HIGH").length,
  }), [tickets]);

  const openTicket = async (ticketId) => {
    setError("");
    try { setSelectedTicket(await api.getAdminSupportTicket(ticketId)); }
    catch (loadError) { setError(loadError.message || "Unable to load ticket details."); }
  };
  const updateStatus = async (status) => {
    if (!selectedTicket) return;
    setSaving(true);
    try { const updated = await api.updateSupportTicketStatus(selectedTicket.ticketId, status); setSelectedTicket(updated); await loadTickets(); }
    catch (saveError) { setError(saveError.message || "Unable to update ticket status."); }
    finally { setSaving(false); }
  };
  const sendReply = async (event) => {
    event.preventDefault(); if (!reply.trim() || !selectedTicket) return;
    setSaving(true);
    try { const updated = await api.replyToSupportTicket(selectedTicket.ticketId, reply.trim()); setSelectedTicket(updated); setReply(""); }
    catch (saveError) { setError(saveError.message || "Unable to send reply."); }
    finally { setSaving(false); }
  };

  return <Layout title="Support Tickets" variant="admin"><main className="admin-tickets">
    <header className="admin-tickets-header"><div><h1>Support Tickets</h1><p>Review customer requests and keep conversations moving.</p></div><button className="tickets-refresh" type="button" onClick={loadTickets} disabled={loading}><FiRefreshCw /> Refresh</button></header>
    <section className="ticket-summary" aria-label="Ticket summary"><Summary title="Total tickets" value={summary.total} /><Summary title="Active requests" value={summary.open} tone="blue" /><Summary title="High priority" value={summary.urgent} tone="red" /></section>
    <section className="tickets-panel"><div className="ticket-filters"><label><FiSearch /><input value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} placeholder="Search request, name or email" /></label><select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}>{STATUS_OPTIONS.map((value) => <option value={value} key={value || "all-status"}>{value ? label(value) : "All statuses"}</option>)}</select><select value={filters.priority} onChange={(event) => setFilters((current) => ({ ...current, priority: event.target.value }))}>{PRIORITY_OPTIONS.map((value) => <option value={value} key={value || "all-priority"}>{value ? `${label(value)} priority` : "All priorities"}</option>)}</select></div>
      {error && <p className="tickets-error" role="alert">{error}</p>}
      {loading ? <p className="tickets-empty">Loading support tickets…</p> : tickets.length === 0 ? <p className="tickets-empty">No tickets match these filters.</p> : <div className="ticket-table-wrap"><table><thead><tr><th>Request</th><th>Customer</th><th>Priority</th><th>Status</th><th>Submitted</th><th /></tr></thead><tbody>{tickets.map((ticket) => <tr key={ticket.ticketId}><td><strong>{ticket.subject}</strong><small>#{ticket.ticketId}</small></td><td><span>{ticket.userName || "Unknown user"}</span><small>{ticket.userEmail}</small></td><td><Badge value={ticket.priority} kind="priority" /></td><td><Badge value={ticket.status} kind="status" /></td><td>{displayDate(ticket.createdAt)}</td><td><button className="ticket-view" type="button" onClick={() => openTicket(ticket.ticketId)}>View</button></td></tr>)}</tbody></table></div>}</section>
  </main>{selectedTicket && <TicketDialog ticket={selectedTicket} reply={reply} saving={saving} onClose={() => setSelectedTicket(null)} onReplyChange={setReply} onReply={sendReply} onStatus={updateStatus} />}</Layout>;
}

function Summary({ title, value, tone = "slate" }) { return <article className={`ticket-summary-card ${tone}`}><span>{title}</span><strong>{value}</strong></article>; }
function Badge({ value, kind }) { return <span className={`ticket-badge ${kind} ${(value || "").toLowerCase()}`}>{label(value || "OPEN")}</span>; }
function TicketDialog({ ticket, reply, saving, onClose, onReplyChange, onReply, onStatus }) { return <div className="ticket-dialog-layer" role="presentation"><button className="ticket-dialog-backdrop" type="button" aria-label="Close ticket details" onClick={onClose} /><section className="ticket-dialog" role="dialog" aria-modal="true" aria-labelledby="ticket-dialog-title"><header><div><span>Ticket #{ticket.ticketId}</span><h2 id="ticket-dialog-title">{ticket.subject}</h2></div><button type="button" aria-label="Close" onClick={onClose}><FiX /></button></header><div className="ticket-dialog-meta"><div><small>Customer</small><strong>{ticket.userName || "Unknown user"}</strong><span>{ticket.userEmail}</span></div><div><small>Submitted</small><strong>{displayDate(ticket.createdAt)}</strong></div><label><small>Status</small><select value={ticket.status} disabled={saving} onChange={(event) => onStatus(event.target.value)}>{STATUS_OPTIONS.slice(1).map((status) => <option value={status} key={status}>{label(status)}</option>)}</select></label></div><div className="ticket-description"><small>Request details</small><p>{ticket.description}</p></div><div className="ticket-conversation"><h3>Conversation</h3>{ticket.messages?.length ? ticket.messages.map((message) => <article key={message.messageId}><strong>{message.senderName || message.senderEmail}</strong><time>{displayDate(message.createdAt)}</time><p>{message.message}</p></article>) : <p className="no-messages">No replies yet.</p>}</div><form className="ticket-reply" onSubmit={onReply}><textarea value={reply} maxLength="2000" onChange={(event) => onReplyChange(event.target.value)} placeholder="Write a reply to the customer…" /><button type="submit" disabled={saving || !reply.trim()}><FiSend /> {saving ? "Sending…" : "Send reply"}</button></form></section></div>; }
export default AdminSupportTickets;
