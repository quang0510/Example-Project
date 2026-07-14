import React, { useState } from 'react';
import { api } from '../api/endpoints';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export const ForgotPassword = () => {
    const navigate = useNavigate();
    
    // Step 1: Request OTP
    const [email, setEmail] = useState('');
    const [step, setStep] = useState<1 | 2 | 3>(1);
    
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

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const newErrors: any = {};
        if (!otp.trim()) newErrors.otp = 'Vui lòng nhập mã OTP';
        
        if (Object.keys(newErrors).length > 0) {
            setFieldErrors(newErrors);
            return;
        }
        setFieldErrors({});

        setLoading(true);
        setStatus('idle');
        setMessage('');
        try {
            await api.auth.verifyOtp({ email, otp });
            setStep(3);
            setStatus('success');
            setMessage('Mã xác nhận hợp lệ. Vui lòng nhập mật khẩu mới.');
        } catch (error: any) {
            setStatus('error');
            setMessage(error.response?.data?.message || 'Mã xác nhận không hợp lệ hoặc đã hết hạn.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const newErrors: any = {};
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
            toast.success('Đặt lại mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới.');
            navigate('/login');
        } catch (error: any) {
            setStatus('error');
            setMessage(error.response?.data?.message || 'Có lỗi xảy ra khi đặt lại mật khẩu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-indigo-50/50 to-purple-50 relative overflow-hidden font-sans">
            {/* Background abstract shapes */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
                <div className="absolute -top-[10%] -left-[10%] w-[40rem] h-[40rem] rounded-full bg-blue-400/20 blur-[100px]"></div>
                <div className="absolute bottom-[-10%] right-[-5%] w-[35rem] h-[35rem] rounded-full bg-purple-400/20 blur-[100px]"></div>
                <div className="absolute top-[20%] right-[15%] w-64 h-64 rounded-full bg-pink-400/20 blur-[80px]"></div>
            </div>

            {/* Left Column: Project Introduction */}
            <div className="hidden lg:flex lg:flex-1 relative bg-white/20 backdrop-blur-sm border-r border-white/50 items-center justify-center z-10">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/10 pointer-events-none"></div>
                <div className="max-w-lg px-8 xl:px-12 text-center relative z-20">
                    <div className="mb-8 inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30 text-white">
                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    
                    <h1 className="text-4xl xl:text-5xl font-extrabold text-blue-950 mb-6 tracking-tight drop-shadow-sm">
                        Booth Rental <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Platform</span>
                    </h1>
                    
                    <p className="text-lg text-blue-900/80 mb-10 leading-relaxed font-medium">
                        Nền tảng quản lý và cho thuê gian hàng trung tâm thương mại thông minh. Tối ưu hóa quy trình kinh doanh, kết nối nhanh chóng và thúc đẩy sự phát triển thương hiệu của bạn.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-6 text-blue-950">
                        <div className="bg-white/50 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-white/60 hover:bg-white/70 transition-all duration-300 transform hover:-translate-y-1">
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4 text-blue-600">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="font-bold text-lg mb-1">Nhanh chóng</h3>
                            <p className="text-sm opacity-80">Thủ tục đơn giản, tiết kiệm thời gian.</p>
                        </div>
                        <div className="bg-white/50 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-white/60 hover:bg-white/70 transition-all duration-300 transform hover:-translate-y-1">
                            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4 text-indigo-600">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <h3 className="font-bold text-lg mb-1">An toàn</h3>
                            <p className="text-sm opacity-80">Bảo mật thông tin dữ liệu tuyệt đối.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Form */}
            <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 relative z-10">
                <div className="mx-auto w-full max-w-md">
                    <div className="bg-white/70 backdrop-blur-xl py-10 px-6 sm:px-10 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-3xl border border-white/60 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                        
                        <div className="mb-8">
                            <h2 className="text-center text-3xl font-extrabold text-gray-900 tracking-tight">
                                Quên mật khẩu
                            </h2>
                            <p className="mt-3 text-center text-sm text-gray-600">
                                Nhớ ra rồi?{' '}
                                <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                                    Đăng nhập ngay
                                </Link>
                            </p>
                        </div>

                        {message && (
                            <div className={`mb-6 p-4 rounded-xl shadow-sm text-sm border-l-4 backdrop-blur-sm ${status === 'error' ? 'bg-red-50/80 text-red-800 border-red-500' : 'bg-green-50/80 text-green-800 border-green-500'}`}>
                                {message}
                            </div>
                        )}

                        {step === 1 ? (
                            <form onSubmit={handleRequestOtp} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email đã đăng ký</label>
                                    <input 
                                        type="email" value={email} onChange={e => {setEmail(e.target.value); if(fieldErrors.email) setFieldErrors({...fieldErrors, email: ''})}}
                                        className={`appearance-none block w-full px-4 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm transition-all duration-200 bg-white/50 focus:bg-white ${fieldErrors.email ? 'border-red-400 focus:border-red-500 focus:ring-red-200 focus:ring-4' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 focus:ring-4'}`} 
                                        placeholder="Ví dụ: example@gmail.com"
                                    />
                                    {fieldErrors.email && <p className="text-red-500 text-xs mt-1.5 font-medium">{fieldErrors.email}</p>}
                                </div>
                                <button 
                                    type="submit" disabled={loading} 
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
                                >
                                    {loading ? (
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : 'Gửi mã xác nhận'}
                                </button>
                            </form>
                        ) : step === 2 ? (
                            <form onSubmit={handleVerifyOtp} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mã xác nhận (OTP)</label>
                                    <input 
                                        type="text" value={otp} onChange={e => {setOtp(e.target.value); if(fieldErrors.otp) setFieldErrors({...fieldErrors, otp: ''})}}
                                        className={`appearance-none block w-full px-4 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm transition-all duration-200 bg-white/50 focus:bg-white ${fieldErrors.otp ? 'border-red-400 focus:border-red-500 focus:ring-red-200 focus:ring-4' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 focus:ring-4'}`} 
                                        placeholder="Nhập mã 6 số từ email"
                                        maxLength={6}
                                    />
                                    {fieldErrors.otp && <p className="text-red-500 text-xs mt-1.5 font-medium">{fieldErrors.otp}</p>}
                                </div>
                                <div className="flex gap-4">
                                    <button 
                                        type="button" onClick={() => setStep(1)} disabled={loading}
                                        className="w-1/3 flex justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-bold text-gray-700 bg-white/50 backdrop-blur hover:bg-white hover:text-gray-900 focus:outline-none transition-all duration-200"
                                    >
                                        Quay lại
                                    </button>
                                    <button 
                                        type="submit" disabled={loading} 
                                        className="w-2/3 flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
                                    >
                                        {loading ? (
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        ) : 'Xác nhận OTP'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={handleResetPassword} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
                                    <input 
                                        type="password" value={newPassword} onChange={e => {setNewPassword(e.target.value); if(fieldErrors.newPassword) setFieldErrors({...fieldErrors, newPassword: ''})}}
                                        className={`appearance-none block w-full px-4 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm transition-all duration-200 bg-white/50 focus:bg-white ${fieldErrors.newPassword ? 'border-red-400 focus:border-red-500 focus:ring-red-200 focus:ring-4' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 focus:ring-4'}`} 
                                    />
                                    {fieldErrors.newPassword && <p className="text-red-500 text-xs mt-1.5 font-medium">{fieldErrors.newPassword}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
                                    <input 
                                        type="password" value={confirmPassword} onChange={e => {setConfirmPassword(e.target.value); if(fieldErrors.confirmPassword) setFieldErrors({...fieldErrors, confirmPassword: ''})}}
                                        className={`appearance-none block w-full px-4 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm transition-all duration-200 bg-white/50 focus:bg-white ${fieldErrors.confirmPassword ? 'border-red-400 focus:border-red-500 focus:ring-red-200 focus:ring-4' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 focus:ring-4'}`} 
                                    />
                                    {fieldErrors.confirmPassword && <p className="text-red-500 text-xs mt-1.5 font-medium">{fieldErrors.confirmPassword}</p>}
                                </div>
                                <div className="flex gap-4">
                                    <button 
                                        type="button" onClick={() => setStep(2)} disabled={loading}
                                        className="w-1/3 flex justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-bold text-gray-700 bg-white/50 backdrop-blur hover:bg-white hover:text-gray-900 focus:outline-none transition-all duration-200"
                                    >
                                        Quay lại
                                    </button>
                                    <button 
                                        type="submit" disabled={loading} 
                                        className="w-2/3 flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
                                    >
                                        {loading ? (
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        ) : 'Cập nhật mật khẩu'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
