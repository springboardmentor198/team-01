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
  LuListChecks,
  LuBadgeCheck,
  LuClock3,
  LuShieldAlert,
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
        let data;
        if (query) {
          // Use backend ranked global search when a keyword is present
          const result = await api.searchProperties(query, { size: 50 });
          data = Array.isArray(result) ? result : result?.content || [];
        } else {
          data = await api.getProperties();
        }

        setProperties(data);
        const summaries = await Promise.all(
          data.map((p) => api.getRiskSummary(p.propertyId).catch(() => null)),
        );
        setRisks(
          Object.fromEntries(
            data.map((p, index) => [
              p.propertyId,
              summaries[index]?.overallRisk || "Unrated",
            ]),
          ),
        );
      } catch (err) {
        setError(err.message || "Failed to load properties");
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [navigate, query]);

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
          <button
            onClick={() => window.location.reload()}
            className="retry-btn"
          >
            Retry
          </button>
        </div>
      </Layout>
    );
  }

  // Filter properties client-side based on criteria
  const filtered = properties.filter((property) => {
    if (
      query &&
      !property.address.toLowerCase().includes(query.toLowerCase()) &&
      !property.propertyCode.toLowerCase().includes(query.toLowerCase())
    ) {
      return false;
    }
    if (type && property.propertyType.toLowerCase() !== type.toLowerCase()) {
      return false;
    }
    if (city && property.city.toLowerCase() !== city.toLowerCase()) {
      return false;
    }
    if (
      risk &&
      (risks[property.propertyId] || "").toLowerCase() !== risk.toLowerCase()
    ) {
      return false;
    }
    if (status && property.status.toLowerCase() !== status.toLowerCase()) {
      return false;
    }
    return true;
  });

  // Enrich once so price/type/city stats and the card list use the same values
  const enriched = filtered.map((property) => {
    const lotSqft = property.lotSizeSqft || 1500;
    return {
      ...property,
      riskLvl: risks[property.propertyId] || "Unrated",
      estimatedPrice: lotSqft * 5000,
    };
  });

  const totalResults = enriched.length;
  const verifiedCount = enriched.filter(
    (p) => p.status === "AVAILABLE" || p.status === "VERIFIED",
  ).length;
  const pendingCount = enriched.filter(
    (p) => p.status === "UNDER_REVIEW",
  ).length;
  const highRiskCount = enriched.filter(
    (p) => p.riskLvl === "High" || p.riskLvl === "Critical",
  ).length;

  const formatINR = (n) => `₹${n.toLocaleString("en-IN")}`;

  const summaryCards = [
    { label: "Total Results", value: totalResults, icon: LuListChecks, tone: "total" },
    { label: "Verified", value: verifiedCount, icon: LuBadgeCheck, tone: "verified" },
    { label: "Pending", value: pendingCount, icon: LuClock3, tone: "pending" },
    { label: "High Risk", value: highRiskCount, icon: LuShieldAlert, tone: "high-risk" },
  ];

  return (
    <Layout title="Search Results">
      <div className="results-page">
        <div className="results-header">
          <div className="results-header-content">
            <span className="results-header-icon" aria-hidden="true">
              <LuBuilding2 />
            </span>
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
          {summaryCards.map(({ label, value, icon: Icon, tone }) => (
            <div key={label} className={`summary-card ${tone}`}>
              <span className="summary-icon" aria-hidden="true"><Icon /></span>
              <div><h3>{value}</h3><p>{label}</p></div>
            </div>
          ))}
        </div>

        <div className="properties-grid">
          {enriched.map((property) => {
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

                  <span
                    className={`risk-badge ${property.riskLvl.toLowerCase()}`}
                  >
                    {property.riskLvl} Risk
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
                      <h4>{formatINR(property.estimatedPrice)}</h4>
                    </div>
                  </div>
                </div>

                <div className="property-footer">
                  <span
                    className={`status-badge ${
                      property.status
                        ? property.status.toLowerCase().replace(/\s/g, "-")
                        : "available"
                    }`}
                  >
                    {property.status === "AVAILABLE" ||
                    property.status === "VERIFIED"
                      ? "Available"
                      : property.status === "UNDER_REVIEW"
                        ? "Under Review"
                        : property.status || "Available"}
                  </span>

                  <button
                    className="view-btn"
                    onClick={() => navigate(`/property/${property.propertyId}`)}
                  >
                    <LuEye />
                    Detail View
                  </button>
                </div>
              </div>
            );
          })}

          {enriched.length === 0 && (
            <div
              className="no-results-card"
              style={{
                gridColumn: "1 / -1",
                textAlign: "center",
                padding: "40px",
                color: "#666",
              }}
            >
              <LuTriangleAlert
                size={48}
                style={{ marginBottom: "15px", color: "#F59E0B" }}
              />
              <h3>No matching properties found.</h3>
              <p>Try searching by:</p>
              <ul className="no-results-tips">
                <li>Property Code</li>
                <li>Address</li>
                <li>City</li>
                <li>Owner Name</li>
              </ul>
            </div>
          )}
        </div>

      </div>
    </Layout>
  );
}
