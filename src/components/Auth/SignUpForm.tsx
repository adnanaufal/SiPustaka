import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import toast from 'react-hot-toast';

export function SignUpForm() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error(t('auth.passwordMismatch'));
      return;
    }

    if (password.length < 6) {
      toast.error(t('auth.passwordMin'));
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password, fullName);
      toast.success(t('auth.signupSuccess'));
      navigate('/');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-serif font-bold text-primary-800 dark:text-primary-100">
          {t('auth.signupTitle')}
        </h2>
        <p className="mt-2 text-primary-500 dark:text-primary-400">{t('auth.signupSubtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="signup-name" className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1.5">
            {t('auth.fullName')}
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-primary-400" />
            <input
              id="signup-name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input-field pl-11"
              placeholder="Nama lengkap"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="signup-email" className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1.5">
            {t('auth.email')}
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-primary-400" />
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field pl-11"
              placeholder="nama@email.com"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="signup-password" className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1.5">
            {t('auth.password')}
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-primary-400" />
            <input
              id="signup-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field pl-11"
              placeholder="Minimal 6 karakter"
              required
              minLength={6}
            />
          </div>
        </div>

        <div>
          <label htmlFor="signup-confirm" className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1.5">
            {t('auth.confirmPassword')}
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-primary-400" />
            <input
              id="signup-confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field pl-11"
              placeholder="Ulangi kata sandi"
              required
              minLength={6}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              {t('auth.signingUp')}
            </>
          ) : (
            t('auth.signup')
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-primary-500 dark:text-primary-400">
        {t('auth.hasAccount')}{' '}
        <Link to="/auth/login" className="font-semibold text-primary-700 dark:text-primary-300 hover:text-primary-600">
          {t('auth.login')}
        </Link>
      </p>
    </div>
  );
}
