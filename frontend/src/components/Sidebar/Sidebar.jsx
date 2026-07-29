import { useState } from "react";
import "./Sidebar.css";
import logo from "../../assets/images/logo.png";

import { NavLink, useNavigate } from "react-router-dom";
import { api } from "../../services/api";

import { RiDashboardFill } from "react-icons/ri";
import { FiSearch, FiLogOut, FiAlertTriangle } from "react-icons/fi";
import { IoNotificationsOutline } from "react-icons/io5";
import { HiOutlineClipboardDocumentList } from "react-icons/hi2";
import { CgProfile } from "react-icons/cg";

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

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <RiDashboardFill />,
    },
    {
      name: "Properties",
      path: "/properties",
      icon: <FiSearch />,
    },
    {
      name: "Notifications",
      path: "/notifications",
      icon: <IoNotificationsOutline />,
    },
    {
      name: "Reports",
      path: "/reports",
      icon: <HiOutlineClipboardDocumentList />,
    },
    {
      name: "Profile",
      path: "/profile",
      icon: <CgProfile />,
    },
  ];
  if (api.getCurrentUser().role === "ADMIN") menuItems.push({ name: "Admin", path: "/admin/dashboard", icon: <HiOutlineClipboardDocumentList /> });

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

      <button className="logout" onClick={handleLogoutClick}>

        <FiLogOut />

        <span>Logout</span>

      </button>

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
