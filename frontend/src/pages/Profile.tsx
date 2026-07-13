import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/endpoints';

export const Profile = () => {
    const { user, updateUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [fieldErrors, setFieldErrors] = useState<any>({});
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        address: '',
    });

    const [pwdData, setPwdData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [isPwdLoading, setIsPwdLoading] = useState(false);
    const [pwdMessage, setPwdMessage] = useState({ text: '', type: '' });
    const [pwdFieldErrors, setPwdFieldErrors] = useState<any>({});

    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.fullName || '',
                phone: user.phone || '',
                address: user.address || '',
            });
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (fieldErrors[name]) setFieldErrors({ ...fieldErrors, [name]: '' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.fullName.trim()) {
            setFieldErrors({ fullName: 'Vui lòng nhập họ và tên' });
            return;
        }
        setFieldErrors({});

        setIsLoading(true);
        setMessage({ text: '', type: '' });

        try {
            const res = await api.users.updateProfile(formData);
            updateUser({ ...user, ...res.data });
            setMessage({ text: 'Cập nhật thông tin thành công!', type: 'success' });
            setIsEditing(false);
        } catch (error: any) {
            setMessage({ 
                text: error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật.', 
                type: 'error' 
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePwdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPwdData(prev => ({ ...prev, [name]: value }));
        if (pwdFieldErrors[name]) setPwdFieldErrors({ ...pwdFieldErrors, [name]: '' });
    };

    const handlePwdSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPwdMessage({ text: '', type: '' });

        const newErrors: any = {};
        if (!pwdData.oldPassword) newErrors.oldPassword = 'Vui lòng nhập mật khẩu hiện tại';
        if (!pwdData.newPassword) newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
        else if (pwdData.newPassword.length < 6) newErrors.newPassword = 'Mật khẩu phải có ít nhất 6 ký tự';
        
        if (!pwdData.confirmPassword) newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
        else if (pwdData.newPassword !== pwdData.confirmPassword) newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';

        if (Object.keys(newErrors).length > 0) {
            setPwdFieldErrors(newErrors);
            return;
        }
        setPwdFieldErrors({});

        setIsPwdLoading(true);
        try {
            await api.users.changePassword({
                oldPassword: pwdData.oldPassword,
                newPassword: pwdData.newPassword
            });
            setPwdMessage({ text: 'Đổi mật khẩu thành công!', type: 'success' });
            setPwdData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error: any) {
            setPwdMessage({ 
                text: error.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu.', 
                type: 'error' 
            });
        } finally {
            setIsPwdLoading(false);
        }
    };

    if (!user) return <div className="p-8 text-center">Vui lòng đăng nhập...</div>;

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-10 text-white flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Hồ sơ cá nhân</h1>
                        <p className="text-blue-100">Quản lý thông tin tài khoản và liên hệ của bạn</p>
                    </div>
                    {!isEditing && (
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="bg-white/20 hover:bg-white/30 backdrop-blur-md px-6 py-2 rounded-xl transition-colors font-medium border border-white/30 flex items-center"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            Chỉnh sửa
                        </button>
                    )}
                </div>

                <div className="p-8">
                    {message.text && (
                        <div className={`mb-6 p-4 rounded-lg flex items-center ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                            {message.type === 'success' ? (
                                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                            ) : (
                                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                            )}
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Read-only fields */}
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                <label className="block text-sm font-medium text-gray-500 mb-1">Tên đăng nhập</label>
                                <p className="text-gray-900 font-semibold">{user.username}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                                <p className="text-gray-900 font-semibold">{user.email || 'Chưa cập nhật'}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 md:col-span-2">
                                <label className="block text-sm font-medium text-gray-500 mb-1">Vai trò</label>
                                <p className="text-gray-900 font-semibold">{user.role}</p>
                            </div>
                        </div>

                        <hr className="my-6 border-gray-100" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên <span className="text-red-500">*</span></label>
                                {isEditing ? (
                                    <div>
                                        <input 
                                            type="text"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            className={`w-full rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border transition-colors outline-none ${fieldErrors.fullName ? 'border-red-400 focus:ring-red-200' : 'border-gray-300'}`}
                                        />
                                        {fieldErrors.fullName && <p className="text-red-500 text-xs mt-1.5 font-medium">{fieldErrors.fullName}</p>}
                                    </div>
                                ) : (
                                    <p className="text-gray-900 font-semibold text-lg py-2">{user.fullName}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                                {isEditing ? (
                                    <input 
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border transition-colors"
                                    />
                                ) : (
                                    <p className="text-gray-900 font-semibold text-lg py-2">{user.phone || <span className="text-gray-400 italic">Chưa cập nhật</span>}</p>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ</label>
                                {isEditing ? (
                                    <textarea 
                                        name="address"
                                        rows={3}
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border transition-colors"
                                    />
                                ) : (
                                    <p className="text-gray-900 font-semibold text-lg py-2">{user.address || <span className="text-gray-400 italic">Chưa cập nhật</span>}</p>
                                )}
                            </div>
                        </div>

                        {isEditing && (
                            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
                                <button 
                                    type="button"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setFormData({
                                            fullName: user.fullName || '',
                                            phone: user.phone || '',
                                            address: user.address || '',
                                        });
                                        setMessage({ text: '', type: '' });
                                    }}
                                    className="px-6 py-2.5 bg-white text-gray-700 font-medium rounded-xl border border-gray-300 hover:bg-gray-50 focus:outline-none transition-colors"
                                >
                                    Hủy bỏ
                                </button>
                                <button 
                                    type="submit"
                                    disabled={isLoading}
                                    className="px-8 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-md transition-all"
                                >
                                    {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-8">
                <div className="bg-gray-50 px-8 py-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800">Đổi mật khẩu</h2>
                    <p className="text-gray-500 text-sm mt-1">Đảm bảo tài khoản của bạn đang sử dụng mật khẩu mạnh và an toàn</p>
                </div>
                <div className="p-8">
                    {pwdMessage.text && (
                        <div className={`mb-6 p-4 rounded-lg flex items-center ${pwdMessage.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                            {pwdMessage.text}
                        </div>
                    )}

                    <form onSubmit={handlePwdSubmit} className="max-w-md space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu hiện tại</label>
                            <input 
                                type="password" name="oldPassword"
                                value={pwdData.oldPassword} onChange={handlePwdChange}
                                className={`w-full rounded-lg shadow-sm p-2.5 border transition-colors outline-none ${pwdFieldErrors.oldPassword ? 'border-red-400 focus:border-red-500 focus:ring-red-200 focus:ring-2' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                            />
                            {pwdFieldErrors.oldPassword && <p className="text-red-500 text-xs mt-1.5 font-medium">{pwdFieldErrors.oldPassword}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
                            <input 
                                type="password" name="newPassword"
                                value={pwdData.newPassword} onChange={handlePwdChange}
                                className={`w-full rounded-lg shadow-sm p-2.5 border transition-colors outline-none ${pwdFieldErrors.newPassword ? 'border-red-400 focus:border-red-500 focus:ring-red-200 focus:ring-2' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                            />
                            {pwdFieldErrors.newPassword && <p className="text-red-500 text-xs mt-1.5 font-medium">{pwdFieldErrors.newPassword}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
                            <input 
                                type="password" name="confirmPassword"
                                value={pwdData.confirmPassword} onChange={handlePwdChange}
                                className={`w-full rounded-lg shadow-sm p-2.5 border transition-colors outline-none ${pwdFieldErrors.confirmPassword ? 'border-red-400 focus:border-red-500 focus:ring-red-200 focus:ring-2' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                            />
                            {pwdFieldErrors.confirmPassword && <p className="text-red-500 text-xs mt-1.5 font-medium">{pwdFieldErrors.confirmPassword}</p>}
                        </div>
                        <div className="pt-2">
                            <button 
                                type="submit"
                                disabled={isPwdLoading}
                                className="px-6 py-2.5 bg-gray-800 text-white font-medium rounded-xl hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 flex items-center transition-all"
                            >
                                {isPwdLoading ? 'Đang xử lý...' : 'Cập nhật mật khẩu'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
