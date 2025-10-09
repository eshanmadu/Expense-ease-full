import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import { Wallet } from 'lucide-react';

const NavBar = () => {
  const { isAuthenticated, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/', { state: { loggedOut: true } });
  };

  return (
    <header className="sticky top-0 z-30 bg-[#a48bbe] border-b border-[#E3D0FF]">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Wallet className="w-6 h-6 text-[#FD980C]" />
          <span className="font-semibold text-[#111827]">ExpenseEase</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link to="/" className="text-[#374151] hover:text-[#7C3AED] transition">{t('navigation.home')}</Link>
          <Link to="/dashboard" className="text-[#374151] hover:text-[#7C3AED] transition">{t('navigation.dashboard')}</Link>
          <div className="hidden md:block">
            <LanguageSwitcher />
          </div>
          
          {isAuthenticated ? (
            <button onClick={handleLogout} className="inline-flex items-center rounded-md bg-white px-3 py-1.5 text-[#111827] font-medium border border-gray-200 hover:bg-gray-50 transition">{t('navigation.logout')}</button>
          ) : (
            <Link to="/login" className="inline-flex items-center rounded-md bg-[#7C3AED] px-3 py-1.5 text-white font-medium shadow-sm hover:brightness-110 transition">{t('login.loginButton')}</Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default NavBar;


