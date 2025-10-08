import React from 'react';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();
  
  return (
    <footer className="mt-12 border-t border-white/10 bg-black/30 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-white/70 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-center sm:text-left">© {new Date().getFullYear()} ExpenseTracker</p>
        <p className="text-white/60 text-center sm:text-right">Built with ❤️ and discipline</p>
      </div>
    </footer>
  );
};

export default Footer;


