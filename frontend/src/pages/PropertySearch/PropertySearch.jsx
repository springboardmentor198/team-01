import { useState } from "react";
import Layout from "../../components/Layout/Layout";
import "./PropertySearch.css";
import { useNavigate } from "react-router-dom";

import {
  FiSearch,
  FiMapPin,
  FiHome,
  FiClock,
} from "react-icons/fi";

import {
  IoFilterOutline,
  IoLocationOutline,
} from "react-icons/io5";

import { MdOutlineApartment } from "react-icons/md";

function PropertySearch() {
  const navigate = useNavigate();

  const [address, setAddress] = useState("");
  const [propertyType, setPropertyType] = useState("All");
  const [city, setCity] = useState("All");
  const [riskLevel, setRiskLevel] = useState("All");
  const [status, setStatus] = useState("All");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (address.trim()) params.append("query", address.trim());
    if (propertyType !== "All") params.append("type", propertyType);
    if (city !== "All") params.append("city", city);
    if (riskLevel !== "All") params.append("risk", riskLevel);
    if (status !== "All") params.append("status", status);

    navigate(`/property-results?${params.toString()}`);
  };

  const recentSearches = [
    {
      address: "24 Lakeview Street",
      type: "Residential",
      risk: "Medium",
    },
    {
      address: "18 Green Avenue",
      type: "Commercial",
      risk: "Low",
    },
    {
      address: "Palm Residency",
      type: "Residential",
      risk: "High",
    },
  ];

  const quickLocations = [
    "Delhi",
    "Noida",
    "Mumbai",
    "Bangalore",
  ];

  return (
    <Layout title="Property Search">
      <div className="property-search">
        {/* ================= HERO ================= */}
        <section className="hero-card card">
          <div className="hero-icon">
            <FiSearch />
          </div>
          <h1>Find Properties with Confidence</h1>
          <p>
            Search properties by address or use advanced filters for detailed due diligence.
          </p>
        </section>

        {/* ================= SEARCH ================= */}
        <section className="search-card card">
          <div className="card-heading">
            <FiMapPin />
            <h2>Search by Address</h2>
          </div>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Enter property address or name..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button className="search-btn" onClick={handleSearch}>
              <FiSearch />
              Search
            </button>
          </div>

          {/* Quick Search */}
          <div className="quick-search">
            <span>Quick Search:</span>
            {quickLocations.map((loc) => (
              <button
                key={loc}
                className="chip"
                onClick={() => navigate(`/property-results?city=${loc}`)}
              >
                <IoLocationOutline />
                {loc}
              </button>
            ))}
          </div>
        </section>

        {/* ================= OR ================= */}
        <div className="or-divider">
          <span>OR</span>
        </div>

        {/* ================= ADVANCED FILTER ================= */}
        <section className="advanced-section">
          <button className="advanced-btn" onClick={handleSearch}>
            <IoFilterOutline />
            Apply Selected Filters
          </button>
        </section>

        {/* ================= QUICK ACTIONS / FILTERS ================= */}
        <section className="quick-card card">
          <div className="card-heading">
            <MdOutlineApartment />
            <h2>Search Filters</h2>
          </div>

          <div className="quick-grid">
            <div className="filter-box">
              <label>Property Type</label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
              >
                <option value="All">All Types</option>
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
                <option value="Industrial">Industrial</option>
                <option value="Land">Land</option>
              </select>
            </div>

            <div className="filter-box">
              <label>City</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
              >
                <option value="All">All Cities</option>
                <option value="Delhi">Delhi</option>
                <option value="Noida">Noida</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Chennai">Chennai</option>
                <option value="Pune">Pune</option>
              </select>
            </div>

            <div className="filter-box">
              <label>Risk Level</label>
              <select
                value={riskLevel}
                onChange={(e) => setRiskLevel(e.target.value)}
              >
                <option value="All">All Levels</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div className="filter-box">
              <label>Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="AVAILABLE">Available</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="SOLD">Sold</option>
              </select>
            </div>
          </div>
        </section>

        {/* ================= RECENT SEARCHES ================= */}
        <section className="recent-card card">
          <div className="card-heading">
            <FiClock />
            <h2>Recent Searches</h2>
          </div>
          <table className="recent-table">
            <thead>
              <tr>
                <th>Property</th>
                <th>Type</th>
                <th>Risk</th>
              </tr>
            </thead>
            <tbody>
              {recentSearches.map((item, index) => (
                <tr
                  key={index}
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate(`/property-results?query=${encodeURIComponent(item.address)}`)}
                >
                  <td>{item.address}</td>
                  <td>{item.type}</td>
                  <td>
                    <span className={`risk ${item.risk.toLowerCase()}`}>
                      {item.risk}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* ================= SAVED FILTERS ================= */}
        <section className="saved-card card">
          <div className="card-heading">
            <FiHome />
            <h2>Saved Filters</h2>
          </div>
          <div className="saved-grid">
            <div
              className="saved-item"
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/property-results?type=Residential&city=Delhi")}
            >
              <h4>Residential • Delhi</h4>
              <p>Last used 2 hours ago</p>
            </div>

            <div
              className="saved-item"
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/property-results?type=Commercial&city=Noida")}
            >
              <h4>Commercial • Noida</h4>
              <p>Last used Yesterday</p>
            </div>

            <div
              className="saved-item"
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/property-results?risk=High")}
            >
              <h4>High Risk Properties</h4>
              <p>Last used 3 days ago</p>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}

export default PropertySearch;