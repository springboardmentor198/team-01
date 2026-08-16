import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import { api } from "../../services/api";
import "./SmartSearchAutocomplete.css";

const DEBOUNCE_MS = 300;
const MAX_SUGGESTIONS = 10;

function highlightMatch(text, query) {
  if (!text) return text || "";
  const lowerText = String(text).toLowerCase();
  const lowerQuery = (query || "").toLowerCase();
  if (!lowerQuery) return text;

  const index = lowerText.indexOf(lowerQuery);
  if (index === -1) return text;

  return (
    <>
      {text.slice(0, index)}
      <mark className="smart-search-highlight">
        {text.slice(index, index + query.length)}
      </mark>
      {text.slice(index + query.length)}
    </>
  );
}

export default function SmartSearchAutocomplete({
  onSelect,
  onSearch,
  placeholder = "Search properties by name, city, address...",
  className = "",
  autoFocus = false,
  showSubmitButton = false,
  submitLabel = "Search",
}) {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);
  const requestIdRef = useRef(0);

  // Fetch suggestions with debounce
  const fetchSuggestions = useCallback(async (term) => {
    if (!term || !term.trim()) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    const requestId = ++requestIdRef.current;
    setLoading(true);

    try {
      const data = await api.autocomplete(term.trim());
      if (requestId !== requestIdRef.current) return; // stale response
      setSuggestions(Array.isArray(data) ? data.slice(0, MAX_SUGGESTIONS) : []);
      setOpen(true);
    } catch (err) {
      console.warn("Autocomplete failed", err);
      if (requestId === requestIdRef.current) {
        setSuggestions([]);
        setOpen(false);
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const handleChange = (event) => {
    const value = event.target.value;
    setQuery(value);
    setActiveIndex(-1);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!value.trim()) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, DEBOUNCE_MS);
  };

  const handleSelect = (suggestion) => {
    setOpen(false);
    if (onSelect) {
      onSelect(suggestion);
      return;
    }

    // Default: navigate to Property Details and record history
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

  const handleSubmit = (event) => {
    event.preventDefault();
    const term = query.trim();

    if (activeIndex >= 0 && suggestions[activeIndex]) {
      handleSelect(suggestions[activeIndex]);
      return;
    }

    if (!term) return;

    setOpen(false);

    if (onSearch) {
      onSearch(term);
      return;
    }

    if (api.isAuthenticated()) {
      api
        .saveSearchHistory({ query: term })
        .catch((err) => console.warn("Failed to record search", err));
    }

    navigate(`/property-results?query=${encodeURIComponent(term)}`);
  };

  // Keyboard support: ArrowDown / ArrowUp / Enter / Escape
  const handleKeyDown = (event) => {
    if (!open || suggestions.length === 0) {
      if (event.key === "Escape") {
        setOpen(false);
      }
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((prev) => (prev >= suggestions.length - 1 ? 0 : prev + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
    } else if (event.key === "Enter") {
      if (activeIndex >= 0) {
        event.preventDefault();
        handleSelect(suggestions[activeIndex]);
      }
    } else if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  // Click outside closes the dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className={`smart-search ${className}`} ref={containerRef}>
      <form className="smart-search-form" onSubmit={handleSubmit}>
        <FiSearch className="smart-search-icon" aria-hidden="true" />
        <input
          ref={inputRef}
          type="text"
          className="smart-search-input"
          placeholder={placeholder}
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setOpen(true);
          }}
          aria-label="Search property"
          autoFocus={autoFocus}
        />
        {loading && <span className="smart-search-loader" />}
        {showSubmitButton && (
          <button type="submit" className="smart-search-submit">
            {submitLabel}
          </button>
        )}
      </form>

      {open && suggestions.length > 0 && (
        <ul className="smart-search-dropdown" role="listbox">
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion.propertyId}
              role="option"
              aria-selected={index === activeIndex}
              className={`smart-search-item ${
                index === activeIndex ? "active" : ""
              }`}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => handleSelect(suggestion)}
            >
              <span className="smart-search-item-name">
                {highlightMatch(suggestion.name, query)}
              </span>
              <span className="smart-search-item-meta">
                {suggestion.city || ""}
                {suggestion.propertyType
                  ? `${suggestion.city ? " • " : ""}${suggestion.propertyType}`
                  : ""}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
