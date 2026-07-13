import React from 'react';
import { StatusBadge } from './StatusBadge';
import { MapPin, Maximize, CircleDollarSign } from 'lucide-react';

export interface BoothData {
  id: string;
  boothCode: string;
  name: string;
  area: number;
  zone: string;
  price: number;
  status: 'TRONG' | 'DA_DAT' | 'DANG_THUE' | 'BAO_TRI';
  imageUrl: string;
}

interface BoothCardProps {
  booth: BoothData;
  onBook: (id: string) => void;
}

export const BoothCard: React.FC<BoothCardProps> = ({ booth, onBook }) => {
  return (
    <div className="group relative bg-white/70 backdrop-blur-md rounded-2xl border border-white/40 shadow-xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
      <div className="relative h-48 w-full overflow-hidden">
        <img 
          src={booth.imageUrl} 
          alt={booth.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-3 right-3">
          <StatusBadge status={booth.status} />
        </div>
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-gray-900 font-bold px-3 py-1 rounded-lg shadow-sm">
          {booth.boothCode}
        </div>
      </div>
      
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-800 mb-2 truncate">{booth.name}</h3>
        
        <div className="space-y-2 mb-6">
          <div className="flex items-center text-gray-600 text-sm">
            <MapPin className="w-4 h-4 mr-2 text-indigo-500" />
            <span>Khu vực: <span className="font-medium text-gray-800">{booth.zone}</span></span>
          </div>
          <div className="flex items-center text-gray-600 text-sm">
            <Maximize className="w-4 h-4 mr-2 text-emerald-500" />
            <span>Diện tích: <span className="font-medium text-gray-800">{booth.area} m²</span></span>
          </div>
          <div className="flex items-center text-gray-600 text-sm">
            <CircleDollarSign className="w-4 h-4 mr-2 text-amber-500" />
            <span>Giá: <span className="font-bold text-gray-900">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(booth.price)}</span>/tháng</span>
          </div>
        </div>
        
        <button 
          onClick={() => onBook(booth.id)}
          disabled={booth.status !== 'TRONG'}
          className={`w-full py-2.5 rounded-xl font-semibold text-white shadow-md transition-all duration-300 ${
            booth.status === 'TRONG' 
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 hover:shadow-indigo-500/25 active:scale-95'
              : 'bg-gray-300 cursor-not-allowed opacity-70'
          }`}
        >
          {booth.status === 'TRONG' ? 'Đăng Ký Thuê Ngay' : 'Đã Có Người Đặt'}
        </button>
      </div>
    </div>
  );
};
