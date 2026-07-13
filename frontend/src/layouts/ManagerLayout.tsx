import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useState } from 'react';
import { 
  LayoutDashboard, 
  Store, 
  ClipboardList, 
  FileText, 
  CreditCard,
  LogOut,
  User as UserIcon,
  Activity,
  Settings,
  Users
} from 'lucide-react';

export function ManagerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  if (!user || (user.role !== 'ROLE_MANAGER' && user.role !== 'ROLE_SYSTEM_ADMIN' && user.role !== 'MANAGER' && user.role !== 'SYSTEM_ADMIN')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100 max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Truy cập bị từ chối</h2>
          <p className="text-gray-500 mb-6">Bạn không có quyền truy cập trang quản trị hệ thống.</p>
          <Link to="/" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-colors w-full">
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    );
  }

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    navigate('/login');
    setShowLogoutConfirm(false);
    toast.success('Đã đăng xuất thành công');
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const navItems = [
    { name: 'Tổng quan', path: '/manager', icon: LayoutDashboard },
    { name: 'Hồ sơ cá nhân', path: '/manager/profile', icon: UserIcon },
    { name: 'Gian hàng', path: '/manager/booths', icon: Store },
    { name: 'Yêu cầu thuê', path: '/manager/requests', icon: ClipboardList },
    { name: 'Hợp đồng', path: '/manager/contracts', icon: FileText },
    { name: 'Thanh toán', path: '/manager/payments', icon: CreditCard },
  ];

  if (user?.role === 'ROLE_SYSTEM_ADMIN' || user?.role === 'SYSTEM_ADMIN') {
    navItems.push({ name: 'Người dùng', path: '/manager/users', icon: Users });
    navItems.push({ name: 'Nhật ký hệ thống', path: '/manager/audit-logs', icon: Activity });
    navItems.push({ name: 'Cấu hình', path: '/manager/configs', icon: Settings });
  }

  return (
    <div className="min-h-screen flex bg-[#f8fafc]">
      {/* Sidebar - Sleek Dark Theme */}
      <aside className="w-[260px] bg-gray-900 text-gray-300 flex flex-col fixed h-full z-20 shadow-xl border-r border-gray-800">
        <div className="h-20 flex items-center px-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="text-white font-bold text-xl leading-none">B</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-wide">Booth<span className="text-blue-500">Space</span></h1>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 custom-scrollbar">
          <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Quản lý & Vận hành</p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path !== '/manager' && location.pathname.startsWith(item.path));
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`group relative flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-blue-600/10 text-blue-400' 
                      : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                  }`}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="sidebar-active"
                      className="absolute left-0 w-1 h-5 bg-blue-500 rounded-r-full"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon className={`mr-3.5 h-5 w-5 flex-shrink-0 transition-colors ${isActive ? 'text-blue-500' : 'text-gray-500 group-hover:text-gray-300'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-800 bg-gray-900/50">
          <div className="flex items-center mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center font-bold text-white shadow-lg">
              {user.fullName.charAt(0)}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{user.fullName}</p>
              <p className="text-xs text-gray-500 truncate">{user.role === 'MANAGER' ? 'Quản lý' : 'Admin'}</p>
            </div>
          </div>
          <button 
            onClick={handleLogoutClick}
            className="w-full flex items-center justify-center px-4 py-2.5 border border-gray-700 rounded-xl text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors cursor-pointer"
          >
            <LogOut className="mr-2 h-4 w-4" /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-[260px] flex flex-col min-h-screen">
        <header className="h-20 bg-white border-b border-gray-200 flex items-center px-8 sticky top-0 z-10">
          <h2 className="text-xl font-bold text-gray-800">
            {navItems.find(item => location.pathname === item.path || (item.path !== '/manager' && location.pathname.startsWith(item.path)))?.name || 'Dashboard'}
          </h2>
          <div className="ml-auto flex items-center gap-4">
            <div className="relative">
              <svg className="w-6 h-6 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
            </div>
          </div>
        </header>
        
        <div className="p-8 flex-1">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </div>
      </main>

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
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button 
                  onClick={confirmLogout}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 shadow-sm shadow-red-200 transition-colors cursor-pointer"
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
