import React, { useEffect, useState } from 'react';
import { api } from '../../api/endpoints';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Filter, CheckCircle, AlertCircle, Clock, CreditCard } from 'lucide-react';

export const Payments = () => {
    const [payments, setPayments] = useState([]);
    const [statusFilter, setStatusFilter] = useState('ALL');

    // Modal state
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [actualAmount, setActualAmount] = useState('');
    const [expectedAmount, setExpectedAmount] = useState<number>(0);

    useEffect(() => {
        fetchPayments();
    }, [statusFilter]);

    const fetchPayments = async () => {
        try {
            const res = await api.payments.getAll({ status: statusFilter === 'ALL' ? undefined : statusFilter });
            setPayments(res.data);
        } catch (error) {
            console.error(error);
            toast.error('Lỗi khi tải danh sách thanh toán');
        }
    };

    const openConfirm = (id: string, amountToPay: number) => {
        setSelectedId(id);
        setExpectedAmount(amountToPay);
        setActualAmount(amountToPay.toString());
        setShowConfirmModal(true);
    };

    const handleConfirmSubmit = async () => {
        if (!selectedId) return;
        const amount = Number(actualAmount);
        if (!actualAmount || isNaN(amount) || amount < 0) {
            toast.error('Số tiền không hợp lệ');
            return;
        }

        try {
            await api.payments.confirm(selectedId, { actualAmount: amount });
            toast.success('Đã xác nhận thanh toán thành công!');
            setShowConfirmModal(false);
            fetchPayments();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Lỗi khi xác nhận thanh toán');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CHO_THANH_TOAN': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'DA_THANH_TOAN': return 'bg-green-100 text-green-800 border-green-200';
            case 'QUA_HAN': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    return (
        <div className="p-2 sm:p-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Quản lý Thanh toán</h1>
                    <p className="text-sm text-gray-500 mt-1">Theo dõi các khoản thu tiền cọc, tiền thuê gian hàng và phí phạt.</p>
                </div>
                
                <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                        <Filter className="w-4 h-4" />
                    </div>
                    <select 
                        value={statusFilter} 
                        onChange={e => setStatusFilter(e.target.value)}
                        className="bg-transparent border-none text-sm font-medium text-gray-700 focus:ring-0 cursor-pointer outline-none pr-4"
                    >
                        <option value="ALL">Tất cả khoản thu</option>
                        <option value="CHO_THANH_TOAN">Chờ thanh toán</option>
                        <option value="DA_THANH_TOAN">Đã thanh toán</option>
                        <option value="QUA_HAN">Quá hạn</option>
                    </select>
                </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-gradient-to-r from-slate-50 to-slate-100/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Khách hàng</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Hợp đồng</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Khoản thu</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Cần thu</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Hạn chót</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {payments.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                                        Không tìm thấy khoản thanh toán nào.
                                    </td>
                                </tr>
                            ) : payments.map((p: any) => {
                                const totalToPay = p.amount + (p.penaltyAmount || 0);
                                const isOverdue = p.status === 'QUA_HAN';
                                return (
                                    <tr key={p.id} className={`hover:bg-slate-50/80 transition-colors group relative ${isOverdue ? 'bg-red-50/20' : ''}`}>
                                        <td className={`absolute left-0 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-opacity ${isOverdue ? 'bg-red-500' : 'bg-blue-500'}`}></td>
                                        <td className="px-6 py-4 relative">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 font-bold mr-3 shadow-sm border border-indigo-200/50 group-hover:scale-110 transition-transform">
                                                    {p.customerFullName?.charAt(0) || '?'}
                                                </div>
                                                <span className="text-sm font-bold text-slate-900">{p.customerFullName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 relative">
                                            <div className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                                                {p.contractNo}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 relative">
                                            <div className="text-sm font-bold text-slate-800">{p.title}</div>
                                        </td>
                                        <td className="px-6 py-4 relative">
                                            <div className="text-sm text-slate-900 font-black">{formatCurrency(p.amount)}</div>
                                            {p.penaltyAmount > 0 && <div className="text-rose-500 text-xs font-bold mt-1 bg-rose-50 px-1.5 py-0.5 rounded w-fit border border-rose-100">+ Phạt: {formatCurrency(p.penaltyAmount)}</div>}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 font-medium relative">
                                            {p.dueDate}
                                        </td>
                                        <td className="px-6 py-4 relative">
                                            <span className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-bold border ${getStatusColor(p.status)} ${isOverdue ? 'animate-pulse' : ''}`}>
                                                {p.status === 'CHO_THANH_TOAN' && <Clock className="w-3.5 h-3.5 mr-1" />}
                                                {p.status === 'DA_THANH_TOAN' && <CheckCircle className="w-3.5 h-3.5 mr-1" />}
                                                {p.status === 'QUA_HAN' && <AlertCircle className="w-3.5 h-3.5 mr-1" />}
                                                {p.status === 'CHO_THANH_TOAN' ? 'Chờ thanh toán' : p.status === 'DA_THANH_TOAN' ? 'Đã thanh toán' : 'Quá hạn'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right relative">
                                            {p.status !== 'DA_THANH_TOAN' ? (
                                                <button 
                                                    onClick={() => openConfirm(p.id, totalToPay)} 
                                                    className="inline-flex items-center px-3 py-2 border border-transparent rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-200 hover:shadow-md hover:shadow-blue-300 transition-all hover:-translate-y-0.5"
                                                >
                                                    <CreditCard className="w-4 h-4 mr-1.5" /> Xác nhận thu
                                                </button>
                                            ) : (
                                                <div className="inline-flex flex-col items-end">
                                                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Thực thu</span>
                                                    <span className="text-sm font-black text-emerald-600">{formatCurrency(p.actualAmount)}</span>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Xác Nhận Thu Tiền */}
            <AnimatePresence>
                {showConfirmModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
                            onClick={() => setShowConfirmModal(false)}
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-full max-w-md border border-white"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-6 shadow-inner transform -translate-y-12 mb--8 absolute left-1/2 -translate-x-1/2 bg-white">
                                <CreditCard className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="text-2xl font-black text-center text-slate-900 mb-2 mt-4">Xác nhận thu tiền</h3>
                            <p className="text-center text-slate-500 mb-8 font-medium">Vui lòng kiểm tra kỹ số tiền thực nhận trước khi xác nhận.</p>
                            
                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 mb-6 flex flex-col items-center justify-center gap-1 shadow-inner">
                                <span className="text-sm text-slate-500 font-bold uppercase tracking-wider">Số tiền cần thu</span>
                                <span className="text-3xl font-black text-slate-900 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{formatCurrency(expectedAmount)}</span>
                            </div>

                            <div className="mb-8">
                                <label className="block text-sm font-bold text-slate-700 mb-2">Thực thu (VNĐ) <span className="text-rose-500">*</span></label>
                                <div className="relative group">
                                    <input 
                                        type="number" 
                                        value={actualAmount}
                                        onChange={e => setActualAmount(e.target.value)}
                                        className="block w-full pl-4 pr-16 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-xl font-black text-slate-900 focus:bg-white"
                                    />
                                    <span className="absolute right-4 top-4 text-slate-400 font-bold group-focus-within:text-blue-500 transition-colors">VNĐ</span>
                                </div>
                            </div>
                            
                            <div className="flex gap-4">
                                <button 
                                    onClick={() => setShowConfirmModal(false)}
                                    className="flex-1 px-4 py-3.5 rounded-xl text-slate-700 font-bold bg-slate-100 hover:bg-slate-200 transition-colors"
                                >
                                    Hủy bỏ
                                </button>
                                <button 
                                    onClick={handleConfirmSubmit}
                                    className="flex-1 px-4 py-3.5 bg-blue-600 rounded-xl text-white font-bold hover:bg-blue-700 shadow-md shadow-blue-200 transition-all hover:-translate-y-0.5"
                                >
                                    Xác nhận
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
