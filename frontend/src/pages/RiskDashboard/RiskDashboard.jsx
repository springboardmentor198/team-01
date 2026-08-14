import { useEffect, useState } from "react";
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

  const [properties, setProperties] = useState([]);
  const [propertiesLoading, setPropertiesLoading] = useState(true);
  const [propertiesError, setPropertiesError] = useState("");

  const [selectedId, setSelectedId] = useState("");

  const [risk, setRisk] = useState(null);
  const [riskLoading, setRiskLoading] = useState(false);
  const [riskError, setRiskError] = useState("");

  const [comparables, setComparables] = useState([]);
  const [comparablesLoading, setComparablesLoading] = useState(false);
  const [comparablesError, setComparablesError] = useState("");

  const [valuation, setValuation] = useState(null);
  const [valuationLoading, setValuationLoading] = useState(false);
  const [valuationError, setValuationError] = useState("");

  useEffect(() => {
    if (!api.isAuthenticated()) {
      navigate("/login");
      return;
    }

    let cancelled = false;

    async function loadProperties() {
      try {
        const data = await api.getProperties();
        if (cancelled) return;
        const list = Array.isArray(data) ? data : [];
        setProperties(list);
        if (list.length) setSelectedId(String(list[0].id));
      } catch (err) {
        if (!cancelled) setPropertiesError(err.message || "Failed to load properties");
      } finally {
        if (!cancelled) setPropertiesLoading(false);
      }
    }

    loadProperties();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  useEffect(() => {
    if (!selectedId) return;

    let cancelled = false;

    async function loadRisk() {
      setRiskLoading(true);
      setRiskError("");
      setRisk(null);

      try {
        const data = await api.getRiskSummary(selectedId);
        if (!cancelled) setRisk(data);
      } catch (err) {
        if (!cancelled) setRiskError(err.message || "Failed to load risk summary");
      } finally {
        if (!cancelled) setRiskLoading(false);
      }
    }

    loadRisk();

    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  useEffect(() => {
    if (!selectedId) return;

    let cancelled = false;

    async function loadComparables() {
      setComparablesLoading(true);
      setComparablesError("");
      setComparables([]);

      try {
        const data = await api.getComparableProperties(selectedId);
        if (!cancelled) setComparables(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) setComparablesError(err.message || "Failed to load comparable properties");
      } finally {
        if (!cancelled) setComparablesLoading(false);
      }
    }

    loadComparables();

    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  useEffect(() => {
    if (!selectedId) return;

    let cancelled = false;

    async function loadValuation() {
      setValuationLoading(true);
      setValuationError("");
      setValuation(null);

      try {
        const data = await api.getPropertyValuation(selectedId);
        if (!cancelled) setValuation(data);
      } catch (err) {
        if (!cancelled) setValuationError(err.message || "Failed to load property valuation");
      } finally {
        if (!cancelled) setValuationLoading(false);
      }
    }

    loadValuation();

    return () => {
      cancelled = true;
    };
  }, [selectedId]);
  return (
    <Layout title="Risk Dashboard">
      <div className="rd-page">
        <div className="rd-header rd-card">
          <h2>
            <LuShieldAlert />
            Risk Dashboard
          </h2>
          <p>Review risk score, comparable properties, and estimated valuation for any property.</p>
        </div>

        <div className="rd-card rd-selector">
          <label htmlFor="rd-property-select">Property</label>

          {propertiesLoading ? (
            <p className="rd-muted">Loading properties…</p>
          ) : propertiesError ? (
            <p className="rd-error">{propertiesError}</p>
          ) : properties.length === 0 ? (
            <p className="rd-muted">No properties available yet.</p>
          ) : (
            <select
              id="rd-property-select"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
            >
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.address ? `${p.address}, ${p.city}` : `Property #${p.id}`}
                </option>
              ))}
            </select>
          )}
        </div>

        {selectedId && (
          <>
            <RiskOverview risk={risk} loading={riskLoading} error={riskError} />

            <div className="rd-grid">
              <ComparableProperties
                items={comparables}
                loading={comparablesLoading}
                error={comparablesError}
              />
              <PropertyValuation
                valuation={valuation}
                loading={valuationLoading}
                error={valuationError}
              />
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}