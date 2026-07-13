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
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Settings className="w-6 h-6 text-indigo-600" />
                    Cấu hình tham số hệ thống
                </h1>
                <p className="text-gray-500 mt-2">Quản lý các tham số hoạt động cốt lõi của toàn hệ thống. Hãy cẩn trọng khi thay đổi.</p>
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row items-start md:items-center gap-6 hover:border-indigo-300 transition-colors">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
                <Icon className={`w-6 h-6 ${iconColor}`} />
            </div>
            
            <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-lg">{title}</h3>
                <p className="text-sm text-gray-500 mt-1">{config.description}</p>
                <div className="mt-2 inline-block px-2 py-1 bg-gray-100 text-xs text-gray-600 font-mono rounded">
                    Key: {config.key}
                </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                <div className="relative">
                    <input 
                        type="text" 
                        value={val} 
                        onChange={e => setVal(e.target.value)} 
                        className="w-full md:w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-semibold text-gray-900 text-center"
                    />
                </div>
                <button 
                    onClick={() => onSave(config.key, val, config.description, setSaving)} 
                    disabled={saving || val === config.value}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors whitespace-nowrap"
                >
                    <Save className="w-4 h-4" />
                    {saving ? 'Đang lưu...' : 'Lưu lại'}
                </button>
            </div>
        </div>
    );
};
