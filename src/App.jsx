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
import { fetchCurrentAccount, logoutAccount, readAuthToken, writeAuthToken } from './utils/authStorage';

const PAGE_STORAGE_KEY = 'finverde-current-page';
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

export default function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [account, setAccount] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  useEffect(() => {
    const boot = async () => {
      const token = readAuthToken();
      if (!token) {
        setAuthReady(true);
        return;
      }

      try {
        const response = await fetchCurrentAccount(token);
        setAccount(response.user);
        const savedPage = localStorage.getItem(PAGE_STORAGE_KEY);
        setCurrentPage(savedPage && VALID_PAGES.has(savedPage) && savedPage !== 'login' && savedPage !== 'register' ? savedPage : 'mainpage');
      } catch {
        writeAuthToken('');
        localStorage.removeItem(PAGE_STORAGE_KEY);
        setAccount(null);
        setCurrentPage('login');
      } finally {
        setAuthReady(true);
      }
    };

    void boot();
  }, []);

  const changePage = (page) => {
    if (!VALID_PAGES.has(page)) return;

    if (!account && page !== 'login' && page !== 'register') {
      setCurrentPage('login');
      return;
    }

    localStorage.setItem(PAGE_STORAGE_KEY, page);
    setCurrentPage(page);
  };

  const goToRegister = () => changePage('register');
  const goToLogin = async () => {
    const token = readAuthToken();
    if (token) {
      await logoutAccount(token).catch(() => null);
    }
    writeAuthToken('');
    localStorage.removeItem(PAGE_STORAGE_KEY);
    setAccount(null);
    setCurrentPage('login');
  };
  const goToMainpage = (user, token) => {
    if (token) writeAuthToken(token);
    setAccount(user || null);
    localStorage.setItem(PAGE_STORAGE_KEY, 'mainpage');
    setCurrentPage('mainpage');
  };
  const navigateToPage = (page) => changePage(page);

  if (!authReady) {
    return null;
  }

  return (
    <>
      {currentPage === 'login' && <LoginPage onRegister={goToRegister} onLoginSuccess={goToMainpage} />}
      {currentPage === 'register' && <RegisterPage onLogin={goToLogin} onRegisterSuccess={goToMainpage} />}
      {currentPage === 'mainpage' && <MainPage onLogout={goToLogin} onNavigate={navigateToPage} isGuest={true} />}
      {currentPage === 'dashboard' && <MainPage onLogout={goToLogin} onNavigate={navigateToPage} isGuest={true} />}
      {currentPage === 'gastos' && <GastosPage onLogout={goToLogin} onNavigate={navigateToPage} isGuest={true} />}
      {currentPage === 'metas' && <MetasPage onLogout={goToLogin} onNavigate={navigateToPage} isGuest={true} />}
      {currentPage === 'calendario' && <CalendarioPage onLogout={goToLogin} onNavigate={navigateToPage} isGuest={true} />}
      {currentPage === 'chatbot' && <ChatbotPage onLogout={goToLogin} onNavigate={navigateToPage} isGuest={true} />}
      {currentPage === 'planes' && <PlanesPage onLogout={goToLogin} onNavigate={navigateToPage} isGuest={true} />}
      {currentPage === 'perfil' && <PerfilPage onLogout={goToLogin} onNavigate={navigateToPage} isGuest={true} registeredAt={account?.registeredAt || null} />}
    </>
  );
}
