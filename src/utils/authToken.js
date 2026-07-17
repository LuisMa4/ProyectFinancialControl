const AUTH_TOKEN_KEY = "savia-auth-token";

export const readAuthToken = () => localStorage.getItem(AUTH_TOKEN_KEY) || "";

export const writeAuthToken = (token) => {
  if (token) localStorage.setItem(AUTH_TOKEN_KEY, token);
  else localStorage.removeItem(AUTH_TOKEN_KEY);
};
