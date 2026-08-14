import {
  LuUserPlus,
  LuBadgeCheck,
  LuBuilding2,
  LuMessageCircle,
  LuFileCheck2,
} from "react-icons/lu";

const recentActivities = [
  {
    id: 1,
    type: "registration",
    title: "New user registered",
    description: "Rahul Sharma created a new buyer account",
    time: "5 min ago",
    icon: LuUserPlus,
  },
  {
    id: 2,
    type: "verification",
    title: "Professional verified",
    description: "Ankit Mehta was approved as a Property Agent",
    time: "18 min ago",
    icon: LuBadgeCheck,
  },
  {
    id: 3,
    type: "property",
    title: "New property submitted",
    description: "A property listing was submitted for verification",
    time: "32 min ago",
    icon: LuBuilding2,
  },
  {
    id: 4,
    type: "support",
    title: "Support ticket raised",
    description: "A user submitted a technical support request",
    time: "46 min ago",
    icon: LuMessageCircle,
  },
  {
    id: 5,
    type: "document",
    title: "Document verification completed",
    description: "Property documents were successfully verified",
    time: "1 hr ago",
    icon: LuFileCheck2,
  },
];

const activityIconStyles = {
  registration: {
    background: "#EDE9FE",
    color: "#7C3AED",
  },
  verification: {
    background: "#DCFCE7",
    color: "#16A34A",
  },
  property: {
    background: "#DBEAFE",
    color: "#2563EB",
  },
  support: {
    background: "#FEF3C7",
    color: "#D97706",
  },
  document: {
    background: "#E0F2FE",
    color: "#0284C7",
  },
};

function RecentActivity() {
  return (
    <article className="admin-dashboard-card">
      {/* ---------------------------------------------------
          HEADER
      --------------------------------------------------- */}
      <div className="admin-dashboard-card-header">
        <div>
          <h2 className="admin-dashboard-card-title">Recent Activity</h2>

          <p className="admin-dashboard-card-subtitle">
            Latest activity across the platform
          </p>
        </div>

        <button type="button" className="admin-dashboard-view-all">
          View all
        </button>
      </div>

      {/* ---------------------------------------------------
          ACTIVITY LIST
      --------------------------------------------------- */}
      <div className="admin-recent-activity">
        {recentActivities.map((activity) => {
          const Icon = activity.icon;

          const iconStyle = activityIconStyles[activity.type];

          return (
            <div className="admin-activity-item" key={activity.id}>
              {/* Activity icon */}
              <div
                className="admin-activity-icon"
                style={{
                  background: iconStyle.background,
                  color: iconStyle.color,
                }}
              >
                <Icon size={17} strokeWidth={2} />
              </div>

              {/* Activity information */}
              <div className="admin-activity-info">
                <p className="admin-activity-title">{activity.title}</p>

                <p className="admin-activity-description">
                  {activity.description}
                </p>
              </div>

              {/* Time */}
              <span className="admin-activity-time">{activity.time}</span>
            </div>
          );
        })}
      </div>
    </article>
  );
}

export default RecentActivity;
