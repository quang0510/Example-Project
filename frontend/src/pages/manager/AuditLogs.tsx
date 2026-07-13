import React, { useEffect, useState } from 'react';
import { api } from '../../api/endpoints';
import { Activity, Search, Filter } from 'lucide-react';

export const AuditLogs = () => {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    
    // Filters
    const [actionFilter, setActionFilter] = useState('ALL');
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchLogs();
    }, [page]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await api.auditLogs.getAll(page, 20);
            setLogs(res.data.content);
            setTotalPages(res.data.totalPages);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('vi-VN');
    };

    const getActionBadge = (action: string) => {
        switch (action) {
            case 'CREATE': return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">THÊM MỚI</span>;
            case 'UPDATE': return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">CẬP NHẬT</span>;
            case 'DELETE': return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">XÓA</span>;
            default: return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">{action}</span>;
        }
    };

    const filteredLogs = logs.filter(log => {
        const matchAction = actionFilter === 'ALL' || log.action === actionFilter;
        const matchSearch = search === '' || 
                            log.entityName.toLowerCase().includes(search.toLowerCase()) || 
                            log.performedBy.toLowerCase().includes(search.toLowerCase()) ||
                            log.details.toLowerCase().includes(search.toLowerCase());
        return matchAction && matchSearch;
    });

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Activity className="w-6 h-6 text-indigo-600" />
                        Nhật ký thao tác
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Giám sát các thay đổi quan trọng trên hệ thống</p>
                </div>
                <button onClick={fetchLogs} className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 text-sm font-medium">
                    Làm mới
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                <div className="p-4 border-b border-gray-100 flex gap-4 bg-gray-50/50">
                    <div className="relative flex-1 max-w-md">
                        <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm theo chi tiết, bảng, người thực hiện..." 
                            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <Filter className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                        <select 
                            className="pl-9 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
                            value={actionFilter}
                            onChange={(e) => setActionFilter(e.target.value)}
                        >
                            <option value="ALL">Tất cả hành động</option>
                            <option value="CREATE">Thêm mới (CREATE)</option>
                            <option value="UPDATE">Cập nhật (UPDATE)</option>
                            <option value="DELETE">Xóa (DELETE)</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4">Thời gian</th>
                                <th className="px-6 py-4">Hành động</th>
                                <th className="px-6 py-4">Đối tượng (Bảng)</th>
                                <th className="px-6 py-4">Chi tiết</th>
                                <th className="px-6 py-4">Người thực hiện</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Đang tải dữ liệu...</td></tr>
                            ) : filteredLogs.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Không có nhật ký nào phù hợp.</td></tr>
                            ) : (
                                filteredLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">{formatDate(log.createdAt)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{getActionBadge(log.action)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                                {log.entityName}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-900">{log.details}</td>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{log.performedBy}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
                        <span className="text-sm text-gray-600">Trang {page + 1} / {totalPages}</span>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setPage(p => Math.max(0, p - 1))} 
                                disabled={page === 0}
                                className="px-3 py-1 border border-gray-300 rounded bg-white disabled:opacity-50 hover:bg-gray-50 text-sm"
                            >
                                Trước
                            </button>
                            <button 
                                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} 
                                disabled={page >= totalPages - 1}
                                className="px-3 py-1 border border-gray-300 rounded bg-white disabled:opacity-50 hover:bg-gray-50 text-sm"
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
