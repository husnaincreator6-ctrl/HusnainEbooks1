import React, { useState } from 'react';
import { Lock, ArrowLeft, Shield, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { HusnainLogo } from '../components/HusnainLogo';

interface AdminLoginPageProps {
  onLoginSuccess: (token: string, email: string) => void;
  onNavigate: (page: string) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onLoginSuccess,
  onNavigate
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Invalid administrator credentials. Access denied.');
        setLoading(false);
        return;
      }

      onLoginSuccess(data.token, data.email);
    } catch (err: any) {
      setError('Connection error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0C0E] text-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      
      {/* Back Link */}
      <div className="max-w-md w-full mx-auto mb-6">
        <button
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-[#D4AF37] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Storefront</span>
        </button>
      </div>

      <div className="max-w-md w-full mx-auto">
        <div className="p-8 sm:p-10 rounded-3xl bg-[#11141B] border border-[#212733] shadow-2xl space-y-6">
          
          {/* Logo & Header */}
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <HusnainLogo size="md" variant="horizontal" />
            </div>
            
            <div className="pt-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#161B23] border border-[#27303E] text-xs font-semibold text-[#D4AF37]">
                <Shield className="w-3.5 h-3.5" />
                <span>Authorized Staff Portal</span>
              </div>
              <h2 className="text-2xl font-bold text-white mt-2">
                Administrator Sign In
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Access payment approvals, order records, and digital catalog controls.
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-700/60 text-red-200 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Administrator Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@husnainebooks.com"
                className="w-full bg-[#161B23] border border-[#262E3B] text-xs text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#D4AF37]"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Passcode / Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#161B23] border border-[#262E3B] text-xs text-white rounded-xl pl-4 pr-11 py-3 focus:outline-none focus:border-[#D4AF37]"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#DFBA4E] to-[#D4AF37] text-black font-bold text-xs hover:brightness-110 shadow-lg shadow-[#D4AF37]/15 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
            </button>
          </form>

          <div className="text-center text-[11px] text-gray-500 pt-2 border-t border-[#1C222D]">
            <span>Husnain Ebooks Protected Admin Route • Role-Based Enforcement</span>
          </div>

        </div>
      </div>
    </div>
  );
};
