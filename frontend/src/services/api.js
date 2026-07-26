const BASE_URL = "http://localhost:8081/api";

const readAuthenticationResponse = async (response) => {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const authentication = await response.json();
    if (!authentication.token) {
      throw new Error("Login response did not include a token");
    }
    return authentication;
  }

  return { token: await response.text() };
};

const storeAuthenticationState = (authentication, fallbackEmail) => {
  localStorage.setItem("token", authentication.token);
  localStorage.setItem("email", authentication.email || fallbackEmail);

  ["role", "status", "profileCompleted"].forEach((key) => {
    localStorage.removeItem(key);
  });

  if (authentication.role) localStorage.setItem("role", authentication.role);
  if (authentication.status) localStorage.setItem("status", authentication.status);
  if (typeof authentication.profileCompleted === "boolean") {
    localStorage.setItem("profileCompleted", String(authentication.profileCompleted));
  }
  if (authentication.name) localStorage.setItem("fullName", authentication.name);
  if (authentication.avatarUrl) localStorage.setItem("avatarUrl", authentication.avatarUrl);
};

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

export const api = {
  // Authentication APIs
  login: async (email, password) => {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: getHeaders(false),
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Login failed");
    }

    const authentication = await readAuthenticationResponse(response);
    storeAuthenticationState(authentication, email);
    localStorage.setItem("fullName", authentication.name || email.split("@")[0]);

    try {
      const profile = await api.getUserProfile();
      if (profile) {
        if (profile.name) localStorage.setItem("fullName", profile.name);
        if (profile.userId) localStorage.setItem("userId", String(profile.userId));
        if (profile.role) localStorage.setItem("role", profile.role);
        if (profile.status) localStorage.setItem("status", profile.status);
        if (typeof profile.profileCompleted === "boolean") {
          localStorage.setItem("profileCompleted", String(profile.profileCompleted));
        }
      }
    } catch (e) {
      console.warn("Failed to fetch profile during login", e);
    }

    return {
      token: authentication.token,
      email: authentication.email || email,
      role: localStorage.getItem("role"),
      status: localStorage.getItem("status"),
      profileCompleted: localStorage.getItem("profileCompleted") === null
        ? null
        : localStorage.getItem("profileCompleted") === "true",
    };
  },

  // Google OAuth login — Login.jsx uses useGoogleLogin({ flow: "auth-code" }),
  // so tokenResponse contains an authorization `code`, not an access_token.
  loginWithGoogle: async (tokenResponse) => {
    const response = await fetch(`${BASE_URL}/auth/google`, {
      method: "POST",
      headers: getHeaders(false),
      body: JSON.stringify({ code: tokenResponse.code }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Google login failed");
    }

    const authentication = await readAuthenticationResponse(response);
    storeAuthenticationState(authentication);
    localStorage.setItem("fullName", authentication.name || "Google User");

    try {
      const profile = await api.getUserProfile();
      if (profile) {
        if (profile.name) localStorage.setItem("fullName", profile.name);
        if (profile.email) localStorage.setItem("email", profile.email);
        if (profile.userId) localStorage.setItem("userId", String(profile.userId));
        if (profile.role) localStorage.setItem("role", profile.role);
        if (profile.status) localStorage.setItem("status", profile.status);
        if (typeof profile.profileCompleted === "boolean") {
          localStorage.setItem("profileCompleted", String(profile.profileCompleted));
        }
      }
    } catch (e) {
      console.warn("Failed to fetch profile during Google login", e);
    }

    return {
      token: authentication.token,
      role: localStorage.getItem("role"),
      status: localStorage.getItem("status"),
      profileCompleted: localStorage.getItem("profileCompleted") === null
        ? null
        : localStorage.getItem("profileCompleted") === "true",
    };
  },

  register: async (fullName, email, password, phoneNumberOrRole, legacyPhoneNumber) => {
    const phoneNumber = legacyPhoneNumber ?? phoneNumberOrRole;

    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: getHeaders(false),
      body: JSON.stringify({
        name: fullName,
        email: email,
        password: password,
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
    localStorage.removeItem("status");
    localStorage.removeItem("profileCompleted");
    localStorage.removeItem("avatarUrl");
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
      status: localStorage.getItem("status"),
      profileCompleted: localStorage.getItem("profileCompleted") === null
        ? null
        : localStorage.getItem("profileCompleted") === "true",
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

  completeProfile: async (accountType) => {
    const response = await fetch(`${BASE_URL}/profile/complete`, {
      method: "POST",
      headers: getHeaders(true),
      body: JSON.stringify({ accountType }),
    });

    if (!response.ok) {
      throw new Error(await response.text() || "Unable to complete onboarding");
    }

    return response.json();
  },

  createRoleRequest: async (requestData) => {
    const response = await fetch(`${BASE_URL}/role-request`, {
      method: "POST",
      headers: getHeaders(true),
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      throw new Error(await response.text() || "Unable to submit verification request");
    }

    return response.json();
  },

  getAdminRoleRequests: async ({ status, requestedRole } = {}) => {
    const query = new URLSearchParams();
    if (status) query.set("status", status);
    if (requestedRole) query.set("requestedRole", requestedRole);

    const suffix = query.toString() ? `?${query}` : "";
    const response = await fetch(`${BASE_URL}/admin/role-requests${suffix}`, {
      headers: getHeaders(true),
    });

    if (!response.ok) {
      throw new Error(await response.text() || "Unable to load role requests");
    }

    return response.json();
  },

  approveAdminRoleRequest: async (id) => {
    const response = await fetch(`${BASE_URL}/admin/role-requests/${id}/approve`, {
      method: "PUT",
      headers: getHeaders(true),
    });

    if (!response.ok) {
      throw new Error(await response.text() || "Unable to approve role request");
    }

    return response.json();
  },

  rejectAdminRoleRequest: async (id) => {
    const response = await fetch(`${BASE_URL}/admin/role-requests/${id}/reject`, {
      method: "PUT",
      headers: getHeaders(true),
    });

    if (!response.ok) {
      throw new Error(await response.text() || "Unable to reject role request");
    }

    return response.json();
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
