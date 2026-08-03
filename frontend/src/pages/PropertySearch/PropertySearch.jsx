import { useState } from "react";
import Layout from "../../components/Layout/Layout";
import RecentSearchesTable from "../../components/RecentSearches/RecentSearchesTable";
import "./PropertySearch.css";
import { useNavigate } from "react-router-dom";
import { useRecentSearches } from "../../hooks/useRecentSearches";
import { buildSearchHistoryPayload } from "../../utils/searchUtils";

import { FiSearch, FiMapPin, FiHome, FiClock } from "react-icons/fi";

import { IoFilterOutline, IoLocationOutline } from "react-icons/io5";

import { MdOutlineApartment } from "react-icons/md";

function PropertySearch() {
  const navigate = useNavigate();

  const [address, setAddress] = useState("");
  const [propertyType, setPropertyType] = useState("All");
  const [city, setCity] = useState("All");
  const [riskLevel, setRiskLevel] = useState("All");
  const [status, setStatus] = useState("All");
  const {
    searches: recentSearches,
    loading: recentSearchesLoading,
    error: recentSearchesError,
    recordSearch,
  } = useRecentSearches();

  const handleSearch = async () => {
    const params = new URLSearchParams();
    const trimmedAddress = address.trim();
    if (trimmedAddress) params.append("query", trimmedAddress);
    if (propertyType !== "All") params.append("type", propertyType);
    if (city !== "All") params.append("city", city);
    if (riskLevel !== "All") params.append("risk", riskLevel);
    if (status !== "All") params.append("status", status);

    await recordSearch(
      buildSearchHistoryPayload({
        query: trimmedAddress || undefined,
        city: city !== "All" ? city : undefined,
        propertyType: propertyType !== "All" ? propertyType : undefined,
        risk: riskLevel !== "All" ? riskLevel : undefined,
        status: status !== "All" ? status : undefined,
      }),
    );

    navigate(`/property-results?${params.toString()}`);
  };

  const handleQuickLocation = async (loc) => {
    await recordSearch(buildSearchHistoryPayload({ city: loc }));
    navigate(`/property-results?city=${encodeURIComponent(loc)}`);
  };

  const quickLocations = ["Delhi", "Noida", "Mumbai", "Bangalore"];

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
            Search properties by address or use advanced filters for detailed
            due diligence.
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
                onClick={() => handleQuickLocation(loc)}
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
              <select value={city} onChange={(e) => setCity(e.target.value)}>
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
          <RecentSearchesTable
            searches={recentSearches}
            loading={recentSearchesLoading}
            error={recentSearchesError}
            showStatus={false}
            clickable={true}
            emptyMessage="No recent searches yet."
          />
        </section>

        {/* ================= SAVED FILTERS ================= */}
        <section className="saved-card card">
          <div className="card-heading">
            <FiHome />
            <h2>Saved Filters</h2>
          </div>
          {/* TODO: replace with real data from api.getSavedFilters() once
              backend endpoint exists. */}
          <p className="empty-state">No saved filters yet.</p>
        </section>
      </div>
    </Layout>
  );
}

export default PropertySearch;
