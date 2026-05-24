import { useState } from 'react';
import LoginPage from './pages/login.jsx';
import RegisterPage from './pages/register.jsx';

export default function App() {
  const [currentPage, setCurrentPage] = useState('login');

  const goToRegister = () => setCurrentPage('register');
  const goToLogin = () => setCurrentPage('login');

  return (
    <>
      {currentPage === 'login' && <LoginPage onRegister={goToRegister} />}
      {currentPage === 'register' && <RegisterPage onLogin={goToLogin} />}
    </>
  );
}
