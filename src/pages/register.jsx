import { useState } from "react";
import { registerAccount, writeAuthToken } from "../utils/authStorage";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useI18n } from "../i18n/index.jsx";
import saviaIcon from "../assets/savia_icon_final.png";
import "./register.css";

function getStrength(pw, t) {
  if (!pw) return { level: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map = [
    { label: t("register.strengthVeryWeak"), color: "#E07070" },
    { label: t("register.strengthWeak"),     color: "#E0A870" },
    { label: t("register.strengthFair"),     color: "#E0D070" },
    { label: t("register.strengthGood"),     color: "#7EC8C0" },
    { label: t("register.strengthStrong"),   color: "#5AADA5" },
  ];
  return { level: score, ...map[score] };
}

export default function RegisterPage({ onLogin, onRegisterSuccess }) {
  const { t } = useI18n();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [authData, setAuthData] = useState(null);

  // Step 0 — Account
  const [email, setEmail]       = useState("");
  const [password, setPw]       = useState("");
  const [confirm, setConfirm]   = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [showCf, setShowCf]     = useState(false);

  // Step 1 — Profile
  const [firstName, setFirst]   = useState("");
  const [lastName,  setLast]    = useState("");
  const [phone,     setPhone]   = useState("");
  const [currency,  setCurrency]= useState("PEN");

  // Step 2 — Plan
  const [plan,   setPlan]   = useState("free");
  const [terms,  setTerms]  = useState(false);

  const [errors, setErrors] = useState({});

  const STEPS = [t("register.stepAccount"), t("register.stepProfile"), t("register.stepPlan")];
  const strength = getStrength(password, t);

  const validateStep = () => {
    const e = {};
    if (step === 0) {
      if (!email.trim()) e.email = t("register.errEmailRequired");
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = t("register.errEmailInvalid");
      if (!password) e.password = t("register.errPasswordRequired");
      else if (password.length < 8) e.password = t("register.errPasswordMin");
      if (!confirm) e.confirm = t("register.errConfirmRequired");
      else if (confirm !== password) e.confirm = t("register.errConfirmMismatch");
    }
    if (step === 1) {
      if (!firstName.trim()) e.firstName = t("register.errFirstNameRequired");
      if (!lastName.trim())  e.lastName  = t("register.errLastNameRequired");
      if (phone && !/^\d{9}$/.test(phone)) e.phone = t("register.errPhoneInvalid");
    }
    if (step === 2) {
      if (!terms) e.terms = t("register.errTermsRequired");
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
      const parsed = (() => {
        try { return JSON.parse(error.message)?.error; } catch { return null; }
      })();
      setErrors({ form: parsed || t("register.errGeneric") });
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
              <h2 className="success-title">{t("register.successTitle")}</h2>
              <p className="success-sub">
                {t("register.successSubPre")} <strong>Savia</strong>. {t("register.successSubPost")}
              </p>
              <button className="btn-go" onClick={() => onRegisterSuccess(authData?.user, authData?.token)}>{t("register.goToPanel")} →</button>
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
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <LanguageSwitcher />
          </div>
          <div className="form-header">
            <p className="form-eyebrow">{t("register.stepOf", { step: step + 1 })}</p>
            <h2 className="form-title">
              {step === 0 && t("register.title")}
              {step === 1 && t("register.step1Title")}
              {step === 2 && t("register.step2Title")}
            </h2>
            <p className="form-subtitle">
              {step === 0 && t("register.step0Sub")}
              {step === 1 && t("register.step1Sub")}
              {step === 2 && t("register.step2Sub")}
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

          {/* ── STEP 0: Account ── */}
          {step === 0 && (
            <>
              <div className="form-group">
                <label className="form-label">{t("register.email")}</label>
                <div className="input-wrap">
                  <span className="input-icon">✉</span>
                  <input
                    type="email"
                    className={`form-input${errors.email ? " error" : email && !errors.email ? " valid" : ""}`}
                    placeholder={t("login.emailPlaceholder")}
                    value={email}
                    onChange={e => { setEmail(e.target.value); clearErr("email"); }}
                  />
                </div>
                {errors.email && <div className="error-msg">⚠ {errors.email}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">{t("register.password")}</label>
                <div className="input-wrap">
                  <span className="input-icon">🔒</span>
                  <input
                    type={showPw ? "text" : "password"}
                    className={`form-input${errors.password ? " error" : ""}`}
                    placeholder={t("register.passwordPlaceholder")}
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
                <label className="form-label">{t("register.confirmPassword")}</label>
                <div className="input-wrap">
                  <span className="input-icon">🔒</span>
                  <input
                    type={showCf ? "text" : "password"}
                    className={`form-input${errors.confirm ? " error" : confirm && confirm === password ? " valid" : ""}`}
                    placeholder={t("register.confirmPlaceholder")}
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

          {/* ── STEP 1: Profile ── */}
          {step === 1 && (
            <>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">{t("register.firstName")}</label>
                  <div className="input-wrap">
                    <span className="input-icon">👤</span>
                    <input
                      type="text"
                      className={`form-input${errors.firstName ? " error" : ""}`}
                      placeholder={t("register.firstNamePlaceholder")}
                      value={firstName}
                      onChange={e => { setFirst(e.target.value); clearErr("firstName"); }}
                    />
                  </div>
                  {errors.firstName && <div className="error-msg">⚠ {errors.firstName}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label">{t("register.lastName")}</label>
                  <div className="input-wrap">
                    <span className="input-icon">👤</span>
                    <input
                      type="text"
                      className={`form-input${errors.lastName ? " error" : ""}`}
                      placeholder={t("register.lastNamePlaceholder")}
                      value={lastName}
                      onChange={e => { setLast(e.target.value); clearErr("lastName"); }}
                    />
                  </div>
                  {errors.lastName && <div className="error-msg">⚠ {errors.lastName}</div>}
                </div>

                <div className="form-group full">
                  <label className="form-label">{t("register.phone")} <span style={{color:"var(--text-muted)",fontWeight:300}}>({t("register.optional")})</span></label>
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
                  <label className="form-label">{t("register.currencyLabel")}</label>
                  <div className="input-wrap">
                    <span className="input-icon">💱</span>
                    <select
                      className="form-select"
                      value={currency}
                      onChange={e => setCurrency(e.target.value)}
                    >
                      <option value="PEN">🇵🇪 {t("register.currencyPEN")}</option>
                      <option value="USD">🇺🇸 {t("register.currencyUSD")}</option>
                      <option value="EUR">🇪🇺 {t("register.currencyEUR")}</option>
                      <option value="COP">🇨🇴 {t("register.currencyCOP")}</option>
                      <option value="MXN">🇲🇽 {t("register.currencyMXN")}</option>
                      <option value="CLP">🇨🇱 {t("register.currencyCLP")}</option>
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
                  { id: "free", icon: "🌱", name: t("register.planFreeName"), price: t("register.planFreePrice"), badge: null },
                  { id: "premium", icon: "⭐", name: t("register.planPremiumName"), price: t("register.planPremiumPrice"), badge: t("register.planPopular") },
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
                  [t("register.featExpenseLog"), true, true],
                  [t("register.featBasicDashboard"), true, true],
                  [t("register.featExtendedHistory"), false, true],
                  [t("register.featAiChatbot"), false, true],
                  [t("register.featUnlimitedGoals"), false, true],
                  [t("register.featAdvancedAlerts"), false, true],
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
                  {t("register.termsPre")} <a href="#" className="terms-link">{t("register.termsOfService")}</a> {t("register.termsAnd")}{" "}
                  <a href="#" className="terms-link">{t("register.privacyPolicy")}</a> {t("register.termsPost")}
                </label>
              </div>
              {errors.terms && <div className="error-msg" style={{marginBottom:12}}>⚠ {errors.terms}</div>}
            </>
          )}

          {/* Navigation buttons */}
          <div className="btn-row">
            {step > 0 && (
              <button className="btn-back" onClick={() => { setStep(s => s - 1); setErrors({}); }}>
                ← {t("common.back")}
              </button>
            )}
            <button className="btn-next" onClick={handleNext} disabled={loading}>
              {loading ? <div className="spinner" /> : null}
              {loading ? t("register.submitting") : step < 2 ? `${t("register.continue")} →` : `${t("register.submit")} →`}
            </button>
          </div>

          <p className="login-line">
            {t("register.hasAccount")}{" "}
            <a onClick={onLogin} className="login-link">{t("register.login")}</a>
          </p>
          </div>
        </div>
      </div>
    </>
  );
}

function LeftContent() {
  const { t } = useI18n();

  const benefits = [
    { icon: "📊", title: t("register.benefitDashboardTitle"), desc: t("register.benefitDashboardDesc") },
    { icon: "🎯", title: t("register.benefitGoalsTitle"), desc: t("register.benefitGoalsDesc") },
    { icon: "🤖", title: t("register.benefitChatbotTitle"), desc: t("register.benefitChatbotDesc") },
    { icon: "🔔", title: t("register.benefitAlertsTitle"), desc: t("register.benefitAlertsDesc") },
  ];

  return (
    <>
      <div className="brand">
        <img className="brand-icon" src={saviaIcon} alt="Savia" />
        <span className="brand-name">Savia</span>
      </div>

      <div className="hero-content">
        <div className="hero-tag">
          <div className="hero-tag-dot" />
          {t("register.freeSignup")}
        </div>
        <h1 className="hero-title">
          {t("register.heroTitle1")}<br /><em>{t("register.heroTitle2")}</em><br />{t("register.heroTitle3")}
        </h1>
        <p className="hero-sub">{t("register.heroSub")}</p>
      </div>

      <div className="benefits">
        {benefits.map((b, i) => (
          <div className="benefit" key={i}>
            <div className="benefit-icon">{b.icon}</div>
            <div className="benefit-text">
              <div className="benefit-title">{b.title}</div>
              <div className="benefit-desc">{b.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="left-footer">{t("register.footer")}</div>
    </>
  );
}
