import { useState } from 'react';
import { X, DollarSign } from 'lucide-react';

interface ApproveRequestModalProps {
  isOpen: boolean;
  requestId: string;
  onClose: () => void;
  onConfirm: (totalAmount: number, deposit: number) => Promise<void>;
}

/**
 * Modal nhập tổng giá trị hợp đồng và tiền cọc khi duyệt yêu cầu thuê.
 * Thay thế prompt() native của trình duyệt bằng UI đẹp hơn.
 */
export function ApproveRequestModal({ isOpen, onClose, onConfirm }: ApproveRequestModalProps) {
  const [totalAmount, setTotalAmount] = useState('');
  const [deposit, setDeposit] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<any>({});

  if (!isOpen) return null;

  const formatNumber = (value: string) => {
    const num = value.replace(/\D/g, '');
    return num ? Number(num).toLocaleString('vi-VN') : '';
  };

  const parseNumber = (value: string) => {
    return parseInt(value.replace(/\D/g, '') || '0', 10);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const newErrors: any = {};
    if (!totalAmount) newErrors.totalAmount = 'Vui lòng nhập tổng giá trị hợp đồng';
    if (!deposit) newErrors.deposit = 'Vui lòng nhập tiền đặt cọc';

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      return;
    }
    setFieldErrors({});

    const total = parseNumber(totalAmount);
    const dep = parseNumber(deposit);

    if (total <= 0) {
      setError('Tổng giá trị hợp đồng phải lớn hơn 0');
      return;
    }
    if (dep < 0) {
      setError('Tiền cọc không hợp lệ');
      return;
    }
    if (dep > total) {
      setError('Tiền cọc không được lớn hơn tổng giá trị hợp đồng');
      return;
    }

    setLoading(true);
    try {
      await onConfirm(total, dep);
      // Reset form
      setTotalAmount('');
      setDeposit('');
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setTotalAmount('');
      setDeposit('');
      setError('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 animate-in fade-in slide-in-from-bottom-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Duyệt & Tạo Hợp đồng</h3>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tổng giá trị */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tổng giá trị hợp đồng (VND) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={totalAmount}
                onChange={(e) => {setTotalAmount(formatNumber(e.target.value)); if(fieldErrors.totalAmount) setFieldErrors({...fieldErrors, totalAmount: ''})}}
                placeholder="Ví dụ: 15,000,000"
                className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none text-sm transition-all ${fieldErrors.totalAmount ? 'border-red-400 focus:ring-red-200 focus:border-red-500 focus:ring-2' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 focus:ring-2'}`}
                disabled={loading}
              />
            </div>
            {fieldErrors.totalAmount && <p className="text-red-500 text-xs mt-1.5 font-medium">{fieldErrors.totalAmount}</p>}
            {!fieldErrors.totalAmount && totalAmount && (
              <p className="text-xs text-indigo-600 mt-1 font-medium">
                ≈ {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(parseNumber(totalAmount))}
              </p>
            )}
          </div>

          {/* Tiền cọc */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tiền đặt cọc (VND) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={deposit}
              onChange={(e) => {setDeposit(formatNumber(e.target.value)); if(fieldErrors.deposit) setFieldErrors({...fieldErrors, deposit: ''})}}
              placeholder="Ví dụ: 5,000,000"
              className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none text-sm transition-all ${fieldErrors.deposit ? 'border-red-400 focus:ring-red-200 focus:border-red-500 focus:ring-2' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 focus:ring-2'}`}
              disabled={loading}
            />
            {fieldErrors.deposit && <p className="text-red-500 text-xs mt-1.5 font-medium">{fieldErrors.deposit}</p>}
            {!fieldErrors.deposit && deposit && (
              <p className="text-xs text-indigo-600 mt-1 font-medium">
                ≈ {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(parseNumber(deposit))}
              </p>
            )}
          </div>

          {/* Thông tin thêm */}
          <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700">
            <p className="font-semibold mb-1">📋 Lưu ý:</p>
            <ul className="space-y-0.5 list-disc list-inside">
              <li>Hợp đồng sẽ được tạo ở trạng thái <strong>Nháp</strong></li>
              <li>Lãi phạt mặc định <strong>5%/tháng</strong></li>
              <li>Hạn đóng cọc sau khi kích hoạt: <strong>3 ngày</strong></li>
            </ul>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors text-sm disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                'Duyệt & Tạo HĐ'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
