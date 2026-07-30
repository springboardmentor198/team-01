import { useEffect, useState } from "react";
import {
  LuShieldCheck,
  LuFileText,
  LuClipboardList,
  LuCircleCheck,
  LuClock3,
} from "react-icons/lu";
import { api } from "../../../services/api";

export default function ActivityTimeline({ propertyId }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);

    api
      .getActivityLogs(propertyId)
      .then((data) => {
        setActivities(data || []);
      })
      .catch((e) => {
        setError(e.message || "Failed to load activity history");
      })
      .finally(() => setLoading(false));
  }, [propertyId]);

  const getIcon = (type) => {
    switch (type) {
      case "RISK_SUMMARY_CREATED":
        return <LuShieldCheck />;
      case "DOCUMENT_UPLOADED":
        return <LuFileText />;
      case "PERMIT_ADDED":
        return <LuClipboardList />;
      case "OWNERSHIP_VERIFIED":
        return <LuCircleCheck />;
      default:
        return <LuClock3 />;
    }
  };

  const getColor = (type) => {
    switch (type) {
      case "RISK_SUMMARY_CREATED":
        return "#047857";
      case "DOCUMENT_UPLOADED":
        return "#1D4ED8";
      case "PERMIT_ADDED":
        return "#EA580C";
      case "OWNERSHIP_VERIFIED":
        return "#16A34A";
      default:
        return "#64748B";
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "20px",
        border: "1px solid #E5E7EB",
        padding: "28px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              fontSize: "22px",
              fontWeight: 700,
              color: "#111827",
            }}
          >
            Activity Timeline
          </h3>

          <p
            style={{
              margin: "6px 0 0",
              color: "#6B7280",
              fontSize: "14px",
            }}
          >
            Audit trail of all actions performed on this property.
          </p>
        </div>

        {!loading && activities.length > 0 && (
          <div
            style={{
              background: "#F3F4F6",
              borderRadius: "999px",
              padding: "8px 14px",
              fontSize: "13px",
              fontWeight: 600,
              color: "#374151",
            }}
          >
            {activities.length} activities
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div
          style={{
            padding: "32px 0",
            textAlign: "center",
            color: "#64748B",
          }}
        >
          Loading activity history...
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div
          style={{
            padding: "16px",
            borderRadius: "12px",
            background: "#FEF2F2",
            border: "1px solid #FECACA",
            color: "#B91C1C",
          }}
        >
          {error}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && activities.length === 0 && (
        <div
          style={{
            padding: "48px 24px",
            textAlign: "center",
            border: "1px dashed #D1D5DB",
            borderRadius: "16px",
            background: "#FAFAFA",
          }}
        >
          <LuClock3 size={36} color="#9CA3AF" />

          <h4 style={{ margin: "12px 0 6px", color: "#111827" }}>
            No activity available
          </h4>

          <p style={{ margin: 0, color: "#6B7280", fontSize: "14px" }}>
            Activities will appear automatically when documents, permits, and
            risk assessments are created for this property.
          </p>
        </div>
      )}

      {/* Timeline */}
      {!loading && !error && activities.length > 0 && (
        <div style={{ position: "relative", paddingLeft: "12px" }}>
          {/* Vertical line */}
          <div
            style={{
              position: "absolute",
              left: "28px",
              top: 0,
              bottom: 0,
              width: "2px",
              background: "#E5E7EB",
            }}
          />

          {activities.map((activity, index) => {
            const color = getColor(activity.activityType);

            return (
              <div
                key={activity.id || index}
                style={{
                  position: "relative",
                  display: "flex",
                  gap: "18px",
                  paddingBottom: index === activities.length - 1 ? 0 : "28px",
                }}
              >
                {/* Icon */}
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "999px",
                    background: color + "20",
                    border: `2px solid ${color}30`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color,
                    fontSize: "18px",
                    flexShrink: 0,
                    position: "relative",
                    zIndex: 2,
                  }}
                >
                  {getIcon(activity.activityType)}
                </div>

                {/* Card */}
                <div
                  style={{
                    flex: 1,
                    background: "#FFFFFF",
                    border: "1px solid #F1F5F9",
                    borderRadius: "16px",
                    padding: "18px 20px",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "12px",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px",
                          marginBottom: "6px",
                        }}
                      >
                        <span
                          style={{
                            padding: "4px 10px",
                            borderRadius: "999px",
                            background: color + "12",
                            color,
                            fontSize: "12px",
                            fontWeight: 700,
                            letterSpacing: "0.02em",
                          }}
                        >
                          {activity.activityType.replaceAll("_", " ")}
                        </span>
                      </div>

                      <p
                        style={{
                          margin: 0,
                          fontSize: "15px",
                          lineHeight: 1.6,
                          color: "#374151",
                        }}
                      >
                        {activity.description || "No description provided."}
                      </p>
                    </div>

                    <div
                      style={{
                        fontSize: "12px",
                        color: "#64748B",
                        whiteSpace: "nowrap",
                        fontWeight: 500,
                      }}
                    >
                      {formatDate(activity.createdAt)}
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: "14px",
                      paddingTop: "12px",
                      borderTop: "1px solid #F3F4F6",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "13px",
                      color: "#6B7280",
                    }}
                  >
                    <div
                      style={{
                        width: "26px",
                        height: "26px",
                        borderRadius: "999px",
                        background: "#EEF2FF",
                        color: "#4338CA",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "11px",
                        fontWeight: 700,
                      }}
                    >
                      {(activity.performedBy || "S").charAt(0).toUpperCase()}
                    </div>

                    <span>
                      Performed by{" "}
                      <strong style={{ color: "#111827" }}>
                        {activity.performedBy || "System"}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
