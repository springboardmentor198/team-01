import { useState } from "react";
import Layout from "../../components/Layout/Layout";
import { api } from "../../services/api";
import "./Security.css";

import {
  LuShieldCheck,
  LuLock,
  LuKeyRound,
  LuMonitor,
  LuSmartphone,
  LuLaptop,
  LuCircleCheck,
  LuTriangleAlert,
  LuLogOut,
  LuEye,
  LuEyeOff,
} from "react-icons/lu";

function Security() {
  const currentUser = api.getCurrentUser();

  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [sessions, setSessions] = useState([
    {
      id: 1,
      device: "Current Device",
      type: "laptop",
      browser: "Chrome",
      location: "Current session",
      lastActive: "Active now",
      current: true,
    },
    {
      id: 2,
      device: "Windows PC",
      type: "monitor",
      browser: "Chrome",
      location: "Unknown location",
      lastActive: "2 hours ago",
      current: false,
    },
    {
      id: 3,
      device: "Android Device",
      type: "smartphone",
      browser: "Mobile Browser",
      location: "Unknown location",
      lastActive: "Yesterday",
      current: false,
    },
  ]);

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setPasswordMessage("");
  };

  const handlePasswordSubmit = (event) => {
    event.preventDefault();

    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      setPasswordMessage("Please fill in all password fields.");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordMessage(
        "New password must contain at least 8 characters."
      );
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage("New password and confirm password do not match.");
      return;
    }

    setPasswordMessage(
      "Password validation completed. Backend password update is not connected yet."
    );

    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleLogoutSession = (sessionId) => {
    setSessions((prev) =>
      prev.filter((session) => session.id !== sessionId)
    );
  };

  const handleLogoutAll = () => {
    setSessions((prev) =>
      prev.filter((session) => session.current)
    );
  };

  const getDeviceIcon = (type) => {
    if (type === "smartphone") {
      return <LuSmartphone size={22} />;
    }

    if (type === "monitor") {
      return <LuMonitor size={22} />;
    }

    return <LuLaptop size={22} />;
  };

  return (
    <Layout title="Security">
      <div className="security-page">

        {/* ================= HEADER ================= */}

        <div className="security-header">
          <div>
            <div className="security-eyebrow">
              ACCOUNT SECURITY
            </div>

            <h1>Security & Privacy</h1>

            <p>
              Manage your password, authentication settings and active
              sessions.
            </p>
          </div>

          <div className="security-header-icon">
            <LuShieldCheck size={30} />
          </div>
        </div>

        {/* ================= SECURITY STATUS ================= */}

        <div className="security-status-card">

          <div className="security-status-icon">
            <LuShieldCheck size={25} />
          </div>

          <div className="security-status-content">
            <h3>Your account is protected</h3>

            <p>
              Keep your password secure and review active sessions
              regularly.
            </p>
          </div>

          <div className="security-status-badge">
            <LuCircleCheck size={16} />
            Secure
          </div>

        </div>

        {/* ================= ACCOUNT INFORMATION ================= */}

        <section className="security-card">

          <div className="security-card-header">
            <div className="security-card-title">
              <div className="security-section-icon">
                <LuKeyRound size={20} />
              </div>

              <div>
                <h2>Account Security</h2>
                <p>Basic security information for your account.</p>
              </div>
            </div>
          </div>

          <div className="security-info-grid">

            <div className="security-info-item">
              <span>Account</span>
              <strong>
                {currentUser?.email || "Not available"}
              </strong>
            </div>

            <div className="security-info-item">
              <span>Role</span>
              <strong>
                {currentUser?.role || "User"}
              </strong>
            </div>

            <div className="security-info-item">
              <span>Account Status</span>
              <strong className="security-active-text">
                {currentUser?.status || "Active"}
              </strong>
            </div>

          </div>

        </section>

        {/* ================= CHANGE PASSWORD ================= */}

        <section className="security-card">

          <div className="security-card-header">
            <div className="security-card-title">

              <div className="security-section-icon">
                <LuLock size={20} />
              </div>

              <div>
                <h2>Change Password</h2>
                <p>
                  Update your password to keep your account secure.
                </p>
              </div>

            </div>
          </div>

          <form
            className="security-password-form"
            onSubmit={handlePasswordSubmit}
          >

            <div className="security-field">
              <label htmlFor="currentPassword">
                Current Password
              </label>

              <div className="password-input-wrapper">
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type={showPassword ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter current password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword((prev) => !prev)
                  }
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <LuEyeOff size={18} />
                  ) : (
                    <LuEye size={18} />
                  )}
                </button>
              </div>
            </div>

            <div className="security-field">
              <label htmlFor="newPassword">
                New Password
              </label>

              <input
                id="newPassword"
                name="newPassword"
                type={showPassword ? "text" : "password"}
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                placeholder="Enter new password"
              />

              <small>
                Use at least 8 characters.
              </small>
            </div>

            <div className="security-field">
              <label htmlFor="confirmPassword">
                Confirm New Password
              </label>

              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="Confirm new password"
              />
            </div>

            <div className="security-password-actions">

              <button
                type="submit"
                className="security-primary-btn"
              >
                <LuLock size={17} />
                Update Password
              </button>

            </div>

          </form>

          {passwordMessage && (
            <div className="security-message">
              <LuTriangleAlert size={17} />
              <span>{passwordMessage}</span>
            </div>
          )}

        </section>

        {/* ================= TWO FACTOR AUTH ================= */}

        <section className="security-card">

          <div className="security-card-header">

            <div className="security-card-title">

              <div className="security-section-icon">
                <LuShieldCheck size={20} />
              </div>

              <div>
                <h2>Two-Factor Authentication</h2>

                <p>
                  Add an extra layer of protection to your account.
                </p>
              </div>

            </div>

            <button
              type="button"
              className={`security-toggle ${
                twoFactorEnabled ? "enabled" : ""
              }`}
              onClick={() =>
                setTwoFactorEnabled((prev) => !prev)
              }
              aria-label="Toggle two-factor authentication"
            >
              <span />
            </button>

          </div>

          <div className="security-feature-row">

            <div className="security-feature-icon">
              {twoFactorEnabled ? (
                <LuCircleCheck size={22} />
              ) : (
                <LuTriangleAlert size={22} />
              )}
            </div>

            <div className="security-feature-content">

              <strong>
                {twoFactorEnabled
                  ? "Two-factor authentication is enabled"
                  : "Two-factor authentication is disabled"}
              </strong>

              <p>
                {twoFactorEnabled
                  ? "Your account requires an additional verification step."
                  : "Enable this feature when two-factor authentication is supported by the backend."}
              </p>

            </div>

            <span
              className={`security-feature-status ${
                twoFactorEnabled ? "enabled" : "disabled"
              }`}
            >
              {twoFactorEnabled ? "Enabled" : "Disabled"}
            </span>

          </div>

        </section>

        {/* ================= ACTIVE SESSIONS ================= */}

        <section className="security-card">

          <div className="security-card-header">

            <div className="security-card-title">

              <div className="security-section-icon">
                <LuMonitor size={20} />
              </div>

              <div>
                <h2>Active Sessions</h2>

                <p>
                  Review devices currently associated with your account.
                </p>
              </div>

            </div>

            {sessions.length > 1 && (
              <button
                type="button"
                className="security-outline-btn"
                onClick={handleLogoutAll}
              >
                <LuLogOut size={16} />
                Sign Out Other Sessions
              </button>
            )}

          </div>

          <div className="security-sessions">

            {sessions.length === 0 ? (
              <div className="security-empty">
                <LuMonitor size={28} />

                <h3>No active sessions</h3>

                <p>
                  There are no active sessions associated with this
                  account.
                </p>
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  className="security-session"
                  key={session.id}
                >

                  <div className="session-device-icon">
                    {getDeviceIcon(session.type)}
                  </div>

                  <div className="session-details">

                    <div className="session-title-row">

                      <h3>{session.device}</h3>

                      {session.current && (
                        <span className="current-session-badge">
                          Current
                        </span>
                      )}

                    </div>

                    <p>
                      {session.browser} • {session.location}
                    </p>

                    <span className="session-time">
                      {session.lastActive}
                    </span>

                  </div>

                  {!session.current && (
                    <button
                      type="button"
                      className="session-logout-btn"
                      onClick={() =>
                        handleLogoutSession(session.id)
                      }
                    >
                      <LuLogOut size={16} />
                      Sign Out
                    </button>
                  )}

                </div>
              ))
            )}

          </div>

        </section>

        {/* ================= SECURITY NOTICE ================= */}

        <div className="security-notice">

          <LuTriangleAlert size={20} />

          <div>
            <strong>Security reminder</strong>

            <p>
              Never share your password or authentication credentials
              with anyone. Review your active sessions if you notice
              unfamiliar activity.
            </p>
          </div>

        </div>

      </div>
    </Layout>
  );
}

export default Security;