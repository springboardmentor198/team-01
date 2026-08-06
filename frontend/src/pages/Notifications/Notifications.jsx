import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import { api } from "../../services/api";
import {
  formatNotificationTime,
  getNotificationVisuals,
  getPriorityClass,
} from "../../utils/notificationUtils";
import "./Notifications.css";
import { LuTrash2 } from "react-icons/lu";
import { LuSearch } from "react-icons/lu";

export default function Notifications() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const loadNotifications = useCallback(
    async (pageNumber = 0, append = false) => {
      if (!api.isAuthenticated()) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const filter =
          tab === "unread"
            ? "unread"
            : tab === "critical"
              ? "critical"
              : undefined;

        const response = await api.getNotifications({
          page: pageNumber,
          size: 20,
          filter,
        });

        const content = response.content || [];
        setNotifications((prev) => (append ? [...prev, ...content] : content));
        setHasMore(!response.last);
        setPage(pageNumber);

        const count = await api.getNotificationCount();
        setUnreadCount(count);
      } catch (err) {
        setError(err.message || "Unable to load notifications");
      } finally {
        setLoading(false);
      }
    },
    [navigate, tab],
  );

  useEffect(() => {
    loadNotifications(0, false);
  }, [loadNotifications]);

  useEffect(() => {
    const interval = setInterval(() => {
      loadNotifications(0, false);
    }, 45000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  const handleMarkAllRead = async () => {
    if (markingAll) return;
    setMarkingAll(true);
    setError("");
    try {
      await api.markAllNotificationsRead();
      await loadNotifications(0, false);
    } catch (err) {
      setError(err.message || "Failed to mark all notifications read");
    } finally {
      setMarkingAll(false);
    }
  };

  const handleDeleteNotification = async (event, id, status) => {
    event.stopPropagation();

    const confirmed = window.confirm(
      "Delete this notification?"
    );

    if (!confirmed) return;

    try {
      await api.deleteNotification(id);

      setNotifications((prev) =>
        prev.filter((item) => item.id !== id)
      );

      if (status === "UNREAD") {
        setUnreadCount((count) =>
          Math.max(0, count - 1)
        );
      }

    } catch (err) {
      setError(
        err.message ||
        "Failed to delete notification."
      );
    }
  };

  const handleNotificationClick = async (item) => {
    if (item.status === "UNREAD") {
      await api.markNotificationRead(item.id);
      setUnreadCount((count) => Math.max(0, count - 1));
      setNotifications((prev) =>
        prev.map((entry) =>
          entry.id === item.id ? { ...entry, status: "READ" } : entry,
        ),
      );
    }

    if (item.actionUrl) {
      navigate(item.actionUrl);
    }
  };

  const visible = notifications.filter((item) => {
  const matchesSearch =
    `${item.title} ${item.message} ${item.type || ""} ${item.propertyName || ""}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

  return matchesSearch;
});

  return (
    <Layout title="Notifications">
      <div className="notifications-page">
        <div className="notifications-toolbar">

          <div className="notification-search">

            <LuSearch className="search-icon" />

            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

          </div>

          <div className="toolbar-actions">

            <button
              type="button"
              className="mark-all-btn"
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0}
            >
              Mark all as read
            </button>

          </div>

        </div>

        <div className="notifications-tabs">
          <button
            className={tab === "all" ? "active" : ""}
            onClick={() => setTab("all")}
          >
            All ({notifications.length})
          </button>
          <button
            className={tab === "unread" ? "active" : ""}
            onClick={() => setTab("unread")}
          >
            Unread ({unreadCount})
          </button>
          <button
            className={tab === "critical" ? "active" : ""}
            onClick={() => setTab("critical")}
          >
            Critical
          </button>
        </div>

        {error && <div className="notifications-error">{error}</div>}
      <div className="notifications-content">
  <div className="notifications-list">
    {loading && notifications.length === 0 && (
      <p className="notifications-empty">
        Fetching latest notifications...
      </p>
    )}

    {!loading && visible.length === 0 && (
      <div className="notifications-empty">
        <h3>You're all caught up!</h3>

        <p>No new notifications available.</p>
      </div>
    )}

    {visible.map((item) => {
      const visuals = getNotificationVisuals(item.type);
      const Icon = visuals.icon;
      const isUnread = item.status === "UNREAD";

      return (
        <div
          key={item.id}
          className={`notification-card ${isUnread ? "unread" : ""}`}
          style={{ "--accent-color": visuals.color }}
          onClick={() => handleNotificationClick(item)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              handleNotificationClick(item);
            }
          }}
          role="button"
          tabIndex={0}
        >
          <div
            className="notification-icon"
            style={{
              background: visuals.bg,
              color: visuals.color,
            }}
          >
            <Icon size={20} />
          </div>

          <div className="notification-content">
            <div className="notification-top">
              <h3>{item.title}</h3>

              <div className="notification-meta">
                <span>{formatNotificationTime(item.createdAt)}</span>

                {isUnread && <span className="unread-dot" />}
              </div>
            </div>

            <p>{item.message}</p>

            <div className="notification-footer">
              <div className="notification-tags">
                {item.propertyName && (
                  <span className="notification-tag">
                    {item.propertyName}
                  </span>
                )}

                {item.senderName && (
                  <span className="notification-tag">
                    {item.senderName}
                  </span>
                )}

                {item.type && (
                  <span className="notification-tag">
                    {item.type}
                  </span>
                )}

                <span
                  className={`priority-badge ${getPriorityClass(
                    item.priority
                  )}`}
                >
                  {item.priority || "MEDIUM"}
                </span>
              </div>

              <button
                type="button"
                className="delete-btn"
                onClick={(event) =>
                  handleDeleteNotification(
                    event,
                    item.id,
                    item.status
                  )
                }
              >
                <LuTrash2 size={15} />
                Delete
              </button>
            </div>
          </div>
        </div>
      );
    })}
  </div>
</div>
        {hasMore && (
          <button
            type="button"
            className="load-more-btn"
            onClick={() => loadNotifications(page + 1, true)}
            disabled={loading}
          >
            {loading ? "Loading..." : "Load more"}
          </button>
        )}
      </div>
    </Layout>
  );
}
