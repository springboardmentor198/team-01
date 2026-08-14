import { LuBuilding2, LuMapPin, LuClock3 } from "react-icons/lu";

const recentProperties = [
  {
    id: 1,
    name: "Luxury Villa",
    location: "Gachibowli, Hyderabad",
    submittedBy: "Rahul Estates",
    status: "PENDING",
    submittedAt: "12 min ago",
  },
  {
    id: 2,
    name: "Premium Apartment",
    location: "Banjara Hills, Hyderabad",
    submittedBy: "Urban Homes",
    status: "UNDER REVIEW",
    submittedAt: "28 min ago",
  },
  {
    id: 3,
    name: "Commercial Office Space",
    location: "Hitech City, Hyderabad",
    submittedBy: "Prime Properties",
    status: "APPROVED",
    submittedAt: "1 hr ago",
  },
  {
    id: 4,
    name: "Independent House",
    location: "Kondapur, Hyderabad",
    submittedBy: "Green Valley Realty",
    status: "PENDING",
    submittedAt: "2 hrs ago",
  },
];

const statusClass = {
  PENDING: "pending",
  "UNDER REVIEW": "review",
  APPROVED: "approved",
  REJECTED: "rejected",
};

function RecentPropertyApprovals() {
  return (
    <article className="admin-dashboard-card">
      {/* =====================================================
          HEADER
      ====================================================== */}
      <div className="admin-dashboard-card-header">
        <div>
          <h2 className="admin-dashboard-card-title">
            Recent Property Approvals
          </h2>

          <p className="admin-dashboard-card-subtitle">
            Latest property listings requiring administrative review
          </p>
        </div>

        <button type="button" className="admin-dashboard-view-all">
          View all
        </button>
      </div>

      {/* =====================================================
          PROPERTY LIST
      ====================================================== */}
      <div className="admin-property-list">
        {recentProperties.map((property) => (
          <div className="admin-property-item" key={property.id}>
            {/* Property icon */}
            <div
              className="admin-property-image"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#EEF2FF",
                color: "#4F46E5",
              }}
            >
              <LuBuilding2 size={21} />
            </div>

            {/* Property information */}
            <div>
              <p className="admin-property-name">{property.name}</p>

              <p className="admin-property-location">
                <LuMapPin
                  size={10}
                  style={{
                    verticalAlign: "middle",
                    marginRight: "3px",
                  }}
                />

                {property.location}
              </p>

              <p
                style={{
                  margin: "4px 0 0",
                  color: "#94A3B8",
                  fontSize: "9px",
                }}
              >
                Submitted by {property.submittedBy}
              </p>
            </div>

            {/* Status + time */}
            <div className="admin-property-meta">
              <span
                className={`admin-status-badge ${
                  statusClass[property.status] || "pending"
                }`}
              >
                {property.status}
              </span>

              <span className="admin-property-time">
                <LuClock3
                  size={10}
                  style={{
                    verticalAlign: "middle",
                    marginRight: "3px",
                  }}
                />

                {property.submittedAt}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* =====================================================
          FOOTER
      ====================================================== */}
      <div
        style={{
          marginTop: "15px",
          paddingTop: "13px",
          borderTop: "1px solid #f1f5f9",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            color: "#94a3b8",
            fontSize: "10px",
          }}
        >
          Showing the latest property submissions
        </span>

        <button type="button" className="admin-dashboard-view-all">
          Manage approvals
        </button>
      </div>
    </article>
  );
}

export default RecentPropertyApprovals;
