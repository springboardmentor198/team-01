import React, { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from "recharts";

import {
  LuUsers,
  LuBuilding2,
  LuEye,
  LuDownload,
  LuTrendingUp,
  LuTrendingDown,
  LuActivity,
  LuRefreshCw,
  LuCalendarDays,
  LuChartNoAxesCombined,
} from "react-icons/lu";

import "./AdminAnalytics.css";

const BASE_URL = "http://localhost:8081/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

/* -------------------------------------------------------
   Helpers
------------------------------------------------------- */

const numberValue = (value, fallback = 0) => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
};

const formatNumber = (value) => {
  return numberValue(value).toLocaleString("en-IN");
};

const getValue = (object, keys, fallback = 0) => {
  if (!object || typeof object !== "object") {
    return fallback;
  }

  for (const key of keys) {
    if (
      object[key] !== undefined &&
      object[key] !== null &&
      object[key] !== ""
    ) {
      return object[key];
    }
  }

  return fallback;
};

const getArray = (object, keys) => {
  if (!object || typeof object !== "object") {
    return [];
  }

  for (const key of keys) {
    if (Array.isArray(object[key])) {
      return object[key];
    }
  }

  return [];
};

const getDateLabel = (item, index) => {
  const value = getValue(
    item,
    ["date", "label", "period", "month", "day", "name"],
    `Period ${index + 1}`
  );

  if (typeof value !== "string") {
    return `Period ${index + 1}`;
  }

  return value;
};

const getMetricValue = (item, keys) => {
  return numberValue(getValue(item, keys, 0));
};

/* -------------------------------------------------------
   API
------------------------------------------------------- */

