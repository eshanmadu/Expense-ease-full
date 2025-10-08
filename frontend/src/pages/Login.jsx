import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import Lottie from 'lottie-react';
import LanguageSwitcher from '../components/LanguageSwitcher';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    const loadAnimation = async () => {
      try {
        const localRes = await fetch('/animations/lock.json');
        if (localRes.ok) {
          const json = await localRes.json();
          setAnimationData(json);
          return;
        }
      } catch (_) {}

      // Fallback hosted lock animation
      try {
        const remoteRes = await fetch('https://assets5.lottiefiles.com/packages/lf20_jcikwtux.json');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || 'Login failed');
      }
      if (data?.token) {
        login(data.token, data.user);
      }
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F9FAFB]">
      {/* Language Switcher */}
      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitcher />
      </div>
      
      <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 min-h-screen">
        {/* Left welcome panel with animation */}
        <div className="relative p-10 flex flex-col justify-center overflow-hidden">
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-[#7C3AED]/10 rounded-full blur-3xl animate-float" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#0D9488]/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '400ms' }} />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] px-3 py-1 text-sm font-medium">
              {t('welcome.title')}
            </div>
            <h1 className="mt-4 text-4xl md:text-5xl font-bold text-[#111827]">{t('welcome.appName')}</h1>
            <p className="mt-3 text-[#374151] text-lg max-w-md">
              {t('welcome.description')}
            </p>
            <div className="mt-6 flex items-center gap-3">
              <span className="inline-flex items-center rounded-md bg-[#7C3AED] text-white px-3 py-1.5 text-sm">{t('welcome.features.secure')}</span>
              <span className="inline-flex items-center rounded-md bg-[#0D9488] text-white px-3 py-1.5 text-sm">{t('welcome.features.fast')}</span>
              <span className="inline-flex items-center rounded-md bg-black/10 text-[#111827] px-3 py-1.5 text-sm">{t('welcome.features.private')}</span>
            </div>
            <div className="mt-6 w-full max-w-xs md:max-w-sm">
              {animationData ? (
                <Lottie animationData={animationData} loop autoplay className="w-40 md:w-56 mx-auto" />
              ) : (
                <div className="w-40 md:w-56 aspect-square rounded-2xl bg-[#7C3AED]/5 border border-[#7C3AED]/10 mx-auto" />
              )}
            </div>
          </div>
        </div>

        {/* Right form panel */}
        <div className="bg-white flex items-center justify-center p-8 md:p-12 border-l border-gray-100">
          <div className="w-full max-w-sm">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-[#111827]">{t('login.title')}</h2>
              <p className="text-sm text-[#374151] mt-1">{t('login.subtitle')}</p>
            </div>

            {error ? (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">
                {error}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-[#374151] mb-1">{t('login.email')}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full rounded-lg border border-gray-200 bg-white text-[#111827] placeholder-gray-400 px-3 py-2 outline-none focus:ring-2 focus:ring-[#7C3AED]/40 focus:border-[#7C3AED]/60 transition"
                  placeholder={t('login.emailPlaceholder')}
                />
              </div>
              <div>
                <label className="block text-sm text-[#374151] mb-1">{t('login.password')}</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-gray-200 bg-white text-[#111827] placeholder-gray-400 px-3 py-2 outline-none focus:ring-2 focus:ring-[#7C3AED]/40 focus:border-[#7C3AED]/60 transition"
                  placeholder={t('login.passwordPlaceholder')}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 rounded-lg bg-[#7C3AED] text-white font-medium py-2.5 shadow-sm hover:brightness-110 active:brightness-95 transition disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? t('login.loggingIn') : t('login.loginButton')}
              </button>
            </form>

            <div className="mt-4 text-center text-sm text-[#374151]">
              {t('login.noAccount')} <a href="/signup" className="text-[#0D9488] hover:underline">{t('login.signUp')}</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;


