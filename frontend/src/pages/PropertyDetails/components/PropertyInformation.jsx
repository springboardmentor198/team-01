import {
  LuBuilding2,
  LuMapPin,
  LuCalendarDays,
  LuRuler,
  LuBadgeIndianRupee,
} from "react-icons/lu";

export default function PropertyInformation({ property }) {
  return (
    <div className="details-card">
      <h3>Property Information</h3>

      <div className="details-list">
        <div className="detail-item">
          <LuBuilding2 />
          <div>
            <span>Property Type</span>
            <strong>{property?.propertyType || "Not Available"}</strong>
          </div>
        </div>

        <div className="detail-item">
          <LuMapPin />
          <div>
            <span>Address</span>
            <strong>
              {property?.address && property?.city
                ? `${property.address}, ${property.city}`
                : property?.address || "Not Available"}
            </strong>
          </div>
        </div>

        <div className="detail-item">
          <LuCalendarDays />
          <div>
            <span>Year Built</span>
            <strong>{property?.yearBuilt || "Not Available"}</strong>
          </div>
        </div>

        <div className="detail-item">
          <LuRuler />
          <div>
            <span>Area</span>
            <strong>
              {property?.lotSizeSqft
                ? `${property.lotSizeSqft.toLocaleString()} sq.ft`
                : "Not Available"}
            </strong>
          </div>
        </div>

        <div className="detail-item">
          <LuBadgeIndianRupee />
          <div>
            <span>Estimated Value</span>
            <strong>{property?.estimatedValue || "Not Available"}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}