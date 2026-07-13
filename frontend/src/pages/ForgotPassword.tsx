import React, { useState } from 'react';
import { api } from '../api/endpoints';
import { Link, useNavigate } from 'react-router-dom';

export const ForgotPassword = () => {
    const navigate = useNavigate();
    
    // Step 1: Request OTP
    const [email, setEmail] = useState('');
    const [step, setStep] = useState<1 | 2>(1);
    
    // Step 2: Verify OTP & Reset Password
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [fieldErrors, setFieldErrors] = useState<any>({});
    const [loading, setLoading] = useState(false);

    const handleRequestOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const newErrors: any = {};
        if (!email.trim()) newErrors.email = 'Vui lòng nhập email';
        if (Object.keys(newErrors).length > 0) {
            setFieldErrors(newErrors);
            return;
        }
        setFieldErrors({});

        setLoading(true);
        setStatus('idle');
        setMessage('');
        try {
            const res = await api.auth.forgotPassword(email);
            setStep(2);
            setStatus('success');
            setMessage(res.data?.message || 'Mã xác nhận đã được gửi đến email của bạn.');
        } catch (error: any) {
            setStatus('error');
            setMessage(error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng kiểm tra lại email.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const newErrors: any = {};
        if (!otp.trim()) newErrors.otp = 'Vui lòng nhập mã OTP';
        if (!newPassword) newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
        else if (newPassword.length < 6) newErrors.newPassword = 'Mật khẩu phải có ít nhất 6 ký tự';
        if (!confirmPassword) newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
        else if (newPassword !== confirmPassword) newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';

        if (Object.keys(newErrors).length > 0) {
            setFieldErrors(newErrors);
            return;
        }
        setFieldErrors({});

        setLoading(true);
        setStatus('idle');
        setMessage('');
        try {
            await api.auth.resetPassword({ email, otp, newPassword });
            alert('Đặt lại mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới.');
            navigate('/login');
        } catch (error: any) {
            setStatus('error');
            setMessage(error.response?.data?.message || 'Mã xác nhận không hợp lệ hoặc đã hết hạn.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Quên mật khẩu</h2>
            </div>
            
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                {message && (
                    <div className={`mb-6 p-4 rounded-md text-sm ${status === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                        {message}
                    </div>
                )}

                {step === 1 ? (
                    <form onSubmit={handleRequestOtp} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email đã đăng ký</label>
                            <input 
                                type="email" value={email} onChange={e => {setEmail(e.target.value); if(fieldErrors.email) setFieldErrors({...fieldErrors, email: ''})}}
                                className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none transition-colors ${fieldErrors.email ? 'border-red-400 focus:ring-red-200 focus:border-red-500 focus:ring-2' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`} 
                                placeholder="Ví dụ: example@gmail.com"
                            />
                            {fieldErrors.email && <p className="text-red-500 text-xs mt-1.5 font-medium">{fieldErrors.email}</p>}
                        </div>
                        <button 
                            type="submit" disabled={loading} 
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {loading ? 'Đang gửi...' : 'Gửi mã xác nhận'}
                        </button>
                        
                        <div className="text-center mt-4">
                            <Link to="/login" className="text-sm font-medium text-blue-600 hover:text-blue-500">Quay lại đăng nhập</Link>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mã xác nhận (OTP)</label>
                            <input 
                                type="text" value={otp} onChange={e => {setOtp(e.target.value); if(fieldErrors.otp) setFieldErrors({...fieldErrors, otp: ''})}}
                                className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none transition-colors ${fieldErrors.otp ? 'border-red-400 focus:ring-red-200 focus:border-red-500 focus:ring-2' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`} 
                                placeholder="Nhập mã 6 số từ email"
                                maxLength={6}
                            />
                            {fieldErrors.otp && <p className="text-red-500 text-xs mt-1.5 font-medium">{fieldErrors.otp}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
                            <input 
                                type="password" value={newPassword} onChange={e => {setNewPassword(e.target.value); if(fieldErrors.newPassword) setFieldErrors({...fieldErrors, newPassword: ''})}}
                                className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none transition-colors ${fieldErrors.newPassword ? 'border-red-400 focus:ring-red-200 focus:border-red-500 focus:ring-2' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`} 
                            />
                            {fieldErrors.newPassword && <p className="text-red-500 text-xs mt-1.5 font-medium">{fieldErrors.newPassword}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
                            <input 
                                type="password" value={confirmPassword} onChange={e => {setConfirmPassword(e.target.value); if(fieldErrors.confirmPassword) setFieldErrors({...fieldErrors, confirmPassword: ''})}}
                                className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none transition-colors ${fieldErrors.confirmPassword ? 'border-red-400 focus:ring-red-200 focus:border-red-500 focus:ring-2' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`} 
                            />
                            {fieldErrors.confirmPassword && <p className="text-red-500 text-xs mt-1.5 font-medium">{fieldErrors.confirmPassword}</p>}
                        </div>
                        <div className="flex gap-3">
                            <button 
                                type="button" onClick={() => setStep(1)} disabled={loading}
                                className="w-1/3 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                            >
                                Quay lại
                            </button>
                            <button 
                                type="submit" disabled={loading} 
                                className="w-2/3 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50"
                            >
                                {loading ? 'Đang xử lý...' : 'Cập nhật mật khẩu'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};
