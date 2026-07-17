import { apiRequest } from "./apiClient";

export const GOALS_STORAGE_KEY = "savia-goals";
export const GOALS_CHANGED_EVENT = "savia-goals-changed";

export const readStoredGoals = () => {
  try {
    const raw = localStorage.getItem(GOALS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const loadStoredGoals = async (fallback = []) => {
  try {
    const goals = await apiRequest("/goals");
    localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
    window.dispatchEvent(new Event(GOALS_CHANGED_EVENT));
    return goals;
  } catch {
    return readStoredGoals() || fallback;
  }
};

export const writeStoredGoals = async (goals) => {
  try {
    const saved = await apiRequest("/goals", {
      method: "PUT",
      body: JSON.stringify({ goals }),
    });
    localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(saved));
    window.dispatchEvent(new Event(GOALS_CHANGED_EVENT));
    return saved;
  } catch {
    localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
    window.dispatchEvent(new Event(GOALS_CHANGED_EVENT));
    return goals;
  }
};
