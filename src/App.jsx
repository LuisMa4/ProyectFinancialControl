import { useState, useEffect } from 'react';
import LoginPage from './pages/login.jsx';
import RegisterPage from './pages/register.jsx';
import MainPage from './pages/mainpage.jsx';
import GastosPage from './pages/gastospage.jsx';
import MetasPage from './pages/metaspage.jsx';
import PerfilPage from './pages/profile.jsx';
import CalendarioPage from './pages/calendar.jsx';
import ChatbotPage from './pages/chatbot.jsx';
import PlanesPage from './pages/planespage.jsx';

const PAGE_STORAGE_KEY = 'finverde-current-page';
const SESSION_STORAGE_KEY = 'finverde-session-active';
const SESSION_MODE_KEY = 'finverde-session-mode';
const REGISTERED_AT_KEY = 'finverde-registered-at';
const VALID_PAGES = new Set([
  'login',
  'register',
  'mainpage',
  'dashboard',
  'gastos',
  'metas',
  'calendario',
  'chatbot',
  'planes',
  'perfil',
]);
const PRIVATE_PAGES = new Set([
  'mainpage',
  'dashboard',
  'gastos',
  'metas',
  'calendario',
  'chatbot',
  'planes',
  'perfil',
]);

const getInitialPage = () => {
  const hasActiveSession = localStorage.getItem(SESSION_STORAGE_KEY) === 'true';
  const savedPage = localStorage.getItem(PAGE_STORAGE_KEY);

  if (hasActiveSession && PRIVATE_PAGES.has(savedPage)) {
    return savedPage;
  }

  return 'login';
};

const getInitialSessionMode = () => {
  const hasActiveSession = localStorage.getItem(SESSION_STORAGE_KEY) === 'true';
  return localStorage.getItem(SESSION_MODE_KEY) || (hasActiveSession ? 'guest' : null);
};

const getInitialRegisteredAt = () => localStorage.getItem(REGISTERED_AT_KEY) || null;

const formatRegistrationDate = (date) =>
  date.toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

export default function App() {
  const [currentPage, setCurrentPage] = useState(getInitialPage);
  const [sessionMode, setSessionMode] = useState(getInitialSessionMode);
  const [registeredAt, setRegisteredAt] = useState(getInitialRegisteredAt);
  const isGuest = sessionMode === 'guest';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  const setSession = (mode) => {
    localStorage.setItem(SESSION_STORAGE_KEY, 'true');
    localStorage.setItem(SESSION_MODE_KEY, mode);
    if (mode === 'user' && !localStorage.getItem(REGISTERED_AT_KEY)) {
      const today = formatRegistrationDate(new Date());
      localStorage.setItem(REGISTERED_AT_KEY, today);
      setRegisteredAt(today);
    }
    setSessionMode(mode);
  };

  const changePage = (page) => {
    if (!VALID_PAGES.has(page)) return;

    localStorage.setItem(PAGE_STORAGE_KEY, page);
    setCurrentPage(page);
  };

  const goToRegister = () => changePage('register');
  const goToLogin = () => {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem(SESSION_MODE_KEY);
    localStorage.removeItem(PAGE_STORAGE_KEY);
    localStorage.removeItem(REGISTERED_AT_KEY);
    setSessionMode(null);
    setRegisteredAt(null);
    setCurrentPage('login');
  };
  const goToMainpage = (mode = 'user') => {
    setSession(mode);
    changePage('mainpage');
  };
  const goToGuestSession = () => goToMainpage('guest');
  const navigateToPage = (page) => changePage(page);

  return (
    <>
      {currentPage === 'login' && <LoginPage onRegister={goToRegister} onLoginSuccess={() => goToMainpage('user')} onGuest={goToGuestSession} />}
      {currentPage === 'register' && <RegisterPage onLogin={goToLogin} onRegisterSuccess={() => goToMainpage('user')} />}
      {currentPage === 'mainpage' && <MainPage onLogout={goToLogin} onNavigate={navigateToPage} isGuest={isGuest} />}
      {currentPage === 'dashboard' && <MainPage onLogout={goToLogin} onNavigate={navigateToPage} isGuest={isGuest} />}
      {currentPage === 'gastos' && <GastosPage onLogout={goToLogin} onNavigate={navigateToPage} isGuest={isGuest} />}
      {currentPage === 'metas' && <MetasPage onLogout={goToLogin} onNavigate={navigateToPage} isGuest={isGuest} />}
      {currentPage === 'calendario' && <CalendarioPage onLogout={goToLogin} onNavigate={navigateToPage} isGuest={isGuest} />}
      {currentPage === 'chatbot' && <ChatbotPage onLogout={goToLogin} onNavigate={navigateToPage} isGuest={isGuest} />}
      {currentPage === 'planes' && <PlanesPage onLogout={goToLogin} onNavigate={navigateToPage} isGuest={isGuest} />}
      {currentPage === 'perfil' && <PerfilPage onLogout={goToLogin} onNavigate={navigateToPage} isGuest={isGuest} registeredAt={registeredAt} />}
    </>
  );
}
