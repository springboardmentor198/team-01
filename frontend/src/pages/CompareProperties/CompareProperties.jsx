import { useState } from "react";
import Layout from "../../components/Layout/Layout";
import "./CompareProperties.css";

import {
  LuArrowLeftRight,
  LuBuilding2,
  LuMapPin,
  LuShieldCheck,
  LuUser,
  LuRuler,
  LuBadgeCheck,
  LuIndianRupee,
} from "react-icons/lu";

const properties = [
  {
    id: 1,
    name: "3 BHK Luxury Villa",
    type: "Residential",
    city: "Bangalore",
    area: "2450 sq.ft",
    status: "Available",
    risk: "Medium",
    owner: "Satya Prakash",
    valuation: "₹1.25 Cr",
    tax: "Paid",
    flood: "Low",
    legal: "Verified",
  },
  {
    id: 2,
    name: "Commercial Office",
    type: "Commercial",
    city: "Delhi",
    area: "3100 sq.ft",
    status: "Under Review",
    risk: "High",
    owner: "Amit Sharma",
    valuation: "₹2.80 Cr",
    tax: "Pending",
    flood: "Medium",
    legal: "Review Required",
  },
  {
    id: 3,
    name: "Farm House",
    type: "Agricultural",
    city: "Jaipur",
    area: "5500 sq.ft",
    status: "Available",
    risk: "Low",
    owner: "Rajesh Kumar",
    valuation: "₹95 L",
    tax: "Paid",
    flood: "Low",
    legal: "Verified",
  },
];

export default function CompareProperties() {
  const [property1, setProperty1] = useState("");
  const [property2, setProperty2] = useState("");

  const first = properties.find((p) => p.id === Number(property1));
  const second = properties.find((p) => p.id === Number(property2));

  return (
    <Layout title="Compare Properties">
      <div className="compare-page">

        <div className="compare-header">
          <h2>
            <LuArrowLeftRight />
            Compare Properties
          </h2>

          <p>
            Select two properties to compare their valuation,
            ownership, legal status and overall risk assessment.
          </p>
        </div>

        <div className="compare-selection">

          <div className="select-card">
            <label>Property A</label>

            <select
              value={property1}
              onChange={(e) => setProperty1(e.target.value)}
            >
              <option value="">Select Property</option>

              {properties.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div className="vs-text">VS</div>

          <div className="select-card">
            <label>Property B</label>

            <select
              value={property2}
              onChange={(e) => setProperty2(e.target.value)}
            >
              <option value="">Select Property</option>

              {properties.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

        </div>

        {first && second && (
          <>
            {/* Property Summary Cards */}

            <div className="compare-summary">

              <div className="summary-card">

                <h3>{first.name}</h3>

                <div className="summary-grid">

                  <div>
                    <span>Type</span>
                    <strong>{first.type}</strong>
                  </div>

                  <div>
                    <span>City</span>
                    <strong>{first.city}</strong>
                  </div>

                  <div>
                    <span>Risk</span>

                    <span
                      className={`risk-badge ${first.risk.toLowerCase()}`}
                    >
                      {first.risk}
                    </span>

                  </div>

                </div>

              </div>

              <div className="summary-card">

                <h3>{second.name}</h3>

                <div className="summary-grid">

                  <div>
                    <span>Type</span>
                    <strong>{second.type}</strong>
                  </div>

                  <div>
                    <span>City</span>
                    <strong>{second.city}</strong>
                  </div>

                  <div>
                    <span>Risk</span>

                    <span
                      className={`risk-badge ${second.risk.toLowerCase()}`}
                    >
                      {second.risk}
                    </span>

                  </div>

                </div>

              </div>

            </div>

            {/* Comparison Table */}

            <div className="comparison-card">

              <table className="comparison-table">

                <thead>

                  <tr>
                    <th>Comparison</th>
                    <th>{first.name}</th>
                    <th>{second.name}</th>
                  </tr>

                </thead>

                <tbody>

                  <tr>
                    <td>
                      <LuBuilding2 />
                      Property Type
                    </td>

                    <td>{first.type}</td>
                    <td>{second.type}</td>
                  </tr>

                  <tr>
                    <td>
                      <LuMapPin />
                      Location
                    </td>

                    <td>{first.city}</td>
                    <td>{second.city}</td>
                  </tr>

                  <tr>
                    <td>
                      <LuRuler />
                      Area
                    </td>

                    <td>{first.area}</td>
                    <td>{second.area}</td>
                  </tr>

                  <tr>
                    <td>
                      <LuIndianRupee />
                      Estimated Value
                    </td>

                    <td>{first.valuation}</td>
                    <td>{second.valuation}</td>
                  </tr>

                  <tr>
                    <td>
                      <LuUser />
                      Owner
                    </td>

                    <td>{first.owner}</td>
                    <td>{second.owner}</td>
                  </tr>

                  <tr>
                    <td>
                      <LuShieldCheck />
                      Overall Risk
                    </td>

                    <td>
                      <span
                        className={`risk-badge ${first.risk.toLowerCase()}`}
                      >
                        {first.risk}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`risk-badge ${second.risk.toLowerCase()}`}
                      >
                        {second.risk}
                      </span>
                    </td>

                  </tr>

                  <tr>
                    <td>Tax Status</td>

                    <td>{first.tax}</td>
                    <td>{second.tax}</td>
                  </tr>

                  <tr>
                    <td>Flood Zone</td>

                    <td>{first.flood}</td>
                    <td>{second.flood}</td>
                  </tr>

                  <tr>
                    <td>
                      <LuBadgeCheck />
                      Legal Status
                    </td>

                    <td>{first.legal}</td>
                    <td>{second.legal}</td>
                  </tr>

                  <tr>
                    <td>Status</td>

                    <td>{first.status}</td>
                    <td>{second.status}</td>
                  </tr>

                </tbody>

              </table>

            </div>
          </>
        )}

      </div>
    </Layout>
  );
}