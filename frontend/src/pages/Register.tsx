import React, { useState } from 'react';
import { api } from '../api/endpoints';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { User, Lock, Mail, Phone, MapPin, ArrowRight, Eye, EyeOff, CheckCircle } from 'lucide-react';

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
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

    const calculatePasswordStrength = (pass: string) => {
        let score = 0;
        if (!pass) return 0;
        if (pass.length > 6) score += 1;
        if (/[A-Z]/.test(pass)) score += 1;
        if (/[0-9]/.test(pass)) score += 1;
        if (/[^A-Za-z0-9]/.test(pass)) score += 1;
        return score; // 0 to 4
    };

    const passStrength = calculatePasswordStrength(formData.password);

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

        setError('');
        setLoading(true);
        try {
            await api.auth.register(formData);
            setSuccess(true);
            toast.success('Đăng ký tài khoản thành công!');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.');
            toast.error('Đăng ký thất bại!');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden font-sans p-4">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
                    <div className="absolute top-[20%] left-[20%] w-[40rem] h-[40rem] rounded-full bg-emerald-400/20 blur-[100px]"></div>
                </div>
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-10 rounded-[2rem] shadow-2xl shadow-emerald-900/10 max-w-md w-full text-center border border-white relative z-10">
                    <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <CheckCircle className="w-12 h-12 text-emerald-600" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Đăng ký thành công!</h2>
                    <p className="text-slate-500 font-medium mb-8">Tài khoản của bạn đã được tạo. Vui lòng đăng nhập để tiếp tục.</p>
                    <Link to="/login" className="inline-block w-full bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200">
                        Chuyển đến trang đăng nhập
                    </Link>
                </motion.div>
            </div>
        );
    }

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
            </div>

            <div className="w-full flex justify-center items-center p-4 my-8 relative z-10">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white/80 backdrop-blur-xl p-8 sm:p-10 rounded-[2rem] shadow-2xl shadow-indigo-900/10 w-full max-w-2xl border border-white"
                >
                    <div className="text-center mb-8">
                        <Link to="/" className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 mb-6 shadow-lg shadow-indigo-500/30 transform transition-transform hover:scale-105">
                            <span className="text-white font-black text-3xl">B</span>
                        </Link>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Tạo tài khoản mới</h2>
                        <p className="text-slate-500 mt-2 font-medium">Bắt đầu hành trình kinh doanh của bạn cùng BoothRental</p>
                    </div>

                    {error && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6 bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-xl text-sm font-semibold text-center">
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Cột 1 */}
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Tên đăng nhập *</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                            <User className="h-5 w-5" />
                                        </div>
                                        <input type="text" name="username" className={`w-full pl-11 pr-4 py-3.5 bg-slate-50 border rounded-xl outline-none transition-all font-medium text-slate-700 focus:bg-white focus:ring-4 ${fieldErrors.username ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'}`} placeholder="username123" value={formData.username} onChange={handleChange} />
                                    </div>
                                    {fieldErrors.username && <p className="text-rose-500 text-xs mt-1.5 font-bold px-1">{fieldErrors.username}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Mật khẩu *</label>
                                    <div className="relative group mb-1.5">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                            <Lock className="h-5 w-5" />
                                        </div>
                                        <input type={showPassword ? "text" : "password"} name="password" className={`w-full pl-11 pr-12 py-3.5 bg-slate-50 border rounded-xl outline-none transition-all font-medium text-slate-700 focus:bg-white focus:ring-4 ${fieldErrors.password ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'}`} placeholder="••••••••" value={formData.password} onChange={handleChange} />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                    
                                    {/* Password Strength Indicator */}
                                    {formData.password && (
                                        <div className="flex gap-1.5 mt-2 px-1">
                                            {[1, 2, 3, 4].map((level) => (
                                                <div key={level} className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${passStrength >= level ? (passStrength <= 1 ? 'bg-rose-500' : passStrength === 2 ? 'bg-amber-400' : passStrength === 3 ? 'bg-emerald-400' : 'bg-emerald-600') : 'bg-slate-200'}`} />
                                            ))}
                                        </div>
                                    )}
                                    {fieldErrors.password && <p className="text-rose-500 text-xs mt-1.5 font-bold px-1">{fieldErrors.password}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Xác nhận mật khẩu *</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                            <Lock className="h-5 w-5" />
                                        </div>
                                        <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" className={`w-full pl-11 pr-12 py-3.5 bg-slate-50 border rounded-xl outline-none transition-all font-medium text-slate-700 focus:bg-white focus:ring-4 ${fieldErrors.confirmPassword ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'}`} placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} />
                                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                                            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                    {fieldErrors.confirmPassword && <p className="text-rose-500 text-xs mt-1.5 font-bold px-1">{fieldErrors.confirmPassword}</p>}
                                </div>
                            </div>

                            {/* Cột 2 */}
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Họ và Tên *</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                            <User className="h-5 w-5" />
                                        </div>
                                        <input type="text" name="fullName" className={`w-full pl-11 pr-4 py-3.5 bg-slate-50 border rounded-xl outline-none transition-all font-medium text-slate-700 focus:bg-white focus:ring-4 ${fieldErrors.fullName ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'}`} placeholder="Nguyễn Văn A" value={formData.fullName} onChange={handleChange} />
                                    </div>
                                    {fieldErrors.fullName && <p className="text-rose-500 text-xs mt-1.5 font-bold px-1">{fieldErrors.fullName}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Email *</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                            <Mail className="h-5 w-5" />
                                        </div>
                                        <input type="email" name="email" className={`w-full pl-11 pr-4 py-3.5 bg-slate-50 border rounded-xl outline-none transition-all font-medium text-slate-700 focus:bg-white focus:ring-4 ${fieldErrors.email ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'}`} placeholder="email@example.com" value={formData.email} onChange={handleChange} />
                                    </div>
                                    {fieldErrors.email && <p className="text-rose-500 text-xs mt-1.5 font-bold px-1">{fieldErrors.email}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Số điện thoại *</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                            <Phone className="h-5 w-5" />
                                        </div>
                                        <input type="text" name="phone" className={`w-full pl-11 pr-4 py-3.5 bg-slate-50 border rounded-xl outline-none transition-all font-medium text-slate-700 focus:bg-white focus:ring-4 ${fieldErrors.phone ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'}`} placeholder="0901234567" value={formData.phone} onChange={handleChange} />
                                    </div>
                                    {fieldErrors.phone && <p className="text-rose-500 text-xs mt-1.5 font-bold px-1">{fieldErrors.phone}</p>}
                                </div>
                            </div>
                            
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Địa chỉ</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 pt-3.5 pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                        <MapPin className="h-5 w-5" />
                                    </div>
                                    <input type="text" name="address" className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none transition-all font-medium text-slate-700 focus:bg-white focus:ring-4 focus:border-indigo-500 focus:ring-indigo-100" placeholder="Số nhà, Đường, Quận..." value={formData.address} onChange={handleChange} />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button 
                                type="submit" 
                                disabled={loading} 
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-4 rounded-xl transition-all shadow-md shadow-indigo-200 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 flex justify-center items-center gap-2"
                            >
                                {loading ? (
                                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <>Đăng Ký Tài Khoản <ArrowRight className="w-5 h-5" /></>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-100 text-center text-sm font-medium text-slate-600">
                        Đã có tài khoản?{' '}
                        <Link to="/login" className="text-indigo-600 hover:text-indigo-800 font-bold transition-colors">Đăng nhập</Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
