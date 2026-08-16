import "./Navbar.css";

import { CgProfile } from "react-icons/cg";
import { IoChevronBack } from "react-icons/io5";
import { FiBell } from "react-icons/fi";

import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../../services/api";
import SmartSearchAutocomplete from "../SmartSearch/SmartSearchAutocomplete";

function Navbar({ title, showSearch = false }) {
  const navigate = useNavigate();
  const location = useLocation();

  const showBackButton = location.pathname !== "/dashboard";

  const handleSelect = (suggestion) => {
    if (api.isAuthenticated()) {
      api
        .saveSearchHistory({
          query: suggestion.name || suggestion.address,
          propertyId: suggestion.propertyId,
          propertyType: suggestion.propertyType,
          city: suggestion.city,
        })
        .catch((err) => console.warn("Failed to record search", err));
    }
    navigate(`/property/${suggestion.propertyId}`);
  };

  const handleSubmit = (query) => {
    if (!query || !query.trim()) {
      navigate("/property-search");
      return;
    }

    if (api.isAuthenticated()) {
      api
        .saveSearchHistory({ query: query.trim() })
        .catch((err) => console.warn("Failed to record search", err));
    }

    navigate(`/property-results?query=${encodeURIComponent(query.trim())}`);
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
          <SmartSearchAutocomplete
            onSelect={handleSelect}
            onSearch={handleSubmit}
            placeholder="Search property"
          />
        )}

        <button
          className="nav-btn"
          onClick={() => navigate("/notifications")}
          aria-label="Notifications"
        >
          <FiBell />
          <span className="notification-badge"></span>
        </button>

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
