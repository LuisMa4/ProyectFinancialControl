import { apiRequest } from "./apiClient";

const AUTH_TOKEN_KEY = "savia-auth-token";

export const readAuthToken = () => localStorage.getItem(AUTH_TOKEN_KEY) || "";
export const writeAuthToken = (token) => {
  if (token) localStorage.setItem(AUTH_TOKEN_KEY, token);
  else localStorage.removeItem(AUTH_TOKEN_KEY);
};

export const registerAccount = async (payload) => apiRequest("/auth/register", {
  method: "POST",
  body: JSON.stringify(payload),
});

export const loginAccount = async (payload) => apiRequest("/auth/login", {
  method: "POST",
  body: JSON.stringify(payload),
});

export const fetchCurrentAccount = async (token) => apiRequest("/auth/me", {
  method: "GET",
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const logoutAccount = async (token) => apiRequest("/auth/logout", {
  method: "POST",
  body: JSON.stringify({ token }),
});
