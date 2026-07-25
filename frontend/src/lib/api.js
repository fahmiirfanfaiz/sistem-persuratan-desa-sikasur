const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

/**
 * Wrapper around fetch with auto-injected Authorization header and interceptors.
 * @param {string} path - API path (e.g. "/api/submissions")
 * @param {RequestInit} options - fetch options
 */
export async function apiFetch(path, options = {}) {
  const getAccessToken = () =>
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  const getHeaders = (token) => ({
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  });

  const requestOptions = {
    ...options,
    headers: getHeaders(getAccessToken()),
    credentials: options.credentials || "include", // Send HttpOnly cookie
  };

  let res = await fetch(`${API_BASE_URL}${path}`, requestOptions);

  if (res.status === 401 && typeof window !== "undefined") {
    // If not already refreshing, initiate refresh
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const refreshRes = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // Include HttpOnly cookie
        });

        const refreshData = await refreshRes.json();
        
        if (refreshRes.ok && refreshData.data?.accessToken) {
          localStorage.setItem("accessToken", refreshData.data.accessToken);
          onRefreshed(refreshData.data.accessToken);
        } else {
          onRefreshed(null); // Failed to refresh
          clearAuth();
          window.location.href = "/login";
        }
      } catch (err) {
        onRefreshed(null);
        clearAuth();
        window.location.href = "/login";
      } finally {
        isRefreshing = false;
      }
    }

    // Wait for the refresh to complete before retrying
    const newToken = await new Promise((resolve) => {
      subscribeTokenRefresh((token) => resolve(token));
    });

    if (newToken) {
      requestOptions.headers = getHeaders(newToken);
      res = await fetch(`${API_BASE_URL}${path}`, requestOptions);
    }
  }

  return res;
}

/**
 * Returns parsed user from localStorage or null.
 */
export function getStoredUser() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Clears auth state from localStorage.
 */
export function clearAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
}

/**
 * Calls backend to logout (clear HttpOnly cookie) then clears localStorage.
 */
export async function logoutAuth() {
  if (typeof window === "undefined") return;
  try {
    await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch {
    // ignore
  } finally {
    clearAuth();
  }
}
