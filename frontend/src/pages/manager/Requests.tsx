import React, { useEffect, useState } from 'react';
import { api } from '../../api/endpoints';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { Search, Filter, CheckCircle, XCircle, FileText } from 'lucide-react';

export const Requests = () => {
    const [requests, setRequests] = useState([]);
    const [statusFilter, setStatusFilter] = useState('CHO_DUYET');
    
    // Modals state
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    
    // Form state
    const [deposit, setDeposit] = useState('');
    const [total, setTotal] = useState('');
    const [rejectReason, setRejectReason] = useState('');

    useEffect(() => {
        fetchRequests();
    }, [statusFilter]);

    const fetchRequests = async () => {
        try {
            const res = await api.requests.getAll({ status: statusFilter === 'ALL' ? undefined : statusFilter });
            setRequests(res.data);
        } catch (error) {
            console.error(error);
            toast.error('Lỗi khi tải danh sách yêu cầu');
        }
    };

    const openApprove = (id: string) => {
        setSelectedId(id);
        setDeposit('');
        setTotal('');
        setShowApproveModal(true);
    };

    const openReject = (id: string) => {
        setSelectedId(id);
        setRejectReason('');
        setShowRejectModal(true);
    };

    const handleApproveSubmit = async () => {
        if (!selectedId) return;
        if (!deposit || !total) {
            toast.error('Vui lòng nhập đầy đủ số tiền');
            return;
        }
        
        try {
            await api.contracts.createFromRequest(selectedId, {
                totalAmount: Number(total),
                deposit: Number(deposit)
            });
            
            toast.success('Đã duyệt yêu cầu và tạo hợp đồng thành công!');
            setShowApproveModal(false);
            fetchRequests();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Lỗi khi duyệt yêu cầu');
        }
    };

    const handleRejectSubmit = async () => {
        if (!selectedId) return;
        if (!rejectReason.trim()) {
            toast.error('Vui lòng nhập lý do từ chối');
            return;
        }

        try {
            await api.requests.reject(selectedId, rejectReason);
            toast.success('Đã từ chối yêu cầu thành công!');
            setShowRejectModal(false);
            fetchRequests();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Lỗi khi từ chối yêu cầu');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CHO_DUYET': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'DA_DUYET': return 'bg-green-100 text-green-800 border-green-200';
            case 'DA_HUY': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="p-2 sm:p-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Quản lý Yêu cầu thuê</h1>
                    <p className="text-sm text-gray-500 mt-1">Xem xét và phê duyệt các yêu cầu thuê gian hàng từ khách hàng.</p>
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
                        <option value="ALL">Tất cả trạng thái</option>
                        <option value="CHO_DUYET">Đang chờ duyệt</option>
                        <option value="DA_DUYET">Đã duyệt thành công</option>
                        <option value="DA_HUY">Đã hủy / Từ chối</option>
                    </select>
                </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Khách hàng</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Gian hàng</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Thời gian dự kiến</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {requests.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        Không tìm thấy yêu cầu nào phù hợp.
                                    </td>
                                </tr>
                            ) : requests.map((r: any) => (
                                <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-100 to-blue-100 flex items-center justify-center text-indigo-700 font-bold mr-3 shadow-sm">
                                                {r.customerFullName?.charAt(0) || '?'}
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold text-gray-900">{r.customerFullName}</div>
                                                <div className="text-xs text-gray-500 mt-0.5">{r.customerPhone}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-100 text-gray-800 text-sm font-medium border border-gray-200">
                                            {r.boothCode}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900 font-medium">{r.startDate}</div>
                                        <div className="text-xs text-gray-500 mt-0.5">đến {r.endDate}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(r.status)}`}>
                                            {r.status === 'CHO_DUYET' && <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mr-1.5 animate-pulse"></span>}
                                            {r.status === 'DA_DUYET' && <CheckCircle className="w-3 h-3 mr-1" />}
                                            {r.status === 'DA_HUY' && <XCircle className="w-3 h-3 mr-1" />}
                                            {r.status === 'CHO_DUYET' ? 'Chờ duyệt' : r.status === 'DA_DUYET' ? 'Đã duyệt' : 'Đã hủy'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        {r.status === 'CHO_DUYET' && (
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => openReject(r.id)} 
                                                    className="inline-flex items-center px-3 py-1.5 border border-red-200 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 hover:border-red-300 transition-colors"
                                                >
                                                    Từ chối
                                                </button>
                                                <button 
                                                    onClick={() => openApprove(r.id)} 
                                                    className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-colors"
                                                >
                                                    <CheckCircle className="w-4 h-4 mr-1.5" />
                                                    Duyệt & Tạo HĐ
                                                </button>
                                            </div>
                                        )}
                                        {r.status === 'DA_DUYET' && (
                                            <button 
                                                onClick={() => openApprove(r.id)} 
                                                className="inline-flex items-center px-3 py-1.5 border border-indigo-200 rounded-lg text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                                            >
                                                <FileText className="w-4 h-4 mr-1.5" />
                                                Làm lại HĐ
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Duyệt Yêu Cầu */}
            <AnimatePresence>
                {showApproveModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
                            onClick={() => setShowApproveModal(false)}
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                        >
                            <div className="bg-indigo-600 px-6 py-4">
                                <h3 className="text-lg font-bold text-white flex items-center">
                                    <CheckCircle className="w-5 h-5 mr-2" />
                                    Duyệt yêu cầu thuê
                                </h3>
                            </div>
                            <div className="p-6">
                                <p className="text-sm text-gray-500 mb-5">Hệ thống sẽ tự động tạo Hợp đồng sau khi bạn duyệt yêu cầu này. Vui lòng nhập thông tin giá trị hợp đồng.</p>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Tiền cọc yêu cầu (VND)</label>
                                        <div className="relative">
                                            <input 
                                                type="number" 
                                                value={deposit}
                                                onChange={e => setDeposit(e.target.value)}
                                                className="block w-full px-4 py-2.5 border border-gray-300 rounded-xl shadow-sm focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                                                placeholder="VD: 10000000"
                                            />
                                            <span className="absolute right-4 top-2.5 text-gray-400 font-medium">VNĐ</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Tổng giá trị hợp đồng (VND)</label>
                                        <div className="relative">
                                            <input 
                                                type="number" 
                                                value={total}
                                                onChange={e => setTotal(e.target.value)}
                                                className="block w-full px-4 py-2.5 border border-gray-300 rounded-xl shadow-sm focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                                                placeholder="VD: 120000000"
                                            />
                                            <span className="absolute right-4 top-2.5 text-gray-400 font-medium">VNĐ</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="mt-8 flex gap-3">
                                    <button 
                                        onClick={() => setShowApproveModal(false)}
                                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                    >
                                        Hủy bỏ
                                    </button>
                                    <button 
                                        onClick={handleApproveSubmit}
                                        className="flex-1 px-4 py-2.5 bg-indigo-600 rounded-xl text-white font-medium hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-colors"
                                    >
                                        Xác nhận duyệt
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal Từ Chối */}
            <AnimatePresence>
                {showRejectModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
                            onClick={() => setShowRejectModal(false)}
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md"
                        >
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                                <XCircle className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Từ chối yêu cầu</h3>
                            <p className="text-center text-gray-500 mb-6 text-sm">Vui lòng cung cấp lý do từ chối để khách hàng biết thông tin chi tiết.</p>
                            
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Lý do từ chối *</label>
                                <textarea 
                                    value={rejectReason}
                                    onChange={e => setRejectReason(e.target.value)}
                                    rows={4}
                                    className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-red-500 focus:border-red-500 outline-none transition-colors resize-none"
                                    placeholder="VD: Gian hàng đã được đặt trước bởi người khác..."
                                />
                            </div>
                            
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setShowRejectModal(false)}
                                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Hủy bỏ
                                </button>
                                <button 
                                    onClick={handleRejectSubmit}
                                    className="flex-1 px-4 py-2.5 bg-red-600 rounded-xl text-white font-medium hover:bg-red-700 shadow-sm shadow-red-200 transition-colors"
                                >
                                    Từ chối yêu cầu
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
