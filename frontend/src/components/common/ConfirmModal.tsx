import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    type?: 'danger' | 'warning' | 'info' | 'success';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    title,
    message,
    confirmText = 'Xác nhận',
    cancelText = 'Hủy bỏ',
    onConfirm,
    onCancel,
    type = 'warning'
}) => {
    const getIconColor = () => {
        switch (type) {
            case 'danger': return 'text-red-600 bg-red-100';
            case 'success': return 'text-green-600 bg-green-100';
            case 'info': return 'text-blue-600 bg-blue-100';
            case 'warning':
            default: return 'text-yellow-600 bg-yellow-100';
        }
    };

    const getButtonColor = () => {
        switch (type) {
            case 'danger': return 'bg-red-600 hover:bg-red-700 shadow-red-200';
            case 'success': return 'bg-green-600 hover:bg-green-700 shadow-green-200';
            case 'info': return 'bg-blue-600 hover:bg-blue-700 shadow-blue-200';
            case 'warning':
            default: return 'bg-yellow-600 hover:bg-yellow-700 shadow-yellow-200';
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'danger':
            case 'warning':
                return (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                );
            case 'success':
                return (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                );
            case 'info':
                return (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
                        onClick={onCancel}
                    />
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-gray-100"
                    >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${getIconColor()}`}>
                            {getIcon()}
                        </div>
                        <h3 className="text-xl font-bold text-center text-gray-900 mb-2">{title}</h3>
                        <p className="text-center text-gray-500 mb-6">{message}</p>
                        <div className="flex gap-3">
                            <button 
                                onClick={onCancel}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                                {cancelText}
                            </button>
                            <button 
                                onClick={onConfirm}
                                className={`flex-1 px-4 py-2.5 rounded-xl text-white font-medium shadow-sm transition-colors cursor-pointer ${getButtonColor()}`}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
