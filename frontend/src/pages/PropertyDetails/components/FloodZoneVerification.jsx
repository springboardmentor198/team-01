import {
  LuMapPin,
  LuCircleAlert,
  LuLandmark,
  LuFileText,
  LuShieldCheck,
} from "react-icons/lu";

export default function FloodZoneVerification({ floodZone }) {
  return (
    <div className="details-card">
      <h3>Flood Zone Verification</h3>

      <div className="details-list">

        <div className="detail-item">
          <LuMapPin />
          <div>
            <span>Flood Zone</span>
            <strong>{floodZone?.zone || "Zone X (Minimal Risk)"}</strong>
          </div>
        </div>

        <div className="detail-item">
          <LuCircleAlert />
          <div>
            <span>Risk Level</span>
            <strong>{floodZone?.riskLevel || "Low"}</strong>
          </div>
        </div>

        <div className="detail-item">
          <LuLandmark />
          <div>
            <span>Elevation</span>
            <strong>{floodZone?.elevation || "42 m above sea level"}</strong>
          </div>
        </div>

        <div className="detail-item">
          <LuFileText />
          <div>
            <span>FEMA Classification</span>
            <strong>{floodZone?.femaClassification || "Not in Special Flood Hazard Area"}</strong>
          </div>
        </div>

        <div className="detail-item">
          <LuShieldCheck />
          <div>
            <span>Flood Insurance Required</span>
            <strong>{floodZone?.insuranceRequired ? "Yes" : "No"}</strong>
          </div>
        </div>

      </div>
    </div>
  );
}