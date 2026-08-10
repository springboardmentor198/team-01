import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LuShieldAlert } from "react-icons/lu";
import Layout from "../../components/Layout/Layout";
import { api } from "../../services/api";
import RiskOverview from "./components/RiskOverview";
import ComparableProperties from "./components/ComparableProperties";
import PropertyValuation from "./components/PropertyValuation";
import "./RiskDashboard.css";

export default function RiskDashboard() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]), [selectedId, setSelectedId] = useState("");
  const [risk, setRisk] = useState(null), [comparables, setComparables] = useState([]), [valuation, setValuation] = useState(null);
  const [loading, setLoading] = useState(true), [error, setError] = useState("");
  useEffect(() => { if (!api.isAuthenticated()) { navigate("/login"); return; } api.getProperties().then((items) => { const data = Array.isArray(items) ? items : []; setProperties(data); setSelectedId(data[0]?.propertyId ? String(data[0].propertyId) : ""); }).catch((err) => setError(err.message || "Unable to load properties.")).finally(() => setLoading(false)); }, [navigate]);
  useEffect(() => { if (!selectedId) return; setLoading(true); setError(""); Promise.all([api.getRiskAssessment(selectedId), api.getComparableProperties(selectedId), api.getPropertyValuation(selectedId)]).then(([assessment, comparison, value]) => { setRisk(assessment); setComparables(comparison.map((item) => ({ ...item, id: item.propertyId, name: item.propertyCode, area: item.areaSqft, price: item.estimatedPrice, risk: item.overallRisk, distanceKm: "N/A" }))); setValuation(value); }).catch((err) => setError(err.message || "Unable to load property analytics.")).finally(() => setLoading(false)); }, [selectedId]);
  const selectedProperty = useMemo(() => properties.find((p) => String(p.propertyId) === selectedId), [properties, selectedId]);
  if (!api.isAuthenticated()) return null;
  return <Layout title="Risk Dashboard"><div className="rd-page"><div className="rd-header rd-card"><h2><LuShieldAlert />Risk Dashboard</h2><p>Review persisted risk, comparable properties, and valuation data.</p></div><div className="rd-card rd-selector"><label htmlFor="rd-property-select">Property</label><select id="rd-property-select" value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>{properties.map((p) => <option key={p.propertyId} value={p.propertyId}>{p.propertyCode || p.address}{p.city ? `, ${p.city}` : ""}</option>)}</select></div>{!properties.length && !loading ? <div className="rd-card">No properties are available for analysis.</div> : <><RiskOverview risk={risk} loading={loading} error={error} />{!loading && !error && <div className="rd-grid"><ComparableProperties items={comparables} /><PropertyValuation valuation={valuation} property={selectedProperty} /></div>}</>}</div></Layout>;
}
