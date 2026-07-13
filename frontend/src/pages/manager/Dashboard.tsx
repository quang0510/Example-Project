import React, { useEffect, useState } from 'react';
import { api } from '../../api/endpoints';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { DollarSign, Store, ClipboardList, AlertTriangle, TrendingUp, FileText, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
    const [summary, setSummary] = useState<any>(null);
    const [revenueData, setRevenueData] = useState<any[]>([]);
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [summaryRes, revenueRes, requestsRes] = await Promise.all([
                    api.dashboard.getSummary(),
                    api.dashboard.getRevenueChart(new Date().getFullYear()),
                    api.requests.getAll({ status: 'CHO_DUYET' })
                ]);
                setSummary(summaryRes.data);
                
                const formattedRevenue = revenueRes.data.map((item: any) => ({
                    name: `T${item.month}`,
                    revenue: item.revenue
                }));
                setRevenueData(formattedRevenue);
                setRequests(requestsRes.data.slice(0, 5));
            } catch (error) {
                console.error("Lỗi tải dashboard", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50/50">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
            </div>
        );
    }

    if (!summary) return <div className="p-6">Không có dữ liệu</div>;

    const stats = [
        { 
            title: 'Doanh thu tháng này', 
            value: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(summary.monthRevenue), 
            icon: <DollarSign className="w-6 h-6 text-white" />, 
            color: 'bg-indigo-500',
            bgLight: 'bg-indigo-50'
        },
        { 
            title: 'Tỷ lệ lấp đầy', 
            value: `${summary.occupancyRate}%`, 
            subValue: `${summary.rentedBooths}/${summary.totalBooths} gian hàng`,
            icon: <Store className="w-6 h-6 text-white" />, 
            color: 'bg-emerald-500',
            bgLight: 'bg-emerald-50'
        },
        { 
            title: 'Yêu cầu chờ duyệt', 
            value: summary.pendingRequests, 
            icon: <ClipboardList className="w-6 h-6 text-white" />, 
            color: 'bg-amber-500',
            bgLight: 'bg-amber-50'
        },
        { 
            title: 'Tổng nợ quá hạn', 
            value: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(summary.totalDebt), 
            subValue: `${summary.overduePayments} khoản thanh toán`,
            icon: <AlertTriangle className="w-6 h-6 text-white" />, 
            color: 'bg-rose-500',
            bgLight: 'bg-rose-50'
        },
    ];

    const pieData = [
        { name: 'Đang thuê', value: summary.rentedBooths },
        { name: 'Trống', value: summary.totalBooths - summary.rentedBooths },
    ];
    const PIE_COLORS = ['#10b981', '#cbd5e1'];

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 bg-slate-50 min-h-screen font-sans">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Tổng quan hệ thống</h1>
                    <p className="text-sm text-slate-500 mt-1">Theo dõi hoạt động kinh doanh và trạng thái gian hàng.</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm text-sm font-medium text-slate-600 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    Cập nhật: {new Date().toLocaleDateString('vi-VN')}
                </div>
            </div>

            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((item, index) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        key={item.title} 
                        className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-slate-500 mb-1">{item.title}</p>
                                <h3 className="text-2xl font-bold text-slate-900">{item.value}</h3>
                            </div>
                            <div className={`p-3 rounded-xl shadow-inner ${item.color}`}>
                                {item.icon}
                            </div>
                        </div>
                        {item.subValue && (
                            <div className="mt-4 flex items-center text-sm">
                                <span className="text-slate-500">{item.subValue}</span>
                            </div>
                        )}
                        {!item.subValue && (
                            <div className="mt-4 flex items-center text-sm text-emerald-600 font-medium">
                                <TrendingUp className="w-4 h-4 mr-1" />
                                <span>Tăng trưởng tốt</span>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-2 flex flex-col"
                >
                    <div className="mb-6 flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Biểu đồ doanh thu</h2>
                            <p className="text-sm text-slate-500">Doanh thu theo tháng trong năm nay</p>
                        </div>
                        <select className="text-sm border-slate-200 rounded-lg text-slate-600 focus:ring-indigo-500 focus:border-indigo-500">
                            <option>Năm {new Date().getFullYear()}</option>
                        </select>
                    </div>
                    <div className="flex-1 min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
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
                                    formatter={(value: number) => [new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value), 'Doanh thu']}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
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
                                <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600">
                                    <AlertTriangle className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-900">Thanh toán quá hạn</p>
                                    <p className="text-xs text-slate-500">Cần nhắc nhở</p>
                                </div>
                            </div>
                            <span className="text-lg font-bold text-slate-900">{summary.overduePayments}</span>
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
