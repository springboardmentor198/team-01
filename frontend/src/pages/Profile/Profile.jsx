import { useState, useEffect } from "react";
import Layout from "../../components/Layout/Layout";
import { api } from "../../services/api";
import "./Profile.css";

import {
  LuBriefcase,
  LuMail,
  LuBuilding,
  LuCalendar,
  LuPencil,
  LuIdCard,
  LuPhone,
  LuMapPin,
  LuUserCog,
  LuBell,
  LuLock,
  LuChevronRight,
  LuX,
  LuCheck,
  LuCircleCheck,
} from "react-icons/lu";
import { useNavigate } from "react-router-dom";

// NOTE: stats + activity were removed from here — they used to be hardcoded
// dummy numbers/text. Once the backend exposes real endpoints for these,
// wire them up in fetchProfile() below (see TODO markers).
const ROLE_CONFIG = {
  BUYER: {
    label: "Buyer",
    jobTitle: "Property Buyer",
    department: "Retail Client",
    badgeColor: "#DBEAFE",
    badgeText: "#2563EB",
  },
  AGENT: {
    label: "Agent",
    jobTitle: "Property Agent",
    department: "Sales & Listings",
    badgeColor: "#DCFCE7",
    badgeText: "#16A34A",
  },
  LEGAL_REVIEWER: {
    label: "Legal Reviewer",
    jobTitle: "Legal Reviewer",
    department: "Legal & Compliance",
    badgeColor: "#EDE9FE",
    badgeText: "#7C3AED",
  },
  BANK: {
    label: "Bank",
    jobTitle: "Bank Representative",
    department: "Loan & Valuation",
    badgeColor: "#FEF3C7",
    badgeText: "#B45309",
  },
  ADMIN: {
    label: "Admin",
    jobTitle: "System Administrator",
    department: "Platform Operations",
    badgeColor: "#FEE2E2",
    badgeText: "#DC2626",
    isAdmin: true,
  },
};

const BASE_SETTINGS = [
  { icon: LuUserCog, title: "Account", desc: "Update your personal details", action: "modal" },
  { icon: LuBell, title: "Notifications", desc: "Manage alerts and email preferences", path: "/notifications" },
  { icon: LuLock, title: "Security", desc: "Password and two-factor authentication", comingSoon: true },
];


function getInitials(name) {
  if (!name) return "??";
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatJoinDate(dateStr) {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  } catch {
    return "—";
  }
}

