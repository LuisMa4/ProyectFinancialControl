export const LANGUAGE_STORAGE_KEY = "savia-language";

export const readStoredLanguage = () => {
  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return stored === "en" || stored === "es" ? stored : "es";
};
