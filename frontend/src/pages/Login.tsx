import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { api } from '../api/endpoints';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, User, ArrowRight, ShieldCheck, Mail } from 'lucide-react';

export const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
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
        <div className="min-h-screen flex bg-slate-50 relative overflow-hidden font-sans">
            {/* Animated Background Shapes */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
                <motion.div 
                    animate={{ y: [0, -20, 0], x: [0, 10, 0], rotate: [0, 5, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-[10%] -left-[10%] w-[40rem] h-[40rem] rounded-full bg-indigo-400/20 blur-[100px]" 
                />
                <motion.div 
                    animate={{ y: [0, 30, 0], x: [0, -20, 0], rotate: [0, -5, 0] }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute bottom-[-10%] right-[-5%] w-[35rem] h-[35rem] rounded-full bg-purple-400/20 blur-[100px]" 
                />
                <motion.div 
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[20%] right-[15%] w-64 h-64 rounded-full bg-pink-400/20 blur-[80px]" 
                />
            </div>

            <div className="w-full flex justify-center items-center p-4">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white/80 backdrop-blur-xl p-8 sm:p-10 rounded-[2rem] shadow-2xl shadow-indigo-900/10 w-full max-w-md border border-white"
                >
                    <div className="text-center mb-8">
                        <Link to="/" className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 mb-6 shadow-lg shadow-indigo-500/30 transform transition-transform hover:scale-105">
                            <span className="text-white font-black text-3xl">B</span>
                        </Link>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Đăng nhập</h2>
                        <p className="text-slate-500 mt-2 font-medium">Truy cập vào hệ thống quản lý mặt bằng</p>
                    </div>

                    {error && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6 bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-xl text-sm font-semibold text-center flex items-center justify-center gap-2">
                            <ShieldCheck className="w-4 h-4" /> {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Tên đăng nhập</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                    <User className="h-5 w-5" />
                                </div>
                                <input 
                                    type="text" 
                                    className={`w-full pl-11 pr-4 py-3.5 bg-slate-50 border rounded-xl outline-none transition-all font-medium text-slate-700 focus:bg-white focus:ring-4 ${fieldErrors.username ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'}`} 
                                    placeholder="Nhập username của bạn" 
                                    value={username} 
                                    onChange={(e) => setUsername(e.target.value)} 
                                />
                            </div>
                            {fieldErrors.username && <p className="text-rose-500 text-xs mt-1.5 font-bold px-1">{fieldErrors.username}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                Mật khẩu
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                    <Lock className="h-5 w-5" />
                                </div>
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    className={`w-full pl-11 pr-12 py-3.5 bg-slate-50 border rounded-xl outline-none transition-all font-medium text-slate-700 focus:bg-white focus:ring-4 ${fieldErrors.password ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'}`} 
                                    placeholder="••••••••" 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            <div className="flex justify-between items-start mt-2 px-1">
                                <div className="flex-1">
                                    {fieldErrors.password && <p className="text-rose-500 text-xs font-bold">{fieldErrors.password}</p>}
                                </div>
                                <Link to="/forgot-password" className="text-indigo-600 hover:text-indigo-700 text-sm font-bold transition-colors ml-2">Quên mật khẩu?</Link>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading} 
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-4 rounded-xl transition-all shadow-md shadow-indigo-200 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 flex justify-center items-center gap-2 mt-6"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>Đăng Nhập <ArrowRight className="w-5 h-5" /></>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-100 text-center text-sm font-medium text-slate-600">
                        Chưa có tài khoản?{' '}
                        <Link to="/register" className="text-indigo-600 hover:text-indigo-800 font-bold transition-colors">Đăng ký ngay</Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
