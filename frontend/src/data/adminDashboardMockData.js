import {
  LuUsers,
  LuBadgeCheck,
  LuClipboardList,
  LuUserCheck,
  LuHeadphones,
} from "react-icons/lu";

export const dashboardStats = [
  {
    id: "total-users",
    title: "Total Users",
    value: "24,850",
    trend: "12.5%",
    trendType: "positive",
    subtitle: "vs last 7 days",
    icon: LuUsers,
    iconClass: "purple",
  },

  {
    id: "verified-professionals",
    title: "Verified Professionals",
    value: "1,659",
    trend: "8.4%",
    trendType: "positive",
    subtitle: "vs last 7 days",
    icon: LuBadgeCheck,
    iconClass: "green",
  },

  {
    id: "pending-approvals",
    title: "Pending Approvals",
    value: "23",
    trend: "15.3%",
    trendType: "positive",
    subtitle: "vs last 7 days",
    icon: LuClipboardList,
    iconClass: "orange",
  },

  {
    id: "active-users",
    title: "Active Users",
    value: "8,492",
    trend: "9.1%",
    trendType: "positive",
    subtitle: "vs last 7 days",
    icon: LuUserCheck,
    iconClass: "blue",
  },

  {
    id: "open-tickets",
    title: "Open Tickets",
    value: "42",
    trend: "3 Urgent",
    trendType: "negative",
    subtitle: "",
    icon: LuHeadphones,
    iconClass: "red",
  },
];
