import { useState } from "react";
import { registerAccount, writeAuthToken } from "../utils/authStorage";
import "./register.css";

const STEPS = ["Cuenta", "Perfil", "Plan"];

function getStrength(pw) {
  if (!pw) return { level: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map = [
    { label: "Muy débil", color: "#E07070" },
    { label: "Débil",     color: "#E0A870" },
    { label: "Regular",   color: "#E0D070" },
    { label: "Buena",     color: "#7EC8C0" },
    { label: "Fuerte",    color: "#5AADA5" },
  ];
  return { level: score, ...map[score] };
}

export default function RegisterPage({ onLogin, onRegisterSuccess }) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [authData, setAuthData] = useState(null);

  // Step 0 — Cuenta
  const [email, setEmail]       = useState("");
  const [password, setPw]       = useState("");
  const [confirm, setConfirm]   = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [showCf, setShowCf]     = useState(false);

  // Step 1 — Perfil
  const [firstName, setFirst]   = useState("");
  const [lastName,  setLast]    = useState("");
  const [phone,     setPhone]   = useState("");
  const [currency,  setCurrency]= useState("PEN");

  // Step 2 — Plan
  const [plan,   setPlan]   = useState("free");
  const [terms,  setTerms]  = useState(false);

  const [errors, setErrors] = useState({});

  const strength = getStrength(password);

  const validateStep = () => {
    const e = {};
    if (step === 0) {
      if (!email.trim()) e.email = "El correo es requerido";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Correo inválido";
      if (!password) e.password = "La contraseña es requerida";
      else if (password.length < 8) e.password = "Mínimo 8 caracteres";
      if (!confirm) e.confirm = "Confirma tu contraseña";
      else if (confirm !== password) e.confirm = "Las contraseñas no coinciden";
    }
    if (step === 1) {
      if (!firstName.trim()) e.firstName = "Nombre requerido";
      if (!lastName.trim())  e.lastName  = "Apellido requerido";
      if (phone && !/^\d{9}$/.test(phone)) e.phone = "Teléfono debe tener exactamente 9 dígitos";
    }
    if (step === 2) {
      if (!terms) e.terms = "Debes aceptar los términos";
    }
    return e;
  };

  const handleNext = async () => {
    const e = validateStep();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    if (step < 2) { setStep(s => s + 1); return; }
    setLoading(true);
    try {
      const response = await registerAccount({
        email,
        password,
        firstName,
        lastName,
        phone,
        currency,
        plan,
      });
      writeAuthToken(response.token);
      setAuthData(response);
      setDone(true);
    } catch (error) {
      setErrors({ form: error.message || "No se pudo crear la cuenta" });
    } finally {
      setLoading(false);
    }
  };

  const clearErr = (field) => {
    if (errors[field]) setErrors(p => ({ ...p, [field]: null }));
  };

  if (done) {
    return (
      <>
        <div className="page register-page">
          <div className="left-panel">
            <LeftContent />
          </div>
          <div className="right-panel">
            <div className="success-screen">
              <div className="success-icon">✓</div>
              <h2 className="success-title">¡Cuenta creada!</h2>
              <p className="success-sub">
                Bienvenido a <strong>Savia</strong>. Tu cuenta ha sido registrada exitosamente.
                Ahora puedes comenzar a gestionar tus finanzas personales.
              </p>
              <button className="btn-go" onClick={() => onRegisterSuccess(authData?.user, authData?.token)}>Ir al panel principal →</button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="page register-page">
        {/* LEFT */}
        <div className="left-panel">
          <LeftContent />
        </div>

        {/* RIGHT */}
        <div className="right-panel">
          <div className="register-card">
          <div className="form-header">
            <p className="form-eyebrow">Paso {step + 1} de 3</p>
            <h2 className="form-title">
              {step === 0 && "Crea tu cuenta"}
              {step === 1 && "Tu perfil"}
              {step === 2 && "Elige tu plan"}
            </h2>
            <p className="form-subtitle">
              {step === 0 && "Ingresa tus credenciales de acceso"}
              {step === 1 && "Personaliza tu experiencia en Savia"}
              {step === 2 && "Selecciona el plan que mejor se adapte a ti"}
            </p>
          </div>
          {errors.form && <div className="error-msg" style={{marginTop:12}}>⚠ {errors.form}</div>}

          {/* Step indicator */}
          <div className="steps">
            {STEPS.map((label, i) => (
              <div className="step-item" key={i}>
                <div className={`step-circle ${i < step ? "done" : i === step ? "active" : "pending"}`}>
                  {i < step ? "✓" : i + 1}
                </div>
                <span className={`step-label ${i === step ? "active" : "pending"}`}>{label}</span>
                {i < STEPS.length - 1 && (
                  <div className={`step-line ${i < step ? "done" : ""}`} />
                )}
              </div>
            ))}
          </div>

          {/* ── STEP 0: Cuenta ── */}
          {step === 0 && (
            <>
              <div className="form-group">
                <label className="form-label">Correo electrónico</label>
                <div className="input-wrap">
                  <span className="input-icon">✉</span>
                  <input
                    type="email"
                    className={`form-input${errors.email ? " error" : email && !errors.email ? " valid" : ""}`}
                    placeholder="tu@correo.com"
                    value={email}
                    onChange={e => { setEmail(e.target.value); clearErr("email"); }}
                  />
                </div>
                {errors.email && <div className="error-msg">⚠ {errors.email}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Contraseña</label>
                <div className="input-wrap">
                  <span className="input-icon">🔒</span>
                  <input
                    type={showPw ? "text" : "password"}
                    className={`form-input${errors.password ? " error" : ""}`}
                    placeholder="Mínimo 8 caracteres"
                    value={password}
                    onChange={e => { setPw(e.target.value); clearErr("password"); }}
                  />
                  <button type="button" className="toggle-pass" onClick={() => setShowPw(v => !v)}>
                    {showPw ? "🙈" : "👁"}
                  </button>
                </div>
                {errors.password && <div className="error-msg">⚠ {errors.password}</div>}
                {password && (
                  <div className="strength-bar">
                    <div className="strength-track">
                      <div className="strength-fill" style={{ width: `${(strength.level / 4) * 100}%`, background: strength.color }} />
                    </div>
                    <span className="strength-label" style={{ color: strength.color }}>{strength.label}</span>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Confirmar contraseña</label>
                <div className="input-wrap">
                  <span className="input-icon">🔒</span>
                  <input
                    type={showCf ? "text" : "password"}
                    className={`form-input${errors.confirm ? " error" : confirm && confirm === password ? " valid" : ""}`}
                    placeholder="Repite tu contraseña"
                    value={confirm}
                    onChange={e => { setConfirm(e.target.value); clearErr("confirm"); }}
                  />
                  <button type="button" className="toggle-pass" onClick={() => setShowCf(v => !v)}>
                    {showCf ? "🙈" : "👁"}
                  </button>
                </div>
                {errors.confirm && <div className="error-msg">⚠ {errors.confirm}</div>}
              </div>
            </>
          )}

          {/* ── STEP 1: Perfil ── */}
          {step === 1 && (
            <>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Nombre</label>
                  <div className="input-wrap">
                    <span className="input-icon">👤</span>
                    <input
                      type="text"
                      className={`form-input${errors.firstName ? " error" : ""}`}
                      placeholder="Juan"
                      value={firstName}
                      onChange={e => { setFirst(e.target.value); clearErr("firstName"); }}
                    />
                  </div>
                  {errors.firstName && <div className="error-msg">⚠ {errors.firstName}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label">Apellido</label>
                  <div className="input-wrap">
                    <span className="input-icon">👤</span>
                    <input
                      type="text"
                      className={`form-input${errors.lastName ? " error" : ""}`}
                      placeholder="Pérez"
                      value={lastName}
                      onChange={e => { setLast(e.target.value); clearErr("lastName"); }}
                    />
                  </div>
                  {errors.lastName && <div className="error-msg">⚠ {errors.lastName}</div>}
                </div>

                <div className="form-group full">
                  <label className="form-label">Teléfono <span style={{color:"var(--text-muted)",fontWeight:300}}>(opcional)</span></label>
                  <div className="input-wrap">
                    <span className="input-icon">📱</span>
                    <input
                      type="tel"
                      className={`form-input${errors.phone ? " error" : ""}`}
                      placeholder="999999999"
                      maxLength="9"
                      value={phone}
                      onChange={e => { 
                        const val = e.target.value.replace(/\D/g, '').slice(0, 9);
                        setPhone(val); 
                        clearErr("phone"); 
                      }}
                    />
                  </div>
                  {errors.phone && <div className="error-msg">⚠ {errors.phone}</div>}
                </div>

                <div className="form-group full">
                  <label className="form-label">Moneda principal</label>
                  <div className="input-wrap">
                    <span className="input-icon">💱</span>
                    <select
                      className="form-select"
                      value={currency}
                      onChange={e => setCurrency(e.target.value)}
                    >
                      <option value="PEN">🇵🇪 Sol Peruano (S/)</option>
                      <option value="USD">🇺🇸 Dólar Americano ($)</option>
                      <option value="EUR">🇪🇺 Euro (€)</option>
                      <option value="COP">🇨🇴 Peso Colombiano</option>
                      <option value="MXN">🇲🇽 Peso Mexicano</option>
                      <option value="CLP">🇨🇱 Peso Chileno</option>
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── STEP 2: Plan ── */}
          {step === 2 && (
            <>
              <div className="plan-grid">
                {[
                  { id: "free", icon: "🌱", name: "Plan Gratuito", price: "Gratis para siempre", badge: null },
                  { id: "premium", icon: "⭐", name: "Plan Premium", price: "S/ 19.90 / mes", badge: "Popular" },
                ].map(p => (
                  <div
                    key={p.id}
                    className={`plan-card${plan === p.id ? " selected" : ""}`}
                    onClick={() => setPlan(p.id)}
                  >
                    {p.badge && <div className="plan-badge">{p.badge}</div>}
                    <div className="plan-icon">{p.icon}</div>
                    <div className="plan-name">{p.name}</div>
                    <div className="plan-price">{p.price}</div>
                    {plan === p.id && <div className="plan-check">✓</div>}
                  </div>
                ))}
              </div>

              {/* Features comparison mini */}
              <div style={{background:"var(--mint)",borderRadius:12,padding:"16px 20px",marginBottom:20,fontSize:13}}>
                {[
                  ["Registro de gastos", true, true],
                  ["Dashboard e historial básico", true, true],
                  ["Historial extendido (12+ meses)", false, true],
                  ["Chatbot financiero con IA", false, true],
                  ["Metas de ahorro ilimitadas", false, true],
                  ["Alertas y recordatorios avanzados", false, true],
                ].map(([feat, free, prem], i) => (
                  <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 0",borderBottom: i < 5 ? "1px solid #DDE9E7" : "none"}}>
                    <span style={{color:"var(--slate-mid)"}}>{feat}</span>
                    <span style={{color: (plan === "free" ? free : prem) ? "var(--agua-deep)" : "var(--text-muted)", fontWeight:500}}>
                      {(plan === "free" ? free : prem) ? "✓" : "—"}
                    </span>
                  </div>
                ))}
              </div>

              <div className="terms-row">
                <input
                  type="checkbox"
                  id="terms"
                  checked={terms}
                  onChange={e => { setTerms(e.target.checked); clearErr("terms"); }}
                />
                <label htmlFor="terms" className="terms-text">
                  He leído y acepto los <a href="#" className="terms-link">Términos de servicio</a> y la{" "}
                  <a href="#" className="terms-link">Política de privacidad</a> de Savia.
                </label>
              </div>
              {errors.terms && <div className="error-msg" style={{marginBottom:12}}>⚠ {errors.terms}</div>}
            </>
          )}

          {/* Navigation buttons */}
          <div className="btn-row">
            {step > 0 && (
              <button className="btn-back" onClick={() => { setStep(s => s - 1); setErrors({}); }}>
                ← Atrás
              </button>
            )}
            <button className="btn-next" onClick={handleNext} disabled={loading}>
              {loading ? <div className="spinner" /> : null}
              {loading ? "Creando cuenta…" : step < 2 ? "Continuar →" : "Crear cuenta →"}
            </button>
          </div>

          <p className="login-line">
            ¿Ya tienes cuenta?{" "}
            <a onClick={onLogin} className="login-link">Inicia sesión</a>
          </p>
          </div>
        </div>
      </div>
    </>
  );
}

function LeftContent() {
  return (
    <>
      <div className="brand">
        <div className="brand-icon">💎</div>
        <span className="brand-name">Savia</span>
      </div>

      <div className="hero-content">
        <div className="hero-tag">
          <div className="hero-tag-dot" />
          Registro gratuito
        </div>
        <h1 className="hero-title">
          Empieza hoy tu<br /><em>camino</em><br />financiero.
        </h1>
        <p className="hero-sub">
          Únete a Savia y toma el control de tus gastos, metas de ahorro y finanzas personales desde el primer día.
        </p>
      </div>

      <div className="benefits">
        {[
          { icon: "📊", title: "Dashboard en tiempo real", desc: "Visualiza tus gastos con gráficos claros" },
          { icon: "🎯", title: "Metas de ahorro", desc: "Define y alcanza tus objetivos financieros" },
          { icon: "🤖", title: "Chatbot con IA", desc: "Consejos personalizados para tu dinero" },
          { icon: "🔔", title: "Alertas inteligentes", desc: "Nunca superes tu presupuesto de nuevo" },
        ].map((b, i) => (
          <div className="benefit" key={i}>
            <div className="benefit-icon">{b.icon}</div>
            <div className="benefit-text">
              <div className="benefit-title">{b.title}</div>
              <div className="benefit-desc">{b.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="left-footer">© 2025 Savia · Todos los derechos reservados</div>
    </>
  );
}
