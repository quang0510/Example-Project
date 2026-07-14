import React, { useEffect, useState } from 'react';
import { api } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { 
    Calendar, MapPin, FileSignature, Receipt, Clock, CheckCircle, 
    AlertCircle, XCircle, QrCode, Store, Send, DollarSign, Wallet 
} from 'lucide-react';

export const UserDashboard = () => {
    const [activeTab, setActiveTab] = useState('requests');
    const [requests, setRequests] = useState([]);
    const [contracts, setContracts] = useState([]);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<any>(null);
    const [paymentMethod, setPaymentMethod] = useState('bank');
    const { user } = useAuth();
    const location = useLocation();

    // Dialog state
    const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean; id: string | null}>({ isOpen: false, id: null });

    const queryParams = new URLSearchParams(location.search);
    const boothId = queryParams.get('booth');
    
    const [bookingForm, setBookingForm] = useState({
        boothId: boothId || '',
        startDate: '',
        endDate: '',
        businessType: '',
        note: ''
    });
    
    const [errors, setErrors] = useState<any>({});

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'requests') {
                const res = await api.requests.getMy();
                setRequests(res.data);
            } else if (activeTab === 'contracts') {
                const res = await api.contracts.getMy();
                setContracts(res.data);
            } else if (activeTab === 'payments') {
                const res = await api.payments.getMy();
                setPayments(res.data);
            }
        } catch (error) {
            console.error(error);
            toast.error('Lỗi khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRequest = async (e: React.FormEvent) => {
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

        const toastId = toast.loading('Đang xử lý...');
        try {
            await api.requests.create(bookingForm);
            toast.success('Gửi yêu cầu thành công!', { id: toastId });
            setBookingForm({ boothId: '', startDate: '', endDate: '', businessType: '', note: '' });
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Lỗi gửi yêu cầu', { id: toastId });
        }
    };

    const handleCancelClick = (id: string) => {
        setConfirmDialog({ isOpen: true, id });
    };

    const confirmCancelRequest = async () => {
        if (!confirmDialog.id) return;
        const toastId = toast.loading('Đang hủy yêu cầu...');
        try {
            await api.requests.cancel(confirmDialog.id);
            toast.success('Đã hủy yêu cầu', { id: toastId });
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Lỗi', { id: toastId });
        } finally {
            setConfirmDialog({ isOpen: false, id: null });
        }
    };

    const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    const tabs = [
        { id: 'requests', label: 'Yêu cầu của tôi', icon: <Send className="w-4 h-4" /> },
        { id: 'contracts', label: 'Hợp đồng', icon: <FileSignature className="w-4 h-4" /> },
        { id: 'payments', label: 'Thanh toán', icon: <Wallet className="w-4 h-4" /> }
    ];

    const getStatusBadge = (status: string, type: 'req' | 'contract' | 'payment') => {
        const styles: Record<string, string> = {
            // Requests
            'CHO_DUYET': 'bg-amber-50 text-amber-600 border-amber-200',
            'DA_DUYET': 'bg-emerald-50 text-emerald-600 border-emerald-200',
            'DA_HUY': 'bg-red-50 text-red-600 border-red-200',
            // Contracts
            'DANG_HIEU_LUC': 'bg-emerald-50 text-emerald-600 border-emerald-200',
            'NHAP': 'bg-slate-50 text-slate-600 border-slate-200',
            'DA_KET_THUC': 'bg-gray-50 text-gray-500 border-gray-200',
            // Payments
            'CHO_THANH_TOAN': 'bg-amber-50 text-amber-600 border-amber-200',
            'DA_THANH_TOAN': 'bg-emerald-50 text-emerald-600 border-emerald-200',
            'QUA_HAN': 'bg-red-50 text-red-600 border-red-200',
        };

        const icons: Record<string, any> = {
            'CHO_DUYET': <Clock className="w-3.5 h-3.5" />,
            'DA_DUYET': <CheckCircle className="w-3.5 h-3.5" />,
            'DA_HUY': <XCircle className="w-3.5 h-3.5" />,
            'DANG_HIEU_LUC': <CheckCircle className="w-3.5 h-3.5" />,
            'CHO_THANH_TOAN': <Clock className="w-3.5 h-3.5" />,
            'DA_THANH_TOAN': <CheckCircle className="w-3.5 h-3.5" />,
            'QUA_HAN': <AlertCircle className="w-3.5 h-3.5" />,
        };

        const labels: Record<string, string> = {
            'CHO_DUYET': 'Chờ duyệt',
            'DA_DUYET': 'Đã duyệt',
            'DA_HUY': 'Đã hủy',
            'DANG_HIEU_LUC': 'Đang hiệu lực',
            'NHAP': 'Bản nháp',
            'DA_KET_THUC': 'Đã kết thúc',
            'CHO_THANH_TOAN': 'Chờ thanh toán',
            'DA_THANH_TOAN': 'Đã thanh toán',
            'QUA_HAN': 'Quá hạn',
        };

        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${styles[status] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                {icons[status]} {labels[status] || status}
            </span>
        );
    };

    return (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-80px)] bg-slate-50/50">
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Khu vực Khách hàng</h1>
                    <p className="text-slate-500 mt-2">Quản lý các yêu cầu thuê, hợp đồng và thanh toán chi phí của bạn.</p>
                </div>
            </div>

            {/* Summary Stats */}
            {!loading && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                            <Send className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-500 mb-1">Tổng yêu cầu</p>
                            <p className="text-3xl font-black text-slate-900">{requests.length}</p>
                        </div>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                            <FileSignature className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-500 mb-1">Hợp đồng hiệu lực</p>
                            <p className="text-3xl font-black text-slate-900">{contracts.filter((c: any) => c.status === 'DANG_HIEU_LUC').length}</p>
                        </div>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 text-amber-600 flex items-center justify-center border border-amber-100">
                            <Wallet className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-500 mb-1">Thanh toán chờ</p>
                            <p className="text-3xl font-black text-slate-900">{payments.filter((p: any) => p.status === 'CHO_THANH_TOAN').length}</p>
                        </div>
                    </motion.div>
                </div>
            )}
            
            {/* Form đặt nhanh */}
            {boothId && activeTab === 'requests' && (
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-8 rounded-3xl mb-10 shadow-sm border border-indigo-100 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-20 -mt-20 z-0"></div>
                    <div className="relative z-10">
                        <h2 className="text-2xl font-bold text-indigo-900 mb-6 flex items-center gap-3">
                            <div className="bg-indigo-100 text-indigo-600 p-2.5 rounded-xl">
                                <Send className="w-6 h-6" />
                            </div>
                            Gửi Yêu Cầu Thuê Mới
                        </h2>
                        <form onSubmit={handleCreateRequest} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Mã gian hàng</label>
                                <input type="text" value={bookingForm.boothId} readOnly className="w-full p-3.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-500 cursor-not-allowed outline-none font-medium" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Loại hình kinh doanh <span className="text-red-500">*</span></label>
                                <input type="text" value={bookingForm.businessType} onChange={e => {setBookingForm({...bookingForm, businessType: e.target.value}); if (errors.businessType) setErrors({...errors, businessType: ''})}} className={`w-full p-3.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium ${errors.businessType ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-indigo-500'}`} placeholder="Ví dụ: Thời trang nữ, Mỹ phẩm..." />
                                {errors.businessType && <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.businessType}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Từ ngày <span className="text-red-500">*</span></label>
                                <input type="date" value={bookingForm.startDate} onChange={e => {setBookingForm({...bookingForm, startDate: e.target.value}); if (errors.startDate) setErrors({...errors, startDate: ''})}} className={`w-full p-3.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-slate-700 ${errors.startDate ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-indigo-500'}`} />
                                {errors.startDate && <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.startDate}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Đến ngày <span className="text-red-500">*</span></label>
                                <input type="date" value={bookingForm.endDate} onChange={e => {setBookingForm({...bookingForm, endDate: e.target.value}); if (errors.endDate) setErrors({...errors, endDate: ''})}} className={`w-full p-3.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-slate-700 ${errors.endDate ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-indigo-500'}`} />
                                {errors.endDate && <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.endDate}</p>}
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Ghi chú thêm</label>
                                <textarea value={bookingForm.note} onChange={e => setBookingForm({...bookingForm, note: e.target.value})} className="w-full p-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none font-medium text-slate-700" rows={3} placeholder="Yêu cầu về vị trí, thi công..."></textarea>
                            </div>
                            <div className="md:col-span-2 flex justify-end mt-2">
                                <button type="submit" className="bg-indigo-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-indigo-700 shadow-md hover:shadow-xl hover:shadow-indigo-200 transition-all transform hover:-translate-y-0.5 flex items-center gap-2">
                                    Gửi Yêu Cầu <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            )}

            {/* Premium Pill Tabs */}
            <div className="flex gap-2 mb-8 bg-white p-1.5 rounded-2xl w-fit shadow-sm border border-slate-200">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`relative px-6 py-3 text-sm font-bold rounded-xl transition-colors flex items-center gap-2 ${
                            activeTab === tab.id ? 'text-indigo-700' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="user-dashboard-tab"
                                className="absolute inset-0 bg-indigo-50 rounded-xl border border-indigo-100"
                                style={{ zIndex: -1 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                        )}
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-32">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-indigo-600"></div>
                </div>
            ) : (
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* Tab: YÊU CẦU */}
                        {activeTab === 'requests' && (
                            <div className="space-y-4">
                                {requests.map((req: any) => (
                                    <motion.div key={req.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                                        <div className="flex items-start gap-5">
                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100/50 group-hover:scale-110 transition-transform">
                                                <Store className="w-7 h-7" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900 text-xl flex items-center gap-2">
                                                    Gian hàng {req.boothCode} 
                                                    <span className="text-sm font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">{req.boothName}</span>
                                                </h3>
                                                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-600 font-medium">
                                                    <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-slate-400"/> {req.startDate} <span className="text-slate-300 mx-1">→</span> {req.endDate}</div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-col md:items-end gap-3 border-t border-slate-100 pt-4 md:border-t-0 md:pt-0">
                                            {getStatusBadge(req.status, 'req')}
                                            
                                            {req.status === 'CHO_DUYET' && (
                                                <button onClick={() => handleCancelClick(req.id)} className="text-red-500 hover:text-white bg-red-50 hover:bg-red-500 px-4 py-2 rounded-xl transition-all cursor-pointer font-bold text-sm">
                                                    Hủy yêu cầu
                                                </button>
                                            )}
                                            {req.status === 'DA_HUY' && req.rejectedReason && (
                                                <span className="text-slate-500 text-xs bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 flex items-center gap-2 max-w-xs">
                                                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                                                    <span className="truncate" title={req.rejectedReason}>{req.rejectedReason}</span>
                                                </span>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                                {requests.length === 0 && (
                                    <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 border-dashed">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Send className="w-8 h-8 text-slate-300" />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-1">Chưa có yêu cầu thuê</h3>
                                        <p className="text-slate-500">Bạn chưa gửi yêu cầu thuê gian hàng nào.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tab: HỢP ĐỒNG */}
                        {activeTab === 'contracts' && (
                            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                                {contracts.map((c: any) => (
                                    <motion.div key={c.id} className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all group flex flex-col">
                                        <div className={`h-2 ${c.status === 'DANG_HIEU_LUC' ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-slate-200'}`} />
                                        <div className="p-6 flex-1 flex flex-col">
                                            <div className="flex justify-between items-start mb-6">
                                                <div>
                                                    <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-1.5 block">Mã Hợp Đồng</span>
                                                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{c.contractNo}</h3>
                                                </div>
                                                {getStatusBadge(c.status, 'contract')}
                                            </div>
                                            
                                            <div className="space-y-4 mb-6 flex-1">
                                                <div className="flex items-center p-3 bg-slate-50 rounded-2xl">
                                                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center mr-4 text-indigo-600 font-bold">
                                                        <MapPin className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gian hàng</p>
                                                        <p className="font-bold text-slate-900">{c.boothCode}</p>
                                                    </div>
                                                </div>
                                                
                                                <div className="bg-slate-50 p-4 rounded-2xl text-sm space-y-2.5">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-slate-500 font-medium">Tổng giá trị:</span>
                                                        <span className="font-bold text-slate-900 text-base">{formatCurrency(c.totalAmount)}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center border-t border-slate-200/60 pt-2.5">
                                                        <span className="text-slate-500 font-medium">Tiền cọc:</span>
                                                        <span className="font-bold text-emerald-600">{formatCurrency(c.deposit)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="bg-indigo-50/50 p-3 rounded-xl flex items-center justify-between text-sm">
                                                <div className="font-medium text-slate-600">{c.startDate}</div>
                                                <div className="w-8 h-[1px] bg-indigo-200 relative">
                                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                                                </div>
                                                <div className="font-bold text-indigo-700">{c.endDate}</div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                                {contracts.length === 0 && (
                                    <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-slate-200 border-dashed">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <FileSignature className="w-8 h-8 text-slate-300" />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-1">Chưa có hợp đồng</h3>
                                        <p className="text-slate-500">Bạn chưa có hợp đồng thuê nào được ký kết.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tab: THANH TOÁN */}
                        {activeTab === 'payments' && (
                            <div className="space-y-4">
                                {payments.map((p: any) => (
                                    <motion.div key={p.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center gap-6 relative overflow-hidden group">
                                        {/* Colored accent line on the left */}
                                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${p.status === 'CHO_THANH_TOAN' ? 'bg-amber-400' : p.status === 'DA_THANH_TOAN' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                                        
                                        <div className="flex-1 flex items-start gap-4 ml-2">
                                            <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center shrink-0 border border-slate-100">
                                                <Receipt className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900 text-lg mb-1">{p.title}</h3>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase tracking-wider">{p.contractNo}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col md:items-end justify-center md:min-w-[180px] bg-slate-50 md:bg-transparent p-4 md:p-0 rounded-2xl md:rounded-none">
                                            <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
                                                {formatCurrency(p.amount)}
                                            </div>
                                            <div className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-1.5">
                                                <Clock className="w-4 h-4" /> Hạn: {p.dueDate}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 md:min-w-[200px] justify-between md:justify-end border-t border-slate-100 pt-4 md:border-t-0 md:pt-0">
                                            {getStatusBadge(p.status, 'payment')}

                                            {p.status === 'CHO_THANH_TOAN' && (
                                                <button 
                                                    onClick={() => setSelectedPayment(p)} 
                                                    className="inline-flex items-center bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow-lg shadow-indigo-200 cursor-pointer gap-2"
                                                >
                                                    <QrCode className="w-4 h-4" /> Thanh toán
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                                {payments.length === 0 && (
                                    <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 border-dashed">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Wallet className="w-8 h-8 text-slate-300" />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-1">Chưa có khoản thu</h3>
                                        <p className="text-slate-500">Bạn không có khoản thanh toán nào ở thời điểm hiện tại.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            )}

            {/* Payment Modal using Framer Motion */}
            <AnimatePresence>
                {selectedPayment && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                            onClick={() => setSelectedPayment(null)}
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-white rounded-[2rem] shadow-2xl max-w-md w-full overflow-hidden border border-white"
                        >
                            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6 flex justify-between items-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                                <h3 className="text-xl font-bold text-white flex items-center gap-3 relative z-10">
                                    <QrCode className="w-6 h-6 text-indigo-200" />
                                    Chuyển Khoản Nhanh
                                </h3>
                                <button onClick={() => setSelectedPayment(null)} className="text-white/70 hover:text-white transition-colors cursor-pointer bg-white/10 p-2 rounded-full hover:bg-white/20 relative z-10">
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-8">
                                {/* Payment Method Selector */}
                                <div className="flex bg-slate-100 p-1 rounded-xl mb-8">
                                    <button 
                                        onClick={() => setPaymentMethod('bank')} 
                                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${paymentMethod === 'bank' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        Ngân hàng
                                    </button>
                                    <button 
                                        onClick={() => setPaymentMethod('vnpay')} 
                                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${paymentMethod === 'vnpay' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        VNPay
                                    </button>
                                    <button 
                                        onClick={() => setPaymentMethod('momo')} 
                                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${paymentMethod === 'momo' ? 'bg-white text-pink-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        MoMo
                                    </button>
                                </div>

                                {paymentMethod === 'bank' && (
                                    <>
                                        <div className="flex justify-center mb-8 relative group">
                                            <div className="absolute inset-0 bg-indigo-100 rounded-3xl blur-xl opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
                                            <img 
                                                src={`https://img.vietqr.io/image/Techcombank-19035497946017-compact2.png?amount=${selectedPayment.amount}&addInfo=Thanh toan HD ${selectedPayment.contractNo}&accountName=NGUYEN DANG QUANG`} 
                                                alt="VietQR" 
                                                className="w-56 h-56 object-contain border-[3px] border-white rounded-3xl shadow-xl p-3 bg-white relative z-10 transform transition-transform hover:scale-105 duration-300"
                                            />
                                        </div>
                                        <div className="space-y-4 text-sm text-slate-700 bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-inner">
                                            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                                                <span className="text-slate-500 font-medium">Ngân hàng</span> 
                                                <span className="font-bold text-slate-900 bg-white px-3 py-1 rounded-lg shadow-sm border border-slate-100">Techcombank</span>
                                            </div>
                                            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                                                <span className="text-slate-500 font-medium">Số tài khoản</span> 
                                                <span className="font-bold text-indigo-700 tracking-wider text-base">19035497946017</span>
                                            </div>
                                            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                                                <span className="text-slate-500 font-medium">Chủ tài khoản</span> 
                                                <span className="font-bold text-slate-900">NGUYEN DANG QUANG</span>
                                            </div>
                                            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                                                <span className="text-slate-500 font-medium">Số tiền</span> 
                                                <span className="font-black text-rose-600 text-lg">{formatCurrency(selectedPayment.amount)}</span>
                                            </div>
                                            <div className="flex flex-col pt-1">
                                                <span className="text-slate-500 font-medium mb-2 text-center">Nội dung chuyển khoản (bắt buộc)</span> 
                                                <span className="font-bold text-indigo-700 bg-indigo-50 px-4 py-3 rounded-xl border border-indigo-100 text-center tracking-wide shadow-sm">
                                                    Thanh toan HD {selectedPayment.contractNo}
                                                </span>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {paymentMethod === 'vnpay' && (
                                    <div className="animate-in fade-in zoom-in duration-300">
                                        <div className="flex justify-center mb-8 relative group">
                                            <div className="absolute inset-0 bg-blue-100 rounded-3xl blur-xl opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
                                            <img 
                                                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=vnpay://pay?amount=${selectedPayment.amount}&txn_id=${selectedPayment.contractNo}`} 
                                                alt="VNPay QR" 
                                                className="w-56 h-56 object-contain border-[3px] border-white rounded-3xl shadow-xl p-3 bg-white relative z-10 transform transition-transform hover:scale-105 duration-300"
                                            />
                                        </div>
                                        <div className="text-center bg-blue-50 p-6 rounded-2xl border border-blue-100 text-blue-900">
                                            <img src="https://vnpay.vn/s1/vnpay/logo.svg" alt="VNPay" className="h-8 mx-auto mb-4" />
                                            <p className="font-bold text-lg mb-2">Quét mã qua ứng dụng VNPay</p>
                                            <p className="text-sm opacity-80 mb-4">Mở ứng dụng ngân hàng hoặc VNPay để thanh toán an toàn.</p>
                                            
                                            <div className="bg-white/60 rounded-xl p-3 mb-4 text-sm text-left">
                                                <div className="flex justify-between">
                                                    <span className="opacity-80">Chủ tài khoản:</span>
                                                    <span className="font-bold">NGUYỄN ĐĂNG QUANG</span>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center border-t border-blue-200 pt-4 mt-2 text-left">
                                                <span className="font-medium opacity-80">Số tiền cần thanh toán</span>
                                                <span className="font-black text-xl text-blue-700">{formatCurrency(selectedPayment.amount)}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {paymentMethod === 'momo' && (
                                    <div className="animate-in fade-in zoom-in duration-300">
                                        <div className="flex justify-center mb-8 relative group">
                                            <div className="absolute inset-0 bg-pink-100 rounded-3xl blur-xl opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
                                            <img 
                                                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=2|99|0836668889|NGUYEN DANG QUANG||0|0|${selectedPayment.amount}|Thanh toan HD ${selectedPayment.contractNo}|transfer_myqr`} 
                                                alt="MoMo QR" 
                                                className="w-56 h-56 object-contain border-[3px] border-white rounded-3xl shadow-xl p-3 bg-white relative z-10 transform transition-transform hover:scale-105 duration-300"
                                            />
                                        </div>
                                        <div className="text-center bg-pink-50 p-6 rounded-2xl border border-pink-100 text-pink-900">
                                            <img src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png" alt="MoMo" className="h-8 mx-auto mb-4 object-contain" />
                                            <p className="font-bold text-lg mb-2">Quét mã bằng ứng dụng MoMo</p>
                                            <p className="text-sm opacity-80 mb-4">Mở MoMo, chọn quét mã để hoàn tất thanh toán.</p>
                                            
                                            <div className="bg-white/60 rounded-xl p-3 mb-4 text-sm text-left">
                                                <div className="flex justify-between mb-1">
                                                    <span className="opacity-80">Chủ tài khoản:</span>
                                                    <span className="font-bold">NGUYỄN ĐĂNG QUANG</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="opacity-80">Số điện thoại:</span>
                                                    <span className="font-bold">0836668889</span>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center border-t border-pink-200 pt-4 mt-2 text-left">
                                                <span className="font-medium opacity-80">Số tiền cần thanh toán</span>
                                                <span className="font-black text-xl text-pink-700">{formatCurrency(selectedPayment.amount)}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div className="mt-8">
                                    <button 
                                        onClick={() => setSelectedPayment(null)} 
                                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-xl hover:shadow-2xl hover:shadow-slate-900/20 transform hover:-translate-y-1 cursor-pointer flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle className="w-5 h-5" /> Đã thanh toán xong
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <ConfirmDialog 
                isOpen={confirmDialog.isOpen}
                title="Hủy yêu cầu thuê?"
                message="Bạn có chắc chắn muốn hủy yêu cầu thuê gian hàng này không? Hành động này không thể hoàn tác."
                confirmText="Đồng ý hủy"
                isDestructive={true}
                onConfirm={confirmCancelRequest}
                onCancel={() => setConfirmDialog({ isOpen: false, id: null })}
            />
        </div>
    );
};
