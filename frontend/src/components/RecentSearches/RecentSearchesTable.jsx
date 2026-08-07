import { useNavigate } from "react-router-dom";
import {
  buildSearchResultsUrl,
  formatPropertyType,
  formatSearchStatus,
  formatVisitedTime,
  getSearchDisplayName,
} from "../../utils/searchUtils";
import "./RecentSearchesTable.css";

export default function RecentSearchesTable({
  searches = [],
  loading = false,
  error = "",
  showStatus = true,
  clickable = true,
  emptyMessage = "No searches logged.",
  onDelete,
  onClearAll,
}) {
  const navigate = useNavigate();
  const columnCount = showStatus ? 5 : 4;
  const hasActions =
    typeof onDelete === "function" || typeof onClearAll === "function";

  const handleRowClick = (item) => {
    if (!clickable) return;
    if (item.propertyId) {
      navigate(`/property/${item.propertyId}`);
      return;
    }
    navigate(buildSearchResultsUrl(item));
  };

  const handleDelete = (event, item) => {
    event.preventDefault();
    event.stopPropagation();
    if (typeof onDelete === "function") {
      onDelete(item);
    }
  };

  const handleClearAll = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (typeof onClearAll === "function") {
      onClearAll();
    }
  };

  return (
    <div className="recent-searches-table-wrapper">
      {hasActions && searches.length > 0 && (
        <div className="recent-searches-toolbar">
          <span className="recent-searches-count">
            {searches.length} {searches.length === 1 ? "search" : "searches"}
          </span>
          {typeof onClearAll === "function" && (
            <button
              type="button"
              className="recent-searches-clear-all"
              onClick={handleClearAll}
            >
              Clear All
            </button>
          )}
        </div>
      )}
      <table className="recent-searches-table">
        <thead>
          <tr>
            <th>Property</th>
            <th>Type</th>
            <th>City</th>
            <th>Risk</th>
            {showStatus && <th>Status</th>}
            <th>Visited</th>
            {hasActions && <th className="actions-header">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td
                colSpan={columnCount + 1 + (hasActions ? 1 : 0)}
                className="recent-searches-loading"
              >
                Loading recent searches...
              </td>
            </tr>
          )}

          {!loading && error && (
            <tr>
              <td
                colSpan={columnCount + 1 + (hasActions ? 1 : 0)}
                className="recent-searches-error"
              >
                {error}
              </td>
            </tr>
          )}

          {!loading &&
            !error &&
            searches.map((item) => (
              <tr
                key={item.searchId || `${item.query}-${item.searchedAt}`}
                className={clickable ? "clickable-row" : undefined}
                onClick={() => handleRowClick(item)}
                onKeyDown={(event) => {
                  if (
                    clickable &&
                    (event.key === "Enter" || event.key === " ")
                  ) {
                    event.preventDefault();
                    handleRowClick(item);
                  }
                }}
                tabIndex={clickable ? 0 : undefined}
                role={clickable ? "button" : undefined}
              >
                <td className="property-name-cell">
                  <span className="property-name">
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={getSearchDisplayName(item)}
                        className="recent-property-image"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    )}
                    {getSearchDisplayName(item)}
                  </span>
                </td>
                <td>{formatPropertyType(item.propertyType)}</td>
                <td>{item.city || "—"}</td>
                <td>
                  <span
                    className={`risk-badge ${(item.risk || "unrated").toLowerCase()}`}
                  >
                    {item.risk || "Unrated"}
                  </span>
                </td>
                {showStatus && (
                  <td className="status-text">
                    {formatSearchStatus(item.status)}
                  </td>
                )}
                <td className="visited-time">
                  {formatVisitedTime(item.searchedAt)}
                </td>
                {hasActions && (
                  <td className="actions-cell">
                    {typeof onDelete === "function" && (
                      <button
                        type="button"
                        className="recent-search-delete-btn"
                        title="Delete this search"
                        aria-label="Delete this search"
                        onClick={(event) => handleDelete(event, item)}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}

          {!loading && !error && searches.length === 0 && (
            <tr>
              <td
                colSpan={columnCount + 1 + (hasActions ? 1 : 0)}
                className="recent-searches-empty"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
