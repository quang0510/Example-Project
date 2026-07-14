import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/endpoints';
import { toast } from 'react-hot-toast';

export const OAuth2RedirectHandler = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserProfile = async (token: string) => {
            try {
                // Tạm thời lưu token để axiosClient có thể sử dụng (vì interceptor đọc từ localStorage)
                localStorage.setItem('token', token);
                
                const res = await api.users.getProfile();
                const user = res.data;
                
                login(token, user);
                toast.success('Đăng nhập thành công!');
                
                if (user.role === 'SYSTEM_ADMIN' || user.role === 'MANAGER') {
                    navigate('/manager', { replace: true });
                } else {
                    navigate('/', { replace: true });
                }
            } catch (err) {
                console.error('Error fetching user profile after OAuth login:', err);
                setError('Không thể lấy thông tin người dùng. Vui lòng thử lại.');
                localStorage.removeItem('token');
                setTimeout(() => navigate('/login', { replace: true }), 3000);
            }
        };

        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const errorParam = params.get('error');

        if (token) {
            fetchUserProfile(token);
        } else if (errorParam) {
            setError(errorParam);
            setTimeout(() => navigate('/login', { replace: true }), 3000);
        } else {
            setError('Không tìm thấy token đăng nhập.');
            setTimeout(() => navigate('/login', { replace: true }), 3000);
        }
    }, [location, navigate, login]);

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md bg-white p-8 rounded-lg shadow text-center border border-gray-100">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                        <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Đăng nhập thất bại</h2>
                    <p className="text-red-500 mb-4">{error}</p>
                    <p className="text-gray-500">Đang quay lại trang đăng nhập...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8">
            <svg className="animate-spin h-10 w-10 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <h2 className="text-xl font-semibold text-gray-700">Đang xác thực tài khoản...</h2>
            <p className="text-gray-500 mt-2">Vui lòng đợi trong giây lát.</p>
        </div>
    );
};
