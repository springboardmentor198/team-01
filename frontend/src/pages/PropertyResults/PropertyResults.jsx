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
  LuWallet,
  LuLayers,
  LuMap,
  LuCircleCheck,
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

  // ---- Additional summary stats (distinct from the top summary-grid) ----
  const prices = enriched.map((p) => p.estimatedPrice);
  const avgPrice = prices.length
    ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
    : 0;
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;

  const typeBreakdown = enriched.reduce((acc, p) => {
    const t = p.propertyType || "Residential";
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});
  const topType = Object.entries(typeBreakdown).sort((a, b) => b[1] - a[1])[0];

  const cityBreakdown = enriched.reduce((acc, p) => {
    const c = p.city || "Unknown";
    acc[c] = (acc[c] || 0) + 1;
    return acc;
  }, {});
  const citiesCovered = Object.keys(cityBreakdown).length;

  const verificationRate = totalResults
    ? Math.round((verifiedCount / totalResults) * 100)
    : 0;

  const formatINR = (n) => `₹${n.toLocaleString("en-IN")}`;

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
              <h3>No Properties Found</h3>
              <p>Try clearing some filters or searching for another address.</p>
            </div>
          )}
        </div>

        {/* ================= SEARCH SUMMARY (now distinct from top stats) ================= */}
        {totalResults > 0 && (
          <div className="results-summary">
            <h3>Search Summary</h3>
            <div className="summary-details">
              <div className="summary-item">
                <LuWallet className="summary-item-icon" />
                <span>Average Estimated Price</span>
                <strong>{formatINR(avgPrice)}</strong>
                <small>
                  {formatINR(minPrice)} - {formatINR(maxPrice)} range
                </small>
              </div>

              <div className="summary-item">
                <LuLayers className="summary-item-icon" />
                <span>Most Common Type</span>
                <strong>{topType ? topType[0] : "-"}</strong>
                <small>
                  {topType ? `${topType[1]} of ${totalResults} properties` : ""}
                </small>
              </div>

              <div className="summary-item">
                <LuMap className="summary-item-icon" />
                <span>Cities Covered</span>
                <strong>{citiesCovered}</strong>
                <small>{Object.keys(cityBreakdown).join(", ")}</small>
              </div>

              <div className="summary-item">
                <LuCircleCheck className="summary-item-icon" />
                <span>Verification Rate</span>
                <strong>{verificationRate}%</strong>
                <div className="verification-bar">
                  <div
                    className="verification-bar-fill"
                    style={{ width: `${verificationRate}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
