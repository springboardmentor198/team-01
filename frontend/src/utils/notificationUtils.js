import {
  LuBell,
  LuBuilding2,
  LuCircleCheck,
  LuClock,
  LuFileText,
  LuShieldCheck,
  LuTriangleAlert,
  LuUser,
} from "react-icons/lu";

const iconMap = [
  { match: /RISK|HIGH_RISK|CRITICAL/, icon: LuTriangleAlert, color: "#DC2626", bg: "#FEE2E2" },
  { match: /DOCUMENT|REPORT/, icon: LuFileText, color: "#2563EB", bg: "#DBEAFE" },
  { match: /LEGAL|FINANCIAL|REVIEW/, icon: LuShieldCheck, color: "#7C3AED", bg: "#EDE9FE" },
  { match: /PROPERTY|LISTING|OFFER|VISIT/, icon: LuBuilding2, color: "#2563EB", bg: "#DBEAFE" },
  { match: /WELCOME|PROFILE|USER|ROLE/, icon: LuUser, color: "#16A34A", bg: "#DCFCE7" },
  { match: /ADMIN|SYSTEM/, icon: LuBell, color: "#D97706", bg: "#FEF3C7" },
];

export function getNotificationVisuals(type) {
  const normalized = type || "";
  const found = iconMap.find((entry) => entry.match.test(normalized));
  if (found) return found;
  return { icon: LuClock, color: "#6B7280", bg: "#F3F4F6" };
}

export function formatNotificationTime(value) {
  if (!value) return "Just now";

  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString();
}

export function getPriorityClass(priority) {
  return (priority || "MEDIUM").toLowerCase();
}
