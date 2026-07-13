import React, { useState } from 'react';
import axiosClient from '../api/axiosClient';

interface CreateManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateManagerModal: React.FC<CreateManagerModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    phone: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<any>({});

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (fieldErrors[e.target.name]) setFieldErrors({ ...fieldErrors, [e.target.name]: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: any = {};
    if (!formData.username.trim()) newErrors.username = 'Vui lòng nhập tên đăng nhập';
    if (!formData.password) newErrors.password = 'Vui lòng nhập mật khẩu';
    if (!formData.fullName.trim()) newErrors.fullName = 'Vui lòng nhập họ và tên';

    if (Object.keys(newErrors).length > 0) {
        setFieldErrors(newErrors);
        return;
    }
    setFieldErrors({});

    setIsLoading(true);
    setError('');

    try {
      await axiosClient.post('/users/create-manager', formData);
      alert('Tạo tài khoản quản lý thành công!');
      onSuccess();
      onClose();
      // Reset form
      setFormData({ username: '', password: '', fullName: '', email: '', phone: '' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tạo tài khoản.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 flex flex-col">
        <div className="bg-purple-600 px-6 py-4 flex justify-between items-center">
          <h3 className="text-xl font-bold text-white">Thêm Quản lý mới</h3>
          <button onClick={onClose} className="text-white hover:text-gray-200 text-2xl font-bold">&times;</button>
        </div>
        
        <div className="p-6">
          <form id="create-manager-form" onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{error}</div>}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập *</label>
              <input 
                type="text" name="username"
                value={formData.username} onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg outline-none transition-colors ${fieldErrors.username ? 'border-red-400 focus:ring-red-200 focus:border-red-500 focus:ring-2' : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500 focus:ring-2'}`}
              />
              {fieldErrors.username && <p className="text-red-500 text-xs mt-1.5 font-medium">{fieldErrors.username}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu *</label>
              <input 
                type="password" name="password"
                value={formData.password} onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg outline-none transition-colors ${fieldErrors.password ? 'border-red-400 focus:ring-red-200 focus:border-red-500 focus:ring-2' : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500 focus:ring-2'}`}
              />
              {fieldErrors.password && <p className="text-red-500 text-xs mt-1.5 font-medium">{fieldErrors.password}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên *</label>
              <input 
                type="text" name="fullName"
                value={formData.fullName} onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg outline-none transition-colors ${fieldErrors.fullName ? 'border-red-400 focus:ring-red-200 focus:border-red-500 focus:ring-2' : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500 focus:ring-2'}`}
              />
              {fieldErrors.fullName && <p className="text-red-500 text-xs mt-1.5 font-medium">{fieldErrors.fullName}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  type="email" name="email"
                  value={formData.email} onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                <input 
                  type="text" name="phone"
                  value={formData.phone} onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500"
                />
              </div>
            </div>
          </form>
        </div>
        
        <div className="p-4 border-t border-gray-100 flex gap-3 justify-end bg-gray-50">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300">
            Hủy
          </button>
          <button type="submit" form="create-manager-form" disabled={isLoading} className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50">
            {isLoading ? 'Đang xử lý...' : 'Thêm Quản lý'}
          </button>
        </div>
      </div>
    </div>
  );
};
