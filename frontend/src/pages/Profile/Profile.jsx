import { useState } from "react";
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
  LuUsersRound,
  LuChevronRight,
  LuX,
  LuCheck,
  LuLogOut,
  LuCircleCheck,
} from "react-icons/lu";
import { useNavigate } from "react-router-dom";

const ROLE_CONFIG = {
  BUYER: {
    label: "Buyer",
    jobTitle: "Property Buyer",
    department: "Retail Client",
    badgeColor: "#DBEAFE",
    badgeText: "#2563EB",
    stats: [
      { icon: LuBuilding, label: "Properties Viewed", value: "18", color: "#2563EB" },
      { icon: LuIdCard, label: "Reports Requested", value: "6", color: "#22C55E" },
      { icon: LuCalendar, label: "Pending Reviews", value: "2", color: "#F59E0B" },
      { icon: LuMapPin, label: "Saved Listings", value: "11", color: "#EF4444" },
    ],
    activity: [
      { title: "Viewed property report", desc: "12 Lakeview Residency — Legal review complete", time: "2h ago" },
      { title: "Saved a listing", desc: "Greenfield Apartments, Block C", time: "1d ago" },
      { title: "Requested due diligence", desc: "Silver Oak Villa", time: "3d ago" },
    ],
  },
  AGENT: {
    label: "Agent",
    jobTitle: "Property Agent",
    department: "Sales & Listings",
    badgeColor: "#DCFCE7",
    badgeText: "#16A34A",
    stats: [
      { icon: LuBuilding, label: "Properties Listed", value: "34", color: "#2563EB" },
      { icon: LuIdCard, label: "Deals Closed", value: "9", color: "#22C55E" },
      { icon: LuCalendar, label: "Listings Pending", value: "5", color: "#F59E0B" },
      { icon: LuMapPin, label: "Client Rating", value: "4.8", color: "#EF4444" },
    ],
    activity: [
      { title: "Listed new property", desc: "42 Palm Grove Estate", time: "4h ago" },
      { title: "Closed a deal", desc: "Riverside Apartments, Unit 5B", time: "2d ago" },
      { title: "Updated listing photos", desc: "Sunset Heights Villa", time: "4d ago" },
    ],
  },
  LEGAL_REVIEWER: {
    label: "Legal Reviewer",
    jobTitle: "Legal Reviewer",
    department: "Legal & Compliance",
    badgeColor: "#EDE9FE",
    badgeText: "#7C3AED",
    stats: [
      { icon: LuBuilding, label: "Cases Reviewed", value: "27", color: "#2563EB" },
      { icon: LuIdCard, label: "Approved", value: "21", color: "#22C55E" },
      { icon: LuCalendar, label: "Flagged Risks", value: "4", color: "#F59E0B" },
      { icon: LuMapPin, label: "Pending Signatures", value: "2", color: "#EF4444" },
    ],
    activity: [
      { title: "Approved title deed", desc: "12 Lakeview Residency", time: "1h ago" },
      { title: "Flagged encumbrance risk", desc: "Silver Oak Villa", time: "1d ago" },
      { title: "Reviewed sale agreement", desc: "Greenfield Apartments, Block C", time: "2d ago" },
    ],
  },
  BANK: {
    label: "Bank",
    jobTitle: "Bank Representative",
    department: "Loan & Valuation",
    badgeColor: "#FEF3C7",
    badgeText: "#B45309",
    stats: [
      { icon: LuBuilding, label: "Properties Assessed", value: "15", color: "#2563EB" },
      { icon: LuIdCard, label: "Loans Approved", value: "8", color: "#22C55E" },
      { icon: LuCalendar, label: "Under Valuation", value: "3", color: "#F59E0B" },
      { icon: LuMapPin, label: "Loans Rejected", value: "1", color: "#EF4444" },
    ],
    activity: [
      { title: "Completed valuation", desc: "42 Palm Grove Estate", time: "3h ago" },
      { title: "Approved loan application", desc: "Riverside Apartments, Unit 5B", time: "2d ago" },
      { title: "Requested additional documents", desc: "Sunset Heights Villa", time: "5d ago" },
    ],
  },
  ADMIN: {
    label: "Admin",
    jobTitle: "System Administrator",
    department: "Platform Operations",
    badgeColor: "#FEE2E2",
    badgeText: "#DC2626",
    stats: [
      { icon: LuUsersRound, label: "Total Users", value: "312", color: "#2563EB" },
      { icon: LuBuilding, label: "Total Properties", value: "128", color: "#22C55E" },
      { icon: LuCalendar, label: "Active Sessions", value: "47", color: "#F59E0B" },
      { icon: LuMapPin, label: "Flagged Accounts", value: "2", color: "#EF4444" },
    ],
    activity: [
      { title: "Added new user", desc: "Legal Reviewer — Priya S.", time: "30m ago" },
      { title: "Resolved support ticket", desc: "Login issue — Agent account", time: "5h ago" },
      { title: "Updated platform settings", desc: "Notification thresholds", time: "1d ago" },
    ],
    isAdmin: true,
  },
};

