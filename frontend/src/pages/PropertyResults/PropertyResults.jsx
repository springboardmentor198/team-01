import { useState, useEffect } from "react";
import Layout from "../../components/Layout/Layout";
import "./PropertyResults.css";
import { useNavigate, useLocation } from "react-router-dom";
import { api, getPropertyOwnerName } from "../../services/api";

import {
  LuMapPin,
  LuBuilding2,
  LuShieldCheck,
  LuTriangleAlert,
  LuEye,
  LuSearch,
} from "react-icons/lu";

export default function PropertyResults() {
  const navigate = useNavigate();
  const location = useLocation();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [risks, setRisks] = useState({});

  // Parse filters from query parameters
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get("query") || "";
  const type = searchParams.get("type") || "";
  const city = searchParams.get("city") || "";
  const risk = searchParams.get("risk") || "";
  const status = searchParams.get("status") || "";

  useEffect(() => {
    if (!api.isAuthenticated()) {
      navigate("/login");
      return;
    }

    const fetchProperties = async () => {
      try {
        const data = await api.getProperties();
        setProperties(data);
        const summaries = await Promise.all(data.map((p) => api.getRiskSummary(p.propertyId).catch(() => null)));
        setRisks(Object.fromEntries(data.map((p, index) => [p.propertyId, summaries[index]?.overallRisk || "Unrated"])));
      } catch (err) {
        setError(err.message || "Failed to load properties");
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [navigate]);

  if (loading) {
    return (
      <Layout title="Search Results">
        <div className="loading-container">
          <p>Fetching properties from database...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Search Results">
        <div className="error-container">
          <p className="error-message">Error: {error}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            Retry
          </button>
        </div>
      </Layout>
    );
  }

  // Filter properties client-side based on criteria
  const filtered = properties.filter((property) => {
    if (query && !property.address.toLowerCase().includes(query.toLowerCase()) && !property.propertyCode.toLowerCase().includes(query.toLowerCase())) {
      return false;
    }
    if (type && property.propertyType.toLowerCase() !== type.toLowerCase()) {
      return false;
    }
    if (city && property.city.toLowerCase() !== city.toLowerCase()) {
      return false;
    }
    if (risk && (risks[property.propertyId] || "").toLowerCase() !== risk.toLowerCase()) {
      return false;
    }
    if (status && property.status.toLowerCase() !== status.toLowerCase()) {
      return false;
    }
    return true;
  });

  const totalResults = filtered.length;
  const verifiedCount = filtered.filter((p) => p.status === "AVAILABLE" || p.status === "VERIFIED").length;
  const pendingCount = filtered.filter((p) => p.status === "UNDER_REVIEW").length;
  const highRiskCount = filtered.filter((p) => {
    const r = risks[p.propertyId];
    return r === "High" || r === "Critical";
  }).length;

  return (
    <Layout title="Search Results">
      <div className="results-page">
        <div className="results-header">
          <div>
            <h2>Property Search Results</h2>
            <p>
              Showing <strong>{totalResults}</strong> matching properties{" "}
              {query && (
                <>
                  for <strong>"{query}"</strong>
                </>
              )}
            </p>
          </div>

          <button
            className="new-search-btn"
            onClick={() => navigate("/property-search")}
          >
            <LuSearch />
            New Search
          </button>
        </div>

        <div className="summary-grid">
          <div className="summary-card">
            <h3>{totalResults}</h3>
            <p>Total Results</p>
          </div>

          <div className="summary-card">
            <h3>{verifiedCount}</h3>
            <p>Verified</p>
          </div>

          <div className="summary-card">
            <h3>{pendingCount}</h3>
            <p>Pending</p>
          </div>

          <div className="summary-card">
            <h3>{highRiskCount}</h3>
            <p>High Risk</p>
          </div>
        </div>

        <div className="properties-grid">
          {filtered.map((property) => {
            const riskLvl = risks[property.propertyId] || "Unrated";
            const lotSqft = property.lotSizeSqft || 1500;
            const estimatedPrice = lotSqft * 5000;

            return (
              <div key={property.propertyId} className="property-card">
                <div className="property-top">
                  <div>
                    <h3>{property.propertyCode || "Property Entry"}</h3>
                    <p>
                      <LuMapPin />
                      {property.address}, {property.city}
                    </p>
                  </div>

                  <span className={`risk-badge ${riskLvl.toLowerCase()}`}>
                    {riskLvl} Risk
                  </span>
                </div>

                <div className="property-info">
                  <div className="info-box">
                    <LuBuilding2 />
                    <div>
                      <span>Property Type</span>
                      <h4>{property.propertyType || "Residential"}</h4>
                    </div>
                  </div>

                  <div className="info-box">
                    <LuShieldCheck />
                    <div>
                      <span>Owner</span>
                      <h4>{getPropertyOwnerName(property)}</h4>
                    </div>
                  </div>

                  <div className="info-box">
                    <LuTriangleAlert />
                    <div>
                      <span>Estimated Price</span>
                      <h4>
                        ₹
                        {estimatedPrice.toLocaleString("en-IN")}
                      </h4>
                    </div>
                  </div>
                </div>

                <div className="property-footer">
                  <span
                    className={`status-badge ${property.status
                      ? property.status.toLowerCase().replace(/\s/g, "-")
                      : "available"}`}
                  >
                    {property.status === "AVAILABLE" || property.status === "VERIFIED" ? "Available" : property.status === "UNDER_REVIEW" ? "Under Review" : property.status || "Available"}
                  </span>

                  <button
                    className="view-btn"
                    onClick={() => navigate(`/property/${property.propertyId}`)}
                  >
                    <LuEye />
                    View Details
                  </button>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="no-results-card" style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px", color: "#666" }}>
              <LuTriangleAlert size={48} style={{ marginBottom: "15px", color: "#F59E0B" }} />
              <h3>No Properties Found</h3>
              <p>Try clearing some filters or searching for another address.</p>
            </div>
          )}
        </div>

        {/* ================= SEARCH SUMMARY ================= */}
        <div className="results-summary">
          <h3>Search Summary</h3>
          <div className="summary-details">
            <div className="summary-item">
              <span>Total Properties</span>
              <strong>{totalResults}</strong>
            </div>

            <div className="summary-item">
              <span>Verified</span>
              <strong>{verifiedCount}</strong>
            </div>

            <div className="summary-item">
              <span>Pending</span>
              <strong>{pendingCount}</strong>
            </div>

            <div className="summary-item">
              <span>High Risk</span>
              <strong>{highRiskCount}</strong>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
