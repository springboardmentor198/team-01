import Layout from "../../components/Layout/Layout";
import "./PropertyDetails.css";

import { useNavigate } from "react-router-dom";

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

export default function PropertyDetails() {

  const navigate = useNavigate();

  const property = {
    name: "24 Lakeview Street",
    address: "24 Lakeview Street, New Delhi",
    owner: "ABC Developers Pvt. Ltd.",
    type: "Residential",
    status: "Verified",
    risk: "Low",
    builtYear: "2019",
    area: "2450 sq.ft",
    reportId: "REP-2026-0142",
    searchDate: "14 July 2026",
  };

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
            onClick={() => navigate("/property-results")}
          >

            <LuArrowLeft />

            Back to Results

          </button>

          <button className="download-btn">

            <LuDownload />

            Download Report

          </button>

        </div>

        <div className="overview-card">

          <div>

            <h2>{property.name}</h2>

            <p>

              <LuMapPin />

              {property.address}

            </p>

          </div>

          <span className="verified-badge">

            Verified

          </span>

        </div>

        <div className="info-grid">

                  {/* ================= PROPERTY INFORMATION ================= */}

          <div className="details-card">

            <h3>Property Information</h3>

            <div className="details-list">

              <div className="detail-item">

                <LuBuilding2 />

                <div>

                  <span>Property Type</span>

                  <strong>{property.type}</strong>

                </div>

              </div>

              <div className="detail-item">

                <LuCalendarDays />

                <div>

                  <span>Built Year</span>

                  <strong>{property.builtYear}</strong>

                </div>

              </div>

              <div className="detail-item">

                <LuBuilding2 />

                <div>

                  <span>Area</span>

                  <strong>{property.area}</strong>

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

                  <strong>{property.owner}</strong>

                </div>

              </div>

              <div className="detail-item">

                <LuFileText />

                <div>

                  <span>Report ID</span>

                  <strong>{property.reportId}</strong>

                </div>

              </div>

              <div className="detail-item">

                <LuCalendarDays />

                <div>

                  <span>Search Date</span>

                  <strong>{property.searchDate}</strong>

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* ================= RISK SUMMARY ================= */}

        <div className="risk-card">

          <div className="risk-left">

            <LuShieldCheck className="risk-icon" />

            <div>

              <h3>Due Diligence Summary</h3>

              <p>
                The property documents were verified successfully.
                No ownership disputes or legal issues were found.
              </p>

            </div>

          </div>

          <span className="risk-level low">

            Low Risk

          </span>

        </div>

                {/* ================= DOCUMENTS ================= */}

        <div className="details-card">

          <h3>Property Documents</h3>

          <div className="documents-grid">

            {documents.map((doc) => (

              <div
                key={doc}
                className="document-item"
              >

                <LuFileText />

                <span>{doc}</span>

                <span className="doc-status">
                  Available
                </span>

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

                <p>14 July 2026 • 10:00 AM</p>

              </div>

            </div>

            <div className="timeline-item">

              <div className="timeline-dot"></div>

              <div>

                <h4>Documents Verified</h4>

                <p>14 July 2026 • 10:25 AM</p>

              </div>

            </div>

            <div className="timeline-item">

              <div className="timeline-dot"></div>

              <div>

                <h4>Risk Assessment Completed</h4>

                <p>14 July 2026 • 10:40 AM</p>

              </div>

            </div>

            <div className="timeline-item">

              <div className="timeline-dot success"></div>

              <div>

                <h4>Final Report Generated</h4>

                <p>14 July 2026 • 10:45 AM</p>

              </div>

            </div>

          </div>

        </div>

        {/* ================= FINAL STATUS ================= */}

        <div className="recommendation-card">

          <LuShieldCheck className="recommendation-icon" />

          <div>

            <h3>Final Recommendation</h3>

            <p>

              Based on the available records and verification
              results, this property appears to have a
              <strong> Low Risk </strong>
              profile and can be considered for further
              due diligence or purchase.

            </p>

          </div>

        </div>

      </div>

    </Layout>

  );

}