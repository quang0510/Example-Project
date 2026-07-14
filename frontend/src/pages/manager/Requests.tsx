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
            
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-gradient-to-r from-slate-50 to-slate-100/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Khách hàng</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Gian hàng</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Thời gian dự kiến</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {requests.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        Không tìm thấy yêu cầu nào phù hợp.
                                    </td>
                                </tr>
                            ) : requests.map((r: any) => (
                                <tr key={r.id} className="hover:bg-slate-50/80 transition-colors group relative">
                                    <td className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></td>
                                    <td className="px-6 py-4 relative">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-100 to-blue-100 flex items-center justify-center text-indigo-700 font-bold mr-3 shadow-sm border border-indigo-200/50 group-hover:scale-110 transition-transform">
                                                {r.customerFullName?.charAt(0) || '?'}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">{r.customerFullName}</div>
                                                <div className="text-xs font-medium text-slate-500 mt-0.5">{r.customerPhone}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 relative">
                                        <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 text-sm font-bold border border-slate-200">
                                            {r.boothCode}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 relative">
                                        <div className="text-sm text-slate-900 font-bold">{r.startDate}</div>
                                        <div className="text-xs font-medium text-slate-500 mt-0.5">đến {r.endDate}</div>
                                    </td>
                                    <td className="px-6 py-4 relative">
                                        <span className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-bold border ${getStatusColor(r.status)}`}>
                                            {r.status === 'CHO_DUYET' && <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2 animate-pulse"></span>}
                                            {r.status === 'DA_DUYET' && <CheckCircle className="w-3.5 h-3.5 mr-1" />}
                                            {r.status === 'DA_HUY' && <XCircle className="w-3.5 h-3.5 mr-1" />}
                                            {r.status === 'CHO_DUYET' ? 'Chờ duyệt' : r.status === 'DA_DUYET' ? 'Đã duyệt' : 'Đã hủy'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2 relative">
                                        {r.status === 'CHO_DUYET' && (
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    title="Từ chối yêu cầu"
                                                    onClick={() => openReject(r.id)} 
                                                    className="inline-flex items-center px-3 py-2 border border-rose-200 rounded-lg text-sm font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 hover:border-rose-300 transition-colors shadow-sm"
                                                >
                                                    Từ chối
                                                </button>
                                                <button 
                                                    title="Duyệt và tạo hợp đồng"
                                                    onClick={() => openApprove(r.id)} 
                                                    className="inline-flex items-center px-3 py-2 border border-transparent rounded-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-200 hover:shadow-md hover:shadow-indigo-300 transition-all hover:-translate-y-0.5"
                                                >
                                                    <CheckCircle className="w-4 h-4 mr-1.5" />
                                                    Duyệt & Tạo HĐ
                                                </button>
                                            </div>
                                        )}
                                        {r.status === 'DA_DUYET' && (
                                            <button 
                                                title="Làm lại hợp đồng"
                                                onClick={() => openApprove(r.id)} 
                                                className="inline-flex items-center px-3 py-2 border border-indigo-200 rounded-lg text-sm font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 hover:border-indigo-300 transition-colors shadow-sm"
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
                            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100"
                        >
                            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5">
                                <h3 className="text-xl font-black text-white flex items-center">
                                    <CheckCircle className="w-6 h-6 mr-3 text-indigo-200" />
                                    Duyệt yêu cầu thuê
                                </h3>
                            </div>
                            <div className="p-8">
                                <p className="text-sm font-medium text-slate-500 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">Hệ thống sẽ tự động tạo Hợp đồng sau khi bạn duyệt yêu cầu này. Vui lòng nhập thông tin giá trị hợp đồng.</p>
                                
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Tiền cọc yêu cầu (VNĐ)</label>
                                        <div className="relative group">
                                            <input 
                                                type="number" 
                                                value={deposit}
                                                onChange={e => setDeposit(e.target.value)}
                                                className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-bold text-slate-900 bg-slate-50 focus:bg-white"
                                                placeholder="VD: 10000000"
                                            />
                                            <span className="absolute right-4 top-3 text-slate-400 font-bold group-focus-within:text-indigo-500 transition-colors">VNĐ</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Tổng giá trị hợp đồng (VNĐ)</label>
                                        <div className="relative group">
                                            <input 
                                                type="number" 
                                                value={total}
                                                onChange={e => setTotal(e.target.value)}
                                                className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-bold text-slate-900 bg-slate-50 focus:bg-white"
                                                placeholder="VD: 120000000"
                                            />
                                            <span className="absolute right-4 top-3 text-slate-400 font-bold group-focus-within:text-indigo-500 transition-colors">VNĐ</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="mt-8 flex gap-4">
                                    <button 
                                        onClick={() => setShowApproveModal(false)}
                                        className="flex-1 px-4 py-3 rounded-xl text-slate-700 font-bold bg-slate-100 hover:bg-slate-200 transition-colors"
                                    >
                                        Hủy bỏ
                                    </button>
                                    <button 
                                        onClick={handleApproveSubmit}
                                        className="flex-1 px-4 py-3 bg-indigo-600 rounded-xl text-white font-bold hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all hover:-translate-y-0.5"
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
                            className="relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md border border-slate-100"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto mb-5 shadow-inner">
                                <XCircle className="w-8 h-8 text-rose-600" />
                            </div>
                            <h3 className="text-2xl font-black text-center text-slate-900 mb-2">Từ chối yêu cầu</h3>
                            <p className="text-center text-slate-500 mb-6 font-medium text-sm">Vui lòng cung cấp lý do từ chối để khách hàng biết thông tin chi tiết.</p>
                            
                            <div className="mb-8">
                                <label className="block text-sm font-bold text-slate-700 mb-2">Lý do từ chối <span className="text-rose-500">*</span></label>
                                <textarea 
                                    value={rejectReason}
                                    onChange={e => setRejectReason(e.target.value)}
                                    rows={4}
                                    className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-rose-100 focus:border-rose-500 outline-none transition-all resize-none font-medium text-slate-900 focus:bg-white"
                                    placeholder="VD: Gian hàng đã được đặt trước bởi người khác..."
                                />
                            </div>
                            
                            <div className="flex gap-4">
                                <button 
                                    onClick={() => setShowRejectModal(false)}
                                    className="flex-1 px-4 py-3 rounded-xl text-slate-700 font-bold bg-slate-100 hover:bg-slate-200 transition-colors"
                                >
                                    Hủy bỏ
                                </button>
                                <button 
                                    onClick={handleRejectSubmit}
                                    className="flex-1 px-4 py-3 bg-rose-600 rounded-xl text-white font-bold hover:bg-rose-700 shadow-md shadow-rose-200 transition-all hover:-translate-y-0.5"
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
