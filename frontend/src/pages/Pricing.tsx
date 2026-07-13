import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Sparkles, Shield, Zap, ArrowRight } from 'lucide-react';

export const Pricing = () => {
    const [isAnnual, setIsAnnual] = useState(false);

    const plans = [
        {
            name: 'Khu C (Tiết Kiệm)',
            description: 'Phù hợp cho startup, quầy thức ăn nhanh, ki-ốt bán lẻ.',
            price: isAnnual ? '33.000.000' : '3.000.000',
            oldPrice: isAnnual ? '36.000.000' : null,
            period: isAnnual ? '/năm' : '/tháng',
            icon: <Shield className="w-6 h-6 text-emerald-500" />,
            features: [
                'Diện tích: 10 - 20m²',
                'Vị trí: Gần khu ẩm thực, giải trí',
                'An ninh 24/7 & Vệ sinh chung',
                'Hỗ trợ điện nước cơ bản',
            ],
            missing: ['Không hỗ trợ truyền thông', 'Không có mặt tiền sảnh chính'],
            buttonText: 'Đăng ký ngay',
            popular: false,
            color: 'emerald'
        },
        {
            name: 'Khu B (Tiêu Chuẩn)',
            description: 'Lựa chọn tối ưu cho hầu hết các loại hình kinh doanh.',
            price: isAnnual ? '71.500.000' : '6.500.000',
            oldPrice: isAnnual ? '78.000.000' : null,
            period: isAnnual ? '/năm' : '/tháng',
            icon: <Zap className="w-6 h-6 text-blue-500" />,
            features: [
                'Diện tích: 20 - 40m²',
                'Vị trí: Hành lang chính, dễ tiếp cận',
                'Hỗ trợ truyền thông trên fanpage',
                'Bảng hiệu tiêu chuẩn TTTM',
                'An ninh 24/7 & Camera giám sát',
            ],
            missing: ['Quảng cáo LCD sảnh chính'],
            buttonText: 'Chọn khu này',
            popular: true,
            color: 'blue'
        },
        {
            name: 'Khu A (Cao Cấp)',
            description: 'Vị trí đắc địa nhất để định vị thương hiệu đẳng cấp.',
            price: isAnnual ? '132.000.000' : '12.000.000',
            oldPrice: isAnnual ? '144.000.000' : null,
            period: isAnnual ? '/năm' : '/tháng',
            icon: <Sparkles className="w-6 h-6 text-purple-500" />,
            features: [
                'Diện tích: > 40m²',
                'Vị trí: Sảnh chính tầng 1, mặt tiền',
                'Đặc quyền quảng cáo LCD & Standee',
                'Thiết kế gian hàng tự do',
                'Hỗ trợ tổ chức sự kiện khai trương',
                'Ưu tiên bãi đỗ xe VIP',
            ],
            missing: [],
            buttonText: 'Liên hệ tư vấn',
            popular: false,
            color: 'purple'
        }
    ];

    const getColorClasses = (color: string, isPopular: boolean) => {
        if (isPopular) {
            return {
                bg: 'bg-blue-600',
                text: 'text-white',
                desc: 'text-blue-100',
                priceText: 'text-white',
                periodText: 'text-blue-200',
                iconBg: 'bg-blue-500/20',
                featureText: 'text-blue-50',
                checkColor: 'text-blue-300',
                missColor: 'text-blue-300/50',
                btnBg: 'bg-white',
                btnText: 'text-blue-600',
                btnHover: 'hover:bg-blue-50',
                border: 'border-blue-500',
                badgeBg: 'bg-gradient-to-r from-pink-500 to-orange-400',
                badgeText: 'text-white'
            };
        }
        
        const map: Record<string, any> = {
            emerald: {
                bg: 'bg-white',
                text: 'text-gray-900',
                desc: 'text-gray-500',
                priceText: 'text-gray-900',
                periodText: 'text-gray-500',
                iconBg: 'bg-emerald-50',
                featureText: 'text-gray-600',
                checkColor: 'text-emerald-500',
                missColor: 'text-gray-300',
                btnBg: 'bg-emerald-50',
                btnText: 'text-emerald-600',
                btnHover: 'hover:bg-emerald-100',
                border: 'border-gray-100'
            },
            purple: {
                bg: 'bg-white',
                text: 'text-gray-900',
                desc: 'text-gray-500',
                priceText: 'text-gray-900',
                periodText: 'text-gray-500',
                iconBg: 'bg-purple-50',
                featureText: 'text-gray-600',
                checkColor: 'text-purple-500',
                missColor: 'text-gray-300',
                btnBg: 'bg-purple-50',
                btnText: 'text-purple-600',
                btnHover: 'hover:bg-purple-100',
                border: 'border-gray-100'
            }
        };
        return map[color];
    };

    return (
        <div className="min-h-screen bg-slate-50 py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-blue-100/50 to-transparent pointer-events-none" />
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-48 -left-24 w-72 h-72 bg-purple-400/10 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold mb-6 border border-blue-100"
                    >
                        <Sparkles className="w-4 h-4" /> Bảng Giá & Chi Phí
                    </motion.div>
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6"
                    >
                        Đầu tư thông minh,<br className="hidden md:block" /> sinh lời bền vững
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-slate-500"
                    >
                        Khám phá chi phí thuê gian hàng cho các phân khu khác nhau tại trung tâm thương mại. Chúng tôi luôn có chính sách ưu đãi đặc biệt cho đối tác cam kết dài hạn.
                    </motion.p>

                    {/* Toggle Switch */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-10 flex items-center justify-center gap-4"
                    >
                        <span className={`text-sm font-semibold ${!isAnnual ? 'text-slate-900' : 'text-slate-500'}`}>Thanh toán hàng tháng</span>
                        <button
                            onClick={() => setIsAnnual(!isAnnual)}
                            className="relative inline-flex h-8 w-16 items-center rounded-full bg-indigo-500 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            <span
                                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${isAnnual ? 'translate-x-9' : 'translate-x-1'}`}
                            />
                        </button>
                        <span className={`text-sm font-semibold flex items-center gap-2 ${isAnnual ? 'text-slate-900' : 'text-slate-500'}`}>
                            Thanh toán hàng năm
                            <span className="inline-block bg-emerald-100 text-emerald-600 text-xs px-2 py-0.5 rounded-full font-bold">Tiết kiệm 1 tháng</span>
                        </span>
                    </motion.div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center max-w-6xl mx-auto">
                    {plans.map((plan, index) => {
                        const style = getColorClasses(plan.color, plan.popular);
                        return (
                            <motion.div 
                                key={plan.name}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 + index * 0.1 }}
                                className={`relative rounded-3xl ${style.bg} ${plan.popular ? 'shadow-2xl shadow-blue-900/20 scale-105 z-10 py-10' : 'shadow-xl shadow-slate-200/50 py-8'} px-8 border ${style.border} transition-all duration-300 hover:shadow-2xl`}
                            >
                                {plan.popular && (
                                    <div className="absolute top-0 inset-x-0 flex justify-center -translate-y-1/2">
                                        <span className={`${style.badgeBg} ${style.badgeText} text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg`}>
                                            Lựa Chọn Phổ Biến Nhất
                                        </span>
                                    </div>
                                )}
                                
                                <div className={`w-12 h-12 rounded-2xl ${style.iconBg} flex items-center justify-center mb-6`}>
                                    {plan.icon}
                                </div>
                                
                                <h3 className={`text-2xl font-bold ${style.text} mb-2`}>{plan.name}</h3>
                                <p className={`${style.desc} text-sm mb-6 min-h-[40px]`}>{plan.description}</p>
                                
                                <div className="mb-8">
                                    <div className="flex items-baseline gap-1">
                                        <span className={`text-4xl font-extrabold tracking-tight ${style.priceText}`}>
                                            {plan.price}đ
                                        </span>
                                        <span className={`${style.periodText} font-medium`}>{plan.period}</span>
                                    </div>
                                    {plan.oldPrice && (
                                        <div className="mt-1">
                                            <span className="text-sm text-slate-400 line-through">{plan.oldPrice}đ</span>
                                            <span className="text-xs text-emerald-500 font-bold ml-2 bg-emerald-50 px-2 py-0.5 rounded-md">Giảm 8%</span>
                                        </div>
                                    )}
                                </div>
                                
                                <button className={`w-full py-3.5 px-6 rounded-xl font-bold transition-colors mb-8 flex items-center justify-center gap-2 ${style.btnBg} ${style.btnText} ${style.btnHover}`}>
                                    {plan.buttonText}
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                                
                                <div className="space-y-4">
                                    <p className={`text-sm font-semibold ${style.text} uppercase tracking-wider mb-4`}>Bao gồm các tiện ích:</p>
                                    <ul className="space-y-3">
                                        {plan.features.map((feature, i) => (
                                            <li key={i} className="flex items-start gap-3">
                                                <Check className={`w-5 h-5 shrink-0 ${style.checkColor}`} />
                                                <span className={`text-sm ${style.featureText}`}>{feature}</span>
                                            </li>
                                        ))}
                                        {plan.missing.map((feature, i) => (
                                            <li key={i} className="flex items-start gap-3">
                                                <X className={`w-5 h-5 shrink-0 ${style.missColor}`} />
                                                <span className={`text-sm ${style.missColor}`}>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
