import { useState, useEffect } from "react";
import Layout from "../../components/Layout/Layout";
import { api } from "../../services/api";
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
  LuReceipt,
  LuWaves,
  LuCircleCheck,
} from "react-icons/lu";

export default function CompareProperties() {
  const [properties, setProperties] = useState([]);

  const [property1, setProperty1] = useState("");
  const [property2, setProperty2] = useState("");

  const [firstRisk, setFirstRisk] = useState(null);
  const [secondRisk, setSecondRisk] = useState(null);

  const [firstTax, setFirstTax] = useState(null);
  const [secondTax, setSecondTax] = useState(null);

  const [firstFlood, setFirstFlood] = useState(null);
  const [secondFlood, setSecondFlood] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadProperties() {
      try {
        const data = await api.getProperties();
        setProperties(data);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    loadProperties();
  }, []);

  const first = properties.find((p) => p.propertyId === Number(property1));

  const second = properties.find((p) => p.propertyId === Number(property2));

  useEffect(() => {
    if (!property1) return;

    async function loadData() {
      try {
        const [risk, tax, flood] = await Promise.all([
          api.getRiskSummary(property1).catch(() => null),
          api.getPropertyTaxSummary(property1).catch(() => null),
          api.getFloodZone(property1).catch(() => null),
        ]);

        setFirstRisk(risk);
        setFirstTax(tax);
        setFirstFlood(flood);
      } catch (err) {
        console.log(err);
      }
    }

    loadData();
  }, [property1]);

  useEffect(() => {
    if (!property2) return;

    async function loadData() {
      try {
        const [risk, tax, flood] = await Promise.all([
          api.getRiskSummary(property2).catch(() => null),
          api.getPropertyTaxSummary(property2).catch(() => null),
          api.getFloodZone(property2).catch(() => null),
        ]);

        setSecondRisk(risk);
        setSecondTax(tax);
        setSecondFlood(flood);
      } catch (err) {
        console.log(err);
      }
    }

    loadData();
  }, [property2]);

  if (loading) {
    return (
      <Layout title="Compare Properties">
        <div className="compare-page">
          <h2>Loading properties...</h2>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Compare Properties">
        <div className="compare-page">
          <h2>Failed to load properties.</h2>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Compare Properties">
      <div className="compare-page">
        <div className="compare-header">
          <h2>
            <LuArrowLeftRight />
            Compare Properties
          </h2>

          <p>Compare two properties using live backend data.</p>
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
                <option key={item.propertyId} value={item.propertyId}>
                  {item.propertyCode}
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
                <option key={item.propertyId} value={item.propertyId}>
                  {item.propertyCode}
                </option>
              ))}
            </select>
          </div>
        </div>
        {first && second && (
          <>
            {/* Summary Cards */}

            <div className="compare-summary">
              <div className="summary-card">
                <h3>{first.propertyCode}</h3>

                <div className="summary-grid">
                  <div>
                    <span>Property Type</span>
                    <strong>{first.propertyType}</strong>
                  </div>

                  <div>
                    <span>City</span>
                    <strong>{first.city}</strong>
                  </div>

                  <div>
                    <span>Owner</span>
                    <strong>{first.ownerName}</strong>
                  </div>

                  <div>
                    <span>Status</span>
                    <strong>{first.status}</strong>
                  </div>
                </div>
              </div>

              <div className="summary-card">
                <h3>{second.propertyCode}</h3>

                <div className="summary-grid">
                  <div>
                    <span>Property Type</span>
                    <strong>{second.propertyType}</strong>
                  </div>

                  <div>
                    <span>City</span>
                    <strong>{second.city}</strong>
                  </div>

                  <div>
                    <span>Owner</span>
                    <strong>{second.ownerName}</strong>
                  </div>

                  <div>
                    <span>Status</span>
                    <strong>{second.status}</strong>
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
                    <th>{first.propertyCode}</th>
                    <th>{second.propertyCode}</th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td>
                      <LuBuilding2 />
                      Property Type
                    </td>

                    <td>{first.propertyType}</td>
                    <td>{second.propertyType}</td>
                  </tr>

                  <tr>
                    <td>
                      <LuMapPin />
                      Address
                    </td>

                    <td>{first.address}</td>
                    <td>{second.address}</td>
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
                    <td>
                      <div className="comparison-label">
                        <LuRuler />
                        <span>Area</span>
                      </div>
                    </td>

                    <td>{first.lotSizeSqft} sq.ft</td>
                    <td>{second.lotSizeSqft} sq.ft</td>
                  </tr>

                  <tr>
                    <td>Bedrooms</td>

                    <td>{first.bedrooms}</td>
                    <td>{second.bedrooms}</td>
                  </tr>

                  <tr>
                    <td>Bathrooms</td>

                    <td>{first.bathrooms}</td>
                    <td>{second.bathrooms}</td>
                  </tr>

                  <tr>
                    <td>
                      <div className="comparison-label">
                        <LuUser />
                        <span>Owner</span>
                      </div>
                    </td>

                    <td>{first.ownerName}</td>
                    <td>{second.ownerName}</td>
                  </tr>

                  <tr>
                    <td>Parcel ID</td>

                    <td>{first.parcelId}</td>
                    <td>{second.parcelId}</td>
                  </tr>

                  <tr>
                    <td>Land Use</td>

                    <td>{first.landUse}</td>
                    <td>{second.landUse}</td>
                  </tr>

                  <tr>
                    <td>Year Built</td>

                    <td>{first.yearBuilt}</td>
                    <td>{second.yearBuilt}</td>
                  </tr>

                  <tr>
                    <td>Status</td>

                    <td>{first.status}</td>
                    <td>{second.status}</td>
                  </tr>

                  <tr>
                    <td>
                      <div className="comparison-label">
                        <LuShieldCheck />
                        <span>Overall Risk</span>
                      </div>
                    </td>

                    <td>{firstRisk?.overallRisk ?? "N/A"}</td>

                    <td>{secondRisk?.overallRisk ?? "N/A"}</td>
                  </tr>

                  <tr>
                    <td>Risk Score</td>

                    <td>{firstRisk?.riskScore ?? "N/A"}</td>

                    <td>{secondRisk?.riskScore ?? "N/A"}</td>
                  </tr>

                  <tr>
                    <td>Legal Risk</td>

                    <td>{firstRisk?.legalRisk ?? "N/A"}</td>

                    <td>{secondRisk?.legalRisk ?? "N/A"}</td>
                  </tr>

                  <tr>
                    <td>Flood Risk</td>

                    <td>{firstRisk?.floodRisk ?? "N/A"}</td>

                    <td>{secondRisk?.floodRisk ?? "N/A"}</td>
                  </tr>

                  <tr>
                    <td>Environmental Risk</td>

                    <td>{firstRisk?.environmentalRisk ?? "N/A"}</td>

                    <td>{secondRisk?.environmentalRisk ?? "N/A"}</td>
                  </tr>

                  <tr>
                    <td>Tax Status</td>

                    <td>
                      {firstTax?.status ?? firstTax?.paymentStatus ?? "N/A"}
                    </td>

                    <td>
                      {secondTax?.status ?? secondTax?.paymentStatus ?? "N/A"}
                    </td>
                  </tr>

                  <tr>
                    <td>Flood Zone</td>

                    <td>
                      {firstFlood?.zone ?? firstFlood?.floodZone ?? "N/A"}
                    </td>

                    <td>
                      {secondFlood?.zone ?? secondFlood?.floodZone ?? "N/A"}
                    </td>
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
