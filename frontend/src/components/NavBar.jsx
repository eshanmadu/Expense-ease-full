import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import { Wallet, Menu, X } from 'lucide-react';

const NavBar = () => {
  const { isAuthenticated, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/', { state: { loggedOut: true } });
  };

  return (
    <header className="sticky top-0 z-30 bg-[#a48bbe] border-b border-[#E3D0FF]">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
          <Wallet className="w-6 h-6 text-[#FD980C]" />
          <span className="font-semibold text-[#111827]">ExpenseEase</span>
        </Link>
        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-4 text-sm">
          <Link to="/" className="text-[#374151] hover:text-[#7C3AED] transition">{t('navigation.home')}</Link>
          <Link to="/dashboard" className="text-[#374151] hover:text-[#7C3AED] transition">{t('navigation.dashboard')}</Link>
          <Link to="/transactions" className="text-[#374151] hover:text-[#7C3AED] transition">{t('navigation.transactions')}</Link>
          <div className="hidden md:block">
            <LanguageSwitcher />
          </div>
          {isAuthenticated ? (
            <button onClick={handleLogout} className="inline-flex items-center rounded-md bg-white px-3 py-1.5 text-[#111827] font-medium border border-gray-200 hover:bg-gray-50 transition">{t('navigation.logout')}</button>
          ) : (
            <Link to="/login" className="inline-flex items-center rounded-md bg-[#7C3AED] px-3 py-1.5 text-white font-medium shadow-sm hover:brightness-110 transition">{t('login.loginButton')}</Link>
          )}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-[#111827] hover:bg-white/40"
          aria-label="Toggle navigation"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((o) => !o)}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#E3D0FF] bg-[#a48bbe]">
          <div className="mx-auto max-w-6xl px-4 py-3 space-y-3 text-sm">
            <Link to="/" onClick={() => setMobileOpen(false)} className="block text-[#111827] hover:text-[#7C3AED] transition">{t('navigation.home')}</Link>
            <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="block text-[#111827] hover:text-[#7C3AED] transition">{t('navigation.dashboard')}</Link>
            <Link to="/transactions" onClick={() => setMobileOpen(false)} className="block text-[#111827] hover:text-[#7C3AED] transition">{t('navigation.transactions')}</Link>
            <div className="pt-2">
              <LanguageSwitcher />
            </div>
            {isAuthenticated ? (
              <button onClick={() => { setMobileOpen(false); handleLogout(); }} className="w-full inline-flex items-center justify-center rounded-md bg-white px-3 py-2 text-[#111827] font-medium border border-gray-200 hover:bg-gray-50 transition">{t('navigation.logout')}</button>
            ) : (
              <Link to="/login" onClick={() => setMobileOpen(false)} className="w-full inline-flex items-center justify-center rounded-md bg-[#7C3AED] px-3 py-2 text-white font-medium shadow-sm hover:brightness-110 transition">{t('login.loginButton')}</Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default NavBar;


