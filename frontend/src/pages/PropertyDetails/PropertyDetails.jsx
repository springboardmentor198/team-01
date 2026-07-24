import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LuDownload, LuMapPin } from "react-icons/lu";
import Layout from "../../components/Layout/Layout";
import { api } from "../../services/api";
import "./PropertyDetails.css";

import PropertyInformation from "./components/PropertyInformation";
import OwnerDetails from "./components/OwnerDetails";
import PropertyTaxHistory from "./components/PropertyTaxHistory";
import ZoningInformation from "./components/ZoningInformation";
import RiskSummary from "./components/RiskSummary";
import Documents from "./components/Documents";
import PermitEnvironmentalRecords from "./components/PermitEnvironmentalRecords";

const tabs = [
  "Overview",
  "Risk Summary",
  "Documents",
  "Permits",
  "Activity Timeline",
];

export default function PropertyDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [property, setProperty] = useState(null);
  const [ownership, setOwnership] = useState(null);
  const [taxSummary, setTaxSummary] = useState(null);
  const [activeTab, setActiveTab] = useState("Overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!api.isAuthenticated()) {
      navigate("/login");
      return;
    }

    Promise.all([
      api.getPropertyById(id),
      api.getOwnership(id).catch(() => []),
      api.getPropertyTaxSummary(id).catch(() => null),
    ])
      .then(([details, owners, summary]) => {
        setProperty(details);
        setOwnership(owners[0] || null);
        setTaxSummary(summary);
      })
      .catch((err) =>
        setError(err.message || "Failed to load property details"),
      )
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) {
    return (
      <Layout title="Property Details">
        <div className="loading-container">
          <p>Loading property workspace...</p>
        </div>
      </Layout>
    );
  }

  if (error || !property) {
    return (
      <Layout title="Property Details">
        <div className="error-container">
          <p className="error-message">{error || "Property not found"}</p>

          <button className="retry-btn" onClick={() => navigate("/properties")}>
            Back to Properties
          </button>
        </div>
      </Layout>
    );
  }

  const renderTab = () => {
    switch (activeTab) {
      case "Overview":
        return (
          <div className="info-grid">
            <PropertyInformation property={property} />

            <OwnerDetails ownership={ownership} searchDate="—" />

            <PropertyTaxHistory taxSummary={taxSummary} />
            <PropertyTaxHistory taxHistory={taxHistory} />

            <ZoningInformation property={property} />
          </div>
        );

      case "Risk Summary":
        return <RiskSummary propertyId={id} />;

      case "Documents":
        return <Documents propertyId={id} />;

      case "Permits":
        return <PermitEnvironmentalRecords propertyId={id} />;

      case "Activity Timeline":
      default:
        return (
          <div className="details-card">
            <h3>Activity Timeline</h3>

            <p className="no-data">
              Activity events will appear here when the activity API becomes
              available.
            </p>
          </div>
        );
    }
  };

  return (
    <Layout title="Property Details">
      <div className="details-page">
        <div className="details-header">
          <button
            className="download-btn"
            onClick={() => navigate(`/report/${id}`)}
          >
            <LuDownload />
            View Report
          </button>
        </div>

        <div className="overview-card">
          <div>
            <h2>{property.propertyCode || "Property"}</h2>

            <p>
              <LuMapPin />
              {property.address}, {property.city}
              {property.country && `, ${property.country}`}
            </p>
          </div>

          <span
            className={`verified-badge ${
              property.status ? property.status.toLowerCase() : "available"
            }`}
          >
            {property.status}
          </span>
        </div>

        <div className="property-tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="tab-content">{renderTab()}</div>
      </div>
    </Layout>
  );
}