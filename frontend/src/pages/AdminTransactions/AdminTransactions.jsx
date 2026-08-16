import { useEffect, useMemo, useState } from "react";
import Layout from "../../components/Layout/Layout";
import "./Transactions.css";

import {
  LuSearch,
  LuFilter,
  LuRefreshCw,
  LuEye,
  LuX,
  LuArrowUpRight,
  LuArrowDownLeft,
  LuCreditCard,
  LuCalendarDays,
  LuCircleCheck,
  LuClock3,
  LuCircleX,
  LuIndianRupee,
} from "react-icons/lu";

const API_BASE_URL = "http://localhost:8081/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const fallbackTransactions = [
  {
    id: "TXN-1001",
    user: "user@example.com",
    property: "Property A",
    type: "PURCHASE",
    amount: 2500000,
    date: "2026-08-15T10:30:00",
    status: "SUCCESS",
    reference: "REF-78421",
    paymentMethod: "Bank Transfer",
  },
  {
    id: "TXN-1002",
    user: "buyer@example.com",
    property: "Property B",
    type: "VERIFICATION",
    amount: 15000,
    date: "2026-08-14T14:20:00",
    status: "PENDING",
    reference: "REF-78422",
    paymentMethod: "Online Payment",
  },
  {
    id: "TXN-1003",
    user: "client@example.com",
    property: "Property C",
    type: "REPORT",
    amount: 5000,
    date: "2026-08-13T09:15:00",
    status: "SUCCESS",
    reference: "REF-78423",
    paymentMethod: "UPI",
  },
  {
    id: "TXN-1004",
    user: "customer@example.com",
    property: "Property D",
    type: "PURCHASE",
    amount: 1800000,
    date: "2026-08-12T16:45:00",
    status: "FAILED",
    reference: "REF-78424",
    paymentMethod: "Card",
  },
];

const normalizeTransaction = (item, index) => ({
  id:
    item?.transactionId ||
    item?.id ||
    item?.transactionCode ||
    `TXN-${1000 + index}`,

  user:
    item?.userEmail ||
    item?.email ||
    item?.user?.email ||
    item?.userName ||
    "—",

  property:
    item?.propertyName ||
    item?.propertyTitle ||
    item?.property?.propertyTitle ||
    item?.property?.name ||
    "—",

  type:
    item?.transactionType ||
    item?.type ||
    item?.category ||
    "TRANSACTION",

  amount:
    Number(
      item?.amount ??
        item?.transactionAmount ??
        item?.value ??
        0
    ) || 0,

  date:
    item?.transactionDate ||
    item?.createdAt ||
    item?.date ||
    item?.timestamp ||
    null,

  status:
    String(item?.status || "PENDING").toUpperCase(),

  reference:
    item?.reference ||
    item?.referenceNumber ||
    item?.transactionReference ||
    "—",

  paymentMethod:
    item?.paymentMethod ||
    item?.method ||
    "—",

  description:
    item?.description ||
    item?.remarks ||
    item?.message ||
    "No additional transaction information available.",
});

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatAmount = (amount) => {
  return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
};

