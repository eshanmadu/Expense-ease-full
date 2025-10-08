import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext({
  isAuthenticated: false,
  token: null,
  user: null,
  login: (_token, _user) => {},
  logout: () => {},
  currency: 'USD',
  setCurrency: (_currency) => {},
  formatCurrency: (_amount) => '$0.00',
});

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('token');
    } catch (e) {
      return null;
    }
  });

  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
      return null;
    }
  });

  // Standalone persisted currency preference as fallback
  const [preferredCurrency, setPreferredCurrency] = useState(() => {
    try {
      return localStorage.getItem('currency');
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const login = (newToken, newUser) => {
    setToken(newToken || null);
    setUser(newUser || null);
    if (newUser?.currency) {
      setPreferredCurrency(newUser.currency);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const currency = user?.currency || 'USD';
  // Prefer user's currency; fallback to standalone preference; default USD
  const effectiveCurrency = user?.currency || preferredCurrency || 'USD';

  const setCurrency = (newCurrency) => {
    setUser(prev => prev ? { ...prev, currency: newCurrency } : prev);
    setPreferredCurrency(newCurrency);
  };

  // Persist preferred currency separately to survive cases where user object lacks it
  useEffect(() => {
    if (preferredCurrency) {
      localStorage.setItem('currency', preferredCurrency);
    } else {
      localStorage.removeItem('currency');
    }
  }, [preferredCurrency]);

  const formatCurrency = (amount) => {
    try {
      const currencyMap = {
        USD: 'en-US',
        LKR: 'en-LK',
        EUR: 'de-DE',
        GBP: 'en-GB',
        INR: 'en-IN',
      };
      const locale = currencyMap[effectiveCurrency] || 'en-US';
      return new Intl.NumberFormat(locale, { style: 'currency', currency: effectiveCurrency }).format(amount);
    } catch (e) {
      return `${amount}`;
    }
  };

  const value = useMemo(() => ({
    isAuthenticated: Boolean(token),
    token,
    user,
    currency: effectiveCurrency,
    setCurrency,
    formatCurrency,
    login,
    logout,
  }), [token, user, effectiveCurrency]);

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);


