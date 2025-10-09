import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, BarChart3, CreditCard, FileText, User } from 'lucide-react';

const Sidebar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  
  const items = [
    { to: '/', label: t('navigation.home'), icon: Home },
    { to: '/dashboard', label: t('navigation.dashboard'), icon: BarChart3 },
    { to: '/transactions', label: t('navigation.transactions'), icon: CreditCard },
    { to: '/reports', label: t('navigation.reports'), icon: FileText },
    { to: '/profile', label: t('navigation.profile'), icon: User },
  ];
  
  const mainItems = items.slice(0, -1); // All items except profile
  const profileItem = items[items.length - 1]; // Profile item
  
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-60 shrink-0">
        <div className="sticky top-14 h-[calc(100vh-56px)] p-4 flex flex-col">
          <div className="space-y-2 flex-1">
            {mainItems.map((item) => {
              const active = location.pathname === item.to;
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={
                    `flex items-center gap-3 rounded-lg px-3 py-2 transition ` +
                    (active
                      ? 'bg-[#FD980C] text-black font-medium'
                      : 'text-[#7C3AED]  hover:bg-white/5 border border-white/5')
                  }
                >
                  <IconComponent size={18} />
                  {item.label}
                </Link>
              );
            })}
          </div>
          
          {/* Profile at the bottom */}
          <div className="mt-auto pt-4 border-t border-gray-200">
            <Link
              to={profileItem.to}
              className={
                `flex items-center gap-3 rounded-lg px-3 py-2 transition ` +
                (location.pathname === profileItem.to
                  ? 'bg-[#FD980C] text-black font-medium'
                  : 'text-[#7C3AED]  hover:bg-white/5 border border-white/5')
              }
            >
              {React.createElement(profileItem.icon, { size: 18 })}
              {profileItem.label}
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/70">
        <div className="mx-auto max-w-6xl grid grid-cols-5">
          {items.map((item) => {
            const active = location.pathname === item.to;
            const IconComponent = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center justify-center py-2 text-xs ${
                  active ? 'text-[#7C3AED] font-medium' : 'text-gray-500'
                }`}
              >
                <IconComponent size={18} />
                <span className="mt-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
      <div className="md:hidden h-14" />
    </>
  );
};

export default Sidebar;