const BASE_SETTINGS = [
  { icon: LuUserCog, title: "Account", desc: "Update your personal details" },
  { icon: LuBell, title: "Notifications", desc: "Manage alerts and email preferences" },
  { icon: LuLock, title: "Security", desc: "Password and two-factor authentication" },
];

const ADMIN_SETTINGS_ROW = {
  icon: LuUsersRound,
  title: "User Management",
  desc: "Manage roles, permissions and access",
};

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

function Profile() {
  const navigate = useNavigate();
  const currentUser = api.getCurrentUser();

  const roleKey = ROLE_CONFIG[currentUser.role] ? currentUser.role : "BUYER";
  const role = ROLE_CONFIG[roleKey];

  const [fullName, setFullName] = useState(currentUser.fullName || "User");
  const [email, setEmail] = useState(currentUser.email || "");
  const [phone, setPhone] = useState("+91 98765 43210");

  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const [formName, setFormName] = useState(fullName);
  const [formEmail, setFormEmail] = useState(email);
  const [formPhone, setFormPhone] = useState(phone);

  const openModal = () => {
    setFormName(fullName);
    setFormEmail(email);
    setFormPhone(phone);
    setShowModal(true);
  };

  const handleSave = () => {
    if (formName.trim()) setFullName(formName.trim());
    if (formEmail.trim()) setEmail(formEmail.trim());
    if (formPhone.trim()) setPhone(formPhone.trim());
    setShowModal(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const handleLogout = () => {
    api.logout();
    navigate("/login");
  };

  const settingsRows = role.isAdmin ? [...BASE_SETTINGS, ADMIN_SETTINGS_ROW] : BASE_SETTINGS;

  return (
    <Layout title="Profile">
      <div className="profile-page">
        {/* HERO */}
        <section className="profile-hero">
          <div className="profile-hero-left">
            <div className="profile-avatar">{getInitials(fullName)}</div>
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
                  <LuCalendar /> Joined Mar 2025
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
          {role.stats.map((stat) => {
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
          })}
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
                  <div className="about-value">{phone}</div>
                </div>
              </div>
              <div className="about-item">
                <LuMapPin />
                <div>
                  <div className="about-label">Location</div>
                  <div className="about-value">Madurai, TN</div>
                </div>
              </div>
            </div>

            <h3 className="card-title" style={{ marginTop: "24px" }}>
              Recent Activity
            </h3>
            <div className="activity-list">
              {role.activity.map((item) => (
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
              ))}
            </div>
          </div>

          <div className="profile-card">
            <h3 className="card-title">Settings</h3>
            <div className="settings-list">
              {settingsRows.map((item) => {
                const Icon = item.icon;
                return (
                  <button className="settings-item" key={item.title}>
                    <div className="settings-icon">
                      <Icon />
                    </div>
                    <div className="settings-text">
                      <h4>{item.title}</h4>
                      <p>{item.desc}</p>
                    </div>
                    <LuChevronRight className="chevron" />
                  </button>
                );
              })}
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              <LuLogOut /> Log out
            </button>
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
                <div className="profile-avatar">{getInitials(formName)}</div>
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
                  <label>Email</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
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
                <textarea placeholder="Tell us a little about yourself" />
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
