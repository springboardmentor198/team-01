import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LuDownload, LuEye, LuFileText, LuPrinter, LuRefreshCw } from "react-icons/lu";
import Layout from "../../components/Layout/Layout";
import { api } from "../../services/api";
import "./Report.css";

const riskClass = (value) => (value || "unknown").toLowerCase();
const formatDate = (value) => value ? new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
function Badge({ children }) { return <span className={`report-badge ${riskClass(children)}`}>{children || "—"}</span>; }
function Skeleton() { return <div className="report-skeleton"><div /><div /><div /></div>; }

export default function Report() {
  const { propertyId } = useParams(); const navigate = useNavigate();
  const [data, setData] = useState(null); const [loading, setLoading] = useState(Boolean(propertyId)); const [error, setError] = useState(false); const [notFound, setNotFound] = useState(false);
  const [properties, setProperties] = useState([]); const [propertiesLoading, setPropertiesLoading] = useState(!propertyId);
  const load = async () => {
    if (!propertyId) return;
    setLoading(true); setError(false); setNotFound(false);
    try {
      const [property, risk, documents, permits] = await Promise.all([
        api.getPropertyById(propertyId), api.getRiskSummary(propertyId).catch(() => null), api.getDocuments(propertyId), api.getPermits(propertyId),
      ]);
      setData({ property, risk, documents, permits });
    } catch (err) { if (/not found/i.test(err.message || "")) setNotFound(true); else setError(true); } finally { setLoading(false); }
  };
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId]);
  useEffect(() => { if (!propertyId) api.getProperties().then(setProperties).catch(() => setError(true)).finally(() => setPropertiesLoading(false)); }, [propertyId]);
  if (!propertyId) return <Layout title="Reports"><div className="report-empty"><LuFileText /><h2>No property selected</h2><p>Select a property to preview its due diligence report.</p>{propertiesLoading ? <div className="report-select-skeleton" /> : properties.length ? <div className="report-selector"><label htmlFor="report-property">Property</label><select id="report-property" defaultValue="" onChange={(event) => event.target.value && navigate(`/report/${event.target.value}`)}><option value="" disabled>Select a property</option>{properties.map((property) => <option key={property.propertyId} value={property.propertyId}>{property.propertyCode || "Property"} — {[property.address, property.city].filter(Boolean).join(", ")}</option>)}</select></div> : <p className="report-muted">No properties are available yet.</p>}<button onClick={() => navigate("/properties")}>Go to Properties</button></div></Layout>;
  if (loading) return <Layout title="Due Diligence Report"><Skeleton /></Layout>;
  if (notFound) return <Layout title="Due Diligence Report"><div className="report-empty"><LuFileText /><h2>Report not found.</h2><p>The requested property could not be found.</p><button onClick={() => navigate("/properties")}>Go to Properties</button></div></Layout>;
  if (error) return <Layout title="Due Diligence Report"><div className="report-empty"><LuRefreshCw /><h2>Unable to load report.</h2><button onClick={load}>Retry</button></div></Layout>;
  const { property, risk, documents, permits } = data; const score = risk?.riskScore ?? 0; const recommendation = score <= 30 ? ["Safe to Purchase", "Available records indicate a lower due-diligence risk profile."] : score <= 70 ? ["Review Recommended", "Review the listed risks and outstanding records before proceeding."] : ["High Risk", "Additional legal verification recommended."];
  return <Layout title="Due Diligence Report"><div className="report-page">
    <header className="report-header"><div><p className="report-eyebrow">Due Diligence Report</p><h1>{property.propertyCode || "Property Report"}</h1><p>Generated {formatDate(new Date())} · <Badge>{property.status || "Draft"}</Badge></p></div><div className="report-actions"><button onClick={() => window.print()}><LuPrinter />Print</button></div></header>
    <section className="report-card property-report"><h2>Property Information</h2><div className="property-summary">{property.imageUrl ? <img src={property.imageUrl} alt={property.propertyCode} /> : <div className="property-image-placeholder"><LuFileText /></div>}<div className="report-fields">{[["Property Name",property.propertyCode],["Address",property.address],["City",property.city],["State",property.state],["Country",property.country],["Property Type",property.propertyType],["Owner",property.ownerName || property.owner?.name],["Status",property.status],["Area",property.lotSizeSqft ? `${property.lotSizeSqft} sq ft` : null],["Bedrooms",property.bedrooms],["Bathrooms",property.bathrooms],["Year Built",property.yearBuilt]].map(([label,value])=><div key={label}><span>{label}</span><strong>{value || "—"}</strong></div>)}</div></div></section>
    <section className="report-card"><h2>Risk Summary</h2>{risk ? <><div className="risk-score"><div><span>Risk Score</span><strong>{score}<small>/100</small></strong></div><div className="score-track"><i style={{ width: `${Math.min(Math.max(score,0),100)}%` }} /></div></div><div className="risk-grid">{[["Overall Risk",risk.overallRisk],["Flood Risk",risk.floodRisk],["Legal Risk",risk.legalRisk],["Environmental Risk",risk.environmentalRisk]].map(([label,value])=><div key={label}><span>{label}</span><Badge>{value}</Badge></div>)}</div><div className="remarks"><span>Remarks</span><p>{risk.remarks || "No remarks recorded."}</p></div></> : <p className="report-muted">No risk summary is available for this property.</p>}</section>
    <section className="report-card"><h2>Documents</h2>{documents.length ? <div className="report-table-wrap"><table><thead><tr><th>Document Name</th><th>Document Type</th><th>Uploaded At</th><th>Actions</th></tr></thead><tbody>{documents.map(doc=><tr key={doc.id}><td>{doc.documentName}</td><td>{doc.documentType}</td><td>{formatDate(doc.uploadedAt)}</td><td>{doc.fileUrl ? <><a href={doc.fileUrl} target="_blank" rel="noreferrer"><LuEye />View</a><a href={doc.fileUrl} download><LuDownload />Download</a></> : "—"}</td></tr>)}</tbody></table></div> : <p className="report-muted">No documents available.</p>}</section>
    <section className="report-card"><h2>Permits</h2>{permits.length ? <div className="report-table-wrap"><table><thead><tr><th>Permit</th><th>Authority</th><th>Issue Date</th><th>Expiry Date</th><th>Status</th><th>Remarks</th></tr></thead><tbody>{permits.map(permit=>{const expired=permit.expiryDate && new Date(permit.expiryDate) < new Date(); return <tr key={permit.id} className={expired ? "expired" : ""}><td>{permit.permitType}</td><td>{permit.issuingAuthority || "—"}</td><td>{formatDate(permit.issueDate)}</td><td>{formatDate(permit.expiryDate)}</td><td>{expired ? <span className="expired-label">Expired</span> : permit.status || "—"}</td><td>{permit.remarks || "—"}</td></tr>})}</tbody></table></div> : <p className="report-muted">No permits available.</p>}</section>
    <section className={`recommendation ${score > 70 ? "high" : score > 30 ? "medium" : "low"}`}><h2>{recommendation[0]}</h2><p>{recommendation[1]}</p></section>
  </div></Layout>;
}