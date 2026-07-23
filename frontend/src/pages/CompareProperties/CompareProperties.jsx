import { useState } from "react";
import Layout from "../../components/Layout/Layout";
import "./CompareProperties.css";

import {
  LuArrowLeftRight,
  LuBuilding2,
  LuMapPin,
  LuShieldCheck,
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
            Select any two properties to compare their details side by side.
          </p>
        </div>

        <div className="compare-selection">

          <div className="select-card">
            <label>Property 1</label>

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
            <label>Property 2</label>

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
          <div className="comparison-card">

            <table className="comparison-table">

              <thead>

                <tr>
                  <th>Field</th>
                  <th>{first.name}</th>
                  <th>{second.name}</th>
                </tr>

              </thead>

              <tbody>

                <tr>
                  <td>
                    <LuBuilding2 />
                    Type
                  </td>
                  <td>{first.type}</td>
                  <td>{second.type}</td>
                </tr>

                <tr>
                  <td>
                    <LuMapPin />
                    City
                  </td>
                  <td>{first.city}</td>
                  <td>{second.city}</td>
                </tr>

                <tr>
                  <td>Area</td>
                  <td>{first.area}</td>
                  <td>{second.area}</td>
                </tr>

                <tr>
                  <td>Status</td>
                  <td>{first.status}</td>
                  <td>{second.status}</td>
                </tr>

                <tr>
                  <td>
                    <LuShieldCheck />
                    Risk
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
                  <td>Owner</td>
                  <td>{first.owner}</td>
                  <td>{second.owner}</td>
                </tr>

              </tbody>

            </table>

          </div>
        )}

      </div>
    </Layout>
  );
}