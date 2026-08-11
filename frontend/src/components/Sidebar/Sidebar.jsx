import { useState } from "react";
import "./Sidebar.css";
import logo from "../../assets/images/logo.png";

import { NavLink, useNavigate } from "react-router-dom";
import { api } from "../../services/api";

import { RiDashboardFill } from "react-icons/ri";
import {
  FiSearch,
  FiLogOut,
  FiAlertTriangle,
  FiFileText,
  FiCheckSquare,
  FiUser,
  FiClock,
  FiShield,
  FiClipboard,
  FiDollarSign,
} from "react-icons/fi";
import { IoNotificationsOutline } from "react-icons/io5";
import { HiOutlineClipboardDocumentList } from "react-icons/hi2";
import { CgProfile } from "react-icons/cg";

// Each role gets its own Dashboard destination plus only the links
// relevant to that role's workflow, instead of one generic menu for everyone.
function getMenuItemsForRole(role) {
  const dashboardPathByRole = {
    BUYER: "/buyer/dashboard",
    AGENT: "/agent/dashboard",
    LEGAL_REVIEWER: "/legal/dashboard",
    BANK: "/bank/dashboard",
    ADMIN: "/admin/dashboard",
  };

  const dashboardItem = {
    name: "Dashboard",
    path: dashboardPathByRole[role] || "/buyer/dashboard",
    icon: <RiDashboardFill />,
  };

  const notificationsItem = {
    name: "Notifications",
    path: "/notifications",
    icon: <IoNotificationsOutline />,
  };

  const profileItem = {
    name: "Profile",
    path: "/profile",
    icon: <CgProfile />,
  };

  if (role === "BUYER") {
    return [
      dashboardItem,
      { name: "Properties", path: "/properties", icon: <FiSearch /> },
      notificationsItem,
      { name: "Reports", path: "/reports", icon: <HiOutlineClipboardDocumentList /> },
      profileItem,
    ];
  }

  if (role === "AGENT") {
    return [
      dashboardItem,
      { name: "Properties", path: "/agent/properties", icon: <FiSearch /> },
      { name: "Documents", path: "/agent/documents", icon: <FiFileText /> },
      { name: "Permits", path: "/agent/permits", icon: <FiCheckSquare /> },
      { name: "Ownership", path: "/agent/ownership", icon: <FiUser /> },
      { name: "Risk Summary", path: "/agent/risk-summary", icon: <FiShield /> },
      { name: "Activity Timeline", path: "/agent/activity", icon: <FiClock /> },
      notificationsItem,
      profileItem,
    ];
  }

  if (role === "LEGAL_REVIEWER") {
    return [
      dashboardItem,
      { name: "Pending Reviews", path: "/legal/pending-reviews", icon: <FiClipboard /> },
      { name: "Legal Documents", path: "/legal/documents", icon: <FiFileText /> },
      { name: "Risk Assessments", path: "/legal/risk-assessments", icon: <FiShield /> },
      { name: "Activity Timeline", path: "/legal/activity", icon: <FiClock /> },
      { name: "Reports", path: "/legal/reports", icon: <HiOutlineClipboardDocumentList /> },
      notificationsItem,
      profileItem,
    ];
  }

  if (role === "BANK") {
    return [
      dashboardItem,
      { name: "Loan Requests", path: "/bank/loan-requests", icon: <FiDollarSign /> },
      { name: "Financial Review", path: "/bank/financial-review", icon: <FiFileText /> },
      { name: "Risk Analysis", path: "/bank/risk-analysis", icon: <FiShield /> },
      { name: "Reports", path: "/bank/reports", icon: <HiOutlineClipboardDocumentList /> },
      notificationsItem,
      profileItem,
    ];
  }

  if (role === "ADMIN") {
    return [
      dashboardItem,
      { name: "Audit Logs", path: "/audit-logs", icon: <FiFileText /> },
      notificationsItem,
      profileItem,
    ];
  }

  // Fallback for any unexpected/unset role
  return [dashboardItem, notificationsItem, profileItem];
}

function Sidebar() {
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    api.logout();
    navigate("/login");
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const role = api.getCurrentUser()?.role;
  const menuItems = getMenuItemsForRole(role);

  return (
    <aside className="sidebar">
      <div>
        <div className="logo-section">
          <img src={logo} alt="Logo" />
          <h2>DueDiligence</h2>
        </div>

        <nav className="menu">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                isActive ? "menu-item active" : "menu-item"
              }
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="sidebar-bottom">
        <div className="support-card">
          <strong>Need help?</strong>
          <p>We're here to help with any queries.</p>
          <button type="button">Contact Support</button>
        </div>
        <button className="logout" onClick={handleLogoutClick}>
          <FiLogOut />
          <span>Logout</span>
        </button>
      </div>

      {showLogoutConfirm && (
        <div className="logout-overlay" onClick={cancelLogout}>
          <div className="logout-modal" onClick={(e) => e.stopPropagation()}>
            <div className="logout-modal-icon">
              <FiAlertTriangle />
            </div>
            <h3>Log out of DueDiligence?</h3>
            <p>You'll need to sign in again to access your account.</p>
            <div className="logout-modal-actions">
              <button className="logout-cancel-btn" onClick={cancelLogout}>
                Stay Signed In
              </button>
              <button className="logout-confirm-btn" onClick={confirmLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;
