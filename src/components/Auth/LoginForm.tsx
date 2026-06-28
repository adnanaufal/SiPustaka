import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import toast from 'react-hot-toast';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(email, password);
      toast.success(t('auth.loginSuccess'));
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
          {t('auth.loginTitle')}
        </h2>
        <p className="mt-2 text-primary-500 dark:text-primary-400">{t('auth.loginSubtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="login-email" className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1.5">
            {t('auth.email')}
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-primary-400" />
            <input
              id="login-email"
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
          <label htmlFor="login-password" className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1.5">
            {t('auth.password')}
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-primary-400" />
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field pl-11"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              {t('auth.loggingIn')}
            </>
          ) : (
            t('auth.login')
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-primary-500 dark:text-primary-400">
        {t('auth.noAccount')}{' '}
        <Link to="/auth/signup" className="font-semibold text-primary-700 dark:text-primary-300 hover:text-primary-600">
          {t('auth.signup')}
        </Link>
      </p>
    </div>
  );
}
