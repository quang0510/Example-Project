import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map as MapIcon, Coffee, ShoppingBag, Utensils, Sparkles, Gem, Shirt, Navigation, Info, ShieldCheck, Ticket } from 'lucide-react';

export const MallMap = () => {
    const [activeFloor, setActiveFloor] = useState('1');
    const [selectedZone, setSelectedZone] = useState<any>(null);

    const floors = [
        { id: '1', name: 'Tầng 1', shortDesc: 'Sảnh chính & Mỹ phẩm', icon: <Sparkles className="w-5 h-5" /> },
        { id: '2', name: 'Tầng 2', shortDesc: 'Thời trang & Phụ kiện', icon: <Shirt className="w-5 h-5" /> },
        { id: '3', name: 'Tầng 3', shortDesc: 'Ẩm thực & Giải trí', icon: <Utensils className="w-5 h-5" /> },
    ];

    const mapData: Record<string, any[]> = {
        '1': [
            { id: 'A', name: 'Khu A - Sảnh Chính', type: 'Cao Cấp', status: 'Sắp hết', price: 'Từ 12tr/tháng', color: 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700', icon: <Gem className="w-8 h-8 opacity-70" />, desc: 'Vị trí đắc địa nhất, tiếp cận 100% khách hàng khi bước vào TTTM.', span: 'col-span-4 lg:col-span-8 row-span-2' },
            { id: 'B1', name: 'Khu B1 - Mỹ Phẩm', type: 'Tiêu Chuẩn', status: 'Còn trống', price: 'Từ 6.5tr/tháng', color: 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700', icon: <Sparkles className="w-8 h-8 opacity-70" />, desc: 'Khu vực chuyên về mỹ phẩm và chăm sóc sắc đẹp.', span: 'col-span-2 lg:col-span-4 row-span-2' },
            { id: 'C1', name: 'Khu C1 - Kiosk Nhỏ', type: 'Tiết Kiệm', status: 'Còn trống', price: 'Từ 3tr/tháng', color: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700', icon: <ShoppingBag className="w-8 h-8 opacity-70" />, desc: 'Phù hợp cho các quầy phụ kiện nhỏ, hoa tươi, quà lưu niệm.', span: 'col-span-2 lg:col-span-4 row-span-1' },
            { id: 'C2', name: 'Khu C2 - Sự Kiện', type: 'Sự Kiện', status: 'Linh hoạt', price: 'Liên hệ', color: 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-700', icon: <Ticket className="w-8 h-8 opacity-70" />, desc: 'Khu vực tổ chức sự kiện pop-up, hội chợ cuối tuần.', span: 'col-span-2 lg:col-span-4 row-span-1' },
        ],
        '2': [
            { id: 'B2', name: 'Khu B2 - Thời Trang Nữ', type: 'Tiêu Chuẩn', status: 'Còn trống', price: 'Từ 6tr/tháng', color: 'bg-pink-50 hover:bg-pink-100 border-pink-200 text-pink-700', icon: <Shirt className="w-8 h-8 opacity-70" />, desc: 'Khu vực tập trung các thương hiệu thời trang nữ và phụ kiện.', span: 'col-span-4 lg:col-span-6 row-span-3' },
            { id: 'B3', name: 'Khu B3 - Thời Trang Nam', type: 'Tiêu Chuẩn', status: 'Còn ít', price: 'Từ 6tr/tháng', color: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-700', icon: <Shirt className="w-8 h-8 opacity-70" />, desc: 'Khu vực thời trang nam, đồ thể thao và giày dép.', span: 'col-span-4 lg:col-span-6 row-span-3' },
            { id: 'C3', name: 'Khu C3 - Kiosk Đồ Da', type: 'Tiết Kiệm', status: 'Còn trống', price: 'Từ 2.5tr/tháng', color: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700', icon: <ShoppingBag className="w-8 h-8 opacity-70" />, desc: 'Ki-ốt nhỏ cho túi xách, ví da, thắt lưng.', span: 'col-span-4 lg:col-span-12 row-span-1' },
        ],
        '3': [
            { id: 'A3', name: 'Khu Rạp Chiếu Phim', type: 'Giải Trí', status: 'Đã thuê', price: '-', color: 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed', icon: <Ticket className="w-8 h-8 opacity-40" />, desc: 'Cụm rạp chiếu phim (Đã có đối tác dài hạn).', span: 'col-span-4 lg:col-span-8 row-span-2' },
            { id: 'B4', name: 'Khu B4 - Ẩm Thực', type: 'Tiêu Chuẩn', status: 'Còn trống', price: 'Từ 8tr/tháng', color: 'bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-700', icon: <Utensils className="w-8 h-8 opacity-70" />, desc: 'Khu vực nhà hàng gia đình, lẩu nướng.', span: 'col-span-2 lg:col-span-4 row-span-4' },
            { id: 'C4', name: 'Khu C4 - Cafe & Trà Sữa', type: 'Tiết Kiệm', status: 'Đang hot', price: 'Từ 4tr/tháng', color: 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200 text-yellow-700', icon: <Coffee className="w-8 h-8 opacity-70" />, desc: 'Các quầy đồ uống, thức ăn nhanh.', span: 'col-span-4 lg:col-span-8 row-span-2' },
        ]
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-2xl mb-4"
                    >
                        <MapIcon className="w-8 h-8 text-blue-600" />
                    </motion.div>
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
                    >
                        Sơ đồ Trung tâm Thương mại
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-gray-500 max-w-2xl mx-auto"
                    >
                        Bản đồ tương tác giúp bạn dễ dàng hình dung và lựa chọn vị trí kinh doanh tối ưu nhất. Nhấp vào từng phân khu để xem chi tiết.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Sidebar / Controls */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Navigation className="w-5 h-5 text-indigo-500" />
                                Chọn Tầng
                            </h3>
                            <div className="space-y-3">
                                {floors.map((floor) => (
                                    <button
                                        key={floor.id}
                                        onClick={() => {
                                            setActiveFloor(floor.id);
                                            setSelectedZone(null);
                                        }}
                                        className={`w-full text-left p-4 rounded-2xl flex items-center gap-4 transition-all ${
                                            activeFloor === floor.id 
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 transform scale-[1.02]' 
                                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                                        }`}
                                    >
                                        <div className={`p-2 rounded-xl ${activeFloor === floor.id ? 'bg-white/20' : 'bg-white shadow-sm'}`}>
                                            {floor.icon}
                                        </div>
                                        <div>
                                            <div className={`font-bold ${activeFloor === floor.id ? 'text-white' : 'text-slate-900'}`}>{floor.name}</div>
                                            <div className={`text-sm ${activeFloor === floor.id ? 'text-indigo-100' : 'text-slate-500'}`}>{floor.shortDesc}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Zone Details */}
                        <AnimatePresence mode="wait">
                            {selectedZone ? (
                                <motion.div
                                    key={selectedZone.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                                        {selectedZone.icon}
                                    </div>
                                    <div className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 bg-slate-100 text-slate-600">
                                        {selectedZone.type}
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-2">{selectedZone.name}</h3>
                                    <p className="text-slate-600 mb-6">{selectedZone.desc}</p>
                                    
                                    <div className="space-y-4 mb-8">
                                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                            <span className="text-slate-500">Mức giá tham khảo</span>
                                            <span className="font-bold text-slate-900">{selectedZone.price}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                            <span className="text-slate-500">Tình trạng</span>
                                            <span className="font-bold text-indigo-600 flex items-center gap-1">
                                                <ShieldCheck className="w-4 h-4" /> {selectedZone.status}
                                            </span>
                                        </div>
                                    </div>

                                    {selectedZone.status !== 'Đã thuê' && (
                                        <button className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors shadow-sm shadow-indigo-200">
                                            Đăng ký thuê ngay
                                        </button>
                                    )}
                                </motion.div>
                            ) : (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="bg-slate-100 rounded-3xl p-8 border border-slate-200 border-dashed text-center flex flex-col items-center justify-center min-h-[300px]"
                                >
                                    <Info className="w-10 h-10 text-slate-400 mb-4" />
                                    <p className="text-slate-500 font-medium">Nhấp vào một phân khu trên sơ đồ để xem thông tin chi tiết.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Map Area */}
                    <div className="lg:col-span-8">
                        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 min-h-[600px] flex flex-col">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                                    <MapIcon className="w-6 h-6 text-indigo-500" />
                                    Sơ đồ {floors.find(f => f.id === activeFloor)?.name}
                                </h2>
                                <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
                                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-purple-400"></span> Cao cấp</div>
                                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-400"></span> Tiêu chuẩn</div>
                                </div>
                            </div>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeFloor}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.3 }}
                                    className="flex-1 grid grid-cols-4 lg:grid-cols-12 auto-rows-[120px] gap-4"
                                >
                                    {mapData[activeFloor].map((zone) => (
                                        <button
                                            key={zone.id}
                                            onClick={() => setSelectedZone(zone)}
                                            className={`relative overflow-hidden rounded-2xl border-2 p-6 flex flex-col items-center justify-center text-center transition-all ${zone.color} ${zone.span} ${selectedZone?.id === zone.id ? 'ring-4 ring-indigo-500/30 scale-[0.98]' : ''}`}
                                        >
                                            <div className="mb-3 transform transition-transform group-hover:scale-110">
                                                {zone.icon}
                                            </div>
                                            <h4 className="font-bold text-lg mb-1">{zone.name}</h4>
                                            <span className="text-sm font-medium opacity-80">{zone.type}</span>
                                            
                                            {/* Status Badge */}
                                            {zone.status === 'Sắp hết' && (
                                                <span className="absolute top-3 right-3 flex h-3 w-3">
                                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
