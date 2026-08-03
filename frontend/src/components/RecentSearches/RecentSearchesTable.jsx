import { useNavigate } from "react-router-dom";
import {
  buildSearchResultsUrl,
  formatPropertyType,
  formatSearchStatus,
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
}) {
  const navigate = useNavigate();
  const columnCount = showStatus ? 4 : 3;

  const handleRowClick = (item) => {
    if (!clickable) return;
    navigate(buildSearchResultsUrl(item));
  };

  return (
    <div className="recent-searches-table-wrapper">
      <table className="recent-searches-table">
        <thead>
          <tr>
            <th>Property</th>
            <th>Type</th>
            <th>Risk</th>
            {showStatus && <th>Status</th>}
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td colSpan={columnCount} className="recent-searches-loading">
                Loading recent searches...
              </td>
            </tr>
          )}

          {!loading && error && (
            <tr>
              <td colSpan={columnCount} className="recent-searches-error">
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
                  if (clickable && (event.key === "Enter" || event.key === " ")) {
                    event.preventDefault();
                    handleRowClick(item);
                  }
                }}
                tabIndex={clickable ? 0 : undefined}
                role={clickable ? "button" : undefined}
              >
                <td className="property-name-cell">
                  <span className="property-name">{getSearchDisplayName(item)}</span>
                </td>
                <td>{formatPropertyType(item.propertyType)}</td>
                <td>
                  <span
                    className={`risk-badge ${(item.risk || "unrated").toLowerCase()}`}
                  >
                    {item.risk || "Unrated"}
                  </span>
                </td>
                {showStatus && (
                  <td className="status-text">{formatSearchStatus(item.status)}</td>
                )}
              </tr>
            ))}

          {!loading && !error && searches.length === 0 && (
            <tr>
              <td colSpan={columnCount} className="recent-searches-empty">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
