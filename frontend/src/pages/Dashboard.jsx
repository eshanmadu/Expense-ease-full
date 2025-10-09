import React, { useEffect, useMemo, useState } from 'react';
import NavBar from '../components/NavBar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { DollarSign, TrendingDown, TrendingUp, BarChart3, ArrowUpRight, Banknote, CreditCard, Building2, Smartphone, Wrench } from 'lucide-react';

function Dashboard() {
  const { token, formatCurrency, currency } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [transactions, setTransactions] = useState([]);

  const authHeaders = useMemo(() => ({
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }), [token]);

  const fetchTransactions = async () => {
    try {
      const res = await fetch('/api/transactions', { headers: authHeaders });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to load transactions');
      setTransactions(data);
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTransactions();
    } else {
      setError('Please log in to view dashboard');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Calculate metrics
  const metrics = useMemo(() => {
    // Use all transactions for now (we can add month filtering later)
    const allTransactions = transactions;
    
    // Calculate totals
    const incomeTransactions = allTransactions.filter(t => t.amount >= 0);
    const expenseTransactions = allTransactions.filter(t => t.amount < 0);
    
    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const monthlySavings = totalIncome - totalExpenses;

    // Calculate savings change (simplified for now)
    const savingsChange = 0; // We'll add proper month-over-month comparison later

    // Top expense categories
    const expenseCategories = allTransactions
      .filter(t => t.amount < 0)
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
        return acc;
      }, {});

    const topExpenseCategories = Object.entries(expenseCategories)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    // Recent transactions
    const recentTransactions = transactions.slice(0, 5);

    return {
      totalIncome,
      totalExpenses,
      monthlySavings,
      savingsChange,
      topExpenseCategories,
      recentTransactions,
      transactionCount: allTransactions.length
    };
  }, [transactions]);

  // Using formatCurrency from context

  const renderAmount = (amount) => {
    try {
      const currencyMap = {
        USD: 'en-US',
        LKR: 'en-LK',
        EUR: 'de-DE',
        GBP: 'en-GB',
        INR: 'en-IN',
      };
      const locale = currencyMap[currency] || 'en-US';
      const nf = new Intl.NumberFormat(locale, { style: 'currency', currency });
      const parts = nf.formatToParts(amount);
      const currencyText = parts.filter(p => p.type === 'currency').map(p => p.value).join('');
      const numberText = parts.filter(p => p.type !== 'currency').map(p => p.value).join('');
      return `${currencyText}\u00A0${numberText}`;
    } catch (e) {
      return formatCurrency(amount);
    }
  };

  const getCategoryLabel = (category) => {
    const categories = {
      'salary': 'Salary',
      'bonus': 'Bonus',
      'freelance': 'Freelance',
      'investment': 'Investment',
      'other-income': 'Other Income',
      'groceries': 'Groceries',
      'rent': 'Rent',
      'utilities': 'Utilities',
      'transport': 'Transport',
      'entertainment': 'Entertainment',
      'health': 'Health',
      'other-expense': 'Other Expense'
    };
    return categories[category] || category;
  };

  const getPaymentMethodIcon = (method) => {
    const icons = {
      'cash': Banknote,
      'card': CreditCard,
      'bank_transfer': Building2,
      'digital_wallet': Smartphone,
      'other': Wrench
    };
    return icons[method] || Banknote;
  };

  if (loading) {
    return (
      <div className="relative min-h-screen w-full bg-[#F9FAFB]">
        <NavBar />
        <div className="flex items-center justify-center h-96">
          <div className="text-lg text-gray-600">Loading dashboard...</div>
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
              <h1 className="text-3xl font-bold text-[#111827] mb-2">Dashboard</h1>
              <p className="text-gray-600">Welcome back! Here's your financial overview.</p>
            </div>

            {error ? (
              <div className="mb-6 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3">
                {error}
              </div>
            ) : null}

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mb-8 items-stretch">
              {/* Total Income */}
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 border border-emerald-200 h-full">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="text-emerald-600 text-sm font-medium">Total Income</p>
                    <p className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-emerald-800 leading-tight whitespace-nowrap">
                      {renderAmount(metrics.totalIncome)}
                    </p>
                    <p className="text-emerald-600 text-xs">All time</p>
                  </div>
                  <div className="hidden sm:flex w-10 h-10 md:w-12 md:h-12 bg-emerald-200 rounded-full items-center justify-center flex-none shrink-0">
                    <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-emerald-700" />
                  </div>
                </div>
              </div>

              {/* Total Expenses */}
              <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-2xl p-6 border border-rose-200 h-full">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="text-rose-600 text-sm font-medium">Total Expenses</p>
                    <p className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-rose-800 leading-tight whitespace-nowrap">
                      {renderAmount(metrics.totalExpenses)}
                    </p>
                    <p className="text-rose-600 text-xs">All time</p>
                  </div>
                  <div className="hidden sm:flex w-10 h-10 md:w-12 md:h-12 bg-rose-200 rounded-full items-center justify-center flex-none shrink-0">
                    <TrendingDown className="w-5 h-5 md:w-6 md:h-6 text-rose-700" />
                  </div>
                </div>
              </div>

              {/* Monthly Savings */}
              <div className={`bg-gradient-to-br rounded-2xl p-6 border h-full ${
                metrics.monthlySavings >= 0 
                  ? 'from-emerald-50 to-emerald-100 border-emerald-200' 
                  : 'from-rose-50 to-rose-100 border-rose-200'
              }`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 pr-2">
                    <p className={`text-sm font-medium ${
                      metrics.monthlySavings >= 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}>Total Savings</p>
                    <p className={`text-sm sm:text-base md:text-lg lg:text-xl font-bold leading-tight whitespace-nowrap ${
                      metrics.monthlySavings >= 0 ? 'text-emerald-800' : 'text-rose-800'
                    }`}>
                      {renderAmount(metrics.monthlySavings)}
                    </p>
                    <p className={`text-xs ${
                      metrics.monthlySavings >= 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      All time
                    </p>
                  </div>
                  <div className={`hidden sm:flex w-10 h-10 md:w-12 md:h-12 rounded-full items-center justify-center flex-none shrink-0 ${
                    metrics.monthlySavings >= 0 ? 'bg-emerald-200' : 'bg-rose-200'
                  }`}>
                    {metrics.monthlySavings >= 0 ? (
                      <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-emerald-700" />
                    ) : (
                      <TrendingDown className="w-5 h-5 md:w-6 md:h-6 text-rose-700" />
                    )}
                  </div>
                </div>
              </div>

              {/* Transaction Count */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200 h-full">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="text-purple-600 text-sm font-medium">Transactions</p>
                    <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-purple-800 leading-tight">{metrics.transactionCount}</p>
                    <p className="text-purple-600 text-xs">All time</p>
                  </div>
                  <div className="hidden sm:flex w-10 h-10 md:w-12 md:h-12 bg-purple-200 rounded-full items-center justify-center flex-none shrink-0">
                    <BarChart3 className="w-5 h-5 md:w-6 md:h-6 text-purple-700" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Top Expense Categories */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-[#111827] mb-4">Top Expense Categories</h3>
                {metrics.topExpenseCategories.length === 0 ? (
                  <p className="text-gray-500 text-sm">No expenses yet</p>
                ) : (
                  <div className="space-y-3">
                    {metrics.topExpenseCategories.map(([category, amount], index) => (
                      <div key={category} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <span className="text-sm font-medium text-gray-700 capitalize">
                            {getCategoryLabel(category)}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          {formatCurrency(amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Transactions */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-[#111827] mb-4">Recent Transactions</h3>
                {metrics.recentTransactions.length === 0 ? (
                  <p className="text-gray-500 text-sm">No transactions yet</p>
                ) : (
                  <div className="space-y-3">
                    {metrics.recentTransactions.map((transaction) => (
                      <div key={transaction._id} className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                            transaction.type === 'income' 
                              ? 'bg-emerald-100 text-emerald-700' 
                              : 'bg-rose-100 text-rose-700'
                          }`}>
                            {transaction.type === 'income' ? '+' : '-'}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 capitalize">
                              {getCategoryLabel(transaction.category)}
                            </p>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              {React.createElement(getPaymentMethodIcon(transaction.paymentMethod), { size: 12, className: "text-gray-400" })}
                              <span>{new Date(transaction.date).toLocaleDateString()}</span>
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-semibold ${
                            transaction.amount >= 0 ? 'text-emerald-600' : 'text-rose-600'
                          }`}>
                            {transaction.amount >= 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                          </p>
                          {transaction.note && (
                            <p className="text-xs text-gray-500 truncate max-w-24">
                              {transaction.note}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Monthly Savings Chart Placeholder */}
            <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-[#111827] mb-4">Savings Trend</h3>
              <div className="h-32 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <ArrowUpRight className="w-12 h-12 text-gray-400 mb-2" />
                  <p className="text-gray-500 text-sm">Chart visualization coming soon</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Dashboard;