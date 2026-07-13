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
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Khách hàng</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Hợp đồng</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Khoản thu</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cần thu</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Hạn chót</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {payments.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        Không tìm thấy khoản thanh toán nào.
                                    </td>
                                </tr>
                            ) : payments.map((p: any) => {
                                const totalToPay = p.amount + (p.penaltyAmount || 0);
                                return (
                                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 flex items-center justify-center text-gray-700 font-bold mr-3 shadow-sm">
                                                    {p.customerFullName?.charAt(0) || '?'}
                                                </div>
                                                <span className="text-sm font-semibold text-gray-900">{p.customerFullName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="inline-flex items-center px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                                                {p.contractNo}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-800">{p.title}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 font-bold">{formatCurrency(p.amount)}</div>
                                            {p.penaltyAmount > 0 && <div className="text-red-500 text-xs font-medium mt-1">+ Phạt: {formatCurrency(p.penaltyAmount)}</div>}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                                            {p.dueDate}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(p.status)}`}>
                                                {p.status === 'CHO_THANH_TOAN' && <Clock className="w-3 h-3 mr-1" />}
                                                {p.status === 'DA_THANH_TOAN' && <CheckCircle className="w-3 h-3 mr-1" />}
                                                {p.status === 'QUA_HAN' && <AlertCircle className="w-3 h-3 mr-1" />}
                                                {p.status === 'CHO_THANH_TOAN' ? 'Chờ thanh toán' : p.status === 'DA_THANH_TOAN' ? 'Đã thanh toán' : 'Quá hạn'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {p.status !== 'DA_THANH_TOAN' ? (
                                                <button 
                                                    onClick={() => openConfirm(p.id, totalToPay)} 
                                                    className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-200 transition-colors"
                                                >
                                                    <CreditCard className="w-4 h-4 mr-1.5" /> Xác nhận thu
                                                </button>
                                            ) : (
                                                <div className="inline-flex flex-col items-end">
                                                    <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Thực thu</span>
                                                    <span className="text-sm font-bold text-green-600">{formatCurrency(p.actualAmount)}</span>
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
                            className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md border border-gray-100"
                        >
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                                <CreditCard className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Xác nhận thu tiền</h3>
                            <p className="text-center text-gray-500 mb-6 text-sm">Xác nhận khoản tiền bạn thực nhận từ khách hàng cho phiếu thu này.</p>
                            
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 flex justify-between items-center">
                                <span className="text-sm text-gray-600 font-medium">Số tiền cần thu:</span>
                                <span className="text-lg font-bold text-gray-900">{formatCurrency(expectedAmount)}</span>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Thực thu (VND) *</label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        value={actualAmount}
                                        onChange={e => setActualAmount(e.target.value)}
                                        className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-lg font-semibold"
                                    />
                                    <span className="absolute right-4 top-3 text-gray-400 font-medium">VNĐ</span>
                                </div>
                            </div>
                            
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setShowConfirmModal(false)}
                                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Hủy bỏ
                                </button>
                                <button 
                                    onClick={handleConfirmSubmit}
                                    className="flex-1 px-4 py-2.5 bg-blue-600 rounded-xl text-white font-medium hover:bg-blue-700 shadow-sm shadow-blue-200 transition-colors"
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
