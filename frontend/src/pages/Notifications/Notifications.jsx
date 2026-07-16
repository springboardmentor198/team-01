import Layout from "../../components/Layout/Layout";
import "./Notifications.css";

import {
  LuFileText,
  LuTriangleAlert,
  LuClock,
  LuCircleCheck,
} from "react-icons/lu";

const notifications = [
  {
    id: 1,
    title: "Property Report Generated",
    message: "Report for 24 Lakeview Street is ready.",
    time: "10 mins ago",
    icon: LuFileText,
    color: "#2563EB",
    bg: "#DBEAFE",
  },
  {
    id: 2,
    title: "High Risk Detected",
    message: "Palm Residency requires immediate review.",
    time: "30 mins ago",
    icon: LuTriangleAlert,
    color: "#DC2626",
    bg: "#FEE2E2",
  },
  {
    id: 3,
    title: "Pending Review",
    message: "18 Green Avenue is waiting for approval.",
    time: "1 hour ago",
    icon: LuClock,
    color: "#D97706",
    bg: "#FEF3C7",
  },
  {
    id: 4,
    title: "Verification Completed",
    message: "Skyline Towers verification completed successfully.",
    time: "Yesterday",
    icon: LuCircleCheck,
    color: "#16A34A",
    bg: "#DCFCE7",
  },
];

export default function Notifications() {
  return (
    <Layout title="Notifications">

      <div className="notifications-page">

        <div className="notifications-header">

          <h2>Recent Notifications</h2>

          <span>{notifications.length} Notifications</span>

        </div>

        <div className="notifications-list">

          {notifications.map((item) => {

            const Icon = item.icon;

            return (

              <div
                key={item.id}
                className="notification-card"
              >

                <div
                  className="notification-icon"
                  style={{
                    background: item.bg,
                    color: item.color,
                  }}
                >

                  <Icon size={22} />

                </div>

                <div className="notification-content">

                  <div className="notification-top">

                    <h3>{item.title}</h3>

                    <span>{item.time}</span>

                  </div>

                  <p>{item.message}</p>

                </div>

              </div>

            );

          })}

        </div>

      </div>

    </Layout>
  );
}