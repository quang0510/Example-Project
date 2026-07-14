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
            
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-gradient-to-r from-slate-50 to-slate-100/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Mã HĐ</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Khách hàng</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Gian hàng</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Giá trị hợp đồng</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {contracts.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                        Không tìm thấy hợp đồng nào.
                                    </td>
                                </tr>
                            ) : contracts.map((c: any) => (
                                <tr key={c.id} className="hover:bg-slate-50/80 transition-colors group relative">
                                    <td className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></td>
                                    <td className="px-6 py-4 relative">
                                        <div className="inline-flex items-center px-2.5 py-1.5 rounded-md bg-slate-100 text-slate-800 text-sm font-bold border border-slate-200 group-hover:bg-indigo-50 group-hover:text-indigo-700 group-hover:border-indigo-200 transition-colors">
                                            {c.contractNo}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 relative">
                                        <div className="text-sm font-bold text-slate-900">{c.customerFullName}</div>
                                    </td>
                                    <td className="px-6 py-4 relative">
                                        <div className="text-sm font-bold text-slate-700">{c.boothCode}</div>
                                    </td>
                                    <td className="px-6 py-4 relative">
                                        <div className="text-sm text-slate-900 font-black">{formatCurrency(c.totalAmount)}</div>
                                        <div className="text-xs font-medium text-slate-500 mt-1">Cọc: <span className="font-bold text-slate-700">{formatCurrency(c.deposit)}</span></div>
                                    </td>
                                    <td className="px-6 py-4 relative">
                                        <span className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-bold border ${getStatusColor(c.status)}`}>
                                            {c.status === 'NHAP' ? 'Bản nháp' : c.status === 'DANG_HIEU_LUC' ? 'Đang hiệu lực' : 'Đã kết thúc'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2 relative">
                                        {c.status === 'NHAP' && (
                                            <div className="flex items-center justify-end gap-2">
                                                <button title="Sửa thông tin" onClick={() => openEdit(c)} className="inline-flex items-center px-3 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-colors">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button title="Kích hoạt hợp đồng" onClick={() => openActivate(c.id)} className="inline-flex items-center px-3 py-2 border border-transparent rounded-lg text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-200 hover:shadow-md hover:shadow-emerald-300 transition-all hover:-translate-y-0.5">
                                                    <Power className="w-4 h-4 mr-1.5" /> Kích hoạt
                                                </button>
                                            </div>
                                        )}
                                        {c.status === 'DANG_HIEU_LUC' && (
                                            <div className="flex items-center justify-end gap-2">
                                                <button title="Gia hạn" onClick={() => openRenew(c.id)} className="inline-flex items-center px-3 py-2 border border-blue-200 rounded-lg text-sm font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 hover:border-blue-300 shadow-sm transition-colors">
                                                    <Calendar className="w-4 h-4 mr-1.5" /> Gia hạn
                                                </button>
                                                <button title="Thanh lý hợp đồng" onClick={() => openTerminate(c.id)} className="inline-flex items-center px-3 py-2 border border-rose-200 rounded-lg text-sm font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 hover:border-rose-300 shadow-sm transition-colors">
                                                    <FileMinus className="w-4 h-4 mr-1.5" /> Thanh lý
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
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md border border-slate-100">
                            <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center"><Edit className="w-6 h-6 mr-3 text-indigo-600" /> Sửa thông tin giá trị</h3>
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Tiền cọc (VNĐ)</label>
                                    <div className="relative group">
                                        <input type="number" value={editDeposit} onChange={e => setEditDeposit(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-bold focus:bg-white" />
                                        <span className="absolute right-4 top-3 text-slate-400 font-bold group-focus-within:text-indigo-500">VNĐ</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Tổng tiền (VNĐ)</label>
                                    <div className="relative group">
                                        <input type="number" value={editTotal} onChange={e => setEditTotal(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-bold focus:bg-white" />
                                        <span className="absolute right-4 top-3 text-slate-400 font-bold group-focus-within:text-indigo-500">VNĐ</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8 flex gap-4">
                                <button onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-3.5 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors">Hủy bỏ</button>
                                <button onClick={handleEdit} className="flex-1 px-4 py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all hover:-translate-y-0.5">Lưu thay đổi</button>
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
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md border border-slate-100">
                            <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto mb-5 shadow-inner"><FileMinus className="w-8 h-8 text-rose-600" /></div>
                            <h3 className="text-2xl font-black text-center text-slate-900 mb-2">Thanh lý hợp đồng</h3>
                            <div className="mb-8 mt-6">
                                <label className="block text-sm font-bold text-slate-700 mb-2">Lý do / Ghi chú thanh lý <span className="text-rose-500">*</span></label>
                                <textarea value={terminateNote} onChange={e => setTerminateNote(e.target.value)} rows={3} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-rose-100 focus:border-rose-500 outline-none transition-all resize-none font-medium text-slate-900 focus:bg-white" />
                            </div>
                            <div className="flex gap-4">
                                <button onClick={() => setShowTerminateModal(false)} className="flex-1 px-4 py-3.5 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors">Hủy bỏ</button>
                                <button onClick={handleTerminate} className="flex-1 px-4 py-3.5 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 shadow-md shadow-rose-200 transition-all hover:-translate-y-0.5">Xác nhận thanh lý</button>
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
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md border border-slate-100">
                            <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center"><Calendar className="w-6 h-6 mr-3 text-blue-600" /> Gia hạn hợp đồng</h3>
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Ngày kết thúc mới <span className="text-rose-500">*</span></label>
                                    <input type="date" value={renewEndDate} onChange={e => setRenewEndDate(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-bold text-slate-900 focus:bg-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Giá trị gia hạn (Tùy chọn)</label>
                                    <div className="relative group">
                                        <input type="number" value={renewPrice} onChange={e => setRenewPrice(e.target.value)} placeholder="Bỏ trống nếu không đổi" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-bold text-slate-900 focus:bg-white" />
                                        <span className="absolute right-4 top-3 text-slate-400 font-bold group-focus-within:text-blue-500">VNĐ</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8 flex gap-4">
                                <button onClick={() => setShowRenewModal(false)} className="flex-1 px-4 py-3.5 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors">Hủy bỏ</button>
                                <button onClick={handleRenew} className="flex-1 px-4 py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-md shadow-blue-200 transition-all hover:-translate-y-0.5">Xác nhận gia hạn</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
