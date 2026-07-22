import { useState, useEffect } from "react";
import Layout from "../../components/Layout/Layout";
import "./PropertyDetails.css";
import { useNavigate, useParams } from "react-router-dom";
import { api, getPropertyRisk } from "../../services/api";

import {
  LuArrowLeft,
  LuMapPin,
  LuBuilding2,
  LuUser,
  LuShieldCheck,
  LuFileText,
  LuDownload,
  LuCalendarDays,
} from "react-icons/lu";

const getPropertyRiskDetails = (risk) => {
  const lowercaseRisk = risk.toLowerCase();
  if (lowercaseRisk === "low") {
    return {
      class: "low",
      summary: "The property documents were verified successfully. No ownership disputes or legal issues were found.",
      recommendation: "Based on the available records and verification results, this property appears to have a Low Risk profile and can be considered for further due diligence or purchase."
    };
  } else if (lowercaseRisk === "medium") {
    return {
      class: "medium",
      summary: "Minor tax updates or zoning checks are outstanding. Title deeds appear clear but tax verification is recommended.",
      recommendation: "Based on the available records and verification results, this property appears to have a Medium Risk profile. Proceed with caution and verify outstanding tax filings."
    };
  } else {
    return {
      class: lowercaseRisk === "critical" ? "critical" : "high",
      summary: "WARNING: High legal vulnerability. Ongoing title litigation, zoning non-compliance, or buffer zone restrictions found.",
      recommendation: "CAUTION: This property has a High/Critical Risk profile. Significant legal or compliance vulnerabilities exist. Immediate expert consultation is required."
    };
  }
};

