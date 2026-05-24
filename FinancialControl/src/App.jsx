import { useState } from 'react';
import LoginPage from './pages/login.jsx';
import RegisterPage from './pages/register.jsx';
import MainPage from './pages/mainpage.jsx';

export default function App() {
  const [currentPage, setCurrentPage] = useState('login');

  const goToRegister = () => setCurrentPage('register');
  const goToLogin = () => setCurrentPage('login');
  const goToMainpage = () => setCurrentPage('mainpage');
  const goToLogout = () => setCurrentPage('login');

  return (
    <>
      {currentPage === 'login' && <LoginPage onRegister={goToRegister} />}
      {currentPage === 'register' && <RegisterPage onLogin={goToLogin} />}
      {currentPage === 'mainpage' && <MainPage onLogout={goToLogout} />}
    </>
  );
}
