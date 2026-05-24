import { useState } from "react";
import "./login.css";

export default function LoginPage({ onRegister, onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  const validate = () => {
    const errs = {};
    if (!email.trim()) errs.email = "El correo es requerido";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Correo inválido";
    if (!password) errs.password = "La contraseña es requerida";
    else if (password.length < 6) errs.password = "Mínimo 6 caracteres";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    await new Promise(r => setTimeout(r, 1600));
    setLoading(false);
    setToast("¡Bienvenido! Ingresando al sistema…");
    setTimeout(() => {
      setToast(null);
      onLoginSuccess();
    }, 1500);
  };

  const handleChange = (field) => (e) => {
    if (field === "email") setEmail(e.target.value);
    else setPassword(e.target.value);
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  return (
    <>
      {toast && (
        <div className="toast">
          <span>✓</span> {toast}
        </div>
      )}
      <div className="page">
        {/* LEFT */}
        <div className="left-panel">
          <div className="brand">
            <div className="brand-icon">💎</div>
            <span className="brand-name">FinVerde</span>
          </div>

          <div className="hero-content">
            <div className="hero-tag">
              <div className="hero-tag-dot" />
              Sistema Financiero Personal
            </div>
            <h1 className="hero-title">
              Controla tu<br /><em>dinero,</em><br />transforma tu vida.
            </h1>
            <p className="hero-sub">
              Registra gastos, define metas de ahorro y recibe consejos inteligentes para mejorar tu salud financiera.
            </p>
          </div>

          <div className="stats-row">
            <div className="stat">
              <span className="stat-num">32+</span>
              <span className="stat-label">Funcionalidades</span>
            </div>
            <div className="stat">
              <span className="stat-num">100%</span>
              <span className="stat-label">Seguro</span>
            </div>
            <div className="stat">
              <span className="stat-num">24/7</span>
              <span className="stat-label">Disponible</span>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="right-panel">
          <div className="form-header">
            <p className="form-eyebrow">Bienvenido de vuelta</p>
            <h2 className="form-title">Inicia sesión</h2>
            <p className="form-subtitle">Accede a tu panel financiero personal</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Correo electrónico</label>
              <div className="input-wrap">
                <span className="input-icon">✉</span>
                <input
                  id="email"
                  type="email"
                  className={`form-input${errors.email ? " error" : ""}`}
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={handleChange("email")}
                  autoComplete="email"
                />
              </div>
              {errors.email && <div className="error-msg">⚠ {errors.email}</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Contraseña</label>
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
                  onClick={() => setShowPass(v => !v)}
                  aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
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
                  onChange={e => setRemember(e.target.checked)}
                />
                Recuérdame
              </label>
              <a href="#" className="forgot-link">¿Olvidaste tu contraseña?</a>
            </div>

            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? <div className="spinner" /> : null}
              {loading ? "Verificando…" : "Entrar al sistema →"}
            </button>

            <div className="divider">
              <div className="divider-line" />
              <span className="divider-text">o continúa como</span>
              <div className="divider-line" />
            </div>

            <button type="button" className="btn-guest">
              👤 Explorar como visitante
            </button>

            <p className="signup-line">
              ¿No tienes cuenta?{" "}
              <a onClick={onRegister} className="signup-link">Regístrate gratis</a>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}