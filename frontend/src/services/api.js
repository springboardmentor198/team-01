const BASE_URL = "http://localhost:8081/api";

const getHeaders = (includeAuth = true) => {
  const headers = {
    "Content-Type": "application/json",
  };
  if (includeAuth) {
    const token = localStorage.getItem("token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return headers;
};

export const getPropertyRisk = (id) => {
  const risks = {
    1: "Medium",
    2: "Low",
    3: "High",
    4: "Low",
    5: "Low",
    6: "Medium",
    7: "Low",
    8: "High",
    9: "Medium",
    10: "Low",
  };
  return risks[id] || "Low";
};

export const getPropertyOwnerName = (property) => {
  if (property.ownerName) return property.ownerName;
  if (property.owner && property.owner.name) return property.owner.name;
  return "Property Owner";
};

export const api = {
  // Authentication APIs
  login: async (email, password, role) => {
    // Mithun's login DTO takes email and password
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: getHeaders(false),
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Login failed");
    }

    // Mithun's login returns raw JWT token string
    const token = await response.text();
    localStorage.setItem("token", token);
    localStorage.setItem("email", email);
    localStorage.setItem("role", role); // Save selected role in frontend session
    localStorage.setItem("fullName", email.split("@")[0]); // Fallback display name

    try {
      // Fetch profile to get official full name and user id
      const profile = await api.getUserProfile();
      if (profile) {
        if (profile.name) localStorage.setItem("fullName", profile.name);
        if (profile.userId) localStorage.setItem("userId", String(profile.userId));
      }
    } catch (e) {
      console.warn("Failed to fetch profile during login", e);
    }

    return { token, email, role };
  },

  // Google OAuth login — Login.jsx uses useGoogleLogin({ flow: "auth-code" }),
  // so tokenResponse contains an authorization `code`, not an access_token.
  // NOTE: backend needs a POST /api/auth/google endpoint that accepts
  // { code, role } and returns a raw JWT string (same shape as /auth/login).
  // Confirm the exact route/DTO with your backend teammate and adjust below.
  loginWithGoogle: async (tokenResponse, role) => {
    const response = await fetch(`${BASE_URL}/auth/google`, {
      method: "POST",
      headers: getHeaders(false),
      body: JSON.stringify({ code: tokenResponse.code, role }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Google login failed");
    }

    // Assuming backend returns raw JWT text, same as /auth/login
    const token = await response.text();
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    localStorage.setItem("fullName", "Google User"); // Fallback until profile fetch

    try {
      const profile = await api.getUserProfile();
      if (profile) {
        if (profile.name) localStorage.setItem("fullName", profile.name);
        if (profile.email) localStorage.setItem("email", profile.email);
        if (profile.userId) localStorage.setItem("userId", String(profile.userId));
      }
    } catch (e) {
      console.warn("Failed to fetch profile during Google login", e);
    }

    return { token, role };
  },

  register: async (fullName, email, password, role, phoneNumber) => {
    // Mithun's RegisterRequest takes name, email, password, role (Enum)
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: getHeaders(false),
      body: JSON.stringify({
        name: fullName,
        email: email,
        password: password,
        role: role,
        phoneNumber: phoneNumber,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Registration failed");
    }

    return await response.json();
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("fullName");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
  },

  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },

  getCurrentUser: () => {
    return {
      userId: localStorage.getItem("userId"),
      fullName: localStorage.getItem("fullName"),
      email: localStorage.getItem("email"),
      role: localStorage.getItem("role"),
    };
  },

  // Dashboard API
  getDashboardSummary: async () => {
    // Since Mithun's backend does not have a dashboard controller,
    // we fetch properties from the database and compute stats dynamically
    const properties = await api.getProperties();

    const totalProperties = properties.length;
    const pendingReviews = properties.filter((p) => p.status === "UNDER_REVIEW").length;

    const lowCount = properties.filter((p) => getPropertyRisk(p.propertyId) === "Low").length;
    const mediumCount = properties.filter((p) => getPropertyRisk(p.propertyId) === "Medium").length;
    const highCount = properties.filter((p) => getPropertyRisk(p.propertyId) === "High").length;
    const criticalCount = properties.filter((p) => getPropertyRisk(p.propertyId) === "Critical").length;
    const highRiskCount = highCount + criticalCount;

    const totalReports = properties.filter((p) => p.status === "AVAILABLE" || p.status === "VERIFIED").length;

    const recentSearches = properties.slice(0, 5).map((p) => ({
      property: p.address || p.propertyCode,
      type: p.propertyType || "Residential",
      risk: getPropertyRisk(p.propertyId),
      status: p.status === "AVAILABLE" || p.status === "VERIFIED" ? "Completed" : p.status === "UNDER_REVIEW" ? "Reviewing" : "Pending",
    }));

    const riskBreakdown = [
      { label: "Low Risk", count: lowCount, color: "#22C55E" },
      { label: "Medium Risk", count: mediumCount, color: "#F59E0B" },
      { label: "High Risk", count: highCount, color: "#EF4444" },
      { label: "Critical", count: criticalCount, color: "#991B1B" },
    ];

    const notifications = [
      { title: "Database Sync", subtitle: "Latest property records updated" },
      { title: "Status Update", subtitle: "Property review process completed" },
    ];

    return {
      totalProperties,
      totalReports,
      highRiskCount,
      pendingReviews,
      recentSearches,
      riskBreakdown,
      notifications,
    };
  },

  // Property APIs
  getProperties: async () => {
    const response = await fetch(`${BASE_URL}/properties`, {
      method: "GET",
      headers: getHeaders(true),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to load properties");
    }

    return await response.json();
  },

  getPropertyById: async (id) => {
    const response = await fetch(`${BASE_URL}/properties/${id}`, {
      method: "GET",
      headers: getHeaders(true),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to load property details");
    }

    return await response.json();
  },

  // Profile APIs
  getUserProfile: async () => {
    const response = await fetch(`${BASE_URL}/users/profile`, {
      method: "GET",
      headers: getHeaders(true),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to load user profile");
    }

    return await response.json();
  },

  updateUserProfile: async (profileData) => {
    const response = await fetch(`${BASE_URL}/users/profile`, {
      method: "PUT",
      headers: getHeaders(true),
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to update profile");
    }

    return await response.json();
  },
};
