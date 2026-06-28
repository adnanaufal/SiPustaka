import React, { useEffect, useState } from 'react';
import { Layout } from '../../components/Layout/Layout';
import { LoadingSpinner } from '../../components/Common/LoadingSpinner';
import { Badge } from '../../components/Common/Badge';
import { Modal } from '../../components/Common/Modal';
import { useAdmin } from '../../hooks/useAdmin';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { formatDate } from '../../utils/formatters';
import { Users, Shield, Plus, Trash2, Key, Mail, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

export function UserManagementPage() {
  const { users, fetchAllUsers, updateUserRole, createUser, deleteUser } = useAdmin();
  const { user: currentUser } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);

  // Add User form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('cashier');
  const [submitting, setSubmitting] = useState(false);

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

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      toast.error('Harap isi semua kolom data');
      return;
    }
    setSubmitting(true);
    try {
      await createUser({
        email,
        password,
        full_name: fullName,
        role,
      });
      toast.success('Akun baru berhasil dibuat!');
      setShowAddModal(false);
      // Reset form
      setFullName('');
      setEmail('');
      setPassword('');
      setRole('cashier');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Gagal membuat akun baru');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (userId === currentUser?.id) {
      toast.error('Anda tidak dapat menghapus akun Anda sendiri');
      return;
    }
    if (!window.confirm(`Apakah Anda yakin ingin menghapus akun ${userName}?`)) {
      return;
    }
    try {
      await deleteUser(userId);
      toast.success('Pengguna berhasil dihapus');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Gagal menghapus pengguna');
    }
  };

  const roleVariant = (r: string) => {
    const map: Record<string, 'error' | 'warning' | 'success'> = {
      admin: 'error',
      cashier: 'warning',
      customer: 'success',
    };
    return map[r] || 'success';
  };

  if (loading) return <Layout><LoadingSpinner /></Layout>;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-primary-600" />
            <div>
              <h1 className="text-3xl font-serif font-bold text-primary-800 dark:text-primary-100">
                {t('admin.manageUsers')}
              </h1>
              <p className="text-primary-500 dark:text-primary-400">{users.length} pengguna terdaftar</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-secondary flex items-center gap-2 self-start sm:self-center"
          >
            <Plus className="h-5 w-5" />
            Tambah Karyawan
          </button>
        </div>

        {/* Users Table */}
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
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-primary-50/50 dark:hover:bg-primary-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-200 dark:bg-primary-700 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary-600 dark:text-primary-300">
                            {u.full_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium text-primary-800 dark:text-primary-200">{u.full_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-primary-600 dark:text-primary-400">{u.email}</td>
                    <td className="px-6 py-4">
                      <Badge variant={roleVariant(u.role)} size="sm">
                        <Shield className="h-3 w-3 mr-1" />
                        {u.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-primary-500">{formatDate(u.created_at)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="input-field !w-auto !py-1.5 !px-2 text-xs"
                        >
                          <option value="customer">Customer</option>
                          <option value="cashier">Cashier</option>
                          <option value="admin">Admin</option>
                        </select>

                        {u.id !== currentUser?.id && (
                          <button
                            onClick={() => handleDeleteUser(u.id, u.full_name)}
                            className="p-1.5 text-error-600 hover:bg-error-50 dark:hover:bg-error-900/20 rounded-lg transition-colors"
                            title="Hapus Pengguna"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Tambah Akun Karyawan / Pengguna"
        maxWidth="sm"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">
              Nama Lengkap
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-primary-400">
                <UserPlus className="h-5 w-5" />
              </span>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="cth. Adnan Naufal"
                className="input-field pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">
              Alamat Email
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-primary-400">
                <Mail className="h-5 w-5" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="cth. adnan@sipustaka.com"
                className="input-field pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">
              Kata Sandi (Password)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-primary-400">
                <Key className="h-5 w-5" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="input-field pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">
              Role Jabatan
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="input-field"
            >
              <option value="cashier">Cashier (Kasir)</option>
              <option value="admin">Admin (Pengelola)</option>
              <option value="customer">Customer (Pelanggan)</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-primary-150 dark:border-primary-850">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="btn-outline !py-2.5 !px-4"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary !py-2.5 !px-5"
            >
              {submitting ? 'Sedang Menyimpan...' : 'Simpan Akun'}
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}
