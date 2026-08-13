import { LuBriefcaseBusiness, LuLandmark, LuScale } from "react-icons/lu";

const professionals = [
  {
    id: "agents",
    name: "Property Agents",
    count: 842,
    percentage: 51,
    icon: LuBriefcaseBusiness,
    className: "agent",
  },
  {
    id: "legal",
    name: "Legal Professionals",
    count: 497,
    percentage: 30,
    icon: LuScale,
    className: "legal",
  },
  {
    id: "financial",
    name: "Financial Institutions",
    count: 320,
    percentage: 19,
    icon: LuLandmark,
    className: "financial",
  },
];

const professionalColors = {
  agent: {
    background: "#EEF2FF",
    color: "#4F46E5",
    progress: "#4F46E5",
  },
  legal: {
    background: "#ECFDF5",
    color: "#059669",
    progress: "#10B981",
  },
  financial: {
    background: "#FFF7ED",
    color: "#EA580C",
    progress: "#F97316",
  },
};

function ProfessionalDistribution() {
  const totalProfessionals = professionals.reduce(
    (total, professional) => total + professional.count,
    0,
  );

  return (
    <article className="admin-dashboard-card">
      {/* ---------------------------------------------------
          HEADER
      --------------------------------------------------- */}
      <div className="admin-dashboard-card-header">
        <div>
          <h2 className="admin-dashboard-card-title">
            Professional Distribution
          </h2>

          <p className="admin-dashboard-card-subtitle">
            Breakdown of verified professionals by role
          </p>
        </div>

        <span
          style={{
            color: "#475569",
            fontSize: "12px",
            fontWeight: 600,
          }}
        >
          {totalProfessionals.toLocaleString()} Total
        </span>
      </div>

      {/* ---------------------------------------------------
          PROFESSIONAL LIST
      --------------------------------------------------- */}
      <div className="admin-professional-list">
        {professionals.map((professional) => {
          const Icon = professional.icon;
          const colors = professionalColors[professional.className];

          return (
            <div className="admin-professional-row" key={professional.id}>
              {/* Role */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    width: "30px",
                    height: "30px",
                    flexShrink: 0,
                    borderRadius: "8px",
                    background: colors.background,
                    color: colors.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={15} />
                </div>

                <span className="admin-professional-name">
                  {professional.name}
                </span>
              </div>

              {/* Progress */}
              <div className="admin-professional-progress">
                <div
                  className="admin-professional-progress-bar"
                  style={{
                    width: `${professional.percentage}%`,
                    background: colors.progress,
                  }}
                />
              </div>

              {/* Count */}
              <span className="admin-professional-count">
                {professional.count}
              </span>
            </div>
          );
        })}
      </div>

      {/* ---------------------------------------------------
          FOOTER
      --------------------------------------------------- */}
      <div
        style={{
          marginTop: "20px",
          paddingTop: "14px",
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
          Distribution of verified professionals
        </span>

        <button type="button" className="admin-dashboard-view-all">
          View details
        </button>
      </div>
    </article>
  );
}

export default ProfessionalDistribution;
