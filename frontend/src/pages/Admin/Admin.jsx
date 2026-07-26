import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import { api, isAdmin } from "../../services/api";
import "./Admin.css";

import {
  LuUsers,
  LuBuilding2,
  LuUserCheck,
  LuTriangleAlert,
  LuPlus,
  LuPencil,
  LuTrash2,
  LuX,
} from "react-icons/lu";

// Mock users — no backend endpoint exists yet for listing/adding/removing
// other users (UserController only exposes /profile for the logged-in user).
// Swap this out once a real GET /api/users (list) + admin create/delete
// endpoints exist.
const initialMockUsers = [
  { id: 1, name: "Aditi Sharma", email: "aditi@example.com", role: "BUYER", status: "Active" },
  { id: 2, name: "Rahul Verma", email: "rahul@example.com", role: "AGENT", status: "Active" },
  { id: 3, name: "Priya Nair", email: "priya@example.com", role: "LEGAL_REVIEWER", status: "Inactive" },
];

const emptyPropertyForm = {
  propertyCode: "",
  parcelId: "",
  address: "",
  city: "",
  country: "",
  propertyType: "",
  landUse: "",
  lotSizeSqft: "",
  yearBuilt: "",
  bedrooms: "",
  bathrooms: "",
  ownerName: "",
  status: "Active",
};

const emptyUserForm = { name: "", email: "", role: "BUYER", status: "Active" };

