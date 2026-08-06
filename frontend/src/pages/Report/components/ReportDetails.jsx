import { LuFileText, LuEye } from "react-icons/lu";

const riskClass = (value) => (value || "unknown").toLowerCase();

function Badge({ children }) {
  return (
    <span className={`report-badge ${riskClass(children)}`}>
      {children || "—"}
    </span>
  );
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function FieldGrid({ items }) {
  const rows = items.filter(
    ([, value]) => value !== undefined && value !== null && value !== "",
  );
  if (!rows.length) return <p className="report-muted">No data available.</p>;
  return (
    <div className="report-fields">
      {rows.map(([label, value]) => (
        <div key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  );
}

/**
 * ReportDetails — dynamically renders all due diligence sections returned by
 * the backend (property, ownership, financial, legal, environmental, zoning,
 * permit, document, risk analysis). Only sections with available data render.
 */
export default function ReportDetails({
  property,
  risk,
  documents = [],
  permits = [],
}) {
  const ownerName = property?.ownerName || property?.owner?.name || null;

  const propertyFields = [
    ["Property Name", property?.propertyCode],
    ["Property ID", property?.propertyId],
    ["Parcel ID", property?.parcelId],
    ["Address", property?.address],
    ["City", property?.city],
    ["Country", property?.country],
    ["Property Type", property?.propertyType],
    ["Land Use", property?.landUse],
    ["Area", property?.lotSizeSqft ? `${property.lotSizeSqft} sq ft` : null],
    ["Year Built", property?.yearBuilt],
    ["Bedrooms", property?.bedrooms],
    ["Bathrooms", property?.bathrooms],
    ["Status", property?.status],
  ];

  const ownershipFields = [
    ["Owner", ownerName],
    ["Ownership Risk", risk?.ownershipRisk],
    ["Reviewed By", risk?.reviewedBy],
  ];

  const financialFields = [
    ["Financial Risk", risk?.financialRisk],
    ["Market Risk", risk?.marketRisk],
  ];

  const legalFields = [
    ["Legal Risk", risk?.legalRisk],
    ["Compliance Status", risk?.complianceStatus],
  ];

  const environmentalFields = [
    ["Environmental Risk", risk?.environmentalRisk],
    ["Flood Risk", risk?.floodRisk],
  ];

  const zoningFields = [
    ["Zoning / Land Use", property?.landUse],
    ["Property Type", property?.propertyType],
  ];

  const hasValue = (items) => items.some(([, v]) => v && v !== "—");

  return (
    <>
      {/* Property Information */}
      <section className="report-card">
        <h2>Property Information</h2>
        <FieldGrid items={propertyFields} />
      </section>

      {/* Ownership Review */}
      {hasValue(ownershipFields) && (
        <section className="report-card">
          <h2>Ownership Review</h2>
          <FieldGrid items={ownershipFields} />
        </section>
      )}

      {/* Financial Review */}
      {hasValue(financialFields) && (
        <section className="report-card">
          <h2>Financial Review</h2>
          <FieldGrid items={financialFields} />
        </section>
      )}

      {/* Legal Review */}
      {hasValue(legalFields) && (
        <section className="report-card">
          <h2>Legal Review</h2>
          <FieldGrid items={legalFields} />
        </section>
      )}

      {/* Environmental Review */}
      {hasValue(environmentalFields) && (
        <section className="report-card">
          <h2>Environmental Review</h2>
          <FieldGrid items={environmentalFields} />
        </section>
      )}

      {/* Zoning Review */}
      {hasValue(zoningFields) && (
        <section className="report-card">
          <h2>Zoning Review</h2>
          <FieldGrid items={zoningFields} />
        </section>
      )}

      {/* Risk Analysis */}
      {risk && (
        <section className="report-card">
          <h2>Risk Analysis</h2>
          <div className="risk-score">
            <div>
              <span>Risk Score</span>
              <strong>
                {risk.riskScore ?? 0}
                <small>/100</small>
              </strong>
            </div>
            <div className="score-track">
              <i
                style={{
                  width: `${Math.min(Math.max(risk.riskScore ?? 0, 0), 100)}%`,
                }}
              />
            </div>
          </div>
          <div className="risk-grid">
            {[
              ["Overall Risk", risk.overallRisk],
              ["Flood Risk", risk.floodRisk],
              ["Legal Risk", risk.legalRisk],
              ["Environmental Risk", risk.environmentalRisk],
              ["Financial Risk", risk.financialRisk],
              ["Market Risk", risk.marketRisk],
              ["Ownership Risk", risk.ownershipRisk],
              ["Compliance Status", risk.complianceStatus],
            ].map(([label, value]) => (
              <div key={label}>
                <span>{label}</span>
                <Badge>{value}</Badge>
              </div>
            ))}
          </div>
          {risk.remarks && (
            <div className="remarks">
              <span>Remarks</span>
              <p>{risk.remarks}</p>
            </div>
          )}
        </section>
      )}

      {/* Documents */}
      <section className="report-card">
        <h2>Documents</h2>
        {documents.length ? (
          <div className="report-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Document Name</th>
                  <th>Document Type</th>
                  <th>Uploaded At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id}>
                    <td>{doc.documentName}</td>
                    <td>{doc.documentType}</td>
                    <td>{formatDate(doc.uploadedAt)}</td>
                    <td>
                      {doc.fileUrl ? (
                        <>
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <LuEye /> View
                          </a>
                          <a href={doc.fileUrl} download>
                            <LuFileText /> Download
                          </a>
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="report-muted">No documents available.</p>
        )}
      </section>

      {/* Permit Review */}
      <section className="report-card">
        <h2>Permit Review</h2>
        {permits.length ? (
          <div className="report-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Permit</th>
                  <th>Authority</th>
                  <th>Issue Date</th>
                  <th>Expiry Date</th>
                  <th>Status</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {permits.map((permit) => {
                  const expired =
                    permit.expiryDate &&
                    new Date(permit.expiryDate) < new Date();
                  return (
                    <tr key={permit.id} className={expired ? "expired" : ""}>
                      <td>{permit.permitType}</td>
                      <td>{permit.issuingAuthority || "—"}</td>
                      <td>{formatDate(permit.issueDate)}</td>
                      <td>{formatDate(permit.expiryDate)}</td>
                      <td>
                        {expired ? (
                          <span className="expired-label">Expired</span>
                        ) : (
                          permit.status || "—"
                        )}
                      </td>
                      <td>{permit.remarks || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="report-muted">No permits available.</p>
        )}
      </section>
    </>
  );
}
