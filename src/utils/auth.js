// Keys used in localStorage
const TOKEN_KEY = "sukhi_token";
const USER_KEY = "sukhi_user";

/**
 * Save token + user profile after a successful login.
 * The JWT itself also lives in an HTTP-only cookie (set by the server)
 * so requests made with `credentials: "include"` are automatically protected.
 * We keep a localStorage copy so we can:
 *  - Read the user profile without an extra network request
 *  - Check expiry client-side before even hitting the server
 */
export const saveAuth = (token, user) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

/** Returns the raw JWT string, or null if not found. */
export const getToken = () => localStorage.getItem(TOKEN_KEY);

/** Returns the stored user object, or null. */
export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
};

/**
 * Returns true if a valid, non-expired token exists in localStorage.
 * This is a lightweight client-side check — the server always does the
 * real verification on protected API calls.
 */
export const isLoggedIn = () => {
  const token = getToken();
  if (!token) return false;
  try {
    // Decode the payload (base64) without verifying signature
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

/** Wipe all auth data (called on logout). */
export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

/**
 * Helper for authenticated fetch calls.
 * Attaches the Bearer token header and sends cookies automatically.
 */
export const authFetch = (url, options = {}) => {
  const token = getToken();
  return fetch(url, {
    ...options,
    credentials: "include", // send HTTP-only cookie
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
};
