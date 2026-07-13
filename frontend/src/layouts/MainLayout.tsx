import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function MainLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    toast.success('Đã đăng xuất thành công');
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100 via-white to-purple-100">
      {/* Header */}
      <header className="bg-white/50 backdrop-blur-xl border-b border-white/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <span className="text-white font-bold text-xl">B</span>
            </div>
            <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-900 to-purple-900">
              BoothRental
            </h1>
          </Link>
          <nav className="hidden md:flex items-center gap-8 font-medium text-gray-600">
            <Link to="/" className={`${location.pathname === '/' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'hover:text-indigo-600 border-b-2 border-transparent transition-colors'} py-1`}>Trang chủ</Link>
            <Link to="/mall-map" className={`${location.pathname === '/mall-map' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'hover:text-indigo-600 border-b-2 border-transparent transition-colors'} py-1`}>Sơ đồ TTTM</Link>
            <Link to="/pricing" className={`${location.pathname === '/pricing' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'hover:text-indigo-600 border-b-2 border-transparent transition-colors'} py-1`}>Bảng giá</Link>
          </nav>
          <div className="flex gap-4 items-center">
            {user ? (
              <>
                <span className="font-semibold text-gray-700">Chào, {user.fullName}</span>
                <Link 
                    to="/profile"
                    className="px-4 py-2 rounded-xl text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
                >
                    Hồ sơ
                </Link>
                <Link 
                    to={user.role === 'SYSTEM_ADMIN' || user.role === 'MANAGER' ? "/manager" : "/dashboard"} 
                    className="px-5 py-2 rounded-xl text-indigo-600 font-semibold hover:bg-indigo-50 transition-colors"
                >
                    Dashboard
                </Link>
                <button onClick={handleLogoutClick} className="px-5 py-2 rounded-xl bg-red-50 text-red-600 font-semibold hover:bg-red-100 transition-colors">Đăng Xuất</button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-5 py-2 rounded-xl text-indigo-600 font-semibold hover:bg-indigo-50 transition-colors">Đăng Nhập</Link>
                <Link to="/register" className="px-5 py-2 rounded-xl bg-indigo-900 text-white font-semibold hover:bg-indigo-800 shadow-md transition-all active:scale-95">Đăng Ký</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content (Trang con sẽ được render vào đây) */}
      <Outlet />

      {/* Footer */}
      <footer className="mt-20 py-8 text-center text-gray-500 text-sm">
        &copy; 2026 BoothRental System. Designed with Vite + React + TailwindCSS.
      </footer>

      {/* Logout Confirm Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
              onClick={cancelLogout}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-gray-100"
            >
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Đăng xuất tài khoản</h3>
              <p className="text-center text-gray-500 mb-6">Bạn có chắc chắn muốn đăng xuất khỏi hệ thống không?</p>
              <div className="flex gap-3">
                <button 
                  onClick={cancelLogout}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button 
                  onClick={confirmLogout}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 shadow-sm shadow-red-200 transition-colors"
                >
                  Đăng xuất
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
