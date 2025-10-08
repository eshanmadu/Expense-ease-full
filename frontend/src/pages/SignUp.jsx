import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api';

function SignUp() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await apiFetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        const message = typeof data?.message === 'string' ? data.message : 'Registration failed';
        throw new Error(message);
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
    <div className="min-h-screen w-full bg-[#F9FAFB] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-[#111827]">Create your account</h1>
        <p className="text-sm text-[#374151] mt-1">Join ExpenseEase in seconds</p>

        {error ? (
          <div className="mt-4 rounded-lg bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm text-[#374151] mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              className="w-full rounded-lg border border-gray-200 bg-white text-[#111827] placeholder-gray-400 px-3 py-2 outline-none focus:ring-2 focus:ring-[#7C3AED]/40 focus:border-[#7C3AED]/60 transition"
              placeholder="Jane Doe"
            />
          </div>
          <div>
            <label className="block text-sm text-[#374151] mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full rounded-lg border border-gray-200 bg-white text-[#111827] placeholder-gray-400 px-3 py-2 outline-none focus:ring-2 focus:ring-[#7C3AED]/40 focus:border-[#7C3AED]/60 transition"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm text-[#374151] mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="w-full rounded-lg border border-gray-200 bg-white text-[#111827] placeholder-gray-400 px-3 py-2 outline-none focus:ring-2 focus:ring-[#7C3AED]/40 focus:border-[#7C3AED]/60 transition"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#7C3AED] text-white font-medium py-2.5 shadow-sm hover:brightness-110 active:brightness-95 transition disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account…' : 'Sign up'}
          </button>
        </form>

        <p className="mt-4 text-sm text-[#374151] text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-[#0D9488] hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}

export default SignUp;


