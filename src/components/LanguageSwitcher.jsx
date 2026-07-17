import { useI18n } from "../i18n/index.jsx";

const styles = `
.lang-switch{display:inline-flex;align-items:center;background:var(--mint,#EDF8F7);border:1px solid var(--border,#DDE9E7);border-radius:100px;padding:3px;gap:2px;flex-shrink:0}
.lang-switch button{border:none;background:none;font-family:inherit;font-size:12px;font-weight:600;color:var(--muted,#8AADA9);padding:5px 12px;border-radius:100px;cursor:pointer;transition:all .18s;letter-spacing:.3px}
.lang-switch button:hover{color:var(--slate,#2D4A47)}
.lang-switch button.on{background:var(--white,#FAFFFE);color:var(--agua-d,#5AADA5);box-shadow:0 1px 4px rgba(45,74,71,.12)}
`;

export default function LanguageSwitcher({ compact = false }) {
  const { lang, setLang } = useI18n();

  return (
    <>
      <style>{styles}</style>
      <div className="lang-switch" role="group" aria-label="Idioma / Language">
        <button type="button" className={lang === "es" ? "on" : ""} onClick={() => setLang("es")} title="Español">
          {compact ? "ES" : "🇵🇪 ES"}
        </button>
        <button type="button" className={lang === "en" ? "on" : ""} onClick={() => setLang("en")} title="English">
          {compact ? "EN" : "🇺🇸 EN"}
        </button>
      </div>
    </>
  );
}
