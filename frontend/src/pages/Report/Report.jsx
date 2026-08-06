import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LuFileText } from "react-icons/lu";
import Layout from "../../components/Layout/Layout";
import { api } from "../../services/api";
import ReportPage from "./ReportPage";
import Select from "react-select";
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
        <div style={{ marginTop: "0px" }}>
          <div className="report-empty">
            <LuFileText />
            <h2>No property selected</h2>
            <p>Select a property to preview its due diligence report.</p>
            {propertiesLoading ? (
              <div className="report-select-skeleton" />
            ) : properties.length ? (
              <div className="report-selector">
                <label htmlFor="report-property">Property</label>
                <Select
                  placeholder="Select a property"
                  menuPlacement="bottom"
                  menuPosition="fixed"
                  styles={{
                    control: (base) => ({
                      ...base,
                      minHeight: 48,
                      borderRadius: 12,
                      borderColor: "#d6dce8",
                    }),
                    menu: (base) => ({
                      ...base,
                      zIndex: 9999,
                    }),
                  }}
                  options={properties.map((property) => ({
                    value: property.propertyId,
                    label: `${property.propertyCode || "Property"} — ${[
                      property.address,
                      property.city,
                    ]
                      .filter(Boolean)
                      .join(", ")}`,
                  }))}
                  onChange={(selected) => {
                    if (selected) {
                      navigate(`/report/${selected.value}`);
                    }
                  }}
                />
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
        </div>
      </Layout>
    );

  return (
    <Layout title="Due Diligence Report">
      <ReportPage propertyId={propertyId} />
    </Layout>
  );
}
