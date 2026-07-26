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

export const getPropertyOwnerName = (property) => {
  if (property.ownerName) return property.ownerName;
  if (property.owner && property.owner.name) return property.owner.name;
  return "Property Owner";
};

export const isAdmin = () => {
  return localStorage.getItem("role") === "ADMIN";
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

  forgotPassword: async (email) => {
    const response = await fetch(`${BASE_URL}/auth/forgot-password`, {
      method: "POST",
      headers: getHeaders(false),
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || "Unable to create a reset token");
    }

    return response.json();
  },

  resetPassword: async (token, newPassword) => {
    const response = await fetch(`${BASE_URL}/auth/reset-password`, {
      method: "POST",
      headers: getHeaders(false),
      body: JSON.stringify({ token, newPassword }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || "Unable to reset password");
    }

    return response.text();
  },

  // Dashboard API
  getDashboardSummary: async () => {
    const response = await fetch(`${BASE_URL}/dashboard/stats`, { headers: getHeaders(true) });
    if (!response.ok) throw new Error(await response.text() || "Failed to load dashboard statistics");
    return response.json();
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

  createProperty: async (payload) => {
    const response = await fetch(`${BASE_URL}/properties`, {
      method: "POST",
      headers: getHeaders(true),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to create property");
    }

    return await response.json();
  },

  updateProperty: async (id, payload) => {
    const response = await fetch(`${BASE_URL}/properties/${id}`, {
      method: "PUT",
      headers: getHeaders(true),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to update property");
    }

    return await response.json();
  },

  deleteProperty: async (id) => {
    const response = await fetch(`${BASE_URL}/properties/${id}`, {
      method: "DELETE",
      headers: getHeaders(true),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to delete property");
    }

    return await response.text();
  },

  getPropertyTaxHistory: async (propertyId) => {
    const response = await fetch(`${BASE_URL}/properties/${propertyId}/tax-history`, {
      method: "GET",
      headers: getHeaders(true),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to load property tax history");
    }

    return await response.json();
  },

  getPropertyTaxSummary: async (propertyId) => {
    const response = await fetch(`${BASE_URL}/properties/${propertyId}/tax-summary`, {
      method: "GET",
      headers: getHeaders(true),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to load property tax summary");
    }

    return await response.json();
  },

  getOwnership: async (propertyId) => {
    const response = await fetch(`${BASE_URL}/ownership/${propertyId}`, { headers: getHeaders(true) });
    if (!response.ok) throw new Error(await response.text() || "Failed to load ownership records");
    return response.json();
  },
  getRiskSummary: async (propertyId) => {
    const response = await fetch(`${BASE_URL}/risk-summary/${propertyId}`, { headers: getHeaders(true) });
    if (!response.ok) throw new Error(await response.text() || "Failed to load risk summary");
    return response.json();
  },
  getDocuments: async (propertyId) => {
    const response = await fetch(`${BASE_URL}/documents/${propertyId}`, { headers: getHeaders(true) });
    if (!response.ok) throw new Error(await response.text() || "Failed to load documents");
    return response.json();
  },
  createDocument: async (payload) => {
    const response = await fetch(`${BASE_URL}/documents`, { method: "POST", headers: getHeaders(true), body: JSON.stringify(payload) });
    if (!response.ok) throw new Error(await response.text() || "Failed to add document");
    return response.json();
  },
  deleteDocument: async (id) => {
    const response = await fetch(`${BASE_URL}/documents/${id}`, { method: "DELETE", headers: getHeaders(true) });
    if (!response.ok) throw new Error(await response.text() || "Failed to delete document");
  },
  getPermits: async (propertyId) => {
    const response = await fetch(`${BASE_URL}/permits/${propertyId}`, { headers: getHeaders(true) });
    if (!response.ok) throw new Error(await response.text() || "Failed to load permits");
    return response.json();
  },
  createPermit: async (payload) => {
    const response = await fetch(`${BASE_URL}/permits`, { method: "POST", headers: getHeaders(true), body: JSON.stringify(payload) });
    if (!response.ok) throw new Error(await response.text() || "Failed to add permit");
    return response.json();
  },
  updatePermit: async (id, payload) => {
    const response = await fetch(`${BASE_URL}/permits/${id}`, { method: "PUT", headers: getHeaders(true), body: JSON.stringify(payload) });
    if (!response.ok) throw new Error(await response.text() || "Failed to update permit");
    return response.json();
  },
  deletePermit: async (id) => {
    const response = await fetch(`${BASE_URL}/permits/${id}`, { method: "DELETE", headers: getHeaders(true) });
    if (!response.ok) throw new Error(await response.text() || "Failed to delete permit");
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