import Layout from "../../components/Layout/Layout";
import "./PropertyResults.css";

import { useNavigate } from "react-router-dom";

import {
  LuMapPin,
  LuBuilding2,
  LuShieldCheck,
  LuTriangleAlert,
  LuEye,
  LuSearch,
} from "react-icons/lu";

const properties = [
  {
    id: 1,
    name: "24 Lakeview Street",
    city: "Delhi",
    owner: "ABC Developers",
    type: "Residential",
    risk: "Low",
    status: "Verified",
  },
  {
    id: 2,
    name: "Palm Residency",
    city: "Noida",
    owner: "XYZ Infra",
    type: "Commercial",
    risk: "High",
    status: "Under Review",
  },
  {
    id: 3,
    name: "Green Avenue",
    city: "Gurugram",
    owner: "Green Buildcon",
    type: "Residential",
    risk: "Medium",
    status: "Pending",
  },
  {
    id: 4,
    name: "Skyline Towers",
    city: "Delhi",
    owner: "Skyline Group",
    type: "Commercial",
    risk: "Low",
    status: "Verified",
  },
];

export default function PropertyResults() {

  const navigate = useNavigate();

  return (

    <Layout title="Search Results">

      <div className="results-page">

        <div className="results-header">

          <div>

            <h2>Property Search Results</h2>

            <p>
              Showing <strong>4</strong> matching
              properties for
              <strong> "24 Lakeview Street"</strong>
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

            <h3>4</h3>

            <p>Total Results</p>

          </div>

          <div className="summary-card">

            <h3>2</h3>

            <p>Verified</p>

          </div>

          <div className="summary-card">

            <h3>1</h3>

            <p>Pending</p>

          </div>

          <div className="summary-card">

            <h3>1</h3>

            <p>High Risk</p>

          </div>

        </div>

        <div className="properties-grid">

          {properties.map((property) => (

            <div
              key={property.id}
              className="property-card"
            >

            <div className="property-top">

              <div>

                <h3>{property.name}</h3>

                <p>

                  <LuMapPin />

                  {property.city}

                </p>

              </div>

              <span
                className={`risk-badge ${property.risk.toLowerCase()}`}
              >
                {property.risk} Risk
              </span>

            </div>

            <div className="property-info">

              <div className="info-box">

                <LuBuilding2 />

                <div>

                  <span>Property Type</span>

                  <h4>{property.type}</h4>

                </div>

              </div>

              <div className="info-box">

                <LuShieldCheck />

                <div>

                  <span>Owner</span>

                  <h4>{property.owner}</h4>

                </div>

              </div>

              <div className="info-box">

                <LuTriangleAlert />

                <div>

                  <span>Status</span>

                  <h4>{property.status}</h4>

                </div>

              </div>

            </div>

            <div className="property-footer">

              <span
                className={`status-badge ${property.status
                  .toLowerCase()
                  .replace(/\s/g, "-")}`}
              >
                {property.status}
              </span>

              <button
                className="view-btn"
                onClick={() =>
                  navigate("/property-details")
                }
              >

                <LuEye />

                View Details

              </button>

            </div>

          </div>

        ))}

                </div>

        {/* ================= SEARCH SUMMARY ================= */}

        <div className="results-summary">

          <h3>Search Summary</h3>

          <div className="summary-details">

            <div className="summary-item">
              <span>Total Properties</span>
              <strong>4</strong>
            </div>

            <div className="summary-item">
              <span>Verified</span>
              <strong>2</strong>
            </div>

            <div className="summary-item">
              <span>Pending</span>
              <strong>1</strong>
            </div>

            <div className="summary-item">
              <span>High Risk</span>
              <strong>1</strong>
            </div>

          </div>

        </div>

      </div>

    </Layout>

  );

}