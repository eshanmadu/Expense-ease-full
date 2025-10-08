import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => changeLanguage('en')}
        className={`px-3 py-1 text-sm rounded-md transition ${
          i18n.language === 'en'
            ? 'bg-[#7C3AED] text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        English
      </button>
      <button
        onClick={() => changeLanguage('si')}
        className={`px-3 py-1 text-sm rounded-md transition ${
          i18n.language === 'si'
            ? 'bg-[#7C3AED] text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        සිංහල
      </button>
    </div>
  );
};

export default LanguageSwitcher;
