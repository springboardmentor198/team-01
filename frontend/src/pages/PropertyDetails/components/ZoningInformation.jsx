import {
  LuMap,
  LuBuilding2,
  LuLandmark,
  LuCircleAlert,
} from "react-icons/lu";

export default function ZoningInformation({ zoning }) {
  return (
    <div className="details-card">
      <h3>Zoning Information</h3>

      <div className="details-list">

        <div className="detail-item">
          <LuMap />
          <div>
            <span>Zone Type</span>
            <strong>{zoning?.zoneType || "Not Available"}</strong>
          </div>
        </div>

        <div className="detail-item">
          <LuBuilding2 />
          <div>
            <span>Land Use</span>
            <strong>{zoning?.landUse || "Not Available"}</strong>
          </div>
        </div>

        <div className="detail-item">
          <LuLandmark />
          <div>
            <span>Floor Area Ratio (FAR)</span>
            <strong>{zoning?.far || "Not Available"}</strong>
          </div>
        </div>

        <div className="detail-item">
          <LuCircleAlert />
          <div>
            <span>Restrictions</span>
            <strong>
              {zoning?.restrictions || "Not Available"}
            </strong>
          </div>
        </div>

      </div>
    </div>
  );
}