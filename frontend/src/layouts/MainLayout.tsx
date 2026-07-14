import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, MapPin, Phone, Mail } from 'lucide-react';

export function MainLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogoutClick = () => setShowLogoutConfirm(true);

  const confirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    toast.success('Đã đăng xuất thành công');
  };

  const navLinks = [
    { path: '/', label: 'Trang chủ' },
    { path: '/mall-map', label: 'Sơ đồ TTTM' },
    { path: '/pricing', label: 'Bảng giá' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-50/50 via-white to-purple-50/50">
      {/* Header Premium */}
      <header 
        className={`sticky top-0 z-50 transition-all duration-300 backdrop-blur-xl ${
          isScrolled ? 'bg-white/80 shadow-sm border-b border-white/50 py-3' : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
              <span className="text-white font-bold text-xl">B</span>
            </div>
            <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-900 to-purple-900 tracking-tight">
              BoothRental
            </h1>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-4 py-2 font-semibold transition-colors ${
                    isActive ? 'text-indigo-700' : 'text-slate-600 hover:text-indigo-600'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute inset-0 bg-indigo-50 rounded-xl -z-10"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex gap-3 items-center">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end mr-2">
                  <span className="text-sm font-bold text-slate-900">{user.fullName}</span>
                  <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">{user.role}</span>
                </div>
                <Link 
                    to="/profile"
                    className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
                >
                    Hồ sơ
                </Link>
                <Link 
                    to={user.role === 'SYSTEM_ADMIN' || user.role === 'MANAGER' ? "/manager" : "/dashboard"} 
                    className="px-5 py-2.5 rounded-xl bg-indigo-50 text-indigo-700 font-bold hover:bg-indigo-100 transition-colors"
                >
                    Dashboard
                </Link>
                <button onClick={handleLogoutClick} className="px-5 py-2.5 rounded-xl bg-rose-50 text-rose-600 font-bold hover:bg-rose-100 transition-colors">Đăng Xuất</button>
              </div>
            ) : (
              <>
                <Link to="/login" className="px-5 py-2.5 rounded-xl text-slate-700 font-bold hover:bg-slate-100 transition-colors">Đăng Nhập</Link>
                <Link to="/register" className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all hover:-translate-y-0.5">Đăng Ký</Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-slate-600"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden bg-white border-b border-slate-100 overflow-hidden"
            >
              <div className="px-4 py-4 space-y-2 flex flex-col">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`px-4 py-3 rounded-xl font-bold ${
                      location.pathname === link.path ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="h-px bg-slate-100 my-2"></div>
                {user ? (
                  <>
                    <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 rounded-xl font-bold text-slate-600">Hồ sơ</Link>
                    <Link to={user.role === 'SYSTEM_ADMIN' || user.role === 'MANAGER' ? "/manager" : "/dashboard"} onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 rounded-xl font-bold text-indigo-600 bg-indigo-50">Dashboard</Link>
                    <button onClick={() => { setIsMobileMenuOpen(false); handleLogoutClick(); }} className="px-4 py-3 text-left rounded-xl font-bold text-rose-600 bg-rose-50">Đăng Xuất</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 rounded-xl font-bold text-slate-600">Đăng Nhập</Link>
                    <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 rounded-xl font-bold text-white bg-indigo-600 text-center">Đăng Ký</Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      {/* Premium Footer */}
      <footer className="bg-slate-900 text-slate-300 py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12 border-b border-slate-800 pb-12">
            {/* Brand Col */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">B</span>
                </div>
                <h2 className="text-2xl font-black text-white">BoothRental</h2>
              </div>
              <p className="text-sm leading-relaxed text-slate-400">
                Nền tảng quản lý và cho thuê mặt bằng thương mại hàng đầu, giúp kết nối doanh nghiệp với không gian kinh doanh lý tưởng.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-indigo-500 hover:text-white transition-all text-xs font-bold">FB</a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-indigo-500 hover:text-white transition-all text-xs font-bold">TW</a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-indigo-500 hover:text-white transition-all text-xs font-bold">IG</a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-indigo-500 hover:text-white transition-all text-xs font-bold">IN</a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-bold mb-6">Liên kết nhanh</h3>
              <ul className="space-y-3">
                <li><Link to="/" className="hover:text-indigo-400 transition-colors">Về chúng tôi</Link></li>
                <li><Link to="/mall-map" className="hover:text-indigo-400 transition-colors">Sơ đồ mặt bằng</Link></li>
                <li><Link to="/pricing" className="hover:text-indigo-400 transition-colors">Bảng giá & Chi phí</Link></li>
                <li><Link to="#" className="hover:text-indigo-400 transition-colors">Chính sách bảo mật</Link></li>
                <li><Link to="#" className="hover:text-indigo-400 transition-colors">Điều khoản sử dụng</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-white font-bold mb-6">Liên hệ</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                  <span>123 Đường Tôn Đức Thắng, Quận 1, TP. Hồ Chí Minh</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-indigo-400 shrink-0" />
                  <span>1900 6868</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-indigo-400 shrink-0" />
                  <span>contact@boothrental.vn</span>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h3 className="text-white font-bold mb-6">Đăng ký nhận tin</h3>
              <p className="text-sm text-slate-400 mb-4">Nhận thông tin cập nhật mới nhất về các gian hàng hot.</p>
              <form className="flex flex-col gap-2" onSubmit={e => e.preventDefault()}>
                <input type="email" placeholder="Email của bạn..." className="px-4 py-3 rounded-xl bg-slate-800 border-none focus:ring-2 focus:ring-indigo-500 text-white outline-none" />
                <button type="submit" className="px-4 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors">
                  Đăng ký
                </button>
              </form>
            </div>
          </div>
          
          <div className="text-center text-sm text-slate-500">
            &copy; {new Date().getFullYear()} BoothRental System. All rights reserved. Designed with Vite + React + TailwindCSS.
          </div>
        </div>
      </footer>

      {/* Logout Confirm Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setShowLogoutConfirm(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl p-6 md:p-8 w-full max-w-sm border border-slate-100"
            >
              <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-5 border border-rose-100">
                <svg className="w-8 h-8 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-center text-slate-900 mb-2">Đăng xuất</h3>
              <p className="text-center text-slate-500 mb-8 font-medium">Bạn có chắc chắn muốn đăng xuất khỏi hệ thống không?</p>
              <div className="flex gap-3">
                <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 px-4 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-colors">
                  Hủy bỏ
                </button>
                <button onClick={confirmLogout} className="flex-1 px-4 py-3 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 shadow-md shadow-rose-200 transition-colors">
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
