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
  if (authentication.status)
    localStorage.setItem("status", authentication.status);
  if (typeof authentication.profileCompleted === "boolean") {
    localStorage.setItem(
      "profileCompleted",
      String(authentication.profileCompleted),
    );
  }
  if (authentication.name)
    localStorage.setItem("fullName", authentication.name);
  if (authentication.avatarUrl)
    localStorage.setItem("avatarUrl", authentication.avatarUrl);
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
  if (!property) return "N/A";

  if (property.ownerName) return property.ownerName;

  if (property.owner?.name) return property.owner.name;

  return "N/A";
};

export const isAdmin = () => {
  return localStorage.getItem("role") === "ADMIN";
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
      let message = "Login failed. Please try again.";

      try {
        const error = await response.json();

        switch (error.message) {
          case "Invalid Password":
            message = "Incorrect password. Please try again.";
            break;

          case "User not found":
            message = "No account found with this email.";
            break;

          case "Invalid Credentials":
            message = "Invalid email or password.";
            break;

          default:
            message = error.message || message;
        }
      } catch {
        message = await response.text();
      }

      throw new Error(message);
    }

    const authentication = await readAuthenticationResponse(response);
    storeAuthenticationState(authentication, email);
    localStorage.setItem(
      "fullName",
      authentication.name || email.split("@")[0],
    );

    try {
      const profile = await api.getUserProfile();
      if (profile) {
        if (profile.name) localStorage.setItem("fullName", profile.name);
        if (profile.userId)
          localStorage.setItem("userId", String(profile.userId));
        if (profile.role) localStorage.setItem("role", profile.role);
        if (profile.status) localStorage.setItem("status", profile.status);
        if (typeof profile.profileCompleted === "boolean") {
          localStorage.setItem(
            "profileCompleted",
            String(profile.profileCompleted),
          );
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
      profileCompleted:
        localStorage.getItem("profileCompleted") === null
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
      let message = "Google login failed. Please try again.";

      try {
        const error = await response.json();

        switch (error.message) {
          case "User not found":
            message = "No account found with this Google account.";
            break;

          default:
            message = error.message || message;
        }
      } catch {
        message = await response.text();
      }

      throw new Error(message);
    }

    const authentication = await readAuthenticationResponse(response);
    storeAuthenticationState(authentication);
    localStorage.setItem("fullName", authentication.name || "Google User");

    try {
      const profile = await api.getUserProfile();
      if (profile) {
        if (profile.name) localStorage.setItem("fullName", profile.name);
        if (profile.email) localStorage.setItem("email", profile.email);
        if (profile.userId)
          localStorage.setItem("userId", String(profile.userId));
        if (profile.role) localStorage.setItem("role", profile.role);
        if (profile.status) localStorage.setItem("status", profile.status);
        if (typeof profile.profileCompleted === "boolean") {
          localStorage.setItem(
            "profileCompleted",
            String(profile.profileCompleted),
          );
        }
      }
    } catch (e) {
      console.warn("Failed to fetch profile during Google login", e);
    }

    return {
      token: authentication.token,
      role: localStorage.getItem("role"),
      status: localStorage.getItem("status"),
      profileCompleted:
        localStorage.getItem("profileCompleted") === null
          ? null
          : localStorage.getItem("profileCompleted") === "true",
    };
  },

  register: async (
    fullName,
    email,
    password,
    phoneNumberOrRole,
    legacyPhoneNumber,
  ) => {
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
      let message = "Registration failed. Please try again.";

      try {
        const error = await response.json();

        switch (error.message) {
          case "User already exists":
            message = "An account with this email already exists.";
            break;

          default:
            message = error.message || message;
        }
      } catch {
        message = await response.text();
      }

      throw new Error(message);
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
      profileCompleted:
        localStorage.getItem("profileCompleted") === null
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
  verifyOtp: async (email, token) => {
    const response = await fetch(`${BASE_URL}/auth/verify-otp`, {
      method: "POST",

      headers: getHeaders(false),

      body: JSON.stringify({
        email,
        token,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));

      throw new Error(error.error || "Invalid OTP");
    }

    return response.text();
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
      throw new Error(
        (await response.text()) || "Unable to complete onboarding",
      );
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
      throw new Error(
        (await response.text()) || "Unable to submit verification request",
      );
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
      throw new Error(
        (await response.text()) || "Unable to load role requests",
      );
    }

    return response.json();
  },

  approveAdminRoleRequest: async (id) => {
    const response = await fetch(
      `${BASE_URL}/admin/role-requests/${id}/approve`,
      {
        method: "PUT",
        headers: getHeaders(true),
      },
    );

    if (!response.ok) {
      throw new Error(
        (await response.text()) || "Unable to approve role request",
      );
    }

    return response.json();
  },

  rejectAdminRoleRequest: async (id) => {
    const response = await fetch(
      `${BASE_URL}/admin/role-requests/${id}/reject`,
      {
        method: "PUT",
        headers: getHeaders(true),
      },
    );

    if (!response.ok) {
      throw new Error(
        (await response.text()) || "Unable to reject role request",
      );
    }

    return response.json();
  },

  // Dashboard API
  getDashboardSummary: async () => {
    const response = await fetch(`${BASE_URL}/dashboard/stats`, {
      headers: getHeaders(true),
    });
    if (!response.ok)
      throw new Error(
        (await response.text()) || "Failed to load dashboard statistics",
      );
    return response.json();
  },

  getDashboardRiskDistribution: async () => {
    const response = await fetch(`${BASE_URL}/dashboard/risk-distribution`, {
      headers: getHeaders(true),
    });
    if (!response.ok)
      throw new Error(
        (await response.text()) || "Failed to load dashboard risk distribution",
      );
    return response.json();
  },

  getRecentSearches: async () => {
    const response = await fetch(`${BASE_URL}/dashboard/recent-searches`, {
      headers: getHeaders(true),
    });
    if (!response.ok)
      throw new Error(
        (await response.text()) || "Failed to load recent searches",
      );
    return response.json();
  },

  searchProperties: async (keyword, { page = 0, size = 20 } = {}) => {
    const params = new URLSearchParams({ keyword: keyword || "", page, size });
    const response = await fetch(
      `${BASE_URL}/properties/global-search?${params}`,
      { headers: getHeaders(true) },
    );
    if (!response.ok)
      throw new Error((await response.text()) || "Failed to search properties");
    return response.json();
  },

  autocomplete: async (keyword) => {
    const params = new URLSearchParams({ keyword: keyword || "" });
    const response = await fetch(
      `${BASE_URL}/properties/autocomplete?${params}`,
      { headers: getHeaders(true) },
    );
    if (!response.ok)
      throw new Error((await response.text()) || "Failed to load suggestions");
    return response.json();
  },

  saveSearchHistory: async (payload) => {
    const response = await fetch(`${BASE_URL}/search-history`, {
      method: "POST",
      headers: getHeaders(true),
      body: JSON.stringify(payload),
    });
    if (!response.ok)
      throw new Error((await response.text()) || "Failed to save search");
    return response.json();
  },

  deleteSearchHistory: async (searchId) => {
    const response = await fetch(`${BASE_URL}/search-history/${searchId}`, {
      method: "DELETE",
      headers: getHeaders(true),
    });
    if (!response.ok)
      throw new Error(
        (await response.text()) || "Failed to delete search history entry",
      );
    return response.text();
  },

  clearSearchHistory: async () => {
    const response = await fetch(`${BASE_URL}/search-history`, {
      method: "DELETE",
      headers: getHeaders(true),
    });
    if (!response.ok)
      throw new Error(
        (await response.text()) || "Failed to clear search history",
      );
    return response.text();
  },

  getNotifications: async ({ page = 0, size = 20, filter } = {}) => {
    const params = new URLSearchParams({ page, size });
    if (filter) params.set("filter", filter);

    const response = await fetch(`${BASE_URL}/notifications?${params}`, {
      headers: getHeaders(true),
    });
    if (!response.ok)
      throw new Error(
        (await response.text()) || "Failed to load notifications",
      );
    return response.json();
  },

  getUnreadNotifications: async ({ page = 0, size = 20 } = {}) => {
    const params = new URLSearchParams({
      page: String(page),
      size: String(size),
    });
    const response = await fetch(`${BASE_URL}/notifications/unread?${params}`, {
      headers: getHeaders(true),
    });
    if (!response.ok)
      throw new Error(
        (await response.text()) || "Failed to load unread notifications",
      );
    return response.json();
  },

  getNotificationCount: async () => {
    const response = await fetch(`${BASE_URL}/notifications/count`, {
      headers: getHeaders(true),
    });
    if (!response.ok)
      throw new Error(
        (await response.text()) || "Failed to load notification count",
      );
    return response.json();
  },

  markNotificationRead: async (id) => {
    const response = await fetch(`${BASE_URL}/notifications/${id}/read`, {
      method: "PATCH",
      headers: getHeaders(true),
    });
    if (!response.ok)
      throw new Error(
        (await response.text()) || "Failed to mark notification read",
      );
    return response.json();
  },

  markAllNotificationsRead: async () => {
    const response = await fetch(`${BASE_URL}/notifications/read-all`, {
      method: "PATCH",
      headers: getHeaders(true),
    });
    if (!response.ok)
      throw new Error(
        (await response.text()) || "Failed to mark all notifications read",
      );
  },

  deleteNotification: async (id) => {
    const response = await fetch(`${BASE_URL}/notifications/${id}`, {
      method: "DELETE",
      headers: getHeaders(true),
    });
    if (!response.ok)
      throw new Error(
        (await response.text()) || "Failed to delete notification",
      );
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
    const response = await fetch(
      `${BASE_URL}/properties/${propertyId}/tax-history`,
      {
        method: "GET",
        headers: getHeaders(true),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to load property tax history");
    }

    return await response.json();
  },

  getPropertyTaxSummary: async (propertyId) => {
    const response = await fetch(
      `${BASE_URL}/properties/${propertyId}/tax-summary`,
      {
        method: "GET",
        headers: getHeaders(true),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to load property tax summary");
    }

    return await response.json();
  },

  getOwnership: async (propertyId) => {
    const response = await fetch(`${BASE_URL}/ownership/${propertyId}`, {
      headers: getHeaders(true),
    });
    if (!response.ok)
      throw new Error(
        (await response.text()) || "Failed to load ownership records",
      );
    return response.json();
  },
  getRiskSummary: async (propertyId) => {
    const response = await fetch(`${BASE_URL}/risk-summary/${propertyId}`, {
      headers: getHeaders(true),
    });
    if (!response.ok)
      throw new Error((await response.text()) || "Failed to load risk summary");
    return response.json();
  },
  getDocuments: async (propertyId) => {
    const response = await fetch(`${BASE_URL}/documents/${propertyId}`, {
      headers: getHeaders(true),
    });
    if (!response.ok)
      throw new Error((await response.text()) || "Failed to load documents");
    return response.json();
  },
  createDocument: async (payload) => {
    const response = await fetch(`${BASE_URL}/documents`, {
      method: "POST",
      headers: getHeaders(true),
      body: JSON.stringify(payload),
    });
    if (!response.ok)
      throw new Error((await response.text()) || "Failed to add document");
    return response.json();
  },
  deleteDocument: async (id) => {
    const response = await fetch(`${BASE_URL}/documents/${id}`, {
      method: "DELETE",
      headers: getHeaders(true),
    });
    if (!response.ok)
      throw new Error((await response.text()) || "Failed to delete document");
  },
  getPermits: async (propertyId) => {
    const response = await fetch(`${BASE_URL}/permits/${propertyId}`, {
      headers: getHeaders(true),
    });
    if (!response.ok)
      throw new Error((await response.text()) || "Failed to load permits");
    return response.json();
  },
  createPermit: async (payload) => {
    const response = await fetch(`${BASE_URL}/permits`, {
      method: "POST",
      headers: getHeaders(true),
      body: JSON.stringify(payload),
    });
    if (!response.ok)
      throw new Error((await response.text()) || "Failed to add permit");
    return response.json();
  },
  updatePermit: async (id, payload) => {
    const response = await fetch(`${BASE_URL}/permits/${id}`, {
      method: "PUT",
      headers: getHeaders(true),
      body: JSON.stringify(payload),
    });
    if (!response.ok)
      throw new Error((await response.text()) || "Failed to update permit");
    return response.json();
  },
  deletePermit: async (id) => {
    const response = await fetch(`${BASE_URL}/permits/${id}`, {
      method: "DELETE",
      headers: getHeaders(true),
    });
    if (!response.ok)
      throw new Error((await response.text()) || "Failed to delete permit");
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
  getPopularProperties: async (limit = 6) => {
    const response = await fetch(`${BASE_URL}/properties/popular?limit=${limit}`, { headers: getHeaders(true) });
    if (!response.ok) throw new Error((await response.text()) || "Failed to load popular properties");
    return response.json();
  },
  getSavedSearches: async () => {
    const response = await fetch(`${BASE_URL}/saved-searches`, { headers: getHeaders(true) });
    if (!response.ok) throw new Error((await response.text()) || "Failed to load saved searches");
    return response.json();
  },
  createSavedSearch: async (payload) => {
    const response = await fetch(`${BASE_URL}/saved-searches`, { method: "POST", headers: getHeaders(true), body: JSON.stringify(payload) });
    if (!response.ok) throw new Error((await response.text()) || "Failed to save search");
    return response.json();
  },
  deleteSavedSearch: async (id) => {
    const response = await fetch(`${BASE_URL}/saved-searches/${id}`, { method: "DELETE", headers: getHeaders(true) });
    if (!response.ok) throw new Error((await response.text()) || "Failed to delete saved search");
  },
  getProfileDashboard: async () => {
    const response = await fetch(`${BASE_URL}/users/profile/dashboard`, {
      method: "GET",
      headers: getHeaders(true),
    });
    if (!response.ok) {
      throw new Error((await response.text()) || "Failed to load profile dashboard");
    }
    return response.json();
  },
  getActivityLogs: async (propertyId) => {
    const response = await fetch(`${BASE_URL}/activity-log/${propertyId}`, {
      headers: getHeaders(true),
    });

    if (!response.ok) {
      throw new Error(
        (await response.text()) || "Failed to load activity logs",
      );
    }

    return response.json();
  },

  getRiskAssessment: async (propertyId) => {
    const response = await fetch(`${BASE_URL}/risk/${propertyId}`, { headers: getHeaders(true) });
    if (!response.ok) throw new Error((await response.text()) || "Failed to load risk assessment");
    return response.json();
  },

  getComparableProperties: async (propertyId) => {
    const response = await fetch(`${BASE_URL}/comparison/${propertyId}`, { headers: getHeaders(true) });
    if (!response.ok) throw new Error((await response.text()) || "Failed to load comparable properties");
    return response.json();
  },

  getPropertyValuation: async (propertyId) => {
    const response = await fetch(`${BASE_URL}/valuation/${propertyId}`, { headers: getHeaders(true) });
    if (!response.ok) throw new Error((await response.text()) || "Failed to load property valuation");
    return response.json();
  },

  recordPropertyView: async (propertyId) => {
    const response = await fetch(`${BASE_URL}/activity-log/${propertyId}/view`, {
      method: "POST",
      headers: getHeaders(true),
    });
    if (!response.ok)
      throw new Error((await response.text()) || "Failed to record property view");
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

  getZoning: async (propertyId) => {
    const response = await fetch(`${BASE_URL}/zoning/${propertyId}`, {
      method: "GET",
      headers: getHeaders(true),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to load zoning details");
    }

    return await response.json();
  },

  getFloodZone: async (propertyId) => {
    const response = await fetch(`${BASE_URL}/flood-zone/${propertyId}`, {
      method: "GET",
      headers: getHeaders(true),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to load flood zone details");
    }

    return await response.json();
  },

  getAuditLogs: async () => {
    const response = await fetch(`${BASE_URL}/audit`, {
      method: "GET",
      headers: getHeaders(true),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to load audit logs");
    }

    return await response.json();
  },

  // Report Engine APIs
  getReportByProperty: async (propertyId) => {
    const response = await fetch(`${BASE_URL}/report/latest/${propertyId}`, {
      headers: getHeaders(true),
    });
    if (response.status === 404) return null;
    if (!response.ok) {
      throw new Error((await response.text()) || "Failed to load report");
    }
    return response.json();
  },

  generateReport: async (propertyId) => {
    const response = await fetch(`${BASE_URL}/report/generate`, {
      method: "POST",
      headers: getHeaders(true),
      body: JSON.stringify({ propertyId }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to generate report");
    }

    return await response.json();
  },

  downloadReportPdf: async (reportId) => {
    const response = await fetch(`${BASE_URL}/report/pdf/${reportId}`, {
      method: "GET",
      headers: getHeaders(true),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to download PDF report");
    }

    return await response.blob();
  },

  downloadReportExcel: async (reportId) => {
    const response = await fetch(`${BASE_URL}/report/excel/${reportId}`, {
      method: "GET",
      headers: getHeaders(true),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to download Excel report");
    }

    return await response.blob();
  },
};
