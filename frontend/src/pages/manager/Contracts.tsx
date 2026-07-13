import React, { useEffect, useState } from 'react';
import { api } from '../../api/endpoints';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { Search, Filter, Edit, Power, Calendar, FileMinus, FileText } from 'lucide-react';

export const Contracts = () => {
    const [contracts, setContracts] = useState([]);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // Modals
    const [showActivateModal, setShowActivateModal] = useState(false);
    const [showTerminateModal, setShowTerminateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showRenewModal, setShowRenewModal] = useState(false);

    // Form states
    const [terminateNote, setTerminateNote] = useState('');
    const [editTotal, setEditTotal] = useState('');
    const [editDeposit, setEditDeposit] = useState('');
    const [renewEndDate, setRenewEndDate] = useState('');
    const [renewPrice, setRenewPrice] = useState('');

    useEffect(() => {
        fetchContracts();
    }, [statusFilter]);

    const fetchContracts = async () => {
        try {
            const res = await api.contracts.getAll({ status: statusFilter === 'ALL' ? undefined : statusFilter });
            setContracts(res.data);
        } catch (error) {
            console.error(error);
            toast.error('Lỗi khi tải danh sách hợp đồng');
        }
    };

    // Handlers
    const handleActivate = async () => {
        if (!selectedId) return;
        try {
            await api.contracts.activate(selectedId);
            toast.success('Kích hoạt thành công!');
            setShowActivateModal(false);
            fetchContracts();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Lỗi khi kích hoạt');
        }
    };

    const handleTerminate = async () => {
        if (!selectedId) return;
        if (!terminateNote.trim()) {
            toast.error('Vui lòng nhập lý do thanh lý');
            return;
        }
        try {
            await api.contracts.terminate(selectedId, terminateNote);
            toast.success('Đã thanh lý hợp đồng!');
            setShowTerminateModal(false);
            fetchContracts();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Lỗi khi thanh lý');
        }
    };

    const handleEdit = async () => {
        if (!selectedId) return;
        if (!editTotal || !editDeposit) {
            toast.error('Vui lòng nhập đầy đủ số tiền');
            return;
        }
        try {
            await api.contracts.update(selectedId, { totalAmount: Number(editTotal), deposit: Number(editDeposit) });
            toast.success('Cập nhật hợp đồng thành công!');
            setShowEditModal(false);
            fetchContracts();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Lỗi khi cập nhật');
        }
    };

    const handleRenew = async () => {
        if (!selectedId) return;
        if (!renewEndDate) {
            toast.error('Vui lòng chọn ngày kết thúc mới');
            return;
        }
        try {
            await api.contracts.renew(selectedId, { newEndDate: renewEndDate, newPrice: renewPrice ? Number(renewPrice) : undefined });
            toast.success('Gia hạn hợp đồng thành công!');
            setShowRenewModal(false);
            fetchContracts();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Lỗi khi gia hạn');
        }
    };

    // Openers
    const openActivate = (id: string) => { setSelectedId(id); setShowActivateModal(true); };
    const openTerminate = (id: string) => { setSelectedId(id); setTerminateNote(''); setShowTerminateModal(true); };
    const openEdit = (c: any) => { setSelectedId(c.id); setEditTotal(c.totalAmount.toString()); setEditDeposit(c.deposit.toString()); setShowEditModal(true); };
    const openRenew = (id: string) => { setSelectedId(id); setRenewEndDate(''); setRenewPrice(''); setShowRenewModal(true); };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'NHAP': return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'DANG_HIEU_LUC': return 'bg-green-100 text-green-800 border-green-200';
            case 'DA_KET_THUC': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    return (
        <div className="p-2 sm:p-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Quản lý Hợp đồng</h1>
                    <p className="text-sm text-gray-500 mt-1">Theo dõi, chỉnh sửa và quản lý vòng đời của các hợp đồng thuê gian hàng.</p>
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
                        <option value="ALL">Tất cả hợp đồng</option>
                        <option value="NHAP">Bản nháp</option>
                        <option value="DANG_HIEU_LUC">Đang hiệu lực</option>
                        <option value="DA_KET_THUC">Đã kết thúc</option>
                    </select>
                </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Mã HĐ</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Khách hàng</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Gian hàng</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Giá trị hợp đồng</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {contracts.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        Không tìm thấy hợp đồng nào.
                                    </td>
                                </tr>
                            ) : contracts.map((c: any) => (
                                <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-sm font-bold border border-indigo-100">
                                            {c.contractNo}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-semibold text-gray-900">{c.customerFullName}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-600">{c.boothCode}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900 font-bold">{formatCurrency(c.totalAmount)}</div>
                                        <div className="text-xs text-gray-500 mt-1">Cọc: {formatCurrency(c.deposit)}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(c.status)}`}>
                                            {c.status === 'NHAP' ? 'Bản nháp' : c.status === 'DANG_HIEU_LUC' ? 'Đang hiệu lực' : 'Đã kết thúc'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        {c.status === 'NHAP' && (
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => openEdit(c)} className="inline-flex items-center px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                                                    <Edit className="w-3.5 h-3.5 mr-1.5" /> Sửa
                                                </button>
                                                <button onClick={() => openActivate(c.id)} className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 shadow-sm shadow-green-200 transition-colors">
                                                    <Power className="w-3.5 h-3.5 mr-1.5" /> Kích hoạt
                                                </button>
                                            </div>
                                        )}
                                        {c.status === 'DANG_HIEU_LUC' && (
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => openRenew(c.id)} className="inline-flex items-center px-3 py-1.5 border border-blue-200 rounded-lg text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors">
                                                    <Calendar className="w-3.5 h-3.5 mr-1.5" /> Gia hạn
                                                </button>
                                                <button onClick={() => openTerminate(c.id)} className="inline-flex items-center px-3 py-1.5 border border-red-200 rounded-lg text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 transition-colors">
                                                    <FileMinus className="w-3.5 h-3.5 mr-1.5" /> Thanh lý
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <ConfirmModal 
                isOpen={showActivateModal}
                title="Kích hoạt hợp đồng"
                message="Bạn có chắc chắn muốn kích hoạt hợp đồng này? Hệ thống sẽ tự động tạo phiếu thu tiền cọc."
                onConfirm={handleActivate}
                onCancel={() => setShowActivateModal(false)}
                type="info"
                confirmText="Xác nhận kích hoạt"
            />

            {/* Modal Sửa */}
            <AnimatePresence>
                {showEditModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setShowEditModal(false)} />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center"><Edit className="w-5 h-5 mr-2 text-indigo-600" /> Sửa thông tin giá trị</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tiền cọc (VND)</label>
                                    <input type="number" value={editDeposit} onChange={e => setEditDeposit(e.target.value)} className="w-full px-4 py-2 border rounded-xl focus:ring-indigo-500 focus:border-indigo-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tổng tiền (VND)</label>
                                    <input type="number" value={editTotal} onChange={e => setEditTotal(e.target.value)} className="w-full px-4 py-2 border rounded-xl focus:ring-indigo-500 focus:border-indigo-500" />
                                </div>
                            </div>
                            <div className="mt-8 flex gap-3">
                                <button onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-2.5 border rounded-xl font-medium hover:bg-gray-50">Hủy</button>
                                <button onClick={handleEdit} className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700">Lưu thay đổi</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal Thanh Lý */}
            <AnimatePresence>
                {showTerminateModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setShowTerminateModal(false)} />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4"><FileMinus className="w-6 h-6 text-red-600" /></div>
                            <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Thanh lý hợp đồng</h3>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1 mt-4">Lý do / Ghi chú thanh lý *</label>
                                <textarea value={terminateNote} onChange={e => setTerminateNote(e.target.value)} rows={3} className="w-full px-4 py-2 border rounded-xl focus:ring-red-500 focus:border-red-500" />
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setShowTerminateModal(false)} className="flex-1 px-4 py-2.5 border rounded-xl font-medium hover:bg-gray-50">Hủy</button>
                                <button onClick={handleTerminate} className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700">Thanh lý</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal Gia Hạn */}
            <AnimatePresence>
                {showRenewModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setShowRenewModal(false)} />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center"><Calendar className="w-5 h-5 mr-2 text-blue-600" /> Gia hạn hợp đồng</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc mới *</label>
                                    <input type="date" value={renewEndDate} onChange={e => setRenewEndDate(e.target.value)} className="w-full px-4 py-2 border rounded-xl focus:ring-blue-500 focus:border-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Giá trị gia hạn (Tùy chọn)</label>
                                    <input type="number" value={renewPrice} onChange={e => setRenewPrice(e.target.value)} placeholder="Bỏ trống nếu không đổi" className="w-full px-4 py-2 border rounded-xl focus:ring-blue-500 focus:border-blue-500" />
                                </div>
                            </div>
                            <div className="mt-8 flex gap-3">
                                <button onClick={() => setShowRenewModal(false)} className="flex-1 px-4 py-2.5 border rounded-xl font-medium hover:bg-gray-50">Hủy</button>
                                <button onClick={handleRenew} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700">Xác nhận gia hạn</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
