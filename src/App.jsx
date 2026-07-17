import { useState } from 'react';
import LoginPage from './pages/login.jsx';
import RegisterPage from './pages/register.jsx';
import MainPage from './pages/mainpage.jsx';
import GastosPage from './pages/gastospage.jsx';
import MetasPage from './pages/metaspage.jsx';
import PerfilPage from './pages/profile.jsx';
import CalendarioPage from './pages/calendar.jsx';
import ChatbotPage from './pages/chatbot.jsx';
import PlanesPage from './pages/planespage.jsx';
import { logoutAccount, readAuthToken, writeAuthToken } from './utils/authStorage';

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
  // Cada vez que se abre la app se parte siempre del login: ninguna sesión
  // guardada se reanuda automáticamente. El usuario elige explícitamente
  // entrar con su cuenta, crear una nueva, o continuar como cuenta demo.
  const [currentPage, setCurrentPage] = useState('login');
  const [account, setAccount] = useState(null);
  const isDemoAccount = account?.id === 1;

  const changePage = (page) => {
    if (!VALID_PAGES.has(page)) return;
    if (!account && page !== 'login' && page !== 'register') {
      setCurrentPage('login');
      return;
    }
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const goToRegister = () => changePage('register');
  const goToLogin = async () => {
    const token = readAuthToken();
    if (token) {
      await logoutAccount(token).catch(() => null);
    }
    writeAuthToken('');
    setAccount(null);
    setCurrentPage('login');
  };
  const goToMainpage = (user, token) => {
    if (token) writeAuthToken(token);
    setAccount(user || null);
    setCurrentPage('mainpage');
    window.scrollTo(0, 0);
  };
  const navigateToPage = (page) => changePage(page);

  return (
    <>
      {currentPage === 'login' && <LoginPage onRegister={goToRegister} onLoginSuccess={goToMainpage} />}
      {currentPage === 'register' && <RegisterPage onLogin={goToLogin} onRegisterSuccess={goToMainpage} />}
      {currentPage === 'mainpage' && <MainPage onLogout={goToLogin} onNavigate={navigateToPage} isGuest={isDemoAccount} user={account} />}
      {currentPage === 'dashboard' && <MainPage onLogout={goToLogin} onNavigate={navigateToPage} isGuest={isDemoAccount} user={account} />}
      {currentPage === 'gastos' && <GastosPage onLogout={goToLogin} onNavigate={navigateToPage} isGuest={isDemoAccount} user={account} />}
      {currentPage === 'metas' && <MetasPage onLogout={goToLogin} onNavigate={navigateToPage} isGuest={isDemoAccount} user={account} />}
      {currentPage === 'calendario' && <CalendarioPage onLogout={goToLogin} onNavigate={navigateToPage} isGuest={isDemoAccount} user={account} />}
      {currentPage === 'chatbot' && <ChatbotPage onLogout={goToLogin} onNavigate={navigateToPage} isGuest={isDemoAccount} user={account} />}
      {currentPage === 'planes' && <PlanesPage onLogout={goToLogin} onNavigate={navigateToPage} isGuest={isDemoAccount} user={account} />}
      {currentPage === 'perfil' && <PerfilPage onLogout={goToLogin} onNavigate={navigateToPage} isGuest={isDemoAccount} user={account} registeredAt={account?.registeredAt || null} onUserUpdate={setAccount} />}
    </>
  );
}
