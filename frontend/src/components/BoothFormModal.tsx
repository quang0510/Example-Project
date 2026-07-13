import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import type { BoothData } from './BoothCard';
import { X, Store, MapPin, Maximize, DollarSign, Image as ImageIcon, AlignLeft, Info } from 'lucide-react';

interface BoothFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  booth: BoothData | null;
  onSuccess: () => void;
}

export const BoothFormModal: React.FC<BoothFormModalProps> = ({ isOpen, onClose, booth, onSuccess }) => {
  const [formData, setFormData] = useState({
    boothCode: '',
    name: '',
    area: '',
    zone: '',
    price: '',
    thumbnailUrl: '',
    description: '',
    status: 'TRONG'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<any>({});

  useEffect(() => {
    if (booth) {
      setFormData({
        boothCode: booth.boothCode,
        name: booth.name,
        area: booth.area.toString(),
        zone: booth.zone,
        price: booth.price.toString(),
        thumbnailUrl: booth.imageUrl || '',
        description: '', // Backend has it but BoothData might not
        status: booth.status
      });
    } else {
      setFormData({
        boothCode: '', name: '', area: '', zone: '', price: '', thumbnailUrl: '', description: '', status: 'TRONG'
      });
    }
    setError('');
  }, [booth, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (fieldErrors[e.target.name]) setFieldErrors({ ...fieldErrors, [e.target.name]: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: any = {};
    if (!formData.boothCode.trim()) newErrors.boothCode = 'Vui lòng nhập mã gian hàng';
    if (!formData.name.trim()) newErrors.name = 'Vui lòng nhập tên gian hàng';
    if (!formData.area) newErrors.area = 'Vui lòng nhập diện tích';
    if (!formData.zone.trim()) newErrors.zone = 'Vui lòng nhập khu vực';
    if (!formData.price) newErrors.price = 'Vui lòng nhập giá thuê';

    if (Object.keys(newErrors).length > 0) {
        setFieldErrors(newErrors);
        return;
    }
    setFieldErrors({});

    setIsLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        area: parseFloat(formData.area),
        price: parseFloat(formData.price)
      };

      if (booth) {
        await axiosClient.put(`/booths/${booth.id}`, payload);
      } else {
        await axiosClient.post('/booths', payload);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-gray-100 max-h-[90vh] flex flex-col transform transition-all">
        
        {/* Premium Header */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-8 py-6 border-b border-gray-100 flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-xl shadow-sm border border-indigo-100 text-indigo-600">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {booth ? 'Cập nhật gian hàng' : 'Thêm gian hàng mới'}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {booth ? 'Chỉnh sửa thông tin chi tiết của gian hàng' : 'Điền các thông tin cơ bản để tạo gian hàng'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Form Content */}
        <div className="overflow-y-auto px-8 py-6 bg-gray-50/30">
          <form id="booth-form" onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg flex items-start gap-3">
                <Info className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">Thông tin cơ bản</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Mã gian hàng */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">Mã gian hàng <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Store className="h-4 w-4 text-gray-400" />
                    </div>
                    <input 
                      type="text" name="boothCode" disabled={!!booth}
                      value={formData.boothCode} onChange={handleChange}
                      placeholder="VD: A01"
                      className={`pl-10 w-full px-4 py-2.5 border rounded-xl focus:bg-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed outline-none ${fieldErrors.boothCode ? 'bg-white border-red-400 focus:border-red-500 focus:ring-red-200 focus:ring-2' : 'bg-gray-50 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500/20 focus:ring-2'}`}
                    />
                  </div>
                  {fieldErrors.boothCode && <p className="text-red-500 text-xs mt-1.5 font-medium">{fieldErrors.boothCode}</p>}
                </div>

                {/* Tên gian hàng */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">Tên gian hàng <span className="text-red-500">*</span></label>
                  <input 
                    type="text" name="name"
                    value={formData.name} onChange={handleChange}
                    placeholder="VD: Gian hàng quần áo thời trang"
                    className={`w-full px-4 py-2.5 border rounded-xl focus:bg-white transition-colors outline-none ${fieldErrors.name ? 'bg-white border-red-400 focus:border-red-500 focus:ring-red-200 focus:ring-2' : 'bg-gray-50 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500/20 focus:ring-2'}`}
                  />
                  {fieldErrors.name && <p className="text-red-500 text-xs mt-1.5 font-medium">{fieldErrors.name}</p>}
                </div>

                {/* Diện tích */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">Diện tích (m²) <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Maximize className="h-4 w-4 text-gray-400" />
                    </div>
                    <input 
                      type="number" name="area" min="1" step="0.1"
                      value={formData.area} onChange={handleChange}
                      placeholder="0.0"
                      className={`pl-10 w-full px-4 py-2.5 border rounded-xl focus:bg-white transition-colors outline-none ${fieldErrors.area ? 'bg-white border-red-400 focus:border-red-500 focus:ring-red-200 focus:ring-2' : 'bg-gray-50 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500/20 focus:ring-2'}`}
                    />
                  </div>
                  {fieldErrors.area && <p className="text-red-500 text-xs mt-1.5 font-medium">{fieldErrors.area}</p>}
                </div>

                {/* Khu vực */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">Khu vực <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-4 w-4 text-gray-400" />
                    </div>
                    <input 
                      type="text" name="zone"
                      value={formData.zone} onChange={handleChange}
                      placeholder="VD: Khu A"
                      className={`pl-10 w-full px-4 py-2.5 border rounded-xl focus:bg-white transition-colors outline-none ${fieldErrors.zone ? 'bg-white border-red-400 focus:border-red-500 focus:ring-red-200 focus:ring-2' : 'bg-gray-50 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500/20 focus:ring-2'}`}
                    />
                  </div>
                  {fieldErrors.zone && <p className="text-red-500 text-xs mt-1.5 font-medium">{fieldErrors.zone}</p>}
                </div>

                {/* Giá thuê */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">Giá thuê/tháng (VND) <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                    </div>
                    <input 
                      type="number" name="price" min="0"
                      value={formData.price} onChange={handleChange}
                      placeholder="0"
                      className={`pl-10 pr-12 w-full px-4 py-2.5 border rounded-xl focus:bg-white transition-colors outline-none ${fieldErrors.price ? 'bg-white border-red-400 focus:border-red-500 focus:ring-red-200 focus:ring-2' : 'bg-gray-50 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500/20 focus:ring-2'}`}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 text-sm font-medium">VNĐ</span>
                    </div>
                  </div>
                  {fieldErrors.price && <p className="text-red-500 text-xs mt-1.5 font-medium">{fieldErrors.price}</p>}
                </div>

                {/* Trạng thái */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">Trạng thái hiện tại</label>
                  <select 
                    name="status" value={formData.status} onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed font-medium"
                    disabled={booth?.status === 'DANG_THUE'}
                  >
                    <option value="TRONG">🟢 TRỐNG</option>
                    <option value="DA_DAT">🟡 ĐÃ ĐẶT</option>
                    <option value="DANG_THUE">🔴 ĐANG THUÊ</option>
                    <option value="BAO_TRI">🟠 BẢO TRÌ</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">Hình ảnh & Mô tả</h4>
              
              {/* URL Ảnh */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Đường dẫn ảnh (URL)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ImageIcon className="h-4 w-4 text-gray-400" />
                  </div>
                  <input 
                    type="url" name="thumbnailUrl"
                    value={formData.thumbnailUrl} onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                    className="pl-10 w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                  />
                </div>
                {formData.thumbnailUrl && (
                  <div className="mt-3 relative w-32 h-24 rounded-lg overflow-hidden border border-gray-200">
                    <img src={formData.thumbnailUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = 'https://placehold.co/400x300?text=Lỗi+Ảnh')} />
                  </div>
                )}
              </div>

              {/* Mô tả chi tiết */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Mô tả chi tiết</label>
                <div className="relative">
                  <div className="absolute top-3 left-3 pointer-events-none">
                    <AlignLeft className="h-4 w-4 text-gray-400" />
                  </div>
                  <textarea 
                    name="description" rows={4}
                    value={formData.description} onChange={handleChange}
                    placeholder="Nhập mô tả chi tiết về vị trí, tiện ích, ưu điểm của gian hàng..."
                    className="pl-10 w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors resize-none"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>
        
        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 flex gap-3 justify-end bg-white">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-6 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-all"
          >
            Hủy bỏ
          </button>
          <button 
            type="submit" 
            form="booth-form" 
            disabled={isLoading} 
            className="px-8 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-200 transition-all flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang xử lý...
              </>
            ) : (
              booth ? 'Lưu cập nhật' : 'Tạo gian hàng mới'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
