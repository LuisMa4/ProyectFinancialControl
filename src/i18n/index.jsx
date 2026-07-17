/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import es from "./es";
import en from "./en";
import { apiRequest } from "../utils/apiClient";
import { readAuthToken } from "../utils/authToken";
import { LANGUAGE_STORAGE_KEY, readStoredLanguage } from "../utils/languageStorage";

const DICTIONARIES = { es, en };

const I18nContext = createContext(null);

export { readStoredLanguage };

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(readStoredLanguage);

  const setLang = useCallback((next) => {
    const value = next === "en" ? "en" : "es";
    setLangState(value);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, value);
    // Persistir en el perfil si hay sesión activa (sin bloquear la UI)
    if (readAuthToken()) {
      void apiRequest("/user", {
        method: "PUT",
        body: JSON.stringify({ language: value }),
      }).catch(() => null);
    }
  }, []);

  const t = useCallback((key, params) => {
    const template = DICTIONARIES[lang][key] ?? DICTIONARIES.es[key] ?? key;
    if (!params) return template;
    return template.replace(/\{(\w+)\}/g, (match, name) =>
      Object.prototype.hasOwnProperty.call(params, name) ? String(params[name]) : match
    );
  }, [lang]);

  const value = useMemo(() => ({
    lang,
    setLang,
    t,
    locale: lang === "en" ? "en-US" : "es-PE",
  }), [lang, setLang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n debe usarse dentro de <I18nProvider>");
  }
  return context;
}
