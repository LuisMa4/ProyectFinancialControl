import { useState } from "react";
import { loginAccount, writeAuthToken } from "../utils/authStorage";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useI18n } from "../i18n/index.jsx";
import saviaIcon from "../assets/savia_icon_final.png";
import "./login.css";

const parseApiError = (message) => {
  try { return JSON.parse(message)?.error || null; } catch { return null; }
};

export default function LoginPage({ onRegister, onLoginSuccess }) {
  const { t, lang } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [demoLoading, setDemoLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!email.trim()) errs.email = lang === "en" ? "Email is required" : "El correo es requerido";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = lang === "en" ? "Invalid email" : "Correo inválido";
    if (!password) errs.password = lang === "en" ? "Password is required" : "La contraseña es requerida";
    else if (password.length < 6) errs.password = lang === "en" ? "At least 6 characters" : "Mínimo 6 caracteres";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const response = await loginAccount({ email, password, rememberMe: remember });
      writeAuthToken(response.token);
      setToast(lang === "en" ? "Welcome! Signing you in..." : "¡Bienvenido! Ingresando al sistema...");
      setTimeout(() => {
        setToast(null);
        onLoginSuccess(response.user, response.token);
      }, 900);
    } catch (error) {
      setErrors({ form: parseApiError(error.message) || (lang === "en" ? "Could not sign in" : "No se pudo iniciar sesión") });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setErrors({});
    setDemoLoading(true);
    try {
      const response = await loginAccount({ email: "juan.perez@gmail.com", password: "Savia123!", rememberMe: false });
      writeAuthToken(response.token);
      setToast(t("login.demoWelcome"));
      setTimeout(() => {
        setToast(null);
        onLoginSuccess(response.user, response.token);
      }, 700);
    } catch {
      setErrors({ form: t("login.demoError") });
    } finally {
      setDemoLoading(false);
    }
  };

  const handleChange = (field) => (e) => {
    if (field === "email") setEmail(e.target.value);
    else setPassword(e.target.value);
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  return (
    <>
      {toast && (
        <div className="login-toast">
          <span>✓</span> {toast}
        </div>
      )}
      <div className="page login-page">
        <div className="left-panel">
          <div className="brand">
            <img className="brand-icon" src={saviaIcon} alt="Savia" />
            <span className="brand-name">Savia</span>
          </div>

          <div className="hero-content">
            <div className="hero-tag">
              <div className="hero-tag-dot" />
              {t("login.heroTag")}
            </div>
            <h1 className="hero-title">
              {t("login.heroTitle1")}<br />
              <em>{t("login.heroTitle2")}</em>
              <br />
              {t("login.heroTitle3")}
            </h1>
            <p className="hero-sub">{t("login.heroSub")}</p>
          </div>

          <div className="stats-row">
            <div className="stat">
              <span className="stat-num">32+</span>
              <span className="stat-label">{t("login.statFeatures")}</span>
            </div>
            <div className="stat">
              <span className="stat-num">100%</span>
              <span className="stat-label">{t("login.statSecure")}</span>
            </div>
            <div className="stat">
              <span className="stat-num">24/7</span>
              <span className="stat-label">{t("login.statAvailable")}</span>
            </div>
          </div>
        </div>

        <div className="right-panel">
          <div className="login-card">
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
              <LanguageSwitcher />
            </div>
            <div className="form-header">
              <p className="form-eyebrow">{t("login.title")}</p>
              <h2 className="form-title">{t("login.submit")}</h2>
              <p className="form-subtitle">{t("login.subtitle")}</p>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label className="form-label" htmlFor="email">{t("login.email")}</label>
                <div className="input-wrap">
                  <span className="input-icon">✉</span>
                  <input
                    id="email"
                    type="email"
                    className={`form-input${errors.email ? " error" : ""}`}
                    placeholder={t("login.emailPlaceholder")}
                    value={email}
                    onChange={handleChange("email")}
                    autoComplete="email"
                  />
                </div>
                {errors.email && <div className="error-msg">⚠ {errors.email}</div>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="password">{t("login.password")}</label>
                <div className="input-wrap">
                  <span className="input-icon">🔒</span>
                  <input
                    id="password"
                    type={showPass ? "text" : "password"}
                    className={`form-input${errors.password ? " error" : ""}`}
                    placeholder="••••••••"
                    value={password}
                    onChange={handleChange("password")}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="toggle-pass"
                    onClick={() => setShowPass((value) => !value)}
                    aria-label={showPass ? t("login.hidePassword") : t("login.showPassword")}
                  >
                    {showPass ? "🙈" : "👁"}
                  </button>
                </div>
                {errors.password && <div className="error-msg">⚠ {errors.password}</div>}
              </div>

              <div className="row-options">
                <label className="remember-label">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  {t("login.remember")}
                </label>
                <a href="#" className="forgot-link">{t("login.forgot")}</a>
              </div>

              {errors.form && <div className="error-msg">⚠ {errors.form}</div>}

              <button type="submit" className="btn-login" disabled={loading}>
                {loading ? <div className="spinner" /> : null}
                {loading ? t("login.submitting") : `${t("login.submit")} →`}
              </button>

              <p className="signup-line">
                {t("login.noAccount")}{" "}
                <a onClick={onRegister} className="signup-link">{t("login.register")}</a>
              </p>

              <div className="demo-divider"><span>{t("login.or")}</span></div>

              <button type="button" className="btn-demo" onClick={handleDemoLogin} disabled={demoLoading || loading}>
                {demoLoading ? t("login.submitting") : t("login.continueDemo")}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
