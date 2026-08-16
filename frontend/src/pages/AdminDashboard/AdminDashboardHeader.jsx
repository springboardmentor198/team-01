import { LuArrowLeft, LuBell, LuSearch, LuCircleUser } from "react-icons/lu";

function AdminDashboardHeader({ notificationCount = 0 }) {
  return (
    <header className="admin-dashboard-header">
      {/* =====================================================
          LEFT SIDE
      ====================================================== */}

      <div className="admin-dashboard-header-left">
        <button
          type="button"
          className="admin-dashboard-back-button"
          onClick={() => window.history.back()}
          aria-label="Go back"
        >
          <LuArrowLeft size={19} />
        </button>

        <div className="admin-dashboard-title">
          <h1>Admin Dashboard</h1>

          <p>Live platform data and operational status.</p>
        </div>
      </div>

      {/* =====================================================
          RIGHT SIDE
      ====================================================== */}

      <div className="admin-dashboard-header-actions">
        {/* =================================================
            SEARCH
        ================================================== */}

        <div className="admin-dashboard-search">
          <LuSearch size={17} />

          <input
            type="text"
            placeholder="Search anything..."
            aria-label="Search anything"
          />

          <span className="admin-dashboard-search-shortcut">Ctrl + K</span>
        </div>

        {/* =================================================
            NOTIFICATIONS
        ================================================== */}

        <button
          type="button"
          className="admin-dashboard-header-icon"
          aria-label="Notifications"
        >
          <LuBell size={19} />

          {notificationCount > 0 && <span className="admin-dashboard-notification-count">{notificationCount}</span>}
        </button>

        {/* =================================================
            ADMIN PROFILE
        ================================================== */}

        <button
          type="button"
          className="admin-dashboard-header-icon"
          aria-label="Admin profile"
        >
          <LuCircleUser size={20} />
        </button>
      </div>
    </header>
  );
}

export default AdminDashboardHeader;
