import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import Lottie from 'lottie-react';
import { useTranslation } from 'react-i18next';

import { useAuth } from '../context/AuthContext';
import { Wallet, BarChart3, ShieldCheck, Bell, PieChart, Calendar, Sparkles } from 'lucide-react';

const Home = () => {
  const { isAuthenticated, formatCurrency, user } = useAuth();
  const location = useLocation();
  const { t } = useTranslation();
  const [logoutNotice, setLogoutNotice] = useState('');
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    if (location.state?.loggedOut) {
      setLogoutNotice('You have been logged out.');
      // Clear the state so refreshing doesn't re-show
      window.history.replaceState({}, document.title, window.location.pathname);
      const timer = setTimeout(() => setLogoutNotice(''), 2500);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  useEffect(() => {
    // Load Lottie JSON from public folder
    const loadAnimation = async () => {
      try {
        const localRes = await fetch('/animations/laptop-man.json');
        if (localRes.ok) {
          const json = await localRes.json();
          setAnimationData(json);
          return;
        }
      } catch (_) {}

      // Fallback to a hosted Lottie animation (man with laptop)
      try {
        const remoteRes = await fetch('https://assets2.lottiefiles.com/packages/lf20_menhnkvy.json');
        if (remoteRes.ok) {
          const json = await remoteRes.json();
          setAnimationData(json);
          return;
        }
      } catch (_) {}

      setAnimationData(null);
    };

    loadAnimation();
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-[#F9FAFB]">
      <NavBar />

      <div className="relative mx-auto max-w-6xl px-4 py-12 text-[#111827]">
        {/* Hero */}
        <section className="relative animate-fade-in-up">
          {/* decorative orbs */}
          <div className="pointer-events-none absolute -top-20 -left-20 w-72 h-72 bg-[#7C3AED]/10 rounded-full blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-24 w-80 h-80 bg-[#0D9488]/10 rounded-full blur-3xl" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left: Lottie animation */}
            <div className="order-2 md:order-1">
              {animationData ? (
                <Lottie
                  animationData={animationData}
                  loop
                  autoplay
                  className="w-full max-w-md mx-auto"
                />
              ) : (
                <div className="w-full max-w-md mx-auto aspect-[4/3] rounded-2xl bg-[#7C3AED]/5 border border-[#7C3AED]/10" />
              )}
            </div>

            {/* Right: Hero copy */}
            <div className="order-1 md:order-2 text-center md:text-left">
              <div className="relative inline-flex md:inline-flex items-center gap-2 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] px-3 py-1 text-xs font-medium">
            Smarter money management
          </div>
          <h1 className="mt-4 text-4xl md:text-6xl font-bold tracking-tight text-[#111827] font-virust">
            ExpenseEase
          </h1>
          {isAuthenticated && (
            <p className="mt-2 text-lg text-[#111827] font-medium">
              Welcome{user?.name ? `, ${user.name}` : ''}!
            </p>
          )}
              <p className="mt-4 text-base md:text-lg text-[#374151] max-w-2xl md:max-w-none mx-auto md:mx-0">
                {t('Home.description')}
          </p>

          {!isAuthenticated ? (
                <div className="mt-8 flex items-center md:justify-start justify-center gap-3">
              <Link
                to="/login"
                className="inline-flex items-center rounded-lg bg-[#7C3AED] px-5 py-2.5 text-white font-medium shadow-sm hover:brightness-110 active:brightness-95 transition"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center rounded-lg border border-[#0D9488] px-5 py-2.5 text-[#0D9488] hover:bg-[#0D9488]/10 transition"
              >
                Create account
              </Link>
            </div>
          ) : (
                <div className="mt-8 flex items-center md:justify-start justify-center">
              <Link
                to="/dashboard"
                className="inline-flex items-center rounded-lg bg-[#7C3AED]/10 px-5 py-2.5 text-[#7C3AED] font-medium border border-[#7C3AED]/20 hover:bg-[#7C3AED]/20 transition"
              >
                {t('Home.button1')}
              </Link>
            </div>
          )}
            </div>
          </div>

          {logoutNotice && (
            <div className="mt-6 mx-auto max-w-md rounded-lg bg-[#7C3AED]/10 border border-[#7C3AED]/20 text-[#111827] px-4 py-2 text-sm">
              {logoutNotice}
            </div>
          )}
        </section>

        {/* What can you do with ExpenseEase? */}
        <section className="mt-16">
          <h2 className="text-2xl md:text-3xl font-bold">{t('Home.subtitle1')}</h2>
          <p className="mt-2 text-[#374151] max-w-2xl">{t('Home.sub2')}</p>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow transition">
              <div className="w-10 h-10 rounded-lg bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center"><Wallet size={18} /></div>
              <h3 className="mt-4 text-lg font-semibold">{t('Home.card1')}</h3>
              <p className="mt-1 text-sm text-[#6B7280]">Log every transaction in seconds and keep your records accurate.</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow transition">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center"><BarChart3 size={18} /></div>
              <h3 className="mt-4 text-lg font-semibold">{t('Home.card2')}</h3>
              <p className="mt-1 text-sm text-[#6B7280]">Understand patterns by category and time to make smarter decisions.</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow transition">
              <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center"><ShieldCheck size={18} /></div>
              <h3 className="mt-4 text-lg font-semibold">{t('Home.card3')}</h3>
              <p className="mt-1 text-sm text-[#6B7280]">Keep your data private and your budget on track with clear insights.</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow transition">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center"><PieChart size={18} /></div>
              <h3 className="mt-4 text-lg font-semibold">{t('Home.card4')}</h3>
              <p className="mt-1 text-sm text-[#6B7280]">See top categories by spend and where you can save more.</p>
                  </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow transition">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center"><Calendar size={18} /></div>
              <h3 className="mt-4 text-lg font-semibold">{t('Home.card5')}</h3>
              <p className="mt-1 text-sm text-[#6B7280]">Get a clean summary of income, expenses, and savings each month.</p>
                  </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow transition">
              <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center"><Bell size={18} /></div>
              <h3 className="mt-4 text-lg font-semibold">{t('Home.card6')}</h3>
              <p className="mt-1 text-sm text-[#6B7280]">Designed to be quick to use, so you actually stick to it.</p>
                  </div>
                </div>
        </section>

        {/* Why this app? */}
        <section className="mt-16">
          <h2 className="text-2xl md:text-3xl font-bold">Why you need this</h2>
          <p className="mt-2 text-[#374151] max-w-3xl">
            Most people don’t overspend because of big purchases — it’s the small, daily expenses that add up. ExpenseEase
            helps you become aware of your habits, set better priorities, and build momentum toward your goals.
          </p>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="text-sm text-[#6B7280]">Typical month</div>
              <div className="mt-2 text-3xl font-semibold text-[#111827]">{formatCurrency(1240)}</div>
              <div className="text-xs text-[#6B7280]">Tracked expenses</div>
                  </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="text-sm text-[#6B7280]">Typical month</div>
              <div className="mt-2 text-3xl font-semibold text-[#111827]">{formatCurrency(2100)}</div>
              <div className="text-xs text-[#6B7280]">Tracked income</div>
                    </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="text-sm text-[#6B7280]">Focus on savings</div>
              <div className="mt-2 inline-flex items-center gap-2 text-[#111827] text-3xl font-semibold"><Sparkles size={20} className="text-[#7C3AED]" />{formatCurrency(860)}</div>
              <div className="text-xs text-[#6B7280]">Better awareness → better results</div>
                    </div>
                  </div>
                </section>

        {/* How it works */}
        <section className="mt-16">
          <h2 className="text-2xl md:text-3xl font-bold">How it works</h2>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="text-sm font-medium">1. Add transactions</div>
              <p className="mt-2 text-sm text-[#6B7280]">Record income and expenses with categories, dates, and payment methods.</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="text-sm font-medium">2. See your dashboard</div>
              <p className="mt-2 text-sm text-[#6B7280]">Totals, savings, and top categories update automatically.</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="text-sm font-medium">3. Improve decisions</div>
              <p className="mt-2 text-sm text-[#6B7280]">Use insights to adjust habits and reach goals faster.</p>
          </div>
        </div>

          <div className="mt-8 flex items-center justify-center">
            <Link
              to={isAuthenticated ? '/dashboard' : '/signup'}
              className="inline-flex items-center rounded-lg bg-[#7C3AED] px-5 py-2.5 text-white font-medium shadow-sm hover:brightness-110 active:brightness-95 transition"
            >
              {isAuthenticated ? 'Open Dashboard' : 'Get started free'}
            </Link>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
};

export default Home;


