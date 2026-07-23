import { useState, useEffect } from "react";
import Layout from "../../components/Layout/Layout";
import "./PropertyDetails.css";
import { useNavigate, useParams } from "react-router-dom";
import { api, getPropertyRisk } from "../../services/api";

import PropertyInformation from "./components/PropertyInformation";
import OwnerDetails from "./components/OwnerDetails";
import PropertyTaxHistory from "./components/PropertyTaxHistory";
import ZoningInformation from "./components/ZoningInformation";
import FloodZoneVerification from "./components/FloodZoneVerification";
import PermitEnvironmentalRecords from "./components/PermitEnvironmentalRecords";
import RiskSummary from "./components/RiskSummary";
import Documents from "./components/Documents";

import {
  LuArrowLeft,
  LuMapPin,
  LuShieldCheck,
  LuDownload,
} from "react-icons/lu";

const getPropertyRiskDetails = (risk) => {
  const lowercaseRisk = risk.toLowerCase();

  if (lowercaseRisk === "low") {
    return {
      class: "low",
      summary:
        "The property documents were verified successfully. No ownership disputes or legal issues were found.",
      recommendation:
        "Based on the available records and verification results, this property appears to have a Low Risk profile and can be considered for further due diligence or purchase.",
    };
  } else if (lowercaseRisk === "medium") {
    return {
      class: "medium",
      summary:
        "Minor tax updates or zoning checks are outstanding. Title deeds appear clear but tax verification is recommended.",
      recommendation:
        "Based on the available records and verification results, this property appears to have a Medium Risk profile. Proceed with caution and verify outstanding tax filings.",
    };
  } else {
    return {
      class: lowercaseRisk === "critical" ? "critical" : "high",
      summary:
        "WARNING: High legal vulnerability. Ongoing title litigation, zoning non-compliance, or buffer zone restrictions found.",
      recommendation:
        "CAUTION: This property has a High/Critical Risk profile. Significant legal or compliance vulnerabilities exist. Immediate expert consultation is required.",
    };
  }
};

export default function PropertyDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [property, setProperty] = useState(null);
  const [ownership, setOwnership] = useState(null);
  const [taxHistory, setTaxHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!api.isAuthenticated()) {
      navigate("/login");
      return;
    }

    const fetchPropertyDetail = async () => {
      try {
        const propertyData = await api.getPropertyById(id);
        setProperty(propertyData);

        const ownershipResponse = await fetch(
          `http://localhost:8081/api/ownership/${id}`
        );

        if (ownershipResponse.ok) {
          const ownershipData = await ownershipResponse.json();

          if (ownershipData.length > 0) {
            setOwnership(ownershipData[0]);
          }
        }

        try {
          const taxData = await api.getPropertyTaxHistory(id);
          const formattedTaxHistory = taxData.map((item) => {
            const formattedAmount = item.taxAmount !== undefined && item.taxAmount !== null
              ? new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                  maximumFractionDigits: 0,
                }).format(item.taxAmount)
              : "₹0";

            let formattedDate = "";
            if (item.dueDate) {
              const date = new Date(item.dueDate);
              formattedDate = date.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });
            }

            return {
              year: item.taxYear,
              amount: formattedAmount,
              status: item.paymentStatus
                ? item.paymentStatus.charAt(0).toUpperCase() + item.paymentStatus.slice(1).toLowerCase()
                : "",
              dueDate: formattedDate,
            };
          });
          setTaxHistory(formattedTaxHistory);
        } catch (taxErr) {
          console.warn("Failed to fetch tax history from backend", taxErr);
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
          <p className="error-message">
            Error: {error || "Property not found"}
          </p>

          <button
            onClick={() => navigate("/property-search")}
            className="retry-btn"
          >
            Back to Search
          </button>
        </div>
      </Layout>
    );
  }

  const riskLvl = getPropertyRisk(property.propertyId);
  const riskDetails = getPropertyRiskDetails(riskLvl);

  const searchDate = "16 July 2026";



  const zoning = {
    zoneType: "Residential",
    landUse: "Residential Housing",
    far: "2.5",
    buildingHeight: "15 m",
    restrictions: "No Commercial Activities Allowed",
  };

  const documents = [
    "Sale Deed",
    "Property Tax Receipt",
    "Occupancy Certificate",
    "Building Approval Plan",
    "Encumbrance Certificate",
  ];

  const floodZone = {
    zone: "Zone X (Minimal Risk)",
    riskLevel: "Low",
    elevation: "42 m above sea level",
    femaClassification: "Not in Special Flood Hazard Area",
    insuranceRequired: false,
  };

  const permitRecords = {
    buildingPermitStatus: "Approved",
    environmentalClearance: "Obtained",
    occupancyCertificate: "Issued",
    pollutionCompliance: "Compliant",
    lastInspectionDate: "12 Jun 2026",
  };

  return (
  <Layout title="Property Details">
    <div className="details-page">

      {/* ================= HEADER ================= */}

      <div className="details-header">

        <button
          className="back-results-btn"
          onClick={() => navigate(-1)}
        >
          <LuArrowLeft />
          Back
        </button>

        <button
          className="download-btn"
          onClick={() => alert("Report downloaded successfully!")}
        >
          <LuDownload />
          Download Report
        </button>

      </div>

      {/* ================= OVERVIEW ================= */}

      <div className="overview-card">

        <div>

          <h2>{property.propertyCode || "Property Entry"}</h2>

          <p>
            <LuMapPin />
            {property.address}, {property.city}
            {property.country && `, ${property.country}`}
          </p>

        </div>

        <span
          className={`verified-badge ${
            property.status
              ? property.status.toLowerCase()
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

      </div>

      {/* ================= PROPERTY DETAILS ================= */}

      <div className="info-grid">

        <PropertyInformation
          property={property}
        />

        <OwnerDetails
          ownership={ownership}
          searchDate={searchDate}
        />

        <PropertyTaxHistory
          taxHistory={taxHistory}
        />

        <ZoningInformation
          zoning={zoning}
        />

        <FloodZoneVerification
          floodZone={floodZone}
        />

        <PermitEnvironmentalRecords
          permitRecords={permitRecords}
        />

      </div>

      {/* ================= RISK SUMMARY ================= */}

      <RiskSummary
        riskLvl={riskLvl}
        riskDetails={riskDetails}
      />

      {/* ================= DOCUMENTS ================= */}

      <Documents
        documents={documents}
      />

      {/* ================= TIMELINE ================= */}

      <div className="details-card">

        <h3>Timeline</h3>

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

              <h4>Owner Verification Completed</h4>

              <p>16 July 2026 • 10:15 AM</p>

            </div>

          </div>

          <div className="timeline-item">

            <div className="timeline-dot"></div>

            <div>

              <h4>Tax & Zoning Verification</h4>

              <p>16 July 2026 • 10:30 AM</p>

            </div>

          </div>

          <div className="timeline-item">

            <div className="timeline-dot success"></div>

            <div>

              <h4>Risk Assessment Completed</h4>

              <p>16 July 2026 • 10:45 AM</p>

            </div>

          </div>

        </div>

      </div>

      {/* ================= FINAL RECOMMENDATION ================= */}

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