import React, { useEffect, useState } from 'react';
import { api } from '../../api/endpoints';
import { BoothFormModal } from '../../components/BoothFormModal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import toast from 'react-hot-toast';
import { Search, Filter, Edit, Trash2, ShieldAlert, Power } from 'lucide-react';

export const Booths = () => {
    const [booths, setBooths] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState({ search: '', status: 'ALL' });
    
    // Modals state
    const [showFormModal, setShowFormModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [currentBooth, setCurrentBooth] = useState<any>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    useEffect(() => {
        fetchBooths();
    }, [filter]);

    const fetchBooths = async () => {
        setLoading(true);
        try {
            const res = await api.booths.getAll({ ...filter, status: filter.status === 'ALL' ? undefined : filter.status });
            setBooths(res.data);
        } catch (error) {
            console.error(error);
            toast.error('Lỗi khi tải danh sách gian hàng');
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = async () => {
        if (!selectedId) return;
        try {
            await api.booths.delete(selectedId);
            toast.success('Đã xóa gian hàng thành công!');
            setShowDeleteModal(false);
            fetchBooths();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Không thể xóa gian hàng');
        }
    };

    const handleDeleteClick = (id: string) => {
        setSelectedId(id);
        setShowDeleteModal(true);
    };

    const handleChangeStatus = async (id: string, newStatus: string) => {
        try {
            await api.booths.changeStatus(id, newStatus);
            toast.success('Đã cập nhật trạng thái gian hàng');
            fetchBooths();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Lỗi khi cập nhật trạng thái');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'TRONG': return 'bg-green-100 text-green-800 border-green-200';
            case 'DANG_THUE': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'DA_DAT': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'BAO_TRI': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    return (
        <div className="p-2 sm:p-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Quản lý Gian hàng</h1>
                    <p className="text-sm text-gray-500 mt-1">Quản lý danh sách, trạng thái và thông tin chi tiết các gian hàng trong hệ thống.</p>
                </div>
                
                <button 
                    onClick={() => { setCurrentBooth(null); setShowFormModal(true); }}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                >
                    + Thêm Gian hàng
                </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-6 bg-white p-3 rounded-2xl border border-gray-200 shadow-sm">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm gian hàng..." 
                        className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                        value={filter.search} 
                        onChange={e => setFilter({...filter, search: e.target.value})} 
                    />
                </div>
                <div className="relative min-w-[200px]">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Filter className="h-5 w-5 text-gray-400" />
                    </div>
                    <select 
                        className="block w-full pl-10 pr-10 py-2 border border-gray-200 rounded-xl leading-5 bg-gray-50 focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors appearance-none cursor-pointer" 
                        value={filter.status} 
                        onChange={e => setFilter({...filter, status: e.target.value})}
                    >
                        <option value="ALL">Tất cả trạng thái</option>
                        <option value="TRONG">Còn trống</option>
                        <option value="DA_DAT">Đã đặt cọc</option>
                        <option value="DANG_THUE">Đang cho thuê</option>
                        <option value="BAO_TRI">Đang bảo trì</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Mã / Tên</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Khu vực / Diện tích</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Giá thuê (tháng)</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {booths.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        Không tìm thấy gian hàng nào.
                                    </td>
                                </tr>
                            ) : booths.map((b: any) => (
                                <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold mr-3 border border-indigo-100">
                                                {b.boothCode.substring(0, 2)}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-gray-900">{b.boothCode}</div>
                                                <div className="text-xs font-medium text-gray-500">{b.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">Khu {b.zone}</div>
                                        <div className="text-xs text-gray-500 mt-0.5">{b.area} m²</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900 font-bold">
                                            {formatCurrency(b.price)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <select 
                                            className={`px-2.5 py-1 text-xs font-semibold rounded-full border cursor-pointer appearance-none outline-none focus:ring-2 focus:ring-indigo-500 ${getStatusColor(b.status)}`}
                                            value={b.status}
                                            onChange={(e) => handleChangeStatus(b.id, e.target.value)}
                                            disabled={b.status === 'DANG_THUE' || b.status === 'DA_DAT'}
                                        >
                                            <option value="TRONG">Trống</option>
                                            <option value="BAO_TRI">Bảo trì</option>
                                            <option value="DANG_THUE" disabled>Đang thuê</option>
                                            <option value="DA_DAT" disabled>Đã đặt</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button 
                                            onClick={() => { setCurrentBooth({...b}); setShowFormModal(true); }} 
                                            className="inline-flex items-center px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                        >
                                            <Edit className="w-3.5 h-3.5 mr-1" /> Sửa
                                        </button>
                                        
                                        <button 
                                            onClick={() => handleChangeStatus(b.id, b.status === 'BAO_TRI' ? 'TRONG' : 'BAO_TRI')} 
                                            className={`inline-flex items-center px-2.5 py-1.5 border rounded-lg text-xs font-medium transition-colors ${
                                                b.status === 'BAO_TRI' 
                                                ? 'border-green-200 text-green-700 bg-green-50 hover:bg-green-100' 
                                                : 'border-yellow-200 text-yellow-700 bg-yellow-50 hover:bg-yellow-100'
                                            }`}
                                            disabled={b.status === 'DANG_THUE' || b.status === 'DA_DAT'}
                                        >
                                            {b.status === 'BAO_TRI' ? <><Power className="w-3.5 h-3.5 mr-1" /> Mở lại</> : <><ShieldAlert className="w-3.5 h-3.5 mr-1" /> Bảo trì</>}
                                        </button>

                                        <button 
                                            onClick={() => handleDeleteClick(b.id)} 
                                            className="inline-flex items-center px-2.5 py-1.5 border border-red-200 rounded-lg text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={b.status !== 'TRONG' && b.status !== 'BAO_TRI'}
                                        >
                                            <Trash2 className="w-3.5 h-3.5 mr-1" /> Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <BoothFormModal 
                isOpen={showFormModal} 
                onClose={() => setShowFormModal(false)} 
                booth={currentBooth} 
                onSuccess={() => fetchBooths()} 
            />

            <ConfirmModal 
                isOpen={showDeleteModal}
                title="Xóa gian hàng"
                message="Bạn có chắc chắn muốn xóa gian hàng này? Hành động này không thể hoàn tác."
                onConfirm={confirmDelete}
                onCancel={() => setShowDeleteModal(false)}
                type="danger"
                confirmText="Xóa gian hàng"
            />
        </div>
    );
};
