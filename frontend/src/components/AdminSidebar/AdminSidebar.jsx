import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FiActivity,
  FiBarChart2,
  FiBookOpen,
  FiBriefcase,
  FiClipboard,
  FiCreditCard,
  FiFileText,
  FiHelpCircle,
  FiHome,
  FiKey,
  FiLayers,
  FiLogOut,
  FiSettings,
  FiShield,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { HiOutlineOfficeBuilding } from "react-icons/hi";
import { RiCustomerService2Line, RiUserSettingsLine } from "react-icons/ri";
import { api } from "../../services/api";
import "./AdminSidebar.css";

const sections = [
  {
    label: "",
    items: [
      {
        label: "Dashboard",
        path: "/admin/dashboard",
        icon: FiHome,
      },
    ],
  },

  {
    label: "Verification",
    items: [
      {
        label: "Role Requests",
        path: "/admin/role-requests",
        icon: RiUserSettingsLine,
      },
      {
        label: "Property Approvals",
        icon: HiOutlineOfficeBuilding,
        badge: "8",
      },
      {
        label: "Advisor Verifications",
        icon: FiClipboard,
        badge: "5",
      },
    ],
  },

  {
    label: "Platform",
    items: [
      {
        label: "Users",
        icon: FiUsers,
      },
      {
        label: "Agents",
        icon: FiBriefcase,
      },
      {
        label: "Legal Advisors",
        icon: FiBookOpen,
      },
      {
        label: "Financial Institutions",
        icon: FiCreditCard,
      },
      {
        label: "Properties",
        icon: HiOutlineOfficeBuilding,
      },
      {
        label: "Transactions",
        icon: FiLayers,
      },
      {
        label: "Enquiries",
        icon: FiHelpCircle,
      },
      {
        label: "Bookings",
        icon: FiFileText,
      },
    ],
  },

  {
    label: "Support & Security",
    items: [
      {
        label: "Support Tickets",
        path: "/admin/support-tickets",
        icon: RiCustomerService2Line,
      },
      {
        label: "Security Center",
        icon: FiShield,
      },
      {
        label: "Audit Logs",
        path: "/audit-logs",
        icon: FiClipboard,
      },
    ],
  },

  {
    label: "Analytics",
    items: [
      {
        label: "Reports",
        path: "/reports",
        icon: FiBarChart2,
      },
      {
        label: "Activity Analytics",
        icon: FiActivity,
      },
    ],
  },

  {
    label: "Settings",
    items: [
      {
        label: "Settings",
        icon: FiSettings,
      },
      {
        label: "System Logs",
        icon: FiKey,
      },
      {
        label: "Logout",
        icon: FiLogOut,
        logout: true,
      },
    ],
  },
];

function AdminSidebar() {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [pendingRoleRequests, setPendingRoleRequests] = useState(0);

  useEffect(() => {
    const loadPendingRoleRequests = async () => {
      try {
        const requests = await api.getAdminRoleRequests({ status: "PENDING" });
        setPendingRoleRequests(Array.isArray(requests) ? requests.length : 0);
      } catch {
        setPendingRoleRequests(0);
      }
    };
    loadPendingRoleRequests();
    const intervalId = window.setInterval(loadPendingRoleRequests, 30000);
    return () => window.clearInterval(intervalId);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    window.location.href = "/login";
  };

  // Close modal using Escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setShowLogoutModal(false);
      }
    };

    if (showLogoutModal) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showLogoutModal]);

  return (
    <>
      <aside className="admin-sidebar">
        <div className="admin-sidebar-scroll">
          {/* Brand */}
          <div className="admin-brand">
            <span className="admin-brand-mark">
              <HiOutlineOfficeBuilding />
            </span>

            <div>
              <strong>DueDiligence</strong>
              <small>Admin Console</small>
            </div>
          </div>

          {/* Navigation */}
          <nav className="admin-nav" aria-label="Admin navigation">
            {sections.map((section, index) => (
              <div className="admin-nav-section" key={section.label || index}>
                {section.label && <p>{section.label}</p>}

                {section.items.map((item) => (
                  <AdminNavItem
                    key={item.label}
                    item={{ ...item, badge: item.label === "Role Requests" && pendingRoleRequests ? pendingRoleRequests : item.badge }}
                    onLogout={() => setShowLogoutModal(true)}
                  />
                ))}
              </div>
            ))}
          </nav>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div
          className="logout-modal-overlay"
          onClick={() => setShowLogoutModal(false)}
        >
          <div
            className="logout-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-title"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Close */}
            <button
              type="button"
              className="logout-modal-close"
              onClick={() => setShowLogoutModal(false)}
              aria-label="Close"
            >
              <FiX />
            </button>

            {/* Icon */}
            <div className="logout-modal-icon">
              <FiLogOut />
            </div>

            {/* Content */}
            <div className="logout-modal-content">
              <h2 id="logout-title">Sign out?</h2>

              <p>
                Are you sure you want to sign out of the
                <strong> Admin Console</strong>?
              </p>

              <span>
                You will need to sign in again to access the admin dashboard.
              </span>
            </div>

            {/* Actions */}
            <div className="logout-modal-actions">
              <button
                type="button"
                className="logout-cancel-btn"
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="logout-confirm-btn"
                onClick={handleLogout}
              >
                <FiLogOut />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function AdminNavItem({ item, onLogout }) {
  const Icon = item.icon;

  const content = (
    <>
      <Icon />
      <span>{item.label}</span>

      {item.badge && <b className={item.label === "Role Requests" ? "admin-nav-alert-badge" : ""}>{item.badge}</b>}
    </>
  );

  // Logout
  if (item.logout) {
    return (
      <button
        type="button"
        className="admin-nav-item logout-item"
        onClick={onLogout}
      >
        {content}
      </button>
    );
  }

  // Navigation
  if (item.path) {
    return (
      <NavLink
        to={item.path}
        end={item.path === "/admin/dashboard"}
        className={({ isActive }) =>
          `admin-nav-item${isActive ? " active" : ""}`
        }
      >
        {content}
      </NavLink>
    );
  }

  // Non-navigation item
  return (
    <button type="button" className="admin-nav-item" onClick={() => {}}>
      {content}
    </button>
  );
}

export default AdminSidebar;
