import React, { useEffect, useMemo, useState } from 'react';
import NavBar from '../components/NavBar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api';
import { Download, Filter } from 'lucide-react';

function Reports() {
  const { token, formatCurrency } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [transactions, setTransactions] = useState([]);

  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    type: 'all', // all | income | expense
  });

  const authHeaders = useMemo(() => ({
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }), [token]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/api/transactions', { headers: authHeaders });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to load transactions');
      setTransactions(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTransactions();
    } else {
      setError('Please log in to view reports');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const tDate = new Date(t.date);
      if (filters.startDate) {
        const s = new Date(filters.startDate);
        if (tDate < s) return false;
      }
      if (filters.endDate) {
        const e = new Date(filters.endDate);
        // include the end day fully
        e.setHours(23, 59, 59, 999);
        if (tDate > e) return false;
      }
      if (filters.type === 'income' && !(t.amount >= 0)) return false;
      if (filters.type === 'expense' && !(t.amount < 0)) return false;
      return true;
    });
  }, [transactions, filters]);

  const summary = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.amount >= 0)
      .reduce((s, t) => s + Number(t.amount || 0), 0);
    const expenses = filteredTransactions
      .filter(t => t.amount < 0)
      .reduce((s, t) => s + Math.abs(Number(t.amount || 0)), 0);
    const net = income - expenses;

    const expenseByCategory = filteredTransactions
      .filter(t => t.amount < 0)
      .reduce((acc, t) => {
        const key = t.category || 'unknown';
        acc[key] = (acc[key] || 0) + Math.abs(Number(t.amount || 0));
        return acc;
      }, {});

    return { income, expenses, net, expenseByCategory };
  }, [filteredTransactions]);

  const handleDownload = (variant) => {
    // Build a simple printable HTML using inline styles for reliability
    const dateRangeText = `${filters.startDate || 'Beginning'} - ${filters.endDate || 'Today'}`;

    if (variant === 'summary') {
      const expenseRows = Object.entries(summary.expenseByCategory)
        .sort(([,a],[,b]) => b - a)
        .map(([cat, amt]) => `<tr><td style="padding:6px 8px;border:1px solid #e5e7eb">${cat}</td><td style="padding:6px 8px;border:1px solid #e5e7eb;text-align:right">${formatCurrency(amt)}</td></tr>`) 
        .join('');

      const html = `
        <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif; color:#111827;">
          <h1 style="font-size:20px;margin:0 0 8px 0;">Summary Report</h1>
          <div style="font-size:12px;color:#6b7280;margin-bottom:16px;">Range: ${dateRangeText}</div>
          <table style="border-collapse:collapse;width:100%;margin-bottom:16px;">
            <tbody>
              <tr>
                <td style="padding:6px 8px;border:1px solid #e5e7eb;">Total Income</td>
                <td style="padding:6px 8px;border:1px solid #e5e7eb;text-align:right;color:#047857;">${formatCurrency(summary.income)}</td>
              </tr>
              <tr>
                <td style="padding:6px 8px;border:1px solid #e5e7eb;">Total Expenses</td>
                <td style="padding:6px 8px;border:1px solid #e5e7eb;text-align:right;color:#b91c1c;">${formatCurrency(summary.expenses)}</td>
              </tr>
              <tr>
                <td style="padding:6px 8px;border:1px solid #e5e7eb;">Net Savings</td>
                <td style="padding:6px 8px;border:1px solid #e5e7eb;text-align:right;">${formatCurrency(summary.net)}</td>
              </tr>
            </tbody>
          </table>
          <h2 style="font-size:16px;margin:16px 0 8px 0;">Top Expense Categories</h2>
          <table style="border-collapse:collapse;width:100%;">
            <thead>
              <tr>
                <th style="text-align:left;padding:6px 8px;border:1px solid #e5e7eb;background:#f9fafb;">Category</th>
                <th style="text-align:right;padding:6px 8px;border:1px solid #e5e7eb;background:#f9fafb;">Amount</th>
              </tr>
            </thead>
            <tbody>${expenseRows || '<tr><td colspan="2" style="padding:6px 8px;border:1px solid #e5e7eb;text-align:center;color:#6b7280;">No expenses</td></tr>'}</tbody>
          </table>
        </div>
      `;
      const w = window.open('', '_blank');
      if (!w) return;
      w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8" /><title>Summary Report</title></head><body>${html}</body></html>`);
      w.document.close();
      w.focus();
      w.print();
      w.close();
      return;
    }

    // detailed
    const rows = filteredTransactions.map((t) => `
      <tr>
        <td style="padding:6px 8px;border:1px solid #e5e7eb;">${new Date(t.date).toLocaleDateString()}</td>
        <td style="padding:6px 8px;border:1px solid #e5e7eb;">${t.type}</td>
        <td style="padding:6px 8px;border:1px solid #e5e7eb;">${t.category}</td>
        <td style="padding:6px 8px;border:1px solid #e5e7eb;">${t.note || '-'}</td>
        <td style="padding:6px 8px;border:1px solid #e5e7eb;text-align:right;">${t.amount >= 0 ? '+' : ''}${formatCurrency(Number(t.amount))}</td>
      </tr>
    `).join('');

    const html = `
      <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif; color:#111827;">
        <h1 style="font-size:20px;margin:0 0 8px 0;">Detailed Transactions Report</h1>
        <div style="font-size:12px;color:#6b7280;margin-bottom:16px;">Range: ${dateRangeText}</div>
        <table style="border-collapse:collapse;width:100%;">
          <thead>
            <tr>
              <th style="text-align:left;padding:6px 8px;border:1px solid #e5e7eb;background:#f9fafb;">Date</th>
              <th style="text-align:left;padding:6px 8px;border:1px solid #e5e7eb;background:#f9fafb;">Type</th>
              <th style="text-align:left;padding:6px 8px;border:1px solid #e5e7eb;background:#f9fafb;">Category</th>
              <th style="text-align:left;padding:6px 8px;border:1px solid #e5e7eb;background:#f9fafb;">Note</th>
              <th style="text-align:right;padding:6px 8px;border:1px solid #e5e7eb;background:#f9fafb;">Amount</th>
            </tr>
          </thead>
          <tbody>${rows || '<tr><td colspan="5" style="padding:6px 8px;border:1px solid #e5e7eb;text-align:center;color:#6b7280;">No transactions</td></tr>'}</tbody>
        </table>
      </div>
    `;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8" /><title>Detailed Report</title></head><body>${html}</body></html>`);
    w.document.close();
    w.focus();
    w.print();
    w.close();
  };

  return (
    <div className="relative min-h-screen w-full bg-[#F9FAFB]">
      <NavBar />
      <div className="relative mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6">
          <Sidebar />

          <main>
            <div className="mb-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-[#111827]">Reports</h1>
                  <p className="text-sm text-gray-600">Filter and download financial reports</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => handleDownload('summary')} className="inline-flex items-center gap-2 rounded-lg bg-[#7C3AED] px-3 py-2 text-white text-sm font-medium shadow-sm hover:brightness-110 transition">
                    <Download size={16} /> Summary PDF
                  </button>
                  <button onClick={() => handleDownload('detailed')} className="inline-flex items-center gap-2 rounded-lg bg-[#7C3AED] px-3 py-2 text-white text-sm font-medium shadow-sm hover:brightness-110 transition">
                    <Download size={16} /> Detailed PDF
                  </button>
                </div>
              </div>
            </div>

            {error ? (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">{error}</div>
            ) : null}

            {/* Filters */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4 mb-6">
              <div className="flex items-center gap-2 text-gray-700 mb-3"><Filter size={16} /> Filters</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Start date</label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]/60"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">End date</label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]/60"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]/60"
                  >
                    <option value="all">All</option>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => setFilters({ startDate: '', endDate: '', type: 'all' })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 hover:bg-gray-50 transition text-sm"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-5 border border-emerald-200">
                <div className="text-emerald-600 text-sm">Income</div>
                <div className="text-lg font-bold text-emerald-800">{formatCurrency(summary.income)}</div>
              </div>
              <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-2xl p-5 border border-rose-200">
                <div className="text-rose-600 text-sm">Expenses</div>
                <div className="text-lg font-bold text-rose-800">{formatCurrency(summary.expenses)}</div>
              </div>
              <div className={`bg-gradient-to-br rounded-2xl p-5 border ${summary.net >= 0 ? 'from-emerald-50 to-emerald-100 border-emerald-200' : 'from-rose-50 to-rose-100 border-rose-200'}`}> 
                <div className={`text-sm ${summary.net >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>Net</div>
                <div className={`text-lg font-bold ${summary.net >= 0 ? 'text-emerald-800' : 'text-rose-800'}`}>{formatCurrency(summary.net)}</div>
              </div>
            </div>

            {/* Detailed table */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Note</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {loading ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-10 text-center text-gray-500">Loading...</td>
                      </tr>
                    ) : filteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-10 text-center text-gray-500">No transactions found for selected filters</td>
                      </tr>
                    ) : (
                      filteredTransactions.map((t) => (
                        <tr key={t._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900">{new Date(t.date).toLocaleDateString()}</td>
                          <td className="px-6 py-4 text-sm capitalize">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${t.amount >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                              {t.amount >= 0 ? 'Income' : 'Expense'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 capitalize">{t.category}</td>
                          <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">{t.note || '-'}</td>
                          <td className="px-6 py-4 text-sm font-medium">
                            <span className={t.amount >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                              {t.amount >= 0 ? '+' : ''}{formatCurrency(Number(t.amount))}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Reports;


