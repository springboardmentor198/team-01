import { useCallback, useEffect, useState } from "react";
import { FiActivity, FiAlertCircle, FiClock, FiDatabase, FiRefreshCw, FiServer } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import { api } from "../../services/api";
import "./AdminSystemMonitoring.css";

const isNumeric = (value) => value !== null && value !== "" && value !== undefined && Number.isFinite(Number(value));
const formatNumber = (value, fallback = "—") => isNumeric(value) ? new Intl.NumberFormat().format(Number(value)) : fallback;
const formatPercent = (value) => isNumeric(value) ? `${Number(value).toFixed(1)}%` : "Not available";
const formatBytes = (value) => {
  if (!isNumeric(value)) return "Not available";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = Number(value); let unit = 0;
  while (size >= 1024 && unit < units.length - 1) { size /= 1024; unit += 1; }
  return `${size.toFixed(size >= 10 || unit === 0 ? 0 : 1)} ${units[unit]}`;
};
const isUp = (status) => String(status).toUpperCase() === "UP";

function AdminSystemMonitoring() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState(null);

  useEffect(() => { if (!api.isAuthenticated() || api.getCurrentUser()?.role !== "ADMIN") navigate("/dashboard", { replace: true }); }, [navigate]);
  const loadMonitoring = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [health, metrics, performance, logs, cache] = await Promise.all([
        api.getAdminSystemHealth(), api.getAdminSystemMetrics(), api.getAdminApiPerformance(), api.getAdminSystemLogs(), api.getAdminCacheMetrics(),
      ]);
      setData({ health, metrics, performance, logs: Array.isArray(logs) ? logs : [], cache });
      setUpdatedAt(new Date());
    } catch (loadError) { setError(loadError.message || "Unable to load system monitoring data."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { loadMonitoring(); }, [loadMonitoring]);

  if (loading && !data) return <Layout title="System Monitoring" variant="admin"><main className="system-monitoring"><LoadingState /></main></Layout>;
  if (error && !data) return <Layout title="System Monitoring" variant="admin"><main className="system-monitoring"><ErrorState message={error} onRetry={loadMonitoring} /></main></Layout>;

  const { health = {}, metrics = {}, performance = {}, logs = [], cache = {} } = data || {};
  const cpu = metrics.cpu || {}; const memory = metrics.memory || {}; const jvm = metrics.jvm || {};
  const summary = performance.summary || {}; const apis = Array.isArray(performance.apis) ? performance.apis : []; const slowApis = Array.isArray(performance.slowApis) ? performance.slowApis : [];
  const cacheItems = Array.isArray(cache.caches) ? cache.caches : [];

  return <Layout title="System Monitoring" variant="admin"><main className="system-monitoring">
    <header className="system-monitoring-header"><div><h1>System Monitoring</h1><p>Live application health, performance, logs, and cache status.</p>{updatedAt && <small>Last updated {updatedAt.toLocaleTimeString()}</small>}</div><button type="button" onClick={loadMonitoring} disabled={loading}><FiRefreshCw className={loading ? "is-spinning" : ""} /> {loading ? "Refreshing…" : "Refresh"}</button></header>
    {error && <p className="monitoring-warning" role="alert">{error} Showing the most recently loaded data.</p>}
    <section className="monitoring-status-grid"><StatusCard icon={FiActivity} title="Overall system" value={health.status || "UNKNOWN"} status={health.status} /><StatusCard icon={FiServer} title="Application" value={health.application || "UNKNOWN"} status={health.application} /><StatusCard icon={FiDatabase} title="Database" value={health.database || "UNKNOWN"} status={health.database} /><StatusCard icon={FiAlertCircle} title="Error rate" value={formatPercent(summary.errorRatePercentage)} status={Number(summary.errorRatePercentage) > 0 ? "DOWN" : "UP"} /></section>
    <section className="monitoring-grid"><Panel title="CPU usage" icon={FiActivity}><MetricBar label="System CPU" value={cpu.systemCpuUsagePercentage} /><MetricBar label="Application CPU" value={cpu.processCpuUsagePercentage} /></Panel><Panel title="Memory usage" icon={FiServer}><MetricBar label="JVM memory" value={memory.usedPercentage} /><div className="metric-split"><span>{formatBytes(memory.usedBytes)} used</span><span>{formatBytes(memory.maxBytes)} max</span></div></Panel><Panel title="JVM & threads" icon={FiClock}><div className="metric-list"><Metric label="Heap used" value={formatBytes(jvm.heapUsedBytes)} /><Metric label="Heap maximum" value={formatBytes(jvm.heapMaxBytes)} /><Metric label="Non-heap used" value={formatBytes(jvm.nonHeapUsedBytes)} /><Metric label="Active threads" value={formatNumber(jvm.activeThreads)} /><Metric label="Peak threads" value={formatNumber(jvm.peakThreads)} /></div></Panel></section>
    <section className="monitoring-summary"><Metric label="Total requests" value={formatNumber(summary.totalRequests, "0")} /><Metric label="Error requests" value={formatNumber(summary.errorRequests, "0")} /><Metric label="Slow API threshold" value={Number.isFinite(Number(summary.slowApiThresholdMs)) ? `${summary.slowApiThresholdMs} ms` : "Not available"} /></section>
    <section className="monitoring-panel"><PanelHeader title="API performance" subtitle="Endpoint response metrics collected by the application." icon={FiActivity} /><DataTable columns={["Endpoint", "Method", "Status", "Requests", "Average", "Total time"]} empty="No API request metrics are available yet.">{apis.map((item, index) => <tr key={`${item.method}-${item.uri}-${item.status}-${index}`}><td>{item.uri || "Unknown endpoint"}</td><td><code>{item.method || "—"}</code></td><td><span className={`http-status ${String(item.status || "").startsWith("4") || String(item.status || "").startsWith("5") ? "error" : ""}`}>{item.status || "—"}</span></td><td>{formatNumber(item.requestCount, "0")}</td><td>{Number.isFinite(Number(item.averageResponseTimeMs)) ? `${item.averageResponseTimeMs} ms` : "—"}</td><td>{Number.isFinite(Number(item.totalResponseTimeMs)) ? `${item.totalResponseTimeMs} ms` : "—"}</td></tr>)}</DataTable></section>
    <section className="monitoring-grid monitoring-bottom-grid"><section className="monitoring-panel"><PanelHeader title="Slow APIs" subtitle={`Average response time above ${summary.slowApiThresholdMs ?? "configured"} ms.`} icon={FiClock} /><DataTable columns={["Endpoint", "Method", "Average", "Requests"]} empty="No slow APIs detected.">{slowApis.map((item, index) => <tr key={`${item.method}-${item.uri}-${index}`}><td>{item.uri || "Unknown endpoint"}</td><td><code>{item.method || "—"}</code></td><td>{item.averageResponseTimeMs} ms</td><td>{formatNumber(item.requestCount, "0")}</td></tr>)}</DataTable></section><section className="monitoring-panel"><PanelHeader title="Cache metrics" subtitle={cache.status === "NOT_CONFIGURED" ? cache.message || "Caching is not configured." : "Application cache activity."} icon={FiDatabase} /><div className="cache-summary"><Metric label="Cache status" value={cache.status || "UNKNOWN"} /><Metric label="Hit rate" value={formatPercent(cache.hitRatePercentage)} /><Metric label="Hits / misses" value={`${formatNumber(cache.totalHits, "0")} / ${formatNumber(cache.totalMisses, "0")}`} /></div>{cache.status === "NOT_CONFIGURED" ? <EmptyState message="Cache metrics will appear here once a cache provider is configured." /> : <DataTable columns={["Cache", "Metric", "Value"]} empty="No cache meters are currently reporting data.">{cacheItems.map((item, index) => <tr key={`${item.cacheName}-${item.metric}-${index}`}><td>{item.cacheName || "Unnamed cache"}</td><td>{item.metric || "—"}</td><td>{item.value ?? item.count ?? "—"}</td></tr>)}</DataTable>}</section></section>
    <section className="monitoring-panel"><PanelHeader title="Application logs" subtitle="Latest 100 entries from the configured application log file." icon={FiServer} /><div className="application-logs">{logs.length ? logs.map((line, index) => <code key={`${index}-${line}`}>{line}</code>) : <EmptyState message="No application log entries are available." />}</div></section>
  </main></Layout>;
}

