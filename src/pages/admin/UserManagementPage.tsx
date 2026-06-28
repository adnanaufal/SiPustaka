import React, { useEffect, useState } from 'react';
import { Layout } from '../../components/Layout/Layout';
import { LoadingSpinner } from '../../components/Common/LoadingSpinner';
import { Badge } from '../../components/Common/Badge';
import { useAdmin } from '../../hooks/useAdmin';
import { useLanguage } from '../../contexts/LanguageContext';
import { formatDate } from '../../utils/formatters';
import { Users, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export function UserManagementPage() {
  const { users, fetchAllUsers, updateUserRole } = useAdmin();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllUsers().then(() => setLoading(false));
  }, [fetchAllUsers]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateUserRole(userId, newRole);
      toast.success(t('common.success'));
    } catch {
      toast.error(t('common.error'));
    }
  };

  const roleVariant = (role: string) => {
    const map: Record<string, 'error' | 'warning' | 'success'> = {
      admin: 'error', cashier: 'warning', customer: 'success',
    };
    return map[role] || 'success';
  };

  if (loading) return <Layout><LoadingSpinner /></Layout>;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Users className="h-8 w-8 text-primary-600" />
          <div>
            <h1 className="text-3xl font-serif font-bold text-primary-800 dark:text-primary-100">
              {t('admin.manageUsers')}
            </h1>
            <p className="text-primary-500 dark:text-primary-400">{users.length} pengguna terdaftar</p>
          </div>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-primary-200 dark:border-primary-700 bg-primary-50 dark:bg-primary-900/50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-primary-500 uppercase tracking-wider">Nama</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-primary-500 uppercase tracking-wider">Email</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-primary-500 uppercase tracking-wider">Role</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-primary-500 uppercase tracking-wider">Bergabung</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-primary-500 uppercase tracking-wider">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-100 dark:divide-primary-800">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-primary-50/50 dark:hover:bg-primary-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-200 dark:bg-primary-700 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary-600 dark:text-primary-300">
                            {user.full_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium text-primary-800 dark:text-primary-200">{user.full_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-primary-600 dark:text-primary-400">{user.email}</td>
                    <td className="px-6 py-4">
                      <Badge variant={roleVariant(user.role)} size="sm">
                        <Shield className="h-3 w-3 mr-1" />
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-primary-500">{formatDate(user.created_at)}</td>
                    <td className="px-6 py-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="input-field !w-auto !py-1.5 !px-2 text-xs"
                      >
                        <option value="customer">Customer</option>
                        <option value="cashier">Cashier</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
