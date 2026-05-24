import { useState } from 'react';
import LoginPage from './pages/login.jsx';
import RegisterPage from './pages/register.jsx';
import MainPage from './pages/mainpage.jsx';
import GastosPage from './pages/gastospage.jsx';
import MetasPage from './pages/metaspage.jsx';

export default function App() {
  const [currentPage, setCurrentPage] = useState('login');

  const goToRegister = () => setCurrentPage('register');
  const goToLogin = () => setCurrentPage('login');
  const goToMainpage = () => setCurrentPage('mainpage');
  const goToDashboard = () => setCurrentPage('dashboard');
  const goToGastos = () => setCurrentPage('gastos');
  const goToMetas = () => setCurrentPage('metas');

  return (
    <>
      {currentPage === 'login' && <LoginPage onRegister={goToRegister} onLoginSuccess={goToMainpage} />}
      {currentPage === 'register' && <RegisterPage onLogin={goToLogin} />}
      {currentPage === 'mainpage' && <MainPage onLogout={goToLogin} onNavigate={(page) => setCurrentPage(page)} />}
      {currentPage === 'dashboard' && <MainPage onLogout={goToLogin} onNavigate={(page) => setCurrentPage(page)} />}
      {currentPage === 'gastos' && <GastosPage onLogout={goToLogin} onNavigate={(page) => setCurrentPage(page)} />}
      {currentPage === 'metas' && <MetasPage onLogout={goToLogin} onNavigate={(page) => setCurrentPage(page)} />}
    </>
  );
}