function StatusCard({ icon: Icon, title, value, status }) { return <article className="monitoring-status-card"><span className={`status-icon ${isUp(status) ? "up" : "down"}`}><Icon /></span><div><small>{title}</small><strong>{value}</strong></div><span className={`status-dot ${isUp(status) ? "up" : "down"}`} /></article>; }
function Panel({ title, icon: Icon, children }) { return <section className="monitoring-panel compact-panel"><PanelHeader title={title} icon={Icon} />{children}</section>; }
function PanelHeader({ title, subtitle, icon: Icon }) { return <header className="monitoring-panel-header"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>{Icon && <Icon />}</header>; }
function Metric({ label, value }) { return <div className="summary-metric"><small>{label}</small><strong>{value}</strong></div>; }
function MetricBar({ label, value }) { const valid = isNumeric(value); const percentage = valid ? Math.max(0, Math.min(100, Number(value))) : 0; return <div className="metric-bar"><div><span>{label}</span><strong>{valid ? formatPercent(value) : "Not available"}</strong></div><i><b style={{ width: `${percentage}%` }} /></i></div>; }
function DataTable({ columns, children, empty }) { const rows = Array.isArray(children) ? children : [children]; return <div className="monitoring-table-wrap">{rows.length ? <table><thead><tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{rows}</tbody></table> : <EmptyState message={empty} />}</div>; }
function EmptyState({ message }) { return <p className="monitoring-empty">{message}</p>; }
function LoadingState() { return <div className="monitoring-state"><FiActivity className="is-spinning" /><h1>Loading system monitoring</h1><p>Collecting live data from the application.</p></div>; }
function ErrorState({ message, onRetry }) { return <div className="monitoring-state error"><FiAlertCircle /><h1>Unable to load monitoring data</h1><p>{message}</p><button type="button" onClick={onRetry}>Try again</button></div>; }
export default AdminSystemMonitoring;
