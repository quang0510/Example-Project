import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { UserPlus, Lock, Unlock } from 'lucide-react';
import { CreateManagerModal } from '../../components/CreateManagerModal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import toast from 'react-hot-toast';

const ROLE_LABELS: Record<string, { text: string; cls: string }> = {
  SYSTEM_ADMIN: { text: 'Admin',    cls: 'bg-purple-100 text-purple-800 border-purple-200' },
  MANAGER:      { text: 'Quản lý', cls: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  CUSTOMER:     { text: 'Khách',   cls: 'bg-gray-100   text-gray-700 border-gray-200'   },
};

export function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Modals state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    setLoading(true);
    axiosClient.get('/users')
      .then((res: any) => setUsers(res.data))
      .catch((err: any) => {
        toast.error(err.response?.data?.message || 'Không thể tải danh sách người dùng');
      })
      .finally(() => setLoading(false));
  };

  const handleToggleClick = (user: any) => {
    setSelectedUser(user);
    setShowConfirmModal(true);
  };

  const confirmToggleActive = async () => {
    if (!selectedUser) return;
    
    try {
      const endpoint = selectedUser.active ? `/users/${selectedUser.id}/deactivate` : `/users/${selectedUser.id}/activate`;
      await axiosClient.put(endpoint);
      toast.success(selectedUser.active ? 'Đã khóa tài khoản thành công!' : 'Đã mở khóa tài khoản thành công!');
      setShowConfirmModal(false);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái');
    }
  };

  return (
    <div className="p-2 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Quản lý Người dùng</h2>
          <p className="text-sm text-gray-500 mt-1">Chỉ dành cho System Admin - Quản lý tài khoản và phân quyền.</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-lg text-sm font-semibold border border-purple-100">
            Tổng: {users.length} người
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 shadow-sm shadow-purple-200 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Thêm Quản lý
          </button>
        </div>
      </div>

      <CreateManagerModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchUsers} 
      />

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-gradient-to-r from-slate-50 to-slate-100/50">
                <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Người dùng</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Vai trò</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Thao tác</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
                {loading ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-500 font-medium">Đang tải dữ liệu...</td></tr>
                ) : users.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-500 font-medium">Không có dữ liệu người dùng</td></tr>
                ) : (
                users.map((user) => {
                    const roleInfo = ROLE_LABELS[user.role] ?? { text: user.role, cls: 'bg-slate-100 text-slate-700 border-slate-200' };
                    return (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors group relative">
                        <td className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"></td>
                        <td className="px-6 py-4 relative">
                            <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-100 to-indigo-100 flex items-center justify-center text-indigo-700 font-bold mr-4 border border-indigo-200/50 shadow-sm group-hover:scale-110 transition-transform">
                                    {user.fullName?.charAt(0) || user.username?.charAt(0) || '?'}
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-slate-900 group-hover:text-purple-700 transition-colors">{user.fullName}</div>
                                    <div className="text-xs font-medium text-slate-500 mt-0.5">@{user.username} • {user.email}</div>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm relative">
                        <span className={`px-3 py-1.5 inline-flex text-xs font-bold rounded-full border ${roleInfo.cls}`}>
                            {roleInfo.text}
                        </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm relative">
                        {user.active ? (
                            <span className="px-3 py-1.5 inline-flex text-xs font-bold rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
                            Hoạt động
                            </span>
                        ) : (
                            <span className="px-3 py-1.5 inline-flex text-xs font-bold rounded-full bg-rose-50 border border-rose-200 text-rose-700">
                            Đã khóa
                            </span>
                        )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                        {user.role !== 'SYSTEM_ADMIN' && (
                            <button
                            title={user.active ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                            onClick={() => handleToggleClick(user)}
                            className={`inline-flex items-center px-3 py-2 border rounded-lg text-xs font-bold transition-all shadow-sm hover:-translate-y-0.5 ${
                                user.active 
                                ? 'border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 hover:shadow-rose-200' 
                                : 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 hover:shadow-emerald-200'
                            }`}
                            >
                            {user.active ? <><Lock className="w-4 h-4 mr-1.5" /> Khóa tài khoản</> : <><Unlock className="w-4 h-4 mr-1.5" /> Mở khóa</>}
                            </button>
                        )}
                        </td>
                    </tr>
                    );
                })
                )}
            </tbody>
            </table>
        </div>
      </div>

      <ConfirmModal 
        isOpen={showConfirmModal}
        title={selectedUser?.active ? "Khóa tài khoản" : "Mở khóa tài khoản"}
        message={selectedUser?.active 
            ? `Bạn có chắc chắn muốn khóa tài khoản "${selectedUser?.username}"? Người dùng này sẽ không thể đăng nhập vào hệ thống.` 
            : `Bạn có chắc chắn muốn mở khóa tài khoản "${selectedUser?.username}"? Người dùng này sẽ có thể đăng nhập lại.`}
        onConfirm={confirmToggleActive}
        onCancel={() => setShowConfirmModal(false)}
        type={selectedUser?.active ? "danger" : "info"}
        confirmText={selectedUser?.active ? "Khóa tài khoản" : "Mở khóa"}
      />
    </div>
  );
}
