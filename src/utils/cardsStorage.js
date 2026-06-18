import { apiRequest } from "./apiClient";

export const CARD_STORAGE_KEY = "savia-cards";
export const CARD_STORAGE_EVENT = "savia-cards-updated";

export const readStoredCards = () => {
  try {
    const raw = localStorage.getItem(CARD_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const loadStoredCards = async (fallback = []) => {
  try {
    const cards = await apiRequest("/cards");
    localStorage.setItem(CARD_STORAGE_KEY, JSON.stringify(cards));
    window.dispatchEvent(new Event(CARD_STORAGE_EVENT));
    return cards;
  } catch {
    return readStoredCards() || fallback;
  }
};

export const writeStoredCards = async (cards) => {
  try {
    const saved = await apiRequest("/cards", {
      method: "PUT",
      body: JSON.stringify({ cards }),
    });
    localStorage.setItem(CARD_STORAGE_KEY, JSON.stringify(saved));
    window.dispatchEvent(new Event(CARD_STORAGE_EVENT));
    return saved;
  } catch {
    localStorage.setItem(CARD_STORAGE_KEY, JSON.stringify(cards));
    window.dispatchEvent(new Event(CARD_STORAGE_EVENT));
    return cards;
  }
};
