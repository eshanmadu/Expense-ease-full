import React, { useEffect, useMemo, useState } from 'react';
import NavBar from '../components/NavBar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { Globe } from 'lucide-react';

function Profile() {
  const { token, login } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currency: 'USD',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const authHeaders = useMemo(() => ({
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }), [token]);

  const fetchUserProfile = async () => {
    try {
      const res = await fetch('/api/auth/profile', { headers: authHeaders });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to load profile');
      
      setUser(data.user);
      setFormData({
        name: data.user.name,
        email: data.user.email,
        currency: data.user.currency || 'USD',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUserProfile();
    } else {
      setError('Please log in to view profile');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validate password confirmation if changing password
      if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
        throw new Error('New passwords do not match');
      }

      const updateData = {
        name: formData.name,
        email: formData.email,
        currency: formData.currency
      };

      // Only include password fields if new password is provided
      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify(updateData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to update profile');

      setSuccess('Profile updated successfully');
      setUser(data.user);
      // Persist updated user (including currency) to AuthContext/localStorage
      if (token) {
        login(token, data.user);
      }
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!token) {
    return (
      <div className="relative min-h-screen w-full bg-[#F9FAFB]">
        <NavBar />
        <div className="flex items-center justify-center h-96">
          <div className="text-lg text-gray-600">Please log in to view your profile</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-[#F9FAFB]">
      <NavBar />
      <div className="relative mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6">
          <Sidebar />

          <main>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-[#111827] mb-2">{t('profile.title')}</h1>
              <p className="text-gray-600">{t('profile.subtitle')}</p>
            </div>

            {error ? (
              <div className="mb-6 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3">
                {error}
              </div>
            ) : null}

            {success ? (
              <div className="mb-6 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3">
                {success}
              </div>
            ) : null}

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Language Settings Section */}
                <div>
                  <h3 className="text-lg font-semibold text-[#111827] mb-4">{t('profile.languageSettings')}</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-4">{t('profile.languageNote')}</p>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium text-gray-700">{t('profile.selectLanguage')}:</span>
                      <LanguageSwitcher />
                    </div>
                  </div>
                </div>

                {/* Personal Information Section */}
                <div>
                  <h3 className="text-lg font-semibold text-[#111827] mb-4">{t('profile.personalInfo')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('profile.fullName')}
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]/60"
                        placeholder={t('profile.fullName')}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('profile.emailAddress')}
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]/60"
                        placeholder={t('profile.emailAddress')}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('profile.preferredCurrency')}
                      </label>
                      <div className="relative">
                        <select
                          name="currency"
                          value={formData.currency}
                          onChange={handleInputChange}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]/60 appearance-none"
                        >
                          <option value="USD">USD - US Dollar ($)</option>
                          <option value="LKR">LKR - Sri Lankan Rupee (රු)</option>
                          <option value="EUR">EUR - Euro (€)</option>
                          <option value="GBP">GBP - British Pound (£)</option>
                          <option value="INR">INR - Indian Rupee (₹)</option>
                        </select>
                        <Globe className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Password Section */}
                <div>
                  <h3 className="text-lg font-semibold text-[#111827] mb-4">{t('profile.changePassword')}</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {t('profile.passwordNote')}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('profile.currentPassword')}
                      </label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]/60"
                        placeholder={t('profile.currentPassword')}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('profile.newPassword')}
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]/60"
                        placeholder={t('profile.newPassword')}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('profile.confirmNewPassword')}
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]/60"
                        placeholder={t('profile.confirmNewPassword')}
                      />
                    </div>
                  </div>
                </div>

                {/* Account Information */}
                {user && (
                  <div>
                    <h3 className="text-lg font-semibold text-[#111827] mb-4">{t('profile.accountInfo')}</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">{t('profile.memberSince')}</span>
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">{t('profile.lastUpdated')}</span>
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(user.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-[#7C3AED] text-white rounded-lg hover:brightness-110 transition disabled:opacity-70 font-medium"
                  >
                    {loading ? t('profile.updating') : t('profile.updateProfile')}
                  </button>
                </div>
              </form>
            </div>
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Profile;