function Profile() {
  const navigate = useNavigate();
  const currentUser = api.getCurrentUser();

  const roleKey = ROLE_CONFIG[currentUser.role] ? currentUser.role : "BUYER";
  const role = ROLE_CONFIG[roleKey];

  const [fullName, setFullName] = useState(currentUser.fullName || "User");
  const [email, setEmail] = useState(currentUser.email || "");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [joinDate, setJoinDate] = useState(null);
  const [location, setLocation] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(true);

  // Real stats/activity — empty until backend endpoints are confirmed.
  // TODO: once a real endpoint exists, change these back to:
  // const [stats, setStats] = useState([]);
  // const [activity, setActivity] = useState([]);
  // and call setStats(...) / setActivity(...) inside fetchProfile() below.
  const [stats] = useState([]);
  const [activity] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formBio, setFormBio] = useState("");

  useEffect(() => {
    if (!api.isAuthenticated()) {
      navigate("/login");
      return;
    }
    const fetchProfile = async () => {
      try {
        const profile = await api.getUserProfile();
        setFullName(profile.name || "User");
        setEmail(profile.email || "");
        setPhone(profile.phoneNumber || "");
        setBio(profile.bio || "");
        setJoinDate(profile.joinDate || null);
        setLocation(profile.location || "");
        setAvatarUrl(profile.avatarUrl || "");

        // TODO: replace with real calls once endpoints are confirmed, e.g:
        // const statsData = await api.getUserStats();
        // setStats(statsData);
        // const activityData = await api.getUserActivity();
        // setActivity(activityData);
      } catch (err) {
        console.error("Failed to load user profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const openModal = () => {
    setFormName(fullName);
    setFormEmail(email);
    setFormPhone(phone);
    setFormBio(bio);
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const updated = await api.updateUserProfile({
        name: formName.trim(),
        phoneNumber: formPhone.trim(),
        bio: formBio.trim(),
      });
      setFullName(updated.name);
      setPhone(updated.phoneNumber);
      setBio(updated.bio);
      localStorage.setItem("fullName", updated.name);
      setShowModal(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to update profile");
    }
  };

  const settingsRows = BASE_SETTINGS;

  if (loading) {
    return (
      <Layout title="Profile">
        <div style={{ padding: "80px", textAlign: "center", color: "#6B7280", fontFamily: "inherit" }}>
          Loading profile...
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Profile">
      <div className="profile-page">
        {/* HERO */}
        <section className="profile-hero">
          <div className="profile-hero-left">
            <div className="profile-avatar">
              {avatarUrl ? (
                <img src={avatarUrl} alt={fullName} className="avatar-img" />
              ) : (
                getInitials(fullName)
              )}
            </div>
            <div className="profile-hero-info">
              <h2>{fullName}</h2>
              <div className="profile-role">
                <LuBriefcase />
                <span>{role.jobTitle}</span>
                <span
                  className="role-badge"
                  style={{ background: role.badgeColor, color: role.badgeText }}
                >
                  {role.label}
                </span>
              </div>
              <div className="profile-meta">
                <span>
                  <LuMail /> {email}
                </span>
                <span>
                  <LuBuilding /> {role.department}
                </span>
                <span>
                  <LuCalendar /> Joined {formatJoinDate(joinDate)}
                </span>
              </div>
            </div>
          </div>
          <div className="profile-hero-actions">
            <button className="edit-profile-btn" onClick={openModal}>
              <LuPencil /> Edit Profile
            </button>
          </div>
        </section>

        {/* STATS */}
        <section className="stats-grid">
          {stats.length > 0 ? (
            stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div className="stat-card" key={stat.label}>
                  <div
                    className="stat-icon"
                    style={{ background: `${stat.color}22`, color: stat.color }}
                  >
                    <Icon />
                  </div>
                  <div>
                    <div className="stat-label">{stat.label}</div>
                    <div className="stat-value">{stat.value}</div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="stat-card" style={{ gridColumn: "1 / -1", textAlign: "center", color: "#9CA3AF" }}>
              No stats available yet
            </div>
          )}
        </section>

        {/* CONTENT GRID */}
        <section className="profile-content">
          <div className="profile-card">
            <h3 className="card-title">About</h3>
            <div className="about-list">
              <div className="about-item">
                <LuIdCard />
                <div>
                  <div className="about-label">Role</div>
                  <div className="about-value">{role.label}</div>
                </div>
              </div>
              <div className="about-item">
                <LuPhone />
                <div>
                  <div className="about-label">Phone</div>
                  <div className="about-value">{phone || "Not specified"}</div>
                </div>
              </div>
              <div className="about-item">
                <LuMapPin />
                <div>
                  <div className="about-label">Location</div>
                  <div className="about-value">{location || "Not specified"}</div>
                </div>
              </div>
            </div>
            {bio && (
              <div className="bio-section" style={{ marginTop: "20px", borderTop: "1px solid #F3F4F6", paddingTop: "16px" }}>
                <h4 style={{ fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>Bio</h4>
                <p style={{ fontSize: "14px", color: "#4B5563", lineHeight: "1.5" }}>{bio}</p>
              </div>
            )}

            <h3 className="card-title" style={{ marginTop: "24px" }}>
              Recent Activity
            </h3>
            <div className="activity-list">
              {activity.length > 0 ? (
                activity.map((item) => (
                  <div className="activity-item" key={item.title + item.time}>
                    <div className="activity-dot" />
                    <div className="activity-content">
                      <div className="activity-top">
                        <h4>{item.title}</h4>
                        <span>{item.time}</span>
                      </div>
                      <p>{item.desc}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ fontSize: "14px", color: "#9CA3AF", padding: "12px 0" }}>
                  No recent activity yet
                </p>
              )}
            </div>
          </div>

          <div className="profile-card">
            <h3 className="card-title">Settings</h3>
            <div className="settings-list">
              {settingsRows.map((item) => {
                const Icon = item.icon;
                const handleClick = () => {
                  if (item.action === "modal") {
                    openModal();
                  } else if (item.path) {
                    navigate(item.path);
                  }
                  // comingSoon items intentionally do nothing yet
                };
                return (
                  <button
                    className="settings-item"
                    key={item.title}
                    onClick={handleClick}
                  >
                    <div className="settings-icon">
                      <Icon />
                    </div>
                    <div className="settings-text">
                      <h4>
                        {item.title}
                        {item.comingSoon && (
                          <span style={{ fontSize: "10px", fontWeight: 600, color: "#9CA3AF", marginLeft: "8px" }}>
                            COMING SOON
                          </span>
                        )}
                      </h4>
                      <p>{item.desc}</p>
                    </div>
                    <LuChevronRight className="chevron" />
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      {/* EDIT PROFILE MODAL */}
      {showModal && (
        <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-card">
            <div className="modal-header">
              <div>
                <h3>Edit Profile</h3>
                <p>Update your personal information</p>
              </div>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <LuX />
              </button>
            </div>
            <div className="modal-body">
              <div className="avatar-edit-row">
                <div className="profile-avatar">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={formName} className="avatar-img" />
                  ) : (
                    getInitials(formName)
                  )}
                </div>
                <div>
                  <button className="btn-secondary">Change photo</button>
                  <p>JPG or PNG, max 2MB</p>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Full name</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>
                    Role <span className="hint">(fixed)</span>
                  </label>
                  <input type="text" value={role.label} disabled readOnly />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>
                    Email <span className="hint">(fixed)</span>
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    disabled
                    readOnly
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group full">
                <label>Bio</label>
                <textarea
                  placeholder="Tell us a little about yourself"
                  value={formBio}
                  onChange={(e) => setFormBio(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleSave}>
                <LuCheck /> Save changes
              </button>
            </div>
          </div>
        </div>
      )}

      {showToast && (
        <div className="toast show">
          <LuCircleCheck /> Profile updated successfully
        </div>
      )}
    </Layout>
  );
}

export default Profile;