export default function PropertyDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [property, setProperty] = useState(null);
  const [ownership, setOwnership] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

 useEffect(() => {
  if (!api.isAuthenticated()) {
    navigate("/login");
    return;
  }

  const fetchPropertyDetail = async () => {
    try {
      // Fetch Property Details
      const propertyData = await api.getPropertyById(id);
      setProperty(propertyData);

      // Fetch Ownership Details
      const ownershipResponse = await fetch(
        `http://localhost:8081/api/ownership/${id}`
      );

      if (ownershipResponse.ok) {
        const ownershipData = await ownershipResponse.json();

        if (ownershipData.length > 0) {
          setOwnership(ownershipData[0]);
        }
      }
    } catch (err) {
      setError(err.message || "Failed to load property details");
    } finally {
      setLoading(false);
    }
  };

  fetchPropertyDetail();
}, [id, navigate]);


  if (loading) {
    return (
      <Layout title="Property Details">
        <div className="loading-container">
          <p>Loading property details...</p>
        </div>
      </Layout>
    );
  }

  if (error || !property) {
    return (
      <Layout title="Property Details">
        <div className="error-container">
          <p className="error-message">Error: {error || "Property not found"}</p>
          <button onClick={() => navigate("/property-search")} className="retry-btn">
            Back to Search
          </button>
        </div>
      </Layout>
    );
  }

  const riskLvl = getPropertyRisk(property.propertyId);
  const riskDetails = getPropertyRiskDetails(riskLvl);
  const builtYear = property.yearBuilt || "2019";
  const reportId = `REP-2026-0${property.propertyId}84`;
  const searchDate = "16 July 2026";

  const documents = [
    "Sale Deed",
    "Property Tax Receipt",
    "Occupancy Certificate",
    "Building Approval Plan",
    "Encumbrance Certificate",
  ];

  return (
    <Layout title="Property Details">
      <div className="details-page">
        <div className="details-header">
          <button
            className="back-results-btn"
            onClick={() => navigate(-1)}
          >
            <LuArrowLeft />
            Back
          </button>

          <button className="download-btn" onClick={() => alert("Report downloaded successfully!")}>
            <LuDownload />
            Download Report
          </button>
        </div>

        <div className="overview-card">
          <div>
            <h2>{property.propertyCode || "Property Entry"}</h2>
            <p>
              <LuMapPin />
              {property.address}, {property.city}
              {property.country && `, ${property.country}`}
            </p>
          </div>

          <span className={`verified-badge ${property.status ? property.status.toLowerCase() : "available"}`}>
            {property.status === "AVAILABLE" || property.status === "VERIFIED" ? "Available" : property.status === "UNDER_REVIEW" ? "Under Review" : property.status || "Available"}
          </span>
        </div>

        <ditev className="info-grid">
          {/* ================= PROPERTY INFORMATION ================= */}
          <div className="details-card">
            <h3>Property Information</h3>
            <div className="details-list">
              <div className="detail-item">
                <LuBuilding2 />
                <div>
                  <span>Property Type</span>
                  <strong>{property.propertyType || "Residential"}</strong>
                </div>
              </div>

              <div className="detail-item">
                <LuCalendarDays />
                <div>
                  <span>Built Year</span>
                  <strong>{builtYear}</strong>
                </div>
              </div>

              <div className="detail-item">
                <LuBuilding2 />
                <div>
                  <span>Area</span>
                  <strong>
                    {property.lotSizeSqft
                      ? `${property.lotSizeSqft.toLocaleString()} sq.ft`
                      : "N/A"}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* ================= OWNER DETAILS ================= */}
            <div className="details-card">
            <h3>Owner Details</h3>

            <div className="details-list">

              <div className="detail-item">
                <LuUser />
                <div>
                  <span>Registered Owner</span>
                  <strong>
                    {ownership ? ownership.ownerName : "Loading..."}
                  </strong>
                </div>
              </div>
              <div className="detail-item">
                <LuUser />
                <div>
                  <span>Owner Type</span>
                  <strong>
                    {ownership ? ownership.ownerType : "-"}
                  </strong>
                </div>
              </div>
                  <div className="detail-item">
              <LuShieldCheck />
                  <div>
                    <span>Ownership Verified</span>
                    <strong>
                      {ownership?.verified ? "Yes" : "No"}
                    </strong>
                  </div>
        </div>

        <div className="detail-item">
          <LuFileText />
          <div>
            <span>Registration Number</span>
            <strong>
              {ownership ? ownership.registrationNumber : "-"}
            </strong>
          </div>
        </div>
          <div className="detail-item">
                  <LuCalendarDays />
                <div>
                  <span>Search Date</span>
                  <strong>{searchDate}</strong>
                </div>
              </div>

            </div>
          </div>
          </ditev>

        {/* ================= RISK SUMMARY ================= */}
        <div className={`risk-card border-${riskDetails.class}`}>
          <div className="risk-left">
            <LuShieldCheck className={`risk-icon text-${riskDetails.class}`} />
            <div>
              <h3>Due Diligence Summary</h3>
              <p>{riskDetails.summary}</p>
            </div>
          </div>

          <span className={`risk-level ${riskDetails.class}`}>
            {riskLvl} Risk
          </span>
        </div>

        {/* ================= DOCUMENTS ================= */}
        <div className="details-card">
          <h3>Property Documents</h3>
          <div className="documents-grid">
            {documents.map((doc) => (
              <div key={doc} className="document-item">
                <LuFileText />
                <span>{doc}</span>
                <span className="doc-status">Available</span>
              </div>
            ))}
          </div>
        </div>

        {/* ================= TIMELINE ================= */}
        <div className="details-card">
          <h3>Verification Timeline</h3>
          <div className="timeline">
            <div className="timeline-item">
              <div className="timeline-dot"></div>
              <div>
                <h4>Property Search Initiated</h4>
                <p>16 July 2026 • 10:00 AM</p>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-dot"></div>
              <div>
                <h4>Documents Verified</h4>
                <p>16 July 2026 • 10:25 AM</p>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-dot"></div>
              <div>
                <h4>Risk Assessment Completed</h4>
                <p>16 July 2026 • 10:40 AM</p>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-dot success"></div>
              <div>
                <h4>Final Report Generated</h4>
                <p>16 July 2026 • 10:45 AM</p>
              </div>
            </div>
          </div>
        </div>

        {/* ================= FINAL STATUS ================= */}
        <div className="recommendation-card">
          <LuShieldCheck className="recommendation-icon" />
          <div>
            <h3>Final Recommendation</h3>
            <p>{riskDetails.recommendation}</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}