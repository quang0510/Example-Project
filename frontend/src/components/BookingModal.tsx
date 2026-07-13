import React, { useState } from 'react';
import axiosClient from '../api/axiosClient';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  boothId: string;
  onSuccess: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, boothId, onSuccess }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<any>({});

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: any = {};
    if (!startDate) newErrors.startDate = 'Vui lòng chọn ngày bắt đầu';
    if (!endDate) newErrors.endDate = 'Vui lòng chọn ngày kết thúc';
    else if (new Date(endDate) <= new Date(startDate)) newErrors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
    if (!businessType.trim()) newErrors.businessType = 'Vui lòng nhập loại hình kinh doanh';

    if (Object.keys(newErrors).length > 0) {
        setFieldErrors(newErrors);
        return;
    }
    setFieldErrors({});

    setIsLoading(true);
    setError('');

    try {
      await axiosClient.post('/requests/book', {
        boothId,
        startDate,
        endDate,
        businessType,
        note
      });
      alert('Đăng ký thuê thành công! Yêu cầu của bạn đang chờ duyệt.');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi gửi yêu cầu thuê.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex justify-between items-center">
          <h3 className="text-xl font-bold text-white">Yêu cầu thuê gian hàng</h3>
          <button onClick={onClose} className="text-white hover:text-gray-200 text-2xl font-bold">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-200">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu</label>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => {setStartDate(e.target.value); if(fieldErrors.startDate) setFieldErrors({...fieldErrors, startDate: ''})}}
                className={`w-full px-3 py-2 border rounded-lg outline-none transition-all ${fieldErrors.startDate ? 'border-red-400 focus:ring-red-200 focus:border-red-500 focus:ring-2' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 focus:ring-2'}`}
              />
              {fieldErrors.startDate && <p className="text-red-500 text-xs mt-1.5 font-medium">{fieldErrors.startDate}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc</label>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => {setEndDate(e.target.value); if(fieldErrors.endDate) setFieldErrors({...fieldErrors, endDate: ''})}}
                className={`w-full px-3 py-2 border rounded-lg outline-none transition-all ${fieldErrors.endDate ? 'border-red-400 focus:ring-red-200 focus:border-red-500 focus:ring-2' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 focus:ring-2'}`}
              />
              {fieldErrors.endDate && <p className="text-red-500 text-xs mt-1.5 font-medium">{fieldErrors.endDate}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Loại hình kinh doanh</label>
            <input 
              type="text" 
              placeholder="VD: Quần áo, Đồ gia dụng..."
              value={businessType}
              onChange={(e) => {setBusinessType(e.target.value); if(fieldErrors.businessType) setFieldErrors({...fieldErrors, businessType: ''})}}
              className={`w-full px-3 py-2 border rounded-lg outline-none transition-all ${fieldErrors.businessType ? 'border-red-400 focus:ring-red-200 focus:border-red-500 focus:ring-2' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 focus:ring-2'}`}
            />
            {fieldErrors.businessType && <p className="text-red-500 text-xs mt-1.5 font-medium">{fieldErrors.businessType}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú thêm</label>
            <textarea 
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
              placeholder="Bạn có yêu cầu đặc biệt gì không?"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Hủy
            </button>
            <button 
              type="submit" 
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Đang gửi...' : 'Gửi Yêu Cầu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
