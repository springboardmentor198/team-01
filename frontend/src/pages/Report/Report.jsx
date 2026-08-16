import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import { LuChartNoAxesCombined, LuFileSearch, LuFileText, LuFolderOpen, LuHouse, LuSearch, LuShieldCheck, LuShare2 } from "react-icons/lu";
import Layout from "../../components/Layout/Layout";
import { api } from "../../services/api";
import ReportPage from "./ReportPage";
import "./Report.css";

const FEATURES = [
  { icon: LuChartNoAxesCombined, tone: "blue", title: "Comprehensive Analysis", text: "Get detailed insights across legal, financial, technical and environmental areas." },
  { icon: LuShieldCheck, tone: "green", title: "Risk Assessment", text: "Identify potential risks and issues with advanced risk scoring." },
  { icon: LuFolderOpen, tone: "purple", title: "All Documents", text: "Access documents, permits and approvals in one place." },
  { icon: LuShare2, tone: "orange", title: "Export & Share", text: "Download professional reports or share securely with stakeholders." },
];

function ReportLanding() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.getProperties().then(setProperties).catch(() => setError(true)).finally(() => setLoading(false));
  }, []);

  const options = properties.map((property) => ({
    value: property.propertyId,
    label: `${property.propertyCode || "Property"} — ${[property.address, property.city].filter(Boolean).join(", ")}`,
  }));

  return <div className="reports-landing">
    <section className="reports-hero">
      <div className="reports-hero-copy"><span className="reports-kicker">DUE DILIGENCE CENTER</span><h2>Generate Due Diligence Report</h2><p>Select a property to generate a comprehensive due diligence report with risk assessment, documents, permits and more.</p></div>
      <div className="reports-illustration" aria-hidden="true"><div className="illustration-house"><LuHouse /></div><div className="illustration-report"><LuFileText /><span /><span /><span /></div><div className="illustration-chart"><LuChartNoAxesCombined /></div><div className="illustration-search"><LuSearch /></div></div>
    </section>
    <section className="property-select-card">
      <div className="select-icon"><LuFileSearch /></div><h2>No property selected</h2><p>Select a property to preview its due diligence report.</p>
      {loading ? <div className="report-select-skeleton" /> : options.length ? <div className="report-selector"><label htmlFor="report-property">Property</label><Select inputId="report-property" placeholder="Select a property" menuPlacement="bottom" menuPosition="fixed" styles={{ control: (base, state) => ({ ...base, minHeight: 50, borderRadius: 12, borderColor: state.isFocused ? "#2563EB" : "#d6dce8", boxShadow: state.isFocused ? "0 0 0 4px rgba(37,99,235,.12)" : "none", "&:hover": { borderColor: "#2563EB" } }), menu: (base) => ({ ...base, zIndex: 9999 }) }} options={options} onChange={(selected) => selected && navigate(`/report/${selected.value}`)} /></div> : <p className="report-muted">{error ? "Unable to load properties." : "No properties are available yet."}</p>}
      <button className="go-properties-btn" onClick={() => navigate("/properties")}>Go to Properties</button>
    </section>
    <section className="report-features">{FEATURES.map((feature) => { const Icon = feature.icon; return <article className="report-feature" key={feature.title}><span className={`feature-icon ${feature.tone}`}><Icon /></span><div><h3>{feature.title}</h3><p>{feature.text}</p></div></article>; })}</section>
  </div>;
}

export default function Report() {
  const { propertyId } = useParams();
  if (!propertyId) return <Layout title="Reports"><ReportLanding /></Layout>;
  return <Layout title="Due Diligence Report"><ReportPage propertyId={propertyId} /></Layout>;
}
