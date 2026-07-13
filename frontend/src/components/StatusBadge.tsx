import React from 'react';

type Status = 'TRONG' | 'DA_DAT' | 'DANG_THUE' | 'BAO_TRI';

interface StatusBadgeProps {
  status: Status;
}

const statusConfig: Record<Status, { label: string; style: string }> = {
  TRONG: { label: 'Trống', style: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  DA_DAT: { label: 'Đã Đặt', style: 'bg-amber-100 text-amber-700 border-amber-200' },
  DANG_THUE: { label: 'Đang Thuê', style: 'bg-rose-100 text-rose-700 border-rose-200' },
  BAO_TRI: { label: 'Bảo Trì', style: 'bg-slate-100 text-slate-700 border-slate-200' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = statusConfig[status];
  
  return (
    <span className={`px-3 py-1 text-xs font-semibold rounded-full border shadow-sm ${config.style}`}>
      {config.label}
    </span>
  );
};
