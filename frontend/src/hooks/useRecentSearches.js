import { useState, useEffect, useCallback } from "react";
import { api } from "../services/api";

export function useRecentSearches({ refreshOnFocus = true } = {}) {
  const [searches, setSearches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!api.isAuthenticated()) {
      setSearches([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await api.getRecentSearches();
      setSearches(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      setError(err.message || "Unable to load recent searches");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!refreshOnFocus) return undefined;

    const handleRefresh = () => {
      if (document.visibilityState === "visible") {
        refresh();
      }
    };

    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", handleRefresh);

    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", handleRefresh);
    };
  }, [refresh, refreshOnFocus]);

  const recordSearch = useCallback(async (payload) => {
    if (!api.isAuthenticated()) return null;

    try {
      const saved = await api.saveSearchHistory(payload);
      setSearches((prev) => {
        const withoutDuplicate = prev.filter(
          (item) => item.searchId !== saved.searchId,
        );
        return [saved, ...withoutDuplicate].slice(0, 10);
      });
      return saved;
    } catch (err) {
      console.warn("Failed to record search", err);
      return null;
    }
  }, []);

  return { searches, loading, error, refresh, recordSearch };
}
