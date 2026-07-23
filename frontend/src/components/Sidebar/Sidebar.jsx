import "./Sidebar.css";
import logo from "../../assets/images/logo.png";

import { NavLink, useNavigate } from "react-router-dom";
import { api } from "../../services/api";

import { RiDashboardFill } from "react-icons/ri";
import { FiSearch, FiLogOut } from "react-icons/fi";
import { IoNotificationsOutline } from "react-icons/io5";
import { HiOutlineClipboardDocumentList } from "react-icons/hi2";
import { CgProfile } from "react-icons/cg";

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    api.logout();
    navigate("/login");
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
  if (api.getCurrentUser().role === "ADMIN") menuItems.push({ name: "Admin", path: "/admin", icon: <HiOutlineClipboardDocumentList /> });

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

      <button className="logout" onClick={handleLogout}>

        <FiLogOut />

        <span>Logout</span>

      </button>

    </aside>
  );
}

export default Sidebar;
