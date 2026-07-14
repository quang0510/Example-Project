import React, { useEffect, useState } from 'react';
import { api } from '../../api/endpoints';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar } from 'recharts';
import { DollarSign, Store, ClipboardList, AlertTriangle, TrendingUp, FileText, Clock, Download, CalendarClock, ChevronDown, FileSpreadsheet, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export const Dashboard = () => {
    const [summary, setSummary] = useState<any>(null);
    const [revenueData, setRevenueData] = useState<any[]>([]);
    const [comparisonData, setComparisonData] = useState<any[]>([]);
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [chartMode, setChartMode] = useState<'single' | 'compare'>('compare');
    const [exportLoading, setExportLoading] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);

    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [summaryRes, comparisonRes, requestsRes] = await Promise.all([
                    api.dashboard.getSummary(),
                    api.dashboard.getRevenueComparison(selectedYear),
                    api.requests.getAll({ status: 'CHO_DUYET' })
                ]);
                setSummary(summaryRes.data);

                // Format comparison data for overlaid chart
                const current = comparisonRes.data.currentData || [];
                const previous = comparisonRes.data.previousData || [];
                const merged = current.map((item: any, idx: number) => ({
                    name: `T${item.month}`,
                    currentRevenue: item.revenue,
                    previousRevenue: previous[idx]?.revenue || 0,
                }));
                setComparisonData(merged);
                setRevenueData(current.map((item: any) => ({
                    name: `T${item.month}`,
                    revenue: item.revenue
                })));

                setRequests(requestsRes.data.slice(0, 5));
            } catch (error) {
                console.error("Lỗi tải dashboard", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, [selectedYear]);

    const handleExportExcel = async (month?: number) => {
        setExportLoading(true);
        setShowExportMenu(false);
        try {
            const res = await api.reports.exportFinancial(selectedYear, month);
            const blob = new Blob([res.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = month
                ? `BaoCaoTaiChinh_${month}_${selectedYear}.xlsx`
                : `BaoCaoTaiChinh_${selectedYear}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success('Xuất báo cáo thành công!');
        } catch (error) {
            console.error("Lỗi xuất báo cáo", error);
            toast.error('Lỗi khi xuất báo cáo');
        } finally {
            setExportLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50/50">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
                    <p className="text-sm text-slate-500 animate-pulse">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    if (!summary) return <div className="p-6">Không có dữ liệu</div>;

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

    const stats = [
        {
            title: 'Doanh thu tháng này',
            value: formatCurrency(summary.monthRevenue),
            icon: <DollarSign className="w-5 h-5" />,
            gradient: 'from-indigo-500 to-blue-600',
            bgLight: 'bg-indigo-50',
            iconColor: 'text-indigo-600',
        },
        {
            title: 'Tổng doanh thu',
            value: formatCurrency(summary.totalRevenue),
            icon: <Wallet className="w-5 h-5" />,
            gradient: 'from-violet-500 to-purple-600',
            bgLight: 'bg-violet-50',
            iconColor: 'text-violet-600',
        },
        {
            title: 'Tỷ lệ lấp đầy',
            value: `${summary.occupancyRate}%`,
            subValue: `${summary.rentedBooths}/${summary.totalBooths} gian hàng`,
            icon: <Store className="w-5 h-5" />,
            gradient: 'from-emerald-500 to-teal-600',
            bgLight: 'bg-emerald-50',
            iconColor: 'text-emerald-600',
        },
        {
            title: 'Yêu cầu chờ duyệt',
            value: summary.pendingRequests,
            icon: <ClipboardList className="w-5 h-5" />,
            gradient: 'from-amber-500 to-orange-600',
            bgLight: 'bg-amber-50',
            iconColor: 'text-amber-600',
        },
        {
            title: 'Tổng nợ quá hạn',
            value: formatCurrency(summary.totalDebt),
            subValue: `${summary.overduePayments} khoản thanh toán`,
            icon: <AlertTriangle className="w-5 h-5" />,
            gradient: 'from-rose-500 to-red-600',
            bgLight: 'bg-rose-50',
            iconColor: 'text-rose-600',
            alert: summary.overduePayments > 0,
        },
        {
            title: 'HĐ sắp hết hạn',
            value: summary.expiringContracts,
            subValue: 'Trong 30 ngày tới',
            icon: <CalendarClock className="w-5 h-5" />,
            gradient: 'from-sky-500 to-cyan-600',
            bgLight: 'bg-sky-50',
            iconColor: 'text-sky-600',
        },
    ];

    const pieData = [
        { name: 'Đang thuê', value: summary.rentedBooths },
        { name: 'Trống', value: summary.totalBooths - summary.rentedBooths },
    ];
    const PIE_COLORS = ['#10b981', '#e2e8f0'];

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 bg-slate-50 min-h-screen font-sans">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Tổng quan hệ thống</h1>
                    <p className="text-sm text-slate-500 mt-1">Theo dõi hoạt động kinh doanh và trạng thái gian hàng.</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Year Selector */}
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm text-sm font-medium text-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none cursor-pointer"
                    >
                        {yearOptions.map(y => (
                            <option key={y} value={y}>Năm {y}</option>
                        ))}
                    </select>

                    {/* Export Button */}
                    <div className="relative">
                        <button
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            disabled={exportLoading}
                            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-all shadow-sm shadow-emerald-200 disabled:opacity-50 cursor-pointer"
                        >
                            {exportLoading ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            ) : (
                                <FileSpreadsheet className="w-4 h-4" />
                            )}
                            Xuất báo cáo
                            <ChevronDown className="w-3 h-3" />
                        </button>
                        <AnimatePresence>
                            {showExportMenu && (
                                <motion.div
                                    initial={{ opacity: 0, y: -5, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -5, scale: 0.95 }}
                                    className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50"
                                >
                                    <button
                                        onClick={() => handleExportExcel()}
                                        className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                                    >
                                        <Download className="w-4 h-4 text-slate-400" />
                                        Cả năm {selectedYear}
                                    </button>
                                    <div className="border-t border-slate-100 my-1" />
                                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                        <button
                                            key={m}
                                            onClick={() => handleExportExcel(m)}
                                            className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 cursor-pointer"
                                        >
                                            Tháng {m}/{selectedYear}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Date */}
                    <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm text-sm font-medium text-slate-600 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        {new Date().toLocaleDateString('vi-VN')}
                    </div>
                </div>
            </div>

            {/* Close export menu when clicking outside */}
            {showExportMenu && (
                <div className="fixed inset-0 z-40" onClick={() => setShowExportMenu(false)} />
            )}

            {/* Top Stats Cards — 3x2 Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {stats.map((item, index) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.07 }}
                        key={item.title}
                        className={`bg-white rounded-2xl p-5 shadow-sm border hover:shadow-md transition-all duration-300 group ${
                            item.alert ? 'border-rose-200 hover:border-rose-300' : 'border-slate-100'
                        }`}
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-slate-500 mb-1">{item.title}</p>
                                <h3 className="text-2xl font-bold text-slate-900">{item.value}</h3>
                            </div>
                            <div className={`p-3 rounded-xl bg-gradient-to-br ${item.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                <div className="text-white">{item.icon}</div>
                            </div>
                        </div>
                        {item.subValue && (
                            <div className="mt-3 flex items-center text-sm">
                                <span className="text-slate-500">{item.subValue}</span>
                            </div>
                        )}
                        {!item.subValue && (
                            <div className="mt-3 flex items-center text-sm text-emerald-600 font-medium">
                                <TrendingUp className="w-4 h-4 mr-1" />
                                <span>Cập nhật liên tục</span>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart with Comparison */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-2 flex flex-col"
                >
                    <div className="mb-6 flex justify-between items-center flex-wrap gap-3">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Biểu đồ doanh thu</h2>
                            <p className="text-sm text-slate-500">
                                {chartMode === 'compare'
                                    ? `So sánh năm ${selectedYear} và ${selectedYear - 1}`
                                    : `Doanh thu năm ${selectedYear}`
                                }
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex bg-slate-100 rounded-lg p-0.5">
                                <button
                                    onClick={() => setChartMode('single')}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                                        chartMode === 'single'
                                            ? 'bg-white text-slate-900 shadow-sm'
                                            : 'text-slate-500 hover:text-slate-700'
                                    }`}
                                >
                                    Đơn
                                </button>
                                <button
                                    onClick={() => setChartMode('compare')}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                                        chartMode === 'compare'
                                            ? 'bg-white text-slate-900 shadow-sm'
                                            : 'text-slate-500 hover:text-slate-700'
                                    }`}
                                >
                                    So sánh
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            {chartMode === 'compare' ? (
                                <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(value) => `${value / 1000000}M`} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        formatter={(value: any, name: any) => [
                                            formatCurrency(value),
                                            name === 'currentRevenue' ? `Năm ${selectedYear}` : `Năm ${selectedYear - 1}`
                                        ]}
                                    />
                                    <Legend
                                        formatter={(value: string) =>
                                            value === 'currentRevenue' ? `Năm ${selectedYear}` : `Năm ${selectedYear - 1}`
                                        }
                                    />
                                    <Bar dataKey="currentRevenue" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={20} />
                                    <Bar dataKey="previousRevenue" fill="#c7d2fe" radius={[6, 6, 0, 0]} barSize={20} />
                                </BarChart>
                            ) : (
                                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(value) => `${value / 1000000}M`} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        formatter={(value: any) => [formatCurrency(value), 'Doanh thu']}
                                    />
                                    <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                </AreaChart>
                            )}
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Occupancy Pie Chart */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col"
                >
                    <div className="mb-2">
                        <h2 className="text-lg font-bold text-slate-900">Trạng thái gian hàng</h2>
                        <p className="text-sm text-slate-500">Tỷ lệ lấp đầy hiện tại</p>
                    </div>
                    <div className="flex-1 min-h-[250px] flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100">
                        <div className="text-center">
                            <p className="text-xs text-slate-500 mb-1">Đang thuê</p>
                            <p className="text-lg font-bold text-emerald-600">{summary.rentedBooths}</p>
                        </div>
                        <div className="text-center border-l border-slate-100">
                            <p className="text-xs text-slate-500 mb-1">Còn trống</p>
                            <p className="text-lg font-bold text-slate-600">{summary.totalBooths - summary.rentedBooths}</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* System Stats Summary */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
                >
                    <h2 className="text-lg font-bold text-slate-900 mb-6">Chỉ số hệ thống</h2>
                    <div className="space-y-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-900">Hợp đồng hiệu lực</p>
                                    <p className="text-xs text-slate-500">Đang trong thời hạn</p>
                                </div>
                            </div>
                            <span className="text-lg font-bold text-slate-900">{summary.activeContracts}</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center text-sky-600">
                                    <CalendarClock className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-900">HĐ sắp hết hạn</p>
                                    <p className="text-xs text-slate-500">Trong 30 ngày tới</p>
                                </div>
                            </div>
                            <span className={`text-lg font-bold ${summary.expiringContracts > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
                                {summary.expiringContracts}
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600">
                                    <AlertTriangle className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-900">Thanh toán quá hạn</p>
                                    <p className="text-xs text-slate-500">Cần nhắc nhở</p>
                                </div>
                            </div>
                            <span className={`text-lg font-bold ${summary.overduePayments > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                                {summary.overduePayments}
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                                    <ClipboardList className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-900">Yêu cầu chờ duyệt</p>
                                    <p className="text-xs text-slate-500">Chưa xử lý</p>
                                </div>
                            </div>
                            <span className="text-lg font-bold text-slate-900">{summary.pendingRequests}</span>
                        </div>
                    </div>
                </motion.div>

                {/* Recent Requests Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white rounded-2xl shadow-sm border border-slate-100 lg:col-span-2 overflow-hidden flex flex-col"
                >
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Yêu cầu thuê mới nhất</h2>
                            <p className="text-sm text-slate-500">Danh sách chờ duyệt</p>
                        </div>
                        <Link to="/manager/requests" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                            Xem tất cả &rarr;
                        </Link>
                    </div>
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-slate-50 text-slate-600">
                                <tr>
                                    <th className="px-6 py-3 font-semibold">Khách hàng</th>
                                    <th className="px-6 py-3 font-semibold">Gian hàng</th>
                                    <th className="px-6 py-3 font-semibold">Ngày tạo</th>
                                    <th className="px-6 py-3 font-semibold">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {requests.length > 0 ? requests.map((req) => (
                                    <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-slate-900">{req.customerFullName}</p>
                                            <p className="text-slate-500 text-xs">{req.customerPhone}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md font-medium bg-slate-100 text-slate-800">
                                                {req.boothCode}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {req.createdAt ? new Date(req.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                                Chờ duyệt
                                            </span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                                            Không có yêu cầu nào đang chờ duyệt.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