const getStatusClass = (status) => {
  const normalized = String(status || "").toUpperCase();

  if (
    normalized === "SUCCESS" ||
    normalized === "COMPLETED" ||
    normalized === "PAID"
  ) {
    return "success";
  }

  if (
    normalized === "FAILED" ||
    normalized === "CANCELLED" ||
    normalized === "REJECTED"
  ) {
    return "failed";
  }

  return "pending";
};

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("ALL");

  const [selectedTransaction, setSelectedTransaction] =
    useState(null);

  const [showFilters, setShowFilters] = useState(false);

  const loadTransactions = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await fetch(
        `${API_BASE_URL}/admin/transactions`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Unable to load transactions (${response.status})`
        );
      }

      const result = await response.json();

      const rawTransactions = Array.isArray(result)
        ? result
        : result?.transactions ||
          result?.content ||
          result?.data ||
          [];

      setTransactions(
        rawTransactions.map(normalizeTransaction)
      );
    } catch (err) {
      console.error("Transactions loading error:", err);

      setError(
        err?.message ||
          "Unable to load transactions."
      );

      /*
       * Keep the page usable if backend endpoint is not
       * available yet.
       */
      setTransactions(fallbackTransactions);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return transactions.filter((transaction) => {
      const matchesSearch =
        !query ||
        String(transaction.id)
          .toLowerCase()
          .includes(query) ||
        String(transaction.user)
          .toLowerCase()
          .includes(query) ||
        String(transaction.property)
          .toLowerCase()
          .includes(query) ||
        String(transaction.reference)
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "ALL" ||
        transaction.status === statusFilter;

      let matchesDate = true;

      if (dateFilter !== "ALL" && transaction.date) {
        const transactionDate = new Date(
          transaction.date
        );

        const now = new Date();

        const difference =
          now.getTime() -
          transactionDate.getTime();

        const days = difference / (1000 * 60 * 60 * 24);

        if (dateFilter === "7D") {
          matchesDate = days <= 7;
        }

        if (dateFilter === "30D") {
          matchesDate = days <= 30;
        }

        if (dateFilter === "90D") {
          matchesDate = days <= 90;
        }
      }

      return (
        matchesSearch &&
        matchesStatus &&
        matchesDate
      );
    });
  }, [
    transactions,
    search,
    statusFilter,
    dateFilter,
  ]);

  const statistics = useMemo(() => {
    const total = transactions.length;

    const successful = transactions.filter(
      (item) =>
        item.status === "SUCCESS" ||
        item.status === "COMPLETED" ||
        item.status === "PAID"
    ).length;

    const pending = transactions.filter(
      (item) => item.status === "PENDING"
    ).length;

    const failed = transactions.filter(
      (item) =>
        item.status === "FAILED" ||
        item.status === "CANCELLED" ||
        item.status === "REJECTED"
    ).length;

    const volume = transactions.reduce(
      (sum, item) =>
        sum + Number(item.amount || 0),
      0
    );

    return {
      total,
      successful,
      pending,
      failed,
      volume,
    };
  }, [transactions]);

  return (
    <Layout title="Transactions">
      <div className="transactions-page">

        {/* ================= HEADER ================= */}

        <div className="transactions-header">
          <div>
            <div className="transactions-eyebrow">
              ADMINISTRATION
            </div>

            <h1>Transactions</h1>

            <p>
              Monitor and review platform transaction activity.
            </p>
          </div>

          <button
            type="button"
            className="transactions-refresh-btn"
            onClick={() => loadTransactions(true)}
            disabled={refreshing}
          >
            <LuRefreshCw
              size={17}
              className={refreshing ? "transaction-spin" : ""}
            />

            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* ================= STATS ================= */}

        <div className="transaction-stats">

          <div className="transaction-stat-card">
            <div className="transaction-stat-icon blue">
              <LuCreditCard size={21} />
            </div>

            <div>
              <span>Total Transactions</span>
              <strong>{statistics.total}</strong>
            </div>
          </div>

          <div className="transaction-stat-card">
            <div className="transaction-stat-icon green">
              <LuCircleCheck size={21} />
            </div>

            <div>
              <span>Successful</span>
              <strong>{statistics.successful}</strong>
            </div>
          </div>

          <div className="transaction-stat-card">
            <div className="transaction-stat-icon orange">
              <LuClock3 size={21} />
            </div>

            <div>
              <span>Pending</span>
              <strong>{statistics.pending}</strong>
            </div>
          </div>

          <div className="transaction-stat-card">
            <div className="transaction-stat-icon red">
              <LuCircleX size={21} />
            </div>

            <div>
              <span>Failed</span>
              <strong>{statistics.failed}</strong>
            </div>
          </div>

          <div className="transaction-stat-card">
            <div className="transaction-stat-icon purple">
              <LuIndianRupee size={21} />
            </div>

            <div>
              <span>Transaction Volume</span>
              <strong>
                {formatAmount(statistics.volume)}
              </strong>
            </div>
          </div>

        </div>

        {/* ================= ERROR ================= */}

        {error && (
          <div className="transactions-error">
            <div>
              <strong>Live transaction data unavailable</strong>
              <span>{error}</span>
            </div>

            <button
              type="button"
              onClick={() => loadTransactions()}
            >
              Try Again
            </button>
          </div>
        )}

        {/* ================= TABLE CARD ================= */}

        <div className="transactions-card">

          <div className="transactions-toolbar">

            <div className="transaction-search">
              <LuSearch size={18} />

              <input
                type="text"
                placeholder="Search transaction, user or property..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                >
                  <LuX size={16} />
                </button>
              )}
            </div>

            <button
              type="button"
              className={`transaction-filter-btn ${
                showFilters ? "active" : ""
              }`}
              onClick={() =>
                setShowFilters((prev) => !prev)
              }
            >
              <LuFilter size={17} />
              Filters
            </button>

          </div>

          {/* ================= FILTERS ================= */}

          {showFilters && (
            <div className="transaction-filters">

              <div className="transaction-filter-field">
                <label>Status</label>

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value)
                  }
                >
                  <option value="ALL">
                    All Statuses
                  </option>
                  <option value="SUCCESS">
                    Success
                  </option>
                  <option value="PENDING">
                    Pending
                  </option>
                  <option value="FAILED">
                    Failed
                  </option>
                  <option value="CANCELLED">
                    Cancelled
                  </option>
                </select>
              </div>

              <div className="transaction-filter-field">
                <label>Date</label>

                <select
                  value={dateFilter}
                  onChange={(event) =>
                    setDateFilter(event.target.value)
                  }
                >
                  <option value="ALL">
                    All Dates
                  </option>
                  <option value="7D">
                    Last 7 Days
                  </option>
                  <option value="30D">
                    Last 30 Days
                  </option>
                  <option value="90D">
                    Last 90 Days
                  </option>
                </select>
              </div>

              <button
                type="button"
                className="clear-filters-btn"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("ALL");
                  setDateFilter("ALL");
                }}
              >
                Clear Filters
              </button>

            </div>
          )}

          {/* ================= TABLE ================= */}

          <div className="transactions-table-wrapper">

            {loading ? (
              <div className="transactions-loading">
                <LuRefreshCw
                  size={24}
                  className="transaction-spin"
                />

                <p>Loading transactions...</p>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="transactions-empty">
                <LuCreditCard size={34} />

                <h3>No transactions found</h3>

                <p>
                  Try changing your search or filter criteria.
                </p>
              </div>
            ) : (
              <table className="transactions-table">

                <thead>
                  <tr>
                    <th>Transaction</th>
                    <th>User</th>
                    <th>Property</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredTransactions.map(
                    (transaction) => (
                      <tr key={transaction.id}>

                        <td>
                          <div className="transaction-id">
                            <span>
                              {transaction.id}
                            </span>

                            <small>
                              {transaction.reference}
                            </small>
                          </div>
                        </td>

                        <td>
                          <span className="transaction-user">
                            {transaction.user}
                          </span>
                        </td>

                        <td>
                          <span className="transaction-property">
                            {transaction.property}
                          </span>
                        </td>

                        <td>
                          <span className="transaction-type">
                            {transaction.type}
                          </span>
                        </td>

                        <td>
                          <strong className="transaction-amount">
                            {formatAmount(
                              transaction.amount
                            )}
                          </strong>
                        </td>

                        <td>
                          <span className="transaction-date">
                            {formatDate(
                              transaction.date
                            )}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`transaction-status ${getStatusClass(
                              transaction.status
                            )}`}
                          >
                            {transaction.status}
                          </span>
                        </td>

                        <td>
                          <button
                            type="button"
                            className="transaction-view-btn"
                            onClick={() =>
                              setSelectedTransaction(
                                transaction
                              )
                            }
                          >
                            <LuEye size={16} />
                            View
                          </button>
                        </td>

                      </tr>
                    )
                  )}
                </tbody>

              </table>
            )}

          </div>

          {!loading &&
            filteredTransactions.length > 0 && (
              <div className="transactions-footer">
                Showing{" "}
                <strong>
                  {filteredTransactions.length}
                </strong>{" "}
                of{" "}
                <strong>{transactions.length}</strong>{" "}
                transactions
              </div>
            )}

        </div>

        {/* ================= DETAILS DRAWER ================= */}

        {selectedTransaction && (
          <div
            className="transaction-overlay"
            onClick={() =>
              setSelectedTransaction(null)
            }
          >
            <aside
              className="transaction-details-panel"
              onClick={(event) =>
                event.stopPropagation()
              }
            >

              <div className="transaction-details-header">

                <div>
                  <span>TRANSACTION DETAILS</span>

                  <h2>
                    {selectedTransaction.id}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedTransaction(null)
                  }
                  aria-label="Close transaction details"
                >
                  <LuX size={20} />
                </button>

              </div>

              <div className="transaction-details-status">
                <span
                  className={`transaction-status ${getStatusClass(
                    selectedTransaction.status
                  )}`}
                >
                  {selectedTransaction.status}
                </span>
              </div>

              <div className="transaction-detail-amount">
                <span>Transaction Amount</span>

                <strong>
                  {formatAmount(
                    selectedTransaction.amount
                  )}
                </strong>
              </div>

              <div className="transaction-detail-list">

                <div>
                  <span>Reference</span>
                  <strong>
                    {selectedTransaction.reference}
                  </strong>
                </div>

                <div>
                  <span>User</span>
                  <strong>
                    {selectedTransaction.user}
                  </strong>
                </div>

                <div>
                  <span>Property</span>
                  <strong>
                    {selectedTransaction.property}
                  </strong>
                </div>

                <div>
                  <span>Transaction Type</span>
                  <strong>
                    {selectedTransaction.type}
                  </strong>
                </div>

                <div>
                  <span>Payment Method</span>
                  <strong>
                    {selectedTransaction.paymentMethod}
                  </strong>
                </div>

                <div>
                  <span>Date & Time</span>
                  <strong>
                    {formatDateTime(
                      selectedTransaction.date
                    )}
                  </strong>
                </div>

              </div>

              <div className="transaction-description">
                <span>Description</span>

                <p>
                  {selectedTransaction.description}
                </p>
              </div>

              <button
                type="button"
                className="transaction-close-btn"
                onClick={() =>
                  setSelectedTransaction(null)
                }
              >
                Close Details
              </button>

            </aside>
          </div>
        )}

      </div>
    </Layout>
  );
}

export default Transactions;