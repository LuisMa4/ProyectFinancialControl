import { useState } from "react";
import SidebarCards from "./SidebarCards";
import LanguageSwitcher from "./LanguageSwitcher";
import { useI18n } from "../i18n/index.jsx";
import saviaIcon from "../assets/savia_icon_final.png";
import "./appshell.css";

const NAV_IDS = [
  { id: "dashboard", key: "nav.dashboard", icon: "◉" },
  { id: "gastos", key: "nav.expenses", icon: "💳" },
  { id: "metas", key: "nav.goals", icon: "🎯" },
  { id: "calendario", key: "nav.calendar", icon: "📅" },
  { id: "chatbot", key: "nav.chatbot", icon: "🤖" },
  { id: "perfil", key: "nav.profile", icon: "👤" },
];

export default function AppShell({
  active,
  onNavigate,
  onLogout,
  user = null,
  isGuest = false,
  eyebrow = "",
  title = "",
  headerLeft = null,
  headerRight = null,
  fullBleed = false,
  onManageCards = null,
  children,
}) {
  const { t } = useI18n();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const displayName = user?.fullName || user?.email || (isGuest ? "Juan Pérez" : t("common.newAccount"));
  const avatar = user?.avatar || `${(user?.firstName?.[0] || displayName[0] || "C").toUpperCase()}${(user?.lastName?.[0] || "").toUpperCase()}`.slice(0, 2);
  const planLabel = isGuest || user?.plan === "premium" ? t("common.premiumPlan") : t("common.freePlan");

  const handleNav = (id) => {
    setSidebarOpen(false);
    if (onNavigate) onNavigate(id);
  };

  return (
    <div className="shell">
      <div className={`shell-overlay${sidebarOpen ? " show" : ""}`} onClick={() => setSidebarOpen(false)} />

      <aside className={`shell-sidebar${sidebarOpen ? " open" : ""}`}>
        <div className="shell-brand">
          <img className="shell-brand-ico" src={saviaIcon} alt="Savia" />
          <span className="shell-brand-txt">Savia</span>
        </div>
        <nav className="shell-nav">
          {NAV_IDS.map((item) => (
            <button
              key={item.id}
              className={`shell-nav-item${active === item.id ? " active" : ""}`}
              onClick={() => handleNav(item.id)}
            >
              <span className="shell-nav-ico">{item.icon}</span>
              {t(item.key)}
            </button>
          ))}
          <SidebarCards onManage={onManageCards || (() => handleNav("dashboard"))} />
        </nav>
        <div className="shell-footer">
          <div className="shell-user-chip">
            <div className="shell-user-av" style={user?.avatarColor ? { background: user.avatarColor } : undefined}>{avatar}</div>
            <div className="shell-user-info">
              <div className="shell-user-nm">{displayName}</div>
              <div className="shell-user-pl">{planLabel}</div>
            </div>
            {onLogout && (
              <button className="shell-logout" title={t("common.logout")} onClick={onLogout}>⏻</button>
            )}
          </div>
        </div>
      </aside>

      <div className="shell-main">
        <header className="shell-header">
          <div className="shell-hd-left">
            <button className="shell-hamburger" onClick={() => setSidebarOpen((v) => !v)}>☰</button>
            {headerLeft || (
              <div>
                {eyebrow && <div className="shell-hd-eyebrow">{eyebrow}</div>}
                {title && <div className="shell-hd-title">{title}</div>}
              </div>
            )}
          </div>
          <div className="shell-hd-right">
            {headerRight}
            <LanguageSwitcher compact />
          </div>
        </header>
        <div className={`shell-content${fullBleed ? " full-bleed" : ""}`}>
          {children}
        </div>
      </div>
    </div>
  );
}
