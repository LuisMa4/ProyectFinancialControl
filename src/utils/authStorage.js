import { apiRequest } from "./apiClient";
import { readAuthToken, writeAuthToken } from "./authToken";

export { readAuthToken, writeAuthToken };

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