const fetchAnalytics = async (range) => {
  const response = await fetch(
    `${BASE_URL}/admin/analytics?range=${encodeURIComponent(range)}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      errorText || `Unable to load analytics (${response.status})`
    );
  }

  return response.json();
};

/* -------------------------------------------------------
   Default structure
------------------------------------------------------- */

const EMPTY_ANALYTICS = {
  summary: {
    totalUsers: 0,
    totalProperties: 0,
    totalViews: 0,
    totalDownloads: 0,
    activeUsers: 0,
    transactionVolume: 0,
  },

  trends: {
    users: 0,
    properties: 0,
    views: 0,
    downloads: 0,
    activeUsers: 0,
    transactions: 0,
  },

  userGrowth: [],
  propertyGrowth: [],
  transactionVolume: [],
  propertyViews: [],
  documentDownloads: [],
  activeUsers: [],
};

/* -------------------------------------------------------
   Normalize backend response
------------------------------------------------------- */

const normalizeAnalytics = (response) => {
  if (!response || typeof response !== "object") {
    return EMPTY_ANALYTICS;
  }

  const summarySource =
    response.summary ||
    response.overview ||
    response.metrics ||
    response.data ||
    response;

  const trendSource =
    response.trends ||
    response.changes ||
    response.growth ||
    {};

  const userGrowthSource = getArray(response, [
    "userGrowth",
    "usersGrowth",
    "userGrowthData",
    "userTrend",
    "users",
  ]);

  const propertyGrowthSource = getArray(response, [
    "propertyGrowth",
    "propertiesGrowth",
    "propertyGrowthData",
    "propertyTrend",
    "properties",
  ]);

  const transactionSource = getArray(response, [
    "transactionVolume",
    "transactions",
    "transactionData",
    "transactionTrend",
  ]);

  const propertyViewsSource = getArray(response, [
    "propertyViews",
    "views",
    "propertyViewData",
    "viewTrend",
  ]);

  const downloadsSource = getArray(response, [
    "documentDownloads",
    "downloads",
    "downloadData",
    "documentDownloadData",
  ]);

  const activeUsersSource = getArray(response, [
    "activeUsers",
    "activeUserData",
    "activeUsersTrend",
  ]);

  const normalizeSeries = (array, valueKeys) => {
    return array.map((item, index) => ({
      label: getDateLabel(item, index),
      value: getMetricValue(item, valueKeys),
    }));
  };

  return {
    summary: {
      totalUsers: numberValue(
        getValue(
          summarySource,
          ["totalUsers", "users", "userCount", "totalUserCount"]
        )
      ),

      totalProperties: numberValue(
        getValue(
          summarySource,
          [
            "totalProperties",
            "properties",
            "propertyCount",
            "totalPropertyCount",
          ]
        )
      ),

      totalViews: numberValue(
        getValue(
          summarySource,
          [
            "totalViews",
            "propertyViews",
            "views",
            "viewCount",
            "totalPropertyViews",
          ]
        )
      ),

      totalDownloads: numberValue(
        getValue(
          summarySource,
          [
            "totalDownloads",
            "documentDownloads",
            "downloads",
            "downloadCount",
          ]
        )
      ),

      activeUsers: numberValue(
        getValue(
          summarySource,
          ["activeUsers", "activeUserCount", "currentlyActiveUsers"]
        )
      ),

      transactionVolume: numberValue(
        getValue(
          summarySource,
          [
            "transactionVolume",
            "totalTransactionVolume",
            "transactions",
            "transactionCount",
          ]
        )
      ),
    },

    trends: {
      users: numberValue(
        getValue(trendSource, ["users", "userGrowth", "usersGrowth"])
      ),

      properties: numberValue(
        getValue(trendSource, [
          "properties",
          "propertyGrowth",
          "propertiesGrowth",
        ])
      ),

      views: numberValue(
        getValue(trendSource, ["views", "propertyViews", "viewGrowth"])
      ),

      downloads: numberValue(
        getValue(trendSource, [
          "downloads",
          "documentDownloads",
          "downloadGrowth",
        ])
      ),

      activeUsers: numberValue(
        getValue(trendSource, ["activeUsers", "activeUserGrowth"])
      ),

      transactions: numberValue(
        getValue(trendSource, [
          "transactions",
          "transactionVolume",
          "transactionGrowth",
        ])
      ),
    },

    userGrowth: normalizeSeries(userGrowthSource, [
      "value",
      "count",
      "users",
      "userCount",
      "totalUsers",
    ]),

    propertyGrowth: normalizeSeries(propertyGrowthSource, [
      "value",
      "count",
      "properties",
      "propertyCount",
      "totalProperties",
    ]),

    transactionVolume: normalizeSeries(transactionSource, [
      "value",
      "amount",
      "volume",
      "transactions",
      "transactionVolume",
      "count",
    ]),

    propertyViews: normalizeSeries(propertyViewsSource, [
      "value",
      "count",
      "views",
      "propertyViews",
      "viewCount",
    ]),

    documentDownloads: normalizeSeries(downloadsSource, [
      "value",
      "count",
      "downloads",
      "documentDownloads",
      "downloadCount",
    ]),

    activeUsers: normalizeSeries(activeUsersSource, [
      "value",
      "count",
      "users",
      "activeUsers",
      "activeUserCount",
    ]),
  };
};

/* -------------------------------------------------------
   Fallback chart data
   Used only when backend returns summary but no series.
------------------------------------------------------- */

const createFallbackSeries = (range, baseValue) => {
  const periods =
    range === "7D"
      ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
      : range === "30D"
        ? ["Week 1", "Week 2", "Week 3", "Week 4"]
        : range === "3M"
          ? ["Jan", "Feb", "Mar"]
          : ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

  return periods.map((label, index) => ({
    label,
    value: Math.max(
      0,
      Math.round(baseValue * (0.72 + index * 0.055))
    ),
  }));
};

/* -------------------------------------------------------
   Custom Tooltip
------------------------------------------------------- */

const AnalyticsTooltip = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="analytics-tooltip">
      <p className="analytics-tooltip-label">{label}</p>

      {payload.map((item, index) => (
        <div className="analytics-tooltip-row" key={index}>
          <span>{item.name || "Value"}</span>
          <strong>{formatNumber(item.value)}</strong>
        </div>
      ))}
    </div>
  );
};

/* -------------------------------------------------------
   Trend
------------------------------------------------------- */

const TrendValue = ({ value }) => {
  const numericValue = numberValue(value);

  if (numericValue === 0) {
    return (
      <span className="analytics-trend neutral">
        <LuActivity size={14} />
        0%
      </span>
    );
  }

  const positive = numericValue > 0;

  return (
    <span className={`analytics-trend ${positive ? "positive" : "negative"}`}>
      {positive ? <LuTrendingUp size={14} /> : <LuTrendingDown size={14} />}

      {Math.abs(numericValue).toFixed(1)}%
    </span>
  );
};

/* -------------------------------------------------------
   Summary Card
------------------------------------------------------- */

const SummaryCard = ({
  title,
  value,
  trend,
  icon: Icon,
  iconClass,
  description,
}) => {
  return (
    <div className="analytics-summary-card">
      <div className={`analytics-summary-icon ${iconClass}`}>
        <Icon size={22} strokeWidth={2} />
      </div>

      <div className="analytics-summary-content">
        <div className="analytics-summary-top">
          <span>{title}</span>
          <TrendValue value={trend} />
        </div>

        <div className="analytics-summary-value">
          {formatNumber(value)}
        </div>

        <p>{description}</p>
      </div>
    </div>
  );
};

/* -------------------------------------------------------
   Main Component
------------------------------------------------------- */

export default function AdminAnalytics() {
  const [range, setRange] = useState("30D");

  const [analytics, setAnalytics] = useState(EMPTY_ANALYTICS);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [selectedMetric, setSelectedMetric] = useState("users");

  const loadAnalytics = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await fetchAnalytics(range);

      const normalized = normalizeAnalytics(response);

      setAnalytics(normalized);
    } catch (err) {
      console.error("Analytics loading error:", err);

      setError(
        err?.message ||
          "Unable to load analytics. Please check the backend connection."
      );

      setAnalytics(EMPTY_ANALYTICS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [range]);

  /* -------------------------------------------------------
     Main chart
  ------------------------------------------------------- */

  const mainChartData = useMemo(() => {
    let data = [];

    switch (selectedMetric) {
      case "properties":
        data = analytics.propertyGrowth;
        break;

      case "transactions":
        data = analytics.transactionVolume;
        break;

      case "views":
        data = analytics.propertyViews;
        break;

      case "downloads":
        data = analytics.documentDownloads;
        break;

      case "activeUsers":
        data = analytics.activeUsers;
        break;

      case "users":
      default:
        data = analytics.userGrowth;
        break;
    }

    if (data.length > 0) {
      return data;
    }

    const fallbackValue =
      selectedMetric === "users"
        ? analytics.summary.totalUsers
        : selectedMetric === "properties"
          ? analytics.summary.totalProperties
          : selectedMetric === "transactions"
            ? analytics.summary.transactionVolume
            : selectedMetric === "views"
              ? analytics.summary.totalViews
              : selectedMetric === "downloads"
                ? analytics.summary.totalDownloads
                : analytics.summary.activeUsers;

    return createFallbackSeries(range, fallbackValue);
  }, [analytics, selectedMetric, range]);

  const mainChartTitle = {
    users: "User Growth",
    properties: "Property Growth",
    transactions: "Transaction Volume",
    views: "Property Views",
    downloads: "Document Downloads",
    activeUsers: "Active Users",
  }[selectedMetric];

  /* -------------------------------------------------------
     Combined growth data
  ------------------------------------------------------- */

  const growthChartData = useMemo(() => {
    const users =
      analytics.userGrowth.length > 0
        ? analytics.userGrowth
        : createFallbackSeries(range, analytics.summary.totalUsers);

    const properties =
      analytics.propertyGrowth.length > 0
        ? analytics.propertyGrowth
        : createFallbackSeries(range, analytics.summary.totalProperties);

    const length = Math.max(users.length, properties.length);

    return Array.from({ length }).map((_, index) => ({
      label:
        users[index]?.label ||
        properties[index]?.label ||
        `Period ${index + 1}`,

      users: users[index]?.value || 0,

      properties: properties[index]?.value || 0,
    }));
  }, [analytics, range]);

  return (
    <div className="admin-analytics-page">
      {/* -------------------------------------------------
          Header
      ------------------------------------------------- */}

      <div className="analytics-page-header">
        <div>
          <div className="analytics-title-row">
            <LuChartNoAxesCombined size={27} />

            <h1>Analytics</h1>
          </div>

          <p>
            Monitor platform growth, user activity, properties and
            transactions.
          </p>
        </div>

        <div className="analytics-header-actions">
          <div className="analytics-range-selector">
            <LuCalendarDays size={17} />

            <select
              value={range}
              onChange={(event) => setRange(event.target.value)}
            >
              <option value="7D">Last 7 Days</option>
              <option value="30D">Last 30 Days</option>
              <option value="3M">Last 3 Months</option>
              <option value="1Y">Last 1 Year</option>
            </select>
          </div>

          <button
            type="button"
            className="analytics-refresh-btn"
            onClick={() => loadAnalytics(true)}
            disabled={refreshing}
          >
            <LuRefreshCw
              size={17}
              className={refreshing ? "spin" : ""}
            />

            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* -------------------------------------------------
          Error
      ------------------------------------------------- */}

      {error && (
        <div className="analytics-error">
          <div>
            <strong>Unable to load live analytics</strong>

            <span>{error}</span>
          </div>

          <button type="button" onClick={() => loadAnalytics()}>
            Try Again
          </button>
        </div>
      )}

      {/* -------------------------------------------------
          Summary Cards
      ------------------------------------------------- */}

      <div className="analytics-summary-grid">
        <SummaryCard
          title="Total Users"
          value={analytics.summary.totalUsers}
          trend={analytics.trends.users}
          icon={LuUsers}
          iconClass="blue"
          description="Registered platform users"
        />

        <SummaryCard
          title="Total Properties"
          value={analytics.summary.totalProperties}
          trend={analytics.trends.properties}
          icon={LuBuilding2}
          iconClass="green"
          description="Properties on the platform"
        />

        <SummaryCard
          title="Property Views"
          value={analytics.summary.totalViews}
          trend={analytics.trends.views}
          icon={LuEye}
          iconClass="purple"
          description="Total property views"
        />

        <SummaryCard
          title="Document Downloads"
          value={analytics.summary.totalDownloads}
          trend={analytics.trends.downloads}
          icon={LuDownload}
          iconClass="orange"
          description="Documents downloaded"
        />

        <SummaryCard
          title="Active Users"
          value={analytics.summary.activeUsers}
          trend={analytics.trends.activeUsers}
          icon={LuActivity}
          iconClass="cyan"
          description="Currently active users"
        />

        <SummaryCard
          title="Transaction Volume"
          value={analytics.summary.transactionVolume}
          trend={analytics.trends.transactions}
          icon={LuTrendingUp}
          iconClass="red"
          description="Recorded transactions"
        />
      </div>

      {/* -------------------------------------------------
          Loading
      ------------------------------------------------- */}

      {loading ? (
        <div className="analytics-loading-grid">
          <div className="analytics-skeleton large" />
          <div className="analytics-skeleton" />
          <div className="analytics-skeleton" />
        </div>
      ) : (
        <>
          {/* ---------------------------------------------
              Main Analytics
          --------------------------------------------- */}

          <section className="analytics-card main-chart-card">
            <div className="analytics-card-header">
              <div>
                <h2>{mainChartTitle}</h2>

                <p>
                  Performance over the selected time period
                </p>
              </div>

              <select
                className="metric-select"
                value={selectedMetric}
                onChange={(event) =>
                  setSelectedMetric(event.target.value)
                }
              >
                <option value="users">Users</option>
                <option value="properties">Properties</option>
                <option value="transactions">Transactions</option>
                <option value="views">Property Views</option>
                <option value="downloads">Downloads</option>
                <option value="activeUsers">Active Users</option>
              </select>
            </div>

            <div className="main-chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={mainChartData}
                  margin={{
                    top: 15,
                    right: 10,
                    left: 0,
                    bottom: 5,
                  }}
                >
                  <defs>
                    <linearGradient
                      id="analyticsAreaGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#2563eb"
                        stopOpacity={0.25}
                      />

                      <stop
                        offset="100%"
                        stopColor="#2563eb"
                        stopOpacity={0.02}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    stroke="#e5e7eb"
                    strokeDasharray="4 4"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="label"
                    tick={{
                      fill: "#64748b",
                      fontSize: 12,
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    tick={{
                      fill: "#64748b",
                      fontSize: 12,
                    }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />

                  <Tooltip content={<AnalyticsTooltip />} />

                  <Area
                    type="monotone"
                    dataKey="value"
                    name={mainChartTitle}
                    stroke="#2563eb"
                    strokeWidth={3}
                    fill="url(#analyticsAreaGradient)"
                    activeDot={{
                      r: 6,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* ---------------------------------------------
              Second row
          --------------------------------------------- */}

          <div className="analytics-two-column">
            {/* User + Property Growth */}

            <section className="analytics-card">
              <div className="analytics-card-header">
                <div>
                  <h2>Platform Growth</h2>

                  <p>Users and properties over time</p>
                </div>
              </div>

              <div className="secondary-chart-wrapper">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={growthChartData}
                    margin={{
                      top: 15,
                      right: 10,
                      left: 0,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid
                      stroke="#e5e7eb"
                      strokeDasharray="4 4"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="label"
                      tick={{
                        fill: "#64748b",
                        fontSize: 11,
                      }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <YAxis
                      tick={{
                        fill: "#64748b",
                        fontSize: 11,
                      }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />

                    <Tooltip content={<AnalyticsTooltip />} />

                    <Legend
                      wrapperStyle={{
                        fontSize: "12px",
                        paddingTop: "10px",
                      }}
                    />

                    <Line
                      type="monotone"
                      dataKey="users"
                      name="Users"
                      stroke="#2563eb"
                      strokeWidth={2.5}
                      dot={false}
                    />

                    <Line
                      type="monotone"
                      dataKey="properties"
                      name="Properties"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Transactions */}

            <section className="analytics-card">
              <div className="analytics-card-header">
                <div>
                  <h2>Transaction Volume</h2>

                  <p>Transaction activity during the period</p>
                </div>
              </div>

              <div className="secondary-chart-wrapper">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={
                      analytics.transactionVolume.length > 0
                        ? analytics.transactionVolume
                        : createFallbackSeries(
                            range,
                            analytics.summary.transactionVolume
                          )
                    }
                    margin={{
                      top: 15,
                      right: 10,
                      left: 0,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid
                      stroke="#e5e7eb"
                      strokeDasharray="4 4"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="label"
                      tick={{
                        fill: "#64748b",
                        fontSize: 11,
                      }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <YAxis
                      tick={{
                        fill: "#64748b",
                        fontSize: 11,
                      }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />

                    <Tooltip content={<AnalyticsTooltip />} />

                    <Bar
                      dataKey="value"
                      name="Transactions"
                      fill="#7c3aed"
                      radius={[5, 5, 0, 0]}
                      maxBarSize={38}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>

          {/* ---------------------------------------------
              Bottom metrics
          --------------------------------------------- */}

          <div className="analytics-bottom-grid">
            <div className="analytics-mini-card">
              <div className="analytics-mini-icon blue">
                <LuUsers size={20} />
              </div>

              <div>
                <span>Active Users</span>
                <strong>
                  {formatNumber(analytics.summary.activeUsers)}
                </strong>
              </div>
            </div>

            <div className="analytics-mini-card">
              <div className="analytics-mini-icon purple">
                <LuEye size={20} />
              </div>

              <div>
                <span>Property Views</span>
                <strong>
                  {formatNumber(analytics.summary.totalViews)}
                </strong>
              </div>
            </div>

            <div className="analytics-mini-card">
              <div className="analytics-mini-icon orange">
                <LuDownload size={20} />
              </div>

              <div>
                <span>Downloads</span>
                <strong>
                  {formatNumber(analytics.summary.totalDownloads)}
                </strong>
              </div>
            </div>

            <div className="analytics-mini-card">
              <div className="analytics-mini-icon green">
                <LuBuilding2 size={20} />
              </div>

              <div>
                <span>Properties</span>
                <strong>
                  {formatNumber(analytics.summary.totalProperties)}
                </strong>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}