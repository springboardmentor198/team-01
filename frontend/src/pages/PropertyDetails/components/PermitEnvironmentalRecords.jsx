import {
  LuFileText,
  LuShieldCheck,
  LuBuilding2,
  LuCircleAlert,
  LuCalendarDays,
} from "react-icons/lu";

export default function PermitEnvironmentalRecords({ permitRecords }) {
  return (
    <div className="details-card">
      <h3>Permit &amp; Environmental Records</h3>

      <div className="details-list">

        <div className="detail-item">
          <LuFileText />
          <div>
            <span>Building Permit Status</span>
            <strong>{permitRecords?.buildingPermitStatus || "Approved"}</strong>
          </div>
        </div>

        <div className="detail-item">
          <LuShieldCheck />
          <div>
            <span>Environmental Clearance</span>
            <strong>{permitRecords?.environmentalClearance || "Obtained"}</strong>
          </div>
        </div>

        <div className="detail-item">
          <LuBuilding2 />
          <div>
            <span>Occupancy Certificate</span>
            <strong>{permitRecords?.occupancyCertificate || "Issued"}</strong>
          </div>
        </div>

        <div className="detail-item">
          <LuCircleAlert />
          <div>
            <span>Pollution Control Compliance</span>
            <strong>{permitRecords?.pollutionCompliance || "Compliant"}</strong>
          </div>
        </div>

        <div className="detail-item">
          <LuCalendarDays />
          <div>
            <span>Last Inspection Date</span>
            <strong>{permitRecords?.lastInspectionDate || "12 Jun 2026"}</strong>
          </div>
        </div>

      </div>
    </div>
  );
}