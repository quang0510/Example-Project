import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import { api } from '../api/endpoints';

export const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<any>({});
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const newErrors: any = {};
        if (!username.trim()) newErrors.username = 'Vui lòng nhập tên đăng nhập';
        if (!password) newErrors.password = 'Vui lòng nhập mật khẩu';
        if (Object.keys(newErrors).length > 0) {
            setFieldErrors(newErrors);
            return;
        }
        setFieldErrors({});

        setError('');
        setLoading(true);
        try {
            const res = await api.auth.login({ username, password });
            const { token, id, fullName, role, email, phone, address } = res.data;
            const user = { id, username: res.data.username || username, fullName, role, email, phone, address };
            login(token, user);
            
            toast.success('Đăng nhập thành công!');
            if (user.role === 'SYSTEM_ADMIN' || user.role === 'MANAGER') {
                navigate('/manager');
            } else {
                navigate('/');
            }
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Đăng nhập tài khoản
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Hoặc{' '}
                    <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                        tạo tài khoản mới
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-red-700">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tên đăng nhập</label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => { setUsername(e.target.value); if (fieldErrors.username) setFieldErrors({...fieldErrors, username: ''}); }}
                                    className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm ${fieldErrors.username ? 'border-red-400 focus:border-red-500 focus:ring-red-200 focus:ring-2' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 focus:ring-1'}`}
                                    placeholder="Nhập tên đăng nhập"
                                />
                                {fieldErrors.username && <p className="text-red-500 text-xs mt-1 font-medium">{fieldErrors.username}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
                            <div className="mt-1">
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); if (fieldErrors.password) setFieldErrors({...fieldErrors, password: ''}); }}
                                    className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm ${fieldErrors.password ? 'border-red-400 focus:border-red-500 focus:ring-red-200 focus:ring-2' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 focus:ring-1'}`}
                                    placeholder="••••••••"
                                />
                                {fieldErrors.password && <p className="text-red-500 text-xs mt-1 font-medium">{fieldErrors.password}</p>}
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                    Ghi nhớ đăng nhập
                                </label>
                            </div>

                            <div className="text-sm">
                                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                                    Quên mật khẩu?
                                </a>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? (
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : 'Đăng nhập'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