export default function Admin() {
  const navigate = useNavigate();

  const [tab, setTab] = useState("properties"); // "properties" | "users"

  const [properties, setProperties] = useState([]);
  const [propLoading, setPropLoading] = useState(true);
  const [propError, setPropError] = useState("");

  const [users, setUsers] = useState(initialMockUsers);

  const [propModalOpen, setPropModalOpen] = useState(false);
  const [editingPropertyId, setEditingPropertyId] = useState(null);
  const [propForm, setPropForm] = useState(emptyPropertyForm);

  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [userForm, setUserForm] = useState(emptyUserForm);

  // ---- Data loading (defined before the useEffect that calls it) ----
  const loadProperties = async () => {
    setPropLoading(true);
    setPropError("");
    try {
      const data = await api.getProperties();
      setProperties(Array.isArray(data) ? data : []);
    } catch (err) {
      setPropError(err.message || "Failed to load properties");
    } finally {
      setPropLoading(false);
    }
  };

  // ---- Auth / role guard ----
  useEffect(() => {
    if (!api.isAuthenticated()) {
      navigate("/login", { replace: true });
      return;
    }
    if (!isAdmin()) {
      navigate("/dashboard", { replace: true });
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProperties();

  }, [navigate]);

  // ---- Property CRUD ----
  const openAddProperty = () => {
    setEditingPropertyId(null);
    setPropForm(emptyPropertyForm);
    setPropModalOpen(true);
  };

  const openEditProperty = (property) => {
    setEditingPropertyId(property.propertyId);
    setPropForm({
      propertyCode: property.propertyCode || "",
      parcelId: property.parcelId || "",
      address: property.address || "",
      city: property.city || "",
      country: property.country || "",
      propertyType: property.propertyType || "",
      landUse: property.landUse || "",
      lotSizeSqft: property.lotSizeSqft ?? "",
      yearBuilt: property.yearBuilt ?? "",
      bedrooms: property.bedrooms ?? "",
      bathrooms: property.bathrooms ?? "",
      ownerName: property.ownerName || "",
      status: property.status || "Active",
    });
    setPropModalOpen(true);
  };

  const handlePropertySubmit = async (e) => {
    e.preventDefault();
    setPropError("");

    const payload = {
      ...propForm,
      lotSizeSqft: propForm.lotSizeSqft === "" ? null : Number(propForm.lotSizeSqft),
      yearBuilt: propForm.yearBuilt === "" ? null : Number(propForm.yearBuilt),
      bedrooms: propForm.bedrooms === "" ? null : Number(propForm.bedrooms),
      bathrooms: propForm.bathrooms === "" ? null : Number(propForm.bathrooms),
    };

    try {
      if (editingPropertyId) {
        await api.updateProperty(editingPropertyId, payload);
      } else {
        await api.createProperty(payload);
      }
      setPropModalOpen(false);
      loadProperties();
    } catch (err) {
      setPropError(err.message || "Failed to save property");
    }
  };

  const handleDeleteProperty = async (id) => {
    if (!window.confirm("Delete this property? This cannot be undone.")) return;
    try {
      await api.deleteProperty(id);
      loadProperties();
    } catch (err) {
      setPropError(err.message || "Failed to delete property");
    }
  };

  // ---- Mock user CRUD (local state only) ----
  const openAddUser = () => {
    setEditingUserId(null);
    setUserForm(emptyUserForm);
    setUserModalOpen(true);
  };

  const openEditUser = (user) => {
    setEditingUserId(user.id);
    setUserForm({ name: user.name, email: user.email, role: user.role, status: user.status });
    setUserModalOpen(true);
  };

  const handleUserSubmit = (e) => {
    e.preventDefault();
    if (editingUserId) {
      setUsers((prev) =>
        prev.map((u) => (u.id === editingUserId ? { ...u, ...userForm } : u))
      );
    } else {
      setUsers((prev) => [...prev, { id: Date.now(), ...userForm }]);
    }
    setUserModalOpen(false);
  };

  const handleDeleteUser = (id) => {
    if (!window.confirm("Remove this user?")) return;
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  // ---- Stats ----
  const stats = [
    { label: "Total Users", value: users.length, icon: LuUsers, color: "#2563EB", bg: "#DBEAFE" },
    { label: "Total Properties", value: properties.length, icon: LuBuilding2, color: "#10B981", bg: "#D1FAE5" },
    {
      label: "Active Users",
      value: users.filter((u) => u.status === "Active").length,
      icon: LuUserCheck,
      color: "#F59E0B",
      bg: "#FEF3C7",
    },
    {
      label: "Inactive/Flagged",
      value: users.filter((u) => u.status !== "Active").length,
      icon: LuTriangleAlert,
      color: "#EF4444",
      bg: "#FEE2E2",
    },
  ];

  return (
    <Layout title="Admin" showSearch={false}>
      <div className="admin-page">
        <div className="admin-note" role="note">
          User management below uses mock data 
        </div>

        <div className="stats-grid">
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="stat-card">
                <div className="stat-icon" style={{ background: item.bg, color: item.color }}>
                  <Icon size={20} />
                </div>
                <div>
                  <p className="stat-label">{item.label}</p>
                  <h2 className="stat-value">{item.value}</h2>
                </div>
              </div>
            );
          })}
        </div>

        <div className="admin-tabs">
          <button
            className={`admin-tab-btn ${tab === "properties" ? "active" : ""}`}
            onClick={() => setTab("properties")}
          >
            Properties
          </button>
          <button
            className={`admin-tab-btn ${tab === "users" ? "active" : ""}`}
            onClick={() => setTab("users")}
          >
            Users
          </button>
        </div>

        {tab === "properties" && (
          <div className="admin-card">
            <div className="admin-card-header">
              <h3 className="card-title">Property Management</h3>
              <button className="admin-add-btn" onClick={openAddProperty}>
                <LuPlus size={16} /> Add Property
              </button>
            </div>

            {propError && <div className="admin-error">{propError}</div>}

            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Address</th>
                    <th>City</th>
                    <th>Type</th>
                    <th>Owner</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {propLoading && (
                    <tr>
                      <td colSpan="7" className="admin-empty-row">Loading properties...</td>
                    </tr>
                  )}
                  {!propLoading && properties.length === 0 && (
                    <tr>
                      <td colSpan="7" className="admin-empty-row">No properties found.</td>
                    </tr>
                  )}
                  {!propLoading &&
                    properties.map((p) => (
                      <tr key={p.propertyId}>
                        <td>{p.propertyCode}</td>
                        <td>{p.address}</td>
                        <td>{p.city}</td>
                        <td>{p.propertyType}</td>
                        <td>{p.ownerName || "—"}</td>
                        <td>
                          <span className={`status-badge ${(p.status || "").toLowerCase()}`}>
                            {p.status || "—"}
                          </span>
                        </td>
                        <td className="admin-actions">
                          <button className="icon-btn" onClick={() => openEditProperty(p)} aria-label="Edit">
                            <LuPencil size={16} />
                          </button>
                          <button
                            className="icon-btn danger"
                            onClick={() => handleDeleteProperty(p.propertyId)}
                            aria-label="Delete"
                          >
                            <LuTrash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "users" && (
          <div className="admin-card">
            <div className="admin-card-header">
              <h3 className="card-title">User Management</h3>
              <button className="admin-add-btn" onClick={openAddUser}>
                <LuPlus size={16} /> Add User
              </button>
            </div>

            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 && (
                    <tr>
                      <td colSpan="5" className="admin-empty-row">No users found.</td>
                    </tr>
                  )}
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.role}</td>
                      <td>
                        <span className={`status-badge ${u.status.toLowerCase()}`}>{u.status}</span>
                      </td>
                      <td className="admin-actions">
                        <button className="icon-btn" onClick={() => openEditUser(u)} aria-label="Edit">
                          <LuPencil size={16} />
                        </button>
                        <button
                          className="icon-btn danger"
                          onClick={() => handleDeleteUser(u.id)}
                          aria-label="Delete"
                        >
                          <LuTrash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ---- Property Modal ---- */}
      {propModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setPropModalOpen(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{editingPropertyId ? "Edit Property" : "Add Property"}</h3>
              <button className="icon-btn" onClick={() => setPropModalOpen(false)}>
                <LuX size={18} />
              </button>
            </div>
            <form onSubmit={handlePropertySubmit} className="admin-form">
              <div className="admin-form-grid">
                <label>
                  Property Code
                  <input
                    value={propForm.propertyCode}
                    onChange={(e) => setPropForm({ ...propForm, propertyCode: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Parcel ID
                  <input
                    value={propForm.parcelId}
                    onChange={(e) => setPropForm({ ...propForm, parcelId: e.target.value })}
                  />
                </label>
                <label className="span-2">
                  Address
                  <input
                    value={propForm.address}
                    onChange={(e) => setPropForm({ ...propForm, address: e.target.value })}
                    required
                  />
                </label>
                <label>
                  City
                  <input
                    value={propForm.city}
                    onChange={(e) => setPropForm({ ...propForm, city: e.target.value })}
                  />
                </label>
                <label>
                  Country
                  <input
                    value={propForm.country}
                    onChange={(e) => setPropForm({ ...propForm, country: e.target.value })}
                  />
                </label>
                <label>
                  Property Type
                  <input
                    value={propForm.propertyType}
                    onChange={(e) => setPropForm({ ...propForm, propertyType: e.target.value })}
                    placeholder="Residential, Commercial..."
                  />
                </label>
                <label>
                  Land Use
                  <input
                    value={propForm.landUse}
                    onChange={(e) => setPropForm({ ...propForm, landUse: e.target.value })}
                  />
                </label>
                <label>
                  Lot Size (sqft)
                  <input
                    type="number"
                    value={propForm.lotSizeSqft}
                    onChange={(e) => setPropForm({ ...propForm, lotSizeSqft: e.target.value })}
                  />
                </label>
                <label>
                  Year Built
                  <input
                    type="number"
                    value={propForm.yearBuilt}
                    onChange={(e) => setPropForm({ ...propForm, yearBuilt: e.target.value })}
                  />
                </label>
                <label>
                  Bedrooms
                  <input
                    type="number"
                    value={propForm.bedrooms}
                    onChange={(e) => setPropForm({ ...propForm, bedrooms: e.target.value })}
                  />
                </label>
                <label>
                  Bathrooms
                  <input
                    type="number"
                    value={propForm.bathrooms}
                    onChange={(e) => setPropForm({ ...propForm, bathrooms: e.target.value })}
                  />
                </label>
                <label>
                  Owner Name
                  <input
                    value={propForm.ownerName}
                    onChange={(e) => setPropForm({ ...propForm, ownerName: e.target.value })}
                  />
                </label>
                <label>
                  Status
                  <select
                    value={propForm.status}
                    onChange={(e) => setPropForm({ ...propForm, status: e.target.value })}
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </label>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setPropModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingPropertyId ? "Save Changes" : "Add Property"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---- User Modal (mock) ---- */}
      {userModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setUserModalOpen(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{editingUserId ? "Edit User" : "Add User"}</h3>
              <button className="icon-btn" onClick={() => setUserModalOpen(false)}>
                <LuX size={18} />
              </button>
            </div>
            <form onSubmit={handleUserSubmit} className="admin-form">
              <div className="admin-form-grid">
                <label className="span-2">
                  Name
                  <input
                    value={userForm.name}
                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    required
                  />
                </label>
                <label className="span-2">
                  Email
                  <input
                    type="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Role
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="BUYER">Buyer</option>
                    <option value="AGENT">Agent</option>
                    <option value="LEGAL_REVIEWER">Legal Reviewer</option>
                    <option value="BANK">Bank</option>
                  </select>
                </label>
                <label>
                  Status
                  <select
                    value={userForm.status}
                    onChange={(e) => setUserForm({ ...userForm, status: e.target.value })}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </label>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setUserModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingUserId ? "Save Changes" : "Add User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}