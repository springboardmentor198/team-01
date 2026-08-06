import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LuFileText } from "react-icons/lu";
import Layout from "../../components/Layout/Layout";
import { api } from "../../services/api";
import ReportPage from "./ReportPage";
import "./Report.css";

export default function Report() {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [propertiesLoading, setPropertiesLoading] = useState(!propertyId);
  const [propertiesError, setPropertiesError] = useState(false);

  useEffect(() => {
    if (!propertyId)
      api
        .getProperties()
        .then(setProperties)
        .catch(() => setPropertiesError(true))
        .finally(() => setPropertiesLoading(false));
  }, [propertyId]);

  if (!propertyId)
    return (
      <Layout title="Reports">
        <div className="report-empty">
          <LuFileText />
          <h2>No property selected</h2>
          <p>Select a property to preview its due diligence report.</p>
          {propertiesLoading ? (
            <div className="report-select-skeleton" />
          ) : properties.length ? (
            <div className="report-selector">
              <label htmlFor="report-property">Property</label>
              <select
                id="report-property"
                defaultValue=""
                onChange={(event) =>
                  event.target.value &&
                  navigate(`/report/${event.target.value}`)
                }
              >
                <option value="" disabled>
                  Select a property
                </option>
                {properties.map((property) => (
                  <option key={property.propertyId} value={property.propertyId}>
                    {property.propertyCode || "Property"} —{" "}
                    {[property.address, property.city]
                      .filter(Boolean)
                      .join(", ")}
                  </option>
                ))}
              </select>
            </div>
          ) : propertiesError ? (
            <p className="report-muted">Unable to load properties.</p>
          ) : (
            <p className="report-muted">No properties are available yet.</p>
          )}
          <button onClick={() => navigate("/properties")}>
            Go to Properties
          </button>
        </div>
      </Layout>
    );

  return (
    <Layout title="Due Diligence Report">
      <ReportPage propertyId={propertyId} />
    </Layout>
  );
}
