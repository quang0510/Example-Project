import React, { useState } from 'react';
import { api } from '../api/endpoints';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        email: '',
        phone: '',
        address: ''
    });
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<any>({});
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (fieldErrors[e.target.name]) {
            setFieldErrors({ ...fieldErrors, [e.target.name]: '' });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const newErrors: any = {};
        if (!formData.username.trim()) newErrors.username = 'Vui lòng nhập tên đăng nhập';
        if (!formData.fullName.trim()) newErrors.fullName = 'Vui lòng nhập họ và tên';
        if (!formData.password) newErrors.password = 'Vui lòng nhập mật khẩu';
        if (!formData.confirmPassword) newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
        else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
        if (!formData.email.trim()) newErrors.email = 'Vui lòng nhập email';
        if (!formData.phone.trim()) newErrors.phone = 'Vui lòng nhập số điện thoại';

        if (Object.keys(newErrors).length > 0) {
            setFieldErrors(newErrors);
            return;
        }
        setFieldErrors({});

        setError('');

        setLoading(true);
        try {
            await api.auth.register(formData);
            setSuccess(true);
            toast.success('Đăng ký thành công!');
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err: any) {
            console.error("Lỗi khi gọi API đăng ký:", err);
            let errorMsg = 'Đăng ký thất bại. Vui lòng thử lại.';
            if (err.response?.data) {
                if (err.response.data.message) {
                    errorMsg = err.response.data.message;
                } else if (typeof err.response.data === 'object' && Object.keys(err.response.data).length > 0) {
                    errorMsg = Object.values(err.response.data).join(', ');
                }
            } else if (err.message) {
                errorMsg = `Lỗi kết nối đến máy chủ: ${err.message}. Vui lòng kiểm tra backend đã chạy chưa.`;
            }
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md bg-white p-8 rounded-lg shadow text-center border border-gray-100">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                        <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Đăng ký thành công!</h2>
                    <p className="text-gray-500 mb-6">Bạn sẽ được chuyển hướng đến trang đăng nhập trong giây lát...</p>
                    <Link to="/login" className="text-blue-600 font-medium hover:text-blue-500">Đăng nhập ngay</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-xl">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Tạo tài khoản mới
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Đã có tài khoản?{' '}
                    <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                        Đăng nhập
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tên đăng nhập *</label>
                                <input type="text" name="username" value={formData.username} onChange={handleChange}
                                    className={`mt-1 appearance-none block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm outline-none transition-all ${fieldErrors.username ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'}`} />
                                {fieldErrors.username && <p className="text-red-500 text-xs mt-1.5 font-medium">{fieldErrors.username}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Họ và tên *</label>
                                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange}
                                    className={`mt-1 appearance-none block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm outline-none transition-all ${fieldErrors.fullName ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'}`} />
                                {fieldErrors.fullName && <p className="text-red-500 text-xs mt-1.5 font-medium">{fieldErrors.fullName}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Mật khẩu *</label>
                                <input type="password" name="password" value={formData.password} onChange={handleChange}
                                    className={`mt-1 appearance-none block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm outline-none transition-all ${fieldErrors.password ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'}`} />
                                {fieldErrors.password && <p className="text-red-500 text-xs mt-1.5 font-medium">{fieldErrors.password}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Xác nhận mật khẩu *</label>
                                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                                    className={`mt-1 appearance-none block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm outline-none transition-all ${fieldErrors.confirmPassword ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'}`} />
                                {fieldErrors.confirmPassword && <p className="text-red-500 text-xs mt-1.5 font-medium">{fieldErrors.confirmPassword}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email *</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange}
                                    className={`mt-1 appearance-none block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm outline-none transition-all ${fieldErrors.email ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'}`} />
                                {fieldErrors.email && <p className="text-red-500 text-xs mt-1.5 font-medium">{fieldErrors.email}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Số điện thoại *</label>
                                <input type="text" name="phone" value={formData.phone} onChange={handleChange}
                                    className={`mt-1 appearance-none block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm outline-none transition-all ${fieldErrors.phone ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'}`} />
                                {fieldErrors.phone && <p className="text-red-500 text-xs mt-1.5 font-medium">{fieldErrors.phone}</p>}
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Địa chỉ</label>
                                <input type="text" name="address" value={formData.address} onChange={handleChange}
                                    className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                {loading ? 'Đang xử lý...' : 'Đăng ký'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
