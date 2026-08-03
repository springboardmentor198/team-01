import { useState } from "react";
import "./Navbar.css";

import { FiBell, FiSearch } from "react-icons/fi";
import { CgProfile } from "react-icons/cg";
import { IoChevronBack } from "react-icons/io5";

import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../../services/api";

function Navbar({ title, showSearch = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const showBackButton = location.pathname !== "/dashboard";

  const handleSearchSubmit = async (event) => {
    event.preventDefault();

    const query = searchQuery.trim();
    if (!query) {
      navigate("/property-search");
      return;
    }

    if (api.isAuthenticated()) {
      try {
        await api.saveSearchHistory({ query });
      } catch (err) {
        console.warn("Failed to record search", err);
      }
    }

    navigate(`/property-results?query=${encodeURIComponent(query)}`);
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        {showBackButton && (
          <button
            className="back-btn"
            onClick={() => navigate(-1)}
            aria-label="Go Back"
          >
            <IoChevronBack />
          </button>
        )}

        <h1 className="page-title">{title}</h1>
      </div>

      <div className="navbar-right">
        {showSearch && (
          <form className="navbar-search-form" onSubmit={handleSearchSubmit}>
            <FiSearch className="navbar-search-icon" aria-hidden="true" />
            <input
              type="search"
              className="navbar-search-input"
              placeholder="Search property"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              aria-label="Search property"
            />
          </form>
        )}

        {/* <button
          className="nav-btn"
          onClick={() => navigate("/notifications")}
          aria-label="Notifications"
        >
          <FiBell />
          <span className="notification-badge"></span>
        </button> */}

        <button
          className="nav-btn profile-btn"
          onClick={() => navigate("/profile")}
          aria-label="Profile"
        >
          <CgProfile />
        </button>
      </div>
    </header>
  );
}

export default Navbar;
