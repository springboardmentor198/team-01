import {
  LuUser,
  LuShieldCheck,
  LuFileText,
  LuCalendarDays,
  LuUsers,
} from "react-icons/lu";

export default function OwnerDetails({ ownership, searchDate }) {
  return (
    <div className="details-card">
      <h3>Owner Details</h3>

      <div className="details-list">
        <div className="detail-item">
          <LuUser />
          <div>
            <span>Registered Owner</span>
            <strong>
              {ownership?.ownerName || "Not Available"}
            </strong>
          </div>
        </div>

        <div className="detail-item">
          <LuUsers />
          <div>
            <span>Owner Type</span>
            <strong>
              {ownership?.ownerType || "Not Available"}
            </strong>
          </div>
        </div>

        <div className="detail-item">
          <LuShieldCheck />
          <div>
            <span>Ownership Verified</span>
            <strong>
              {ownership?.verified ? "Verified" : "Not Verified"}
            </strong>
          </div>
        </div>

        <div className="detail-item">
          <LuFileText />
          <div>
            <span>Registration Number</span>
            <strong>
              {ownership?.registrationNumber || "Not Available"}
            </strong>
          </div>
        </div>

        <div className="detail-item">
          <LuCalendarDays />
          <div>
            <span>Search Date</span>
            <strong>{searchDate}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}