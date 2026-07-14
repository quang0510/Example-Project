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
                    <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
                        <Activity className="w-6 h-6 text-indigo-600" />
                        Nhật ký thao tác
                    </h1>
                    <p className="text-slate-500 font-medium text-sm mt-1">Giám sát các thay đổi quan trọng trên hệ thống</p>
                </div>
                <button onClick={fetchLogs} className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-colors text-sm font-bold text-slate-700">
                    Làm mới
                </button>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mb-6">
                <div className="p-5 border-b border-slate-100 flex gap-4 bg-slate-50/50">
                    <div className="relative flex-1 max-w-md group">
                        <Search className="w-4 h-4 absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm theo chi tiết, bảng, người thực hiện..." 
                            className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 font-medium text-slate-900 transition-all outline-none focus:bg-white"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="relative group">
                        <Filter className="w-4 h-4 absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <select 
                            className="pl-11 pr-10 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 font-bold text-slate-700 appearance-none bg-white transition-all outline-none"
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
                    <table className="min-w-full text-left text-sm divide-y divide-slate-200">
                        <thead className="bg-gradient-to-r from-slate-50 to-slate-100/50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Thời gian</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Hành động</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Đối tượng (Bảng)</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Chi tiết</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Người thực hiện</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">Đang tải dữ liệu...</td></tr>
                            ) : filteredLogs.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">Không có nhật ký nào phù hợp.</td></tr>
                            ) : (
                                filteredLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-medium">{formatDate(log.createdAt)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{getActionBadge(log.action)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-1.5 rounded-md border border-slate-200">
                                                {log.entityName}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-800 font-medium">{log.details}</td>
                                        <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-900">{log.performedBy}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-5 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <span className="text-sm text-slate-600 font-medium">Trang <span className="font-bold text-slate-900">{page + 1}</span> / {totalPages}</span>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setPage(p => Math.max(0, p - 1))} 
                                disabled={page === 0}
                                className="px-4 py-2 border border-slate-200 rounded-xl bg-white disabled:opacity-50 hover:bg-slate-50 hover:border-slate-300 font-bold text-slate-700 transition-colors shadow-sm"
                            >
                                Trước
                            </button>
                            <button 
                                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} 
                                disabled={page >= totalPages - 1}
                                className="px-4 py-2 border border-slate-200 rounded-xl bg-white disabled:opacity-50 hover:bg-slate-50 hover:border-slate-300 font-bold text-slate-700 transition-colors shadow-sm"
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
