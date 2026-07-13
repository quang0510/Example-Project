import React, { useEffect, useState } from 'react';
import { api } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    MapPin, ShieldCheck, Clock, TrendingUp, Search, ArrowRight, 
    Store, Maximize2, Tag, ChevronRight, CheckCircle2, Play
} from 'lucide-react';

export const Home = () => {
    const [booths, setBooths] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ search: '', status: 'TRONG', zone: '' });
    
    // Modal state
    const [selectedBooth, setSelectedBooth] = useState<any>(null);
    const [bookingForm, setBookingForm] = useState({
        startDate: '',
        endDate: '',
        businessType: '',
        note: ''
    });
    const [errors, setErrors] = useState<any>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [viewingBoothDetails, setViewingBoothDetails] = useState<any>(null);
    
    const { user } = useAuth();
    const navigate = useNavigate();

    // Premium real estate/mall images
    const defaultImages = [
        'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1555529771-835f59fc5efe?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1581373449483-37449f962b6c?q=80&w=1200&auto=format&fit=crop',
    ];

    const getFallbackImage = (boothId: string) => {
        if (!boothId) return defaultImages[0];
        let sum = 0;
        for (let i = 0; i < boothId.length; i++) { sum += boothId.charCodeAt(i); }
        return defaultImages[sum % defaultImages.length];
    };

    useEffect(() => {
        fetchBooths();
    }, [filter]);

    const fetchBooths = async () => {
        try {
            setLoading(true);
            const res = await api.booths.getAll(filter);
            setBooths(res.data);
        } catch (error) {
            console.error("Error fetching booths", error);
            toast.error('Lỗi khi tải danh sách gian hàng');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (booth: any) => {
        if (!user) {
            toast('Vui lòng đăng nhập để thuê gian hàng', { icon: '🔒' });
            navigate('/login');
            return;
        }
        setSelectedBooth(booth);
        setBookingForm({ startDate: '', endDate: '', businessType: '', note: '' });
        setErrors({});
    };

    const handleCloseModal = () => {
        setSelectedBooth(null);
        setErrors({});
    };

    const handleOpenDetails = (booth: any) => setViewingBoothDetails(booth);
    const handleCloseDetails = () => setViewingBoothDetails(null);

    const handleSubmitRent = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const newErrors: any = {};
        if (!bookingForm.businessType.trim()) newErrors.businessType = 'Vui lòng nhập loại hình kinh doanh';
        if (!bookingForm.startDate) newErrors.startDate = 'Vui lòng chọn ngày bắt đầu';
        if (!bookingForm.endDate) newErrors.endDate = 'Vui lòng chọn ngày kết thúc';
        else if (new Date(bookingForm.endDate) <= new Date(bookingForm.startDate)) {
            newErrors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        setErrors({});

        setIsSubmitting(true);
        const toastId = toast.loading('Đang gửi yêu cầu...');
        try {
            await api.requests.create({
                ...bookingForm,
                boothId: selectedBooth.id
            });
            toast.success('Gửi yêu cầu thuê thành công!', { id: toastId });
            handleCloseModal();
            fetchBooths(); 
            navigate('/dashboard'); 
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Lỗi gửi yêu cầu. Vui lòng thử lại.', { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-indigo-200 selection:text-indigo-900 overflow-x-hidden">
            {/* HERO SECTION - Premium Design */}
            <div className="relative pt-24 pb-32 lg:pt-36 lg:pb-40 overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 -mr-40 -mt-40 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-indigo-100/40 to-purple-100/40 blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-blue-100/40 to-emerald-100/40 blur-3xl pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
                        {/* Hero Content */}
                        <div className="max-w-2xl">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-indigo-100 shadow-sm text-indigo-600 text-sm font-semibold mb-6"
                            >
                                <span className="relative flex h-2.5 w-2.5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
                                </span>
                                BoothRental Platform 2.0
                            </motion.div>
                            <motion.h1 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6"
                            >
                                Vị trí đắc địa,<br/>
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
                                    sinh lời tối đa.
                                </span>
                            </motion.h1>
                            <motion.p 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-lg lg:text-xl text-slate-500 mb-10 leading-relaxed max-w-lg"
                            >
                                Nền tảng cho thuê mặt bằng thương mại số 1. Quản lý hợp đồng, tìm kiếm gian hàng và thanh toán dễ dàng chỉ với vài cú click.
                            </motion.p>
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="flex flex-col sm:flex-row gap-4"
                            >
                                <button onClick={() => window.scrollTo({ top: document.getElementById('explore')?.offsetTop, behavior: 'smooth' })} className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transform hover:-translate-y-1 flex items-center justify-center gap-2">
                                    Khám phá ngay <ArrowRight className="w-5 h-5" />
                                </button>
                                <button onClick={() => navigate('/mall-map')} className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 rounded-2xl font-bold text-lg transition-all border border-slate-200 shadow-sm flex items-center justify-center gap-2">
                                    <MapPin className="w-5 h-5" /> Xem Sơ đồ
                                </button>
                            </motion.div>
                        </div>

                        {/* Hero Imagery */}
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2, duration: 0.8 }}
                            className="relative lg:h-[600px] rounded-[2.5rem] overflow-hidden shadow-2xl"
                        >
                            <img 
                                src="https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?q=80&w=1200&auto=format&fit=crop" 
                                alt="Mall Interior" 
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent"></div>
                            
                            {/* Glassmorphism Floating Cards */}
                            <motion.div 
                                initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}
                                className="absolute bottom-8 left-8 right-8 bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl text-white"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-white/70 font-medium text-sm mb-1 uppercase tracking-wider">Lượt xem trong ngày</p>
                                        <p className="text-3xl font-bold">2,400+</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                        <TrendingUp className="w-6 h-6 text-emerald-400" />
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* FLOATING SEARCH BAR */}
            <div id="explore" className="relative z-20 -mt-16 max-w-5xl mx-auto px-4 sm:px-6">
                <motion.div 
                    initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
                    className="bg-white p-4 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col md:flex-row gap-4"
                >
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input 
                            type="text" placeholder="Tìm theo tên hoặc mã gian hàng..." 
                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-700 placeholder:text-slate-400"
                            value={filter.search} onChange={(e) => setFilter({...filter, search: e.target.value})}
                        />
                    </div>
                    <div className="flex gap-4">
                        <select 
                            className="py-3.5 px-5 bg-slate-50 border-none rounded-2xl font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer min-w-[160px]"
                            value={filter.status} onChange={(e) => setFilter({...filter, status: e.target.value})}
                        >
                            <option value="ALL">Mọi trạng thái</option>
                            <option value="TRONG">Đang trống</option>
                            <option value="DA_DAT">Đã đặt</option>
                        </select>
                        <select 
                            className="py-3.5 px-5 bg-slate-50 border-none rounded-2xl font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer min-w-[140px]"
                            value={filter.zone} onChange={(e) => setFilter({...filter, zone: e.target.value})}
                        >
                            <option value="">Mọi khu vực</option>
                            <option value="A">Khu A</option>
                            <option value="B">Khu B</option>
                            <option value="C">Khu C</option>
                        </select>
                    </div>
                </motion.div>
            </div>

            {/* TRUSTED BRANDS */}
            <div className="border-y border-slate-100 bg-white py-12 relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest text-center mb-8">Đối tác chiến lược</p>
                    <div className="flex flex-wrap justify-center items-center gap-x-12 sm:gap-x-16 gap-y-8 opacity-60 hover:opacity-100 grayscale hover:grayscale-0 transition-all duration-500">
                        <span className="text-3xl font-black text-slate-800 tracking-tighter">ZARA</span>
                        <span className="text-3xl font-black text-slate-800 tracking-tighter italic">H&M</span>
                        <span className="text-3xl font-bold text-emerald-800 tracking-tighter">STARBUCKS</span>
                        <span className="text-3xl font-black text-red-700 tracking-tighter">UNIQLO</span>
                        <span className="text-3xl font-black text-slate-900 tracking-tighter">ADIDAS</span>
                        <span className="text-3xl font-bold text-orange-600 tracking-tighter">CGV</span>
                    </div>
                </div>
            </div>

            {/* LISTINGS SECTION */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-3 tracking-tight">Mặt bằng nổi bật</h2>
                        <p className="text-slate-500 text-lg">Khám phá các vị trí đang được săn đón nhất trong hệ thống.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                        <p className="text-slate-500 font-medium">Đang tìm kiếm dữ liệu...</p>
                    </div>
                ) : booths.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-3xl border border-slate-200 border-dashed">
                        <Store className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Không tìm thấy gian hàng</h3>
                        <p className="text-slate-500">Thử điều chỉnh lại bộ lọc tìm kiếm của bạn.</p>
                        <button onClick={() => setFilter({ search: '', status: 'ALL', zone: '' })} className="mt-4 text-indigo-600 font-bold hover:underline">
                            Xóa bộ lọc
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {booths.map((booth: any, idx: number) => (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: Math.min(idx * 0.1, 0.5) }}
                                key={booth.id} 
                                onClick={() => handleOpenDetails(booth)}
                                className="group bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-slate-100 cursor-pointer flex flex-col"
                            >
                                <div className="relative h-64 overflow-hidden">
                                    <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/10 transition-colors z-10"></div>
                                    <img
                                        src={booth.imageUrl || getFallbackImage(booth.id)}
                                        alt={booth.name}
                                        onError={(e) => { e.currentTarget.src = getFallbackImage(booth.id); }}
                                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                                    />
                                    {/* Badges */}
                                    <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                                        <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-extrabold shadow-sm backdrop-blur-md ${
                                            booth.status === 'TRONG' ? 'bg-emerald-500/90 text-white' :
                                            booth.status === 'DA_DAT' ? 'bg-amber-400/90 text-amber-900' :
                                            'bg-rose-500/90 text-white'
                                        }`}>
                                            {booth.status === 'TRONG' ? 'Sẵn sàng' : booth.status}
                                        </span>
                                    </div>
                                    <div className="absolute top-4 right-4 z-20">
                                        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white">
                                            <Maximize2 className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex gap-2 mb-3">
                                        <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md">Khu {booth.zone}</span>
                                        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">Mã: {booth.boothCode}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 mb-4">{booth.name}</h3>
                                    
                                    <div className="flex items-center justify-between text-sm text-slate-500 mb-6 pb-6 border-b border-slate-100">
                                        <div className="flex items-center">
                                            <MapPin className="w-4 h-4 mr-1.5 text-slate-400" /> Tầng 1
                                        </div>
                                        <div className="flex items-center">
                                            <Store className="w-4 h-4 mr-1.5 text-slate-400" /> <span className="font-semibold text-slate-900">{booth.area} m²</span>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-auto flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Giá thuê/tháng</p>
                                            <p className="text-xl font-extrabold text-indigo-600">
                                                {formatCurrency(booth.price)}
                                            </p>
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleOpenModal(booth); }}
                                            disabled={booth.status !== 'TRONG'}
                                            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm ${
                                                booth.status === 'TRONG' 
                                                ? 'bg-slate-900 text-white hover:bg-indigo-600 hover:scale-105' 
                                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                            }`}
                                        >
                                            <ArrowRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* FEATURES SECTION - Redesigned */}
            <div className="bg-white py-24 border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <h2 className="text-indigo-600 font-bold tracking-wide uppercase text-sm mb-3">Lợi Thế Cạnh Tranh</h2>
                        <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900">Môi trường hoàn hảo để phát triển thương hiệu</h3>
                    </div>
                    <div className="grid md:grid-cols-3 gap-12">
                        {[
                            { title: 'Vị Trí Trung Tâm', desc: 'Lưu lượng khách hàng khổng lồ mỗi ngày. Tiếp cận trực tiếp tệp khách hàng có thu nhập cao.', icon: <MapPin className="w-8 h-8 text-indigo-600" /> },
                            { title: 'An Ninh 24/7', desc: 'Hệ thống an ninh đa tầng với camera AI và đội ngũ bảo vệ chuyên nghiệp trực 24/24.', icon: <ShieldCheck className="w-8 h-8 text-emerald-500" /> },
                            { title: 'Hỗ Trợ Toàn Diện', desc: 'Đội ngũ BQL đồng hành từ khâu thiết kế gian hàng đến truyền thông quảng cáo.', icon: <TrendingUp className="w-8 h-8 text-amber-500" /> }
                        ].map((item, idx) => (
                            <div key={idx} className="text-center group">
                                <div className="w-20 h-20 mx-auto bg-slate-50 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-50 transition-all duration-300">
                                    {item.icon}
                                </div>
                                <h4 className="text-xl font-bold text-slate-900 mb-4">{item.title}</h4>
                                <p className="text-slate-500 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* TESTIMONIALS */}
            <div className="bg-slate-50 py-24 border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Khách hàng nói gì về chúng tôi?</h2>
                        <p className="text-lg text-slate-500">Hàng trăm thương hiệu đã tin tưởng và gặt hái thành công vượt bậc.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { name: "Nguyễn Văn A", role: "CEO, Thời trang XYZ", quote: "Từ khi chuyển cửa hàng về trung tâm này, doanh thu của chúng tôi tăng gấp 3 lần nhờ lượng khách vãng lai cực kỳ ổn định." },
                            { name: "Trần Thị B", role: "Quản lý, Cafe ABC", quote: "Hệ thống quản lý hợp đồng và thanh toán trực tuyến rất chuyên nghiệp. Ban quản lý hỗ trợ cực kỳ nhiệt tình." },
                            { name: "Lê Hoàng C", role: "Founder, Startup Công nghệ", quote: "Gian hàng thiết kế đẹp, an ninh đảm bảo 24/7 giúp tôi hoàn toàn yên tâm. Chắc chắn sẽ gia hạn thêm nhiều năm." }
                        ].map((t, idx) => (
                            <div key={idx} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 relative hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                <div className="text-indigo-600/10 absolute top-6 right-8">
                                    <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 32 32"><path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z"/></svg>
                                </div>
                                <p className="text-slate-700 leading-relaxed mb-6 relative z-10 font-medium">"{t.quote}"</p>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold text-xl">{t.name.charAt(0)}</div>
                                    <div>
                                        <p className="font-bold text-slate-900">{t.name}</p>
                                        <p className="text-sm text-slate-500">{t.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CALL TO ACTION */}
            <div className="relative py-24 overflow-hidden bg-slate-900">
                <div className="absolute inset-0">
                    <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2000&auto=format&fit=crop" alt="CTA BG" className="w-full h-full object-cover opacity-20" />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-transparent"></div>
                </div>
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-2xl">
                        <h2 className="text-4xl font-extrabold text-white mb-6 leading-tight">
                            Bắt đầu hành trình kinh doanh thành công của bạn.
                        </h2>
                        <p className="text-xl text-slate-300 mb-10">Đăng ký tài khoản ngay hôm nay để nhận thông tin ưu đãi mới nhất và ưu tiên chọn vị trí đẹp.</p>
                        <div className="flex gap-4">
                            <button onClick={() => navigate('/register')} className="px-8 py-4 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl font-bold text-lg transition-colors shadow-lg shadow-indigo-500/30">
                                Đăng Ký Miễn Phí
                            </button>
                            <button onClick={() => navigate('/pricing')} className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md rounded-xl font-bold text-lg transition-colors border border-white/20">
                                Xem Bảng Giá
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODALS */}
            <AnimatePresence>
                {/* 1. Booking Modal */}
                {selectedBooth && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={handleCloseModal} />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden">
                            <div className="bg-slate-900 px-6 py-5 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-white">Đăng ký thuê gian hàng</h3>
                                <button onClick={handleCloseModal} className="text-slate-400 hover:text-white bg-white/10 p-2 rounded-full cursor-pointer">
                                    <span className="sr-only">Close</span>&times;
                                </button>
                            </div>
                            <div className="p-8">
                                <div className="mb-6 p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-center">
                                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-indigo-600 font-bold mr-4 shadow-sm">
                                        {selectedBooth.boothCode}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900">{selectedBooth.name}</p>
                                        <p className="text-sm font-semibold text-indigo-600">{formatCurrency(selectedBooth.price)}/tháng</p>
                                    </div>
                                </div>
                                <form onSubmit={handleSubmitRent} className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Loại hình kinh doanh <span className="text-red-500">*</span></label>
                                        <input type="text" placeholder="Ví dụ: Thời trang..." className={`w-full rounded-xl focus:ring-2 transition-all p-3.5 border outline-none bg-slate-50 focus:bg-white ${errors.businessType ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-indigo-500'}`} value={bookingForm.businessType} onChange={(e) => {setBookingForm({...bookingForm, businessType: e.target.value}); if(errors.businessType) setErrors({...errors, businessType: ''})}} />
                                        {errors.businessType && <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.businessType}</p>}
                                    </div>
                                    <div className="grid grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Từ ngày <span className="text-red-500">*</span></label>
                                            <input type="date" className={`w-full rounded-xl focus:ring-2 transition-all p-3.5 border outline-none bg-slate-50 focus:bg-white text-slate-700 ${errors.startDate ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-indigo-500'}`} value={bookingForm.startDate} onChange={(e) => {setBookingForm({...bookingForm, startDate: e.target.value}); if(errors.startDate) setErrors({...errors, startDate: ''})}} />
                                            {errors.startDate && <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.startDate}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Đến ngày <span className="text-red-500">*</span></label>
                                            <input type="date" className={`w-full rounded-xl focus:ring-2 transition-all p-3.5 border outline-none bg-slate-50 focus:bg-white text-slate-700 ${errors.endDate ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-indigo-500'}`} value={bookingForm.endDate} onChange={(e) => {setBookingForm({...bookingForm, endDate: e.target.value}); if(errors.endDate) setErrors({...errors, endDate: ''})}} />
                                            {errors.endDate && <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.endDate}</p>}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Ghi chú thêm</label>
                                        <textarea rows={3} placeholder="Nhập yêu cầu đặc biệt..." className="w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-2 transition-all p-3.5 border outline-none resize-none bg-slate-50 focus:bg-white" value={bookingForm.note} onChange={(e) => setBookingForm({...bookingForm, note: e.target.value})}></textarea>
                                    </div>
                                    <div className="mt-8 flex gap-3">
                                        <button type="button" onClick={handleCloseModal} className="flex-1 py-4 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors">Hủy bỏ</button>
                                        <button type="submit" disabled={isSubmitting} className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center">
                                            {isSubmitting ? 'Đang gửi...' : 'Gửi Yêu Cầu'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* 2. Details Modal */}
                {viewingBoothDetails && (
                    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-6" onClick={handleCloseDetails}>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white rounded-[2rem] shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                            <div className="relative h-80 bg-slate-100">
                                <img src={viewingBoothDetails.imageUrl || getFallbackImage(viewingBoothDetails.id)} alt={viewingBoothDetails.name} onError={(e) => { e.currentTarget.src = getFallbackImage(viewingBoothDetails.id); }} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent"></div>
                                <button onClick={handleCloseDetails} className="absolute top-6 right-6 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur-md transition-colors focus:outline-none">
                                    <span className="sr-only">Close</span>&times;
                                </button>
                                <div className="absolute bottom-8 left-8 right-8">
                                    <div className="flex gap-2 mb-4">
                                        <span className="text-xs font-bold text-indigo-900 bg-white px-3 py-1 rounded-md">Khu {viewingBoothDetails.zone}</span>
                                        <span className="text-xs font-bold text-white bg-white/20 backdrop-blur-md border border-white/30 px-3 py-1 rounded-md">Mã: {viewingBoothDetails.boothCode}</span>
                                    </div>
                                    <h2 className="text-4xl font-extrabold text-white mb-2">{viewingBoothDetails.name}</h2>
                                    <p className="text-slate-300 max-w-2xl">{viewingBoothDetails.description || 'Chưa có mô tả chi tiết cho gian hàng này.'}</p>
                                </div>
                            </div>
                            
                            <div className="p-8">
                                <div className="grid grid-cols-3 gap-6 mb-8 pb-8 border-b border-slate-100">
                                    <div className="bg-slate-50 rounded-2xl p-4 text-center">
                                        <Store className="w-6 h-6 text-indigo-500 mx-auto mb-2" />
                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Diện tích</p>
                                        <p className="text-xl font-bold text-slate-900">{viewingBoothDetails.area} <span className="text-sm font-medium">m²</span></p>
                                    </div>
                                    <div className="bg-slate-50 rounded-2xl p-4 text-center">
                                        <MapPin className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Vị trí</p>
                                        <p className="text-xl font-bold text-slate-900">Khu {viewingBoothDetails.zone}</p>
                                    </div>
                                    <div className="bg-slate-50 rounded-2xl p-4 text-center flex flex-col justify-center border border-indigo-100/50">
                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Giá Thuê</p>
                                        <p className="text-xl font-extrabold text-indigo-600">{formatCurrency(viewingBoothDetails.price)}</p>
                                    </div>
                                </div>
                                
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <button 
                                        onClick={() => { handleCloseDetails(); handleOpenModal(viewingBoothDetails); }}
                                        disabled={viewingBoothDetails.status !== 'TRONG'}
                                        className={`flex-1 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                                            viewingBoothDetails.status === 'TRONG' 
                                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200' 
                                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                        }`}
                                    >
                                        {viewingBoothDetails.status === 'TRONG' ? 'Đăng Ký Thuê Gian Này' : 'Gian Hàng Đã Được Thuê'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
