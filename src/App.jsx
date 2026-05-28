import { useState, useEffect } from 'react';
import LoginPage from './pages/login.jsx';
import RegisterPage from './pages/register.jsx';
import MainPage from './pages/mainpage.jsx';
import GastosPage from './pages/gastospage.jsx';
import MetasPage from './pages/metaspage.jsx';
import PerfilPage from './pages/profile.jsx';
import CalendarioPage from './pages/calendar.jsx';
import ChatbotPage from './pages/chatbot.jsx';

export default function App() {
  const [currentPage, setCurrentPage] = useState('login');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  const goToRegister = () => setCurrentPage('register');
  const goToLogin = () => setCurrentPage('login');
  const goToMainpage = () => setCurrentPage('mainpage');
  const navigateToPage = (page) => setCurrentPage(page);

  return (
    <>
      {currentPage === 'login' && <LoginPage onRegister={goToRegister} onLoginSuccess={goToMainpage} />}
      {currentPage === 'register' && <RegisterPage onLogin={goToLogin} onRegisterSuccess={goToMainpage} />}
      {currentPage === 'mainpage' && <MainPage onLogout={goToLogin} onNavigate={navigateToPage} />}
      {currentPage === 'dashboard' && <MainPage onLogout={goToLogin} onNavigate={navigateToPage} />}
      {currentPage === 'gastos' && <GastosPage onLogout={goToLogin} onNavigate={navigateToPage} />}
      {currentPage === 'metas' && <MetasPage onLogout={goToLogin} onNavigate={navigateToPage} />}
      {currentPage === 'calendario' && <CalendarioPage onLogout={goToLogin} onNavigate={navigateToPage} />}
      {currentPage === 'chatbot' && <ChatbotPage onLogout={goToLogin} onNavigate={navigateToPage} />}
      {currentPage === 'perfil' && <PerfilPage onLogout={goToLogin} onNavigate={navigateToPage} />}
    </>
  );
}
