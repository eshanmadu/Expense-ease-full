import React, { useEffect, useMemo, useState } from 'react';
import NavBar from '../components/NavBar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { Banknote, CreditCard, Building2, Smartphone, Wrench, Plus, Edit, Trash2 } from 'lucide-react';
import { apiFetch } from '../utils/api';

const incomeCategories = [
  { value: 'salary', label: 'Salary' },
  { value: 'bonus', label: 'Bonus' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'investment', label: 'Investment' },
  { value: 'other-income', label: 'Other income' },
];

const expenseCategories = [
  { value: 'groceries', label: 'Groceries' },
  { value: 'rent', label: 'Rent' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'transport', label: 'Transport' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'health', label: 'Health' },
  { value: 'other-expense', label: 'Other expense' },
];

const paymentMethods = [
  { value: 'cash', label: 'Cash', icon: Banknote },
  { value: 'card', label: 'Card', icon: CreditCard },
  { value: 'bank_transfer', label: 'Bank Transfer', icon: Building2 },
  { value: 'digital_wallet', label: 'Digital Wallet', icon: Smartphone },
  { value: 'other', label: 'Other', icon: Wrench },
];

function Transactions() {
  const { token, formatCurrency } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deletingTransaction, setDeletingTransaction] = useState(null);

  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: 'groceries',
    date: new Date().toISOString().split('T')[0],
    note: '',
    paymentMethod: 'cash'
  });

  const authHeaders = useMemo(() => ({
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }), [token]);

  const fetchTransactions = async () => {
    try {
      console.log('Fetching transactions with headers:', authHeaders);
      const res = await apiFetch('/api/transactions', { headers: authHeaders });
      const data = await res.json();
      if (!res.ok) {
        console.error('API Error:', data);
        throw new Error(data?.message || 'Failed to load transactions');
      }
      console.log('Fetched transactions:', data);
      setTransactions(data);
    } catch (e) {
      console.error('Fetch error:', e);
      setError(e.message);
    }
  };

  useEffect(() => {
    console.log('Token in Transactions:', token);
    if (token) {
      fetchTransactions();
    } else {
      setError('Please log in to view transactions');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const url = editingTransaction ? `/api/transactions/${editingTransaction._id}` : '/api/transactions';
      const method = editingTransaction ? 'PUT' : 'POST';
      
      const res = await apiFetch(url, {
        method,
        headers: authHeaders,
        body: JSON.stringify({
          ...formData,
          amount: formData.type === 'expense' ? -Math.abs(Number(formData.amount)) : Math.abs(Number(formData.amount)),
          date: new Date(formData.date)
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to save transaction');

      setSuccess(editingTransaction ? 'Transaction updated' : 'Transaction added');
      await fetchTransactions();
      setShowModal(false);
      setEditingTransaction(null);
      resetForm();
      setTimeout(() => setSuccess(''), 2000);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingTransaction) return;
    setLoading(true);
    try {
      const res = await apiFetch(`/api/transactions/${deletingTransaction._id}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      if (!res.ok) throw new Error('Failed to delete transaction');
      
      setSuccess('Transaction deleted');
      await fetchTransactions();
      setShowDeleteModal(false);
      setDeletingTransaction(null);
      setTimeout(() => setSuccess(''), 2000);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = (type = 'expense') => {
    setFormData({
      type: type,
      amount: '',
      category: type === 'income' ? 'salary' : 'groceries',
      date: new Date().toISOString().split('T')[0],
      note: '',
      paymentMethod: 'cash'
    });
  };

  const openEditModal = (transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      type: transaction.type,
      amount: transaction.amount.toString(),
      category: transaction.category,
      date: new Date(transaction.date).toISOString().split('T')[0],
      note: transaction.note || '',
      paymentMethod: transaction.paymentMethod || 'cash'
    });
    setShowModal(true);
  };

  const openAddModal = () => {
    setEditingTransaction(null);
    resetForm('expense');
    setShowModal(true);
  };

  const openDeleteModal = (transaction) => {
    setDeletingTransaction(transaction);
    setShowDeleteModal(true);
  };

  const getPaymentMethodIcon = (method) => {
    const pm = paymentMethods.find(p => p.value === method);
    return pm ? pm.icon : Banknote;
  };

  const getCategoryLabel = (category) => {
    const allCategories = [...incomeCategories, ...expenseCategories];
    const cat = allCategories.find(c => c.value === category);
    return cat ? cat.label : category;
  };

  return (
    <div className="relative min-h-screen w-full bg-[#F9FAFB]">
      <NavBar />
      <div className="relative mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6">
          <Sidebar />

          <main>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
              <h1 className="text-2xl font-semibold text-[#111827]">Transactions</h1>
              <button
                onClick={openAddModal}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#7C3AED] px-4 py-2 text-white font-medium shadow-sm hover:brightness-110 transition"
              >
                <Plus size={18} />
                Add Transaction
              </button>
            </div>

            {error ? (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">{error}</div>
            ) : null}
            {success ? (
              <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-2 text-sm">{success}</div>
            ) : null}

            {/* Creative Table */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                          No transactions yet. Add your first transaction!
                        </td>
                      </tr>
                    ) : (
                      transactions.map((transaction) => (
                        <tr key={transaction._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(transaction.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              transaction.type === 'income' 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : 'bg-rose-100 text-rose-800'
                            }`}>
                              {transaction.type === 'income' ? 'Income' : 'Expense'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                            {getCategoryLabel(transaction.category)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                            {transaction.note || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <span className={transaction.amount >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                              {transaction.amount >= 0 ? '+' : ''}{formatCurrency(Number(transaction.amount))}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className="flex items-center gap-2">
                              {React.createElement(getPaymentMethodIcon(transaction.paymentMethod), { size: 16, className: "text-gray-400" })}
                              <span className="capitalize">{(transaction.paymentMethod || 'cash').replace('_', ' ')}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openEditModal(transaction)}
                                className="text-[#7C3AED] hover:text-[#6D28D9] transition flex items-center gap-1"
                              >
                                <Edit size={14} />
                                Edit
                              </button>
                              <button
                                onClick={() => openDeleteModal(transaction)}
                                className="text-red-600 hover:text-red-800 transition flex items-center gap-1"
                              >
                                <Trash2 size={14} />
                                Delete
                              </button>
                            </div>
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-[#111827] mb-4">
              {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => {
                      const newType = e.target.value;
                      setFormData({
                        ...formData, 
                        type: newType,
                        category: newType === 'income' ? 'salary' : 'groceries'
                      });
                    }}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]/60"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]/60"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]/60"
                >
                  {formData.type === 'income' ? (
                    incomeCategories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))
                  ) : (
                    expenseCategories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]/60"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]/60"
                >
                  {paymentMethods.map(pm => (
                    <option key={pm.value} value={pm.value}>{pm.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Note (optional)</label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({...formData, note: e.target.value})}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]/60"
                  placeholder="Add a note..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-[#7C3AED] text-white rounded-lg hover:brightness-110 transition disabled:opacity-70"
                >
                  {loading ? 'Saving...' : (editingTransaction ? 'Update' : 'Add')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-[#111827] mb-4">Delete Transaction</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this transaction? This action cannot be undone.
            </p>
            {deletingTransaction && (
              <div className="bg-gray-50 rounded-lg p-3 mb-6">
                <div className="text-sm text-gray-700">
                  <div className="font-medium">{getCategoryLabel(deletingTransaction.category)}</div>
                  <div className="text-gray-500">
                    {deletingTransaction.type === 'income' ? '+' : '-'}${Number(deletingTransaction.amount).toFixed(2)}
                  </div>
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-70"
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default Transactions;
