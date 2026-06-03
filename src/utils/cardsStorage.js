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

export const writeStoredCards = (cards) => {
  localStorage.setItem(CARD_STORAGE_KEY, JSON.stringify(cards));
  window.dispatchEvent(new Event(CARD_STORAGE_EVENT));
};
