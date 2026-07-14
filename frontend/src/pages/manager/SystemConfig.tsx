import React, { useEffect, useState } from 'react';
import { api } from '../../api/endpoints';
import { Settings, Percent, Clock, Hash, Save, AlertCircle } from 'lucide-react';

export const SystemConfig = () => {
    const [configs, setConfigs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadConfigs();
    }, []);

    const loadConfigs = async () => {
        setLoading(true);
        try {
            const res = await api.configs.getAll();
            setConfigs(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (key: string, value: string, desc: string, setSaving: (s: boolean) => void) => {
        setSaving(true);
        try {
            await api.configs.update(key, { value, description: desc });
            // Show toast or temporary success message if needed
        } catch (error) {
            console.error('Lỗi cập nhật', error);
            alert('Lỗi khi lưu cấu hình');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-lg shadow-indigo-200">
                <h1 className="text-3xl font-black flex items-center gap-3 tracking-tight">
                    <Settings className="w-8 h-8 text-indigo-200" />
                    Cấu hình tham số hệ thống
                </h1>
                <p className="text-indigo-100 mt-2 font-medium">Quản lý các tham số hoạt động cốt lõi của toàn hệ thống. Hãy cẩn trọng khi thay đổi.</p>
            </div>

            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-12 text-gray-500">Đang tải cấu hình...</div>
                ) : (
                    configs.map((c: any) => (
                        <ConfigCard key={c.key} config={c} onSave={handleUpdate} />
                    ))
                )}
            </div>
        </div>
    );
};

const ConfigCard = ({ config, onSave }: { config: any, onSave: any }) => {
    const [val, setVal] = useState(config.value);
    const [saving, setSaving] = useState(false);
    
    // Pick an appropriate icon based on the config key
    let Icon = AlertCircle;
    let iconBg = "bg-gray-100";
    let iconColor = "text-gray-600";
    let title = config.key;

    if (config.key === 'PENALTY_RATE_PERCENT') {
        Icon = Percent;
        iconBg = "bg-red-100";
        iconColor = "text-red-600";
        title = "Tỷ lệ phạt trả chậm";
    } else if (config.key === 'AUTO_CANCEL_HOURS') {
        Icon = Clock;
        iconBg = "bg-orange-100";
        iconColor = "text-orange-600";
        title = "Thời gian tự hủy yêu cầu";
    } else if (config.key === 'VAT_TAX_PERCENT') {
        Icon = Percent;
        iconBg = "bg-blue-100";
        iconColor = "text-blue-600";
        title = "Thuế VAT";
    } else if (config.key === 'MAX_BOOKING_LIMIT') {
        Icon = Hash;
        iconBg = "bg-purple-100";
        iconColor = "text-purple-600";
        title = "Giới hạn số lượng Booking";
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row items-start md:items-center gap-6 hover:shadow-md hover:border-indigo-300 transition-all group relative overflow-hidden">
            <div className={`absolute left-0 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-opacity ${iconBg.replace('bg-', 'bg-').replace('-100', '-500')}`}></div>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border shadow-inner group-hover:scale-110 transition-transform ${iconBg} ${iconBg.replace('bg-', 'border-').replace('-100', '-200')}`}>
                <Icon className={`w-7 h-7 ${iconColor}`} />
            </div>
            
            <div className="flex-1">
                <h3 className="font-black text-slate-900 text-lg group-hover:text-indigo-700 transition-colors">{title}</h3>
                <p className="text-sm font-medium text-slate-500 mt-1">{config.description}</p>
                <div className="mt-2 inline-flex px-2.5 py-1 bg-slate-100 text-xs text-slate-600 font-bold rounded-md border border-slate-200">
                    Key: {config.key}
                </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                <div className="relative group/input">
                    <input 
                        type="text" 
                        value={val} 
                        onChange={e => setVal(e.target.value)} 
                        className="w-full md:w-32 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 font-black text-slate-900 text-center outline-none transition-all focus:bg-white"
                    />
                </div>
                <button 
                    onClick={() => onSave(config.key, val, config.description, setSaving)} 
                    disabled={saving || val === config.value}
                    className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md shadow-indigo-200 transition-all hover:-translate-y-0.5 whitespace-nowrap"
                >
                    <Save className="w-4 h-4" />
                    {saving ? 'Đang lưu...' : 'Lưu lại'}
                </button>
            </div>
        </div>
    );
};
